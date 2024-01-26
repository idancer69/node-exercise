import http from 'http';
import url from 'url';

let users = [
	{ id: 49, username: 'maciek', email: 'mackiek@mail.com' },
	{ id: 12, username: 'robert', email: 'robert@mail.com' },
	{ id: 94, username: 'tomek', email: 'tomek@mail.com' }
];

const readBody = req => {
	return new Promise((resolve, reject) => {
		let body = '';
		req.on('data', chunk => body += chunk.toString());
		req.on('end', () => {
			try { resolve(JSON.parse(body)); }
			catch (error) { reject(error); }
		});
	});
};

const sendResponse = (res, statusCode, content, contentType = 'application/json') => {
	res.writeHead(statusCode, { 'Content-Type': contentType });
	res.end(JSON.stringify(content));
};

const handleGetUsers = (req, res) => sendResponse(res, 200, users);

const handlePostUser = async (req, res) => {
	const user = await readBody(req);
	user.id = Math.floor(Math.random() * 100);
	users.push(user);
	sendResponse(res, 201, user);
};

const handleGetUserById = (req, res, userId) => {
	const user = users.find(u => u.id === userId);
	user ? sendResponse(res, 200, user) : sendResponse(res, 404, { error: 'User not found' });
};

const handleUpdateUserById = async (req, res, userId) => {
	const updatedData = await readBody(req);
	let userIndex = users.findIndex(u => u.id === userId);
	if (userIndex !== -1) {
		users[userIndex] = { ...users[userIndex], ...updatedData };
		sendResponse(res, 200, users[userIndex]);
	} else {
		sendResponse(res, 404, { error: 'User not found' });
	}
};

const server = http.createServer(async (req, res) => {
	const reqUrl = url.parse(req.url, true);
	const userId = reqUrl.pathname.split('/')[2] ? parseInt(reqUrl.pathname.split('/')[2]) : null;

	try {
		if (reqUrl.pathname === '/users' && req.method === 'GET') {
			handleGetUsers(req, res);
		} else if (reqUrl.pathname === '/users' && req.method === 'POST') {
			handlePostUser(req, res);
		} else if (reqUrl.pathname.startsWith('/users/') && req.method === 'GET') {
			handleGetUserById(req, res, userId);
		} else if (reqUrl.pathname.startsWith('/users/') && req.method === 'PUT') {
			handleUpdateUserById(req, res, userId);
		} else {
			sendResponse(res, 404, { error: 'Not found' });
		}
	} catch (error) {
		sendResponse(res, 400, { error: 'Bad request' });
	}
});

server.listen(3005, () => console.log(`Server running at http://localhost:3005/`));
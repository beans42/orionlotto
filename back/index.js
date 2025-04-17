process.stdout.write('\x1Bc')
const express = require('express');
const https = require('https');
const { Server } = require('socket.io');
const { expressjwt } = require('express-jwt');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { readFileSync, writeFileSync } = require('fs');
const axios = require('axios').default;
const trkl = require('trkl');

global.db = JSON.parse(readFileSync('db.json'));
global.exiting = false;
global.$depositCanExit = trkl(true);
global.$withdrawCanExit = trkl(true);
global.$canExit = trkl.computed(() => $depositCanExit() && $withdrawCanExit());

const ssl_options = {
	key: readFileSync('ssl/privkey.pem'),
	cert: readFileSync('ssl/fullchain.pem'),
};

const app = express();
const server = https.createServer(ssl_options, app);
global.io = new Server(server, {
	cors: {
		origin: process.env.CLIENT_HOST,
		credentials: true
	}
});

const api = require('./api');
const socket = require('./socket');

app.use(cors({
	origin: process.env.CLIENT_HOST,
	credentials: true,
	exposedHeaders: ['set-cookie']
}));
app.use(express.json());
app.use(cookieParser());
app.get('/now', async (_, res) => res.status(200).json(Date.now()));
app.use('/api', expressjwt({
	secret: process.env.TOKEN_SECRET,
	algorithms: [ 'HS256' ],
	getToken: req => req.cookies['token']
}).unless({ path: [ '/api/register', '/api/login' ] }));
app.use((err, req, res, next) => { //disable UnauthorizedError log from express-jwt
	if (err.name === 'UnauthorizedError')
		return;
	else
		next(err);
});
app.use('/api', api);

server.listen(+process.env.PORT);

const publicKey = process.env.STELLAR_PUB;
setInterval(async () => {
	try {
		const { data } = await axios.get(`https://horizon.stellar.org/accounts/${publicKey}/payments?cursor=${db.cursor}&limit=100&order=asc`);
		if (data._embedded.records.length === 0)
			return;
		for (const record of data._embedded.records) {
			const { amount, to, asset_type, asset_code, transaction_hash, asset_issuer } = record;
			if (
				to !== publicKey ||
				asset_type !== 'credit_alphanum4' ||
				asset_code !== 'USDC' ||
				asset_issuer.toUpperCase() !== 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN'
			)
				continue;
			const { data: data2 } = await axios.get(`https://horizon.stellar.org/transactions/${transaction_hash}`);
			if (data2.memo_type !== 'text')
				continue;
			const user = db.memos[data2.memo.toLowerCase()];
			if (!user)
				return;
			$depositCanExit(false);
			db.users[user].balance += +amount;
			db.users[user].deposits += +amount;
			console.log(`deposit: ${user} - $${+amount}`);
			io.to(user).emit('state', filteredState(user));
		}
		db.cursor = data._embedded.records[data._embedded.records.length - 1].paging_token;
		$depositCanExit(true);
	} catch (e) {
		console.log('Can\'t fetch deposits, no connection.');
		$depositCanExit(true);
	}
}, 5000);

const myRL = require('serverline');
myRL.init();
myRL.setPrompt('> ');
myRL.on('line', line => {
	try {
		console.log(eval(line));
	} catch (e) {
		console.error(e);
	}
});
const exitProc = () => {
	for (const user in db.crash.stakes) {
		db.users[user].balance += db.crash.stakes[user].amount;
		db.users[user].staked = false;
	}
	db.crash.stakes = {};
	writeFileSync('db.json', JSON.stringify(db, null, '\t'));
	process.exit(0);
};
myRL.on('SIGINT', () => {
	exiting = true;
	if ($canExit())
		exitProc();
	else
		$canExit.subscribe(canExit => {
			if (canExit)
				exitProc();
		});
});

process.on('uncaughtExceptionMonitor', err => {
	writeFileSync('exception.out', err.stack);
});

const { parseJWT, isValidJWT } = require('./auth');
const { writeFile } = require('fs');
const { rollCrash, rollTime, calculateRate } = require('./roll');
const crypto = require('crypto');

const MAX_BET = 10;
const sha = x => crypto.createHmac('sha256', x).digest('hex');
const now = () => new Date().getTime();
const sleep = time => new Promise(r => setTimeout(r, time));
global.filteredState = user => {
	const copy = JSON.parse(JSON.stringify(db.users[user]));
	delete copy.pass;
	delete copy.ip;
	delete copy.deposits;
	delete copy.withdrawals;
	return copy;
};

//let stakes = {
//	beans: {
//		amount: 20,
//		auto: 1.8
//	}
//};

let inProgress = false;
let nextGame;
let t1;

io.on('connection', socket => {
	const { auth } = socket.handshake;
	if (!isValidJWT(auth.token))
		return socket.disconnect(true);
	const { user } = parseJWT(auth.token);
	socket.join(user);
	socket.on('crash join', () => {
		socket.join('crash');
		socket.emit('crash state', {
			inProgress, t1, nextGame,
			yourStake: db.crash.stakes[user],
			previousGames: previousGames.slice(-10)
		});
	});
	socket.on('crash stake', x => {
		const { balance, staked } = db.users[user];
		if (x < 0 || x > MAX_BET)
			return;
		if (!inProgress && !staked && x <= balance) {
			db.crash.stakes[user] = { amount: x };
			db.users[user].balance -= db.crash.stakes[user].amount;
			db.users[user].staked = true;
		}
		socket.emit('state', filteredState(user));
	});
	socket.on('crash cashout', () => {
		if (db.crash.stakes[user]) {
			if (inProgress) {
				db.users[user].balance += db.crash.stakes[user].amount * calculateRate(now() - t1);
				db.users[user].staked = false;
				delete db.crash.stakes[user];
			} else {
				db.users[user].balance += db.crash.stakes[user].amount;
				db.users[user].staked = false;
				delete db.crash.stakes[user];
			}
			socket.emit('state', filteredState(user));
		}
	});
	socket.on('disconnect', () => {
		if (db.crash.stakes[user]) {
			if (inProgress) {
				db.users[user].balance += db.crash.stakes[user].amount * calculateRate(now() - t1);
				db.users[user].staked = false;
				delete db.crash.stakes[user];
			} else {
				db.users[user].balance += db.crash.stakes[user].amount;
				db.users[user].staked = false;
				delete db.crash.stakes[user];
			}
		}
	});
});

(async () => {
	while (true) {
		global.hashes = [ sha(process.env.CHAIN_SECRET+new Date().toString()) ];
		for (let i = 0; i < 999; ++i)
			hashes.push(sha(hashes[hashes.length - 1]));
		hashes.reverse();
		global.previousGames = [];
		for (const hash of hashes) {
			t1 = now();
			const roll = rollCrash(hash);
			console.log(roll); //TODO: remove
			const crashTime = now() + (rollTime(roll) * 1000); //ms
			inProgress = true;
			io.to('crash').emit('crash state', { inProgress, nextGame, t1, previousGames: previousGames.slice(-10) });
			await sleep(crashTime - now());
			for (const user in db.crash.stakes) {
				db.users[user].staked = false;
				io.to(user).emit('state', filteredState(user));
			}
			db.crash.stakes = {};
			inProgress = false;
			previousGames.push({
				hash,
				startTime: t1,
				crashTime,
				roll
			});
			nextGame = now() + 12000;
			for (const user in db.users)
				db.users[user].balance = Math.round(db.users[user].balance * 1e7) / 1e7;
			if (!exiting)
				writeFile('db.json', JSON.stringify(db, null, '\t'), () => {});
			io.to('crash').emit('crash boom');
			io.to('crash').emit('crash state', { inProgress, nextGame, t1, previousGames: previousGames.slice(-10) });
			await sleep(nextGame - now());
		}
	}
})();
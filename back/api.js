const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const StellarSdk = require('stellar-sdk');

//global.db = {
//	users: {
//		beans: {
//			pass: '$2b$10$UoQw7MlcdtcBArbVjkM72OWDLH1BB.YAGc3Kkr4eCxJntKH.B1yl.',
//			balance: 1000,
//			staked: false,
//			ip: '::ffff:192.168.0.100',
//			memo: '87e250c6bb52620f3b91013f15aa',
//			deposits: 1000,
//			withdrawals: 0
//		}
//	},
//	memos: {
//		'87e250c6bb52620f3b91013f15aa': 'beans'
//	},
//	crash: {
//		stakes: {
//			//beans: {
//			//	amount: 20,
//			//	auto: 1.8
//			//}
//		}	
//	}
//};

const router = express.Router();

router.post('/register', async (req, res) => {
	const { user, pass } = req.body;
	if (!user || db.users[user] !== undefined)
		return res.status(500).json({ error: 'Username taken.' });
	if (!/^[0-9a-zA-Z_.-]+$/.test(user))
		return res.status(500).json({ error: 'Username contains invalid characters.' });
	if (user.length > 30)
		return res.status(500).json({ error: 'Username is too long.' });
	if (!pass)
		return res.status(500).json({ error: 'Can\'t have empty password.' });
	const salt = await bcrypt.genSalt(10);
	const hashed = await bcrypt.hash(pass, salt);
	let memo;
	do {
		memo = crypto.randomBytes(14).toString('hex');
	} while (db.memos[memo]);
	db.users[user] = {
		pass: hashed,
		balance: 0,
		staked: false,
		ip: req.socket.remoteAddress,
		memo,
		deposits: 0,
		withdrawals: 0
	};
	db.memos[memo] = user;
	const token = jwt.sign({ user }, process.env.TOKEN_SECRET, { expiresIn: '1d' });
	res.cookie('token', token, {
		httpOnly: true,
		secure: true,
		maxAge: 1 * 24 * 3600 * 1000,
		sameSite: 'lax',
	});
	return res.status(200).json(token);
});

router.post('/login', async (req, res) => {
	const { user, pass } = req.body;
	if (!user || !db.users[user])
		return res.status(500).json({ error: 'Invalid username.' });
	if (!pass)
		return res.status(500).json({ error: 'Can\'t have empty password.' });
	const valid = await bcrypt.compare(pass, db.users[user].pass);
	if (!valid)
		return res.status(500).json({ error: 'Wrong password.' });
	const token = jwt.sign({ user }, process.env.TOKEN_SECRET, { expiresIn: '1d' });
	db.users[user].ip = req.socket.remoteAddress;
	res.cookie('token', token, {
		httpOnly: true,
		secure: true,
		maxAge: 1 * 24 * 3600 * 1000,
		sameSite: 'lax',
	});
	return res.sendStatus(200);
});

router.post('/logout', async (req, res) => {
	const tokenCookie = req.cookies['token'];
	if (!tokenCookie)
		return res.status(500).json({ error: 'No auth cookie.' });
	res.clearCookie('token', {
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
	});
	return res.sendStatus(200);
});

router.get('/getUser', async (req, res) => {
	const user = db.users[req.auth.user];
	if (!user)
		return res.status(500).json({ error: 'User not found. Clear your cookies.' });
	return res.status(200).json(filteredState(req.auth.user));
});

const server = new StellarSdk.Server('https://horizon.stellar.org');

router.post('/withdraw', async (req, res) => {
	const { amount, destination } = req.body;
	if (!amount || typeof amount !== 'string' || +amount <= 0)
		return res.status(500).json({ error: 'Invalid amount.' });
	if (!destination || typeof destination !== 'string' || destination.length !== 56)
		return res.status(500).json({ error: 'Invalid destination.' });
	const user = db.users[req.auth.user];
	if (!user)
		return res.status(500).json({ error: 'User not found. Clear your cookies.' });
	if (+amount > user.balance)
		return res.status(500).json({ error: 'Insufficient funds.' });
	try {
		const transaction = new StellarSdk.TransactionBuilder(await server.loadAccount(process.env.STELLAR_PUB), {
			fee: 200,
			networkPassphrase: StellarSdk.Networks.PUBLIC
		}).addOperation(StellarSdk.Operation.payment({
			asset: new StellarSdk.Asset('USDC', 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN'),
			destination: destination,
			amount
		})).setTimeout(30).build();
		transaction.sign(StellarSdk.Keypair.fromSecret(process.env.STELLAR_PRI));
		$withdrawCanExit(false);
		server.submitTransaction(transaction).then(() => {
			db.users[req.auth.user].balance -= +amount;
			db.users[req.auth.user].withdrawals += +amount;
			io.to(req.auth.user).emit('state', filteredState(req.auth.user));
			console.log(`withdraw: ${req.auth.user} - $${+amount}`);
			$withdrawCanExit(true);
			return res.status(200).json({ user: req.auth.user, amount: +amount, destination });	
		}).catch(e => {
			console.log(e);
			$withdrawCanExit(true);
			return res.status(500).json({ error: e.toString() });
		});
	} catch (e) {
		console.log(e);
		return res.status(500).json({ error: e.toString() });
	}
});

module.exports = router;
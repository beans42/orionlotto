process.stdout.write('\x1Bc');

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { expressjwt } = require('express-jwt');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { readFileSync, writeFileSync } = require('fs');
const axios = require('axios').default;
const trkl = require('trkl');

global.db = JSON.parse(readFileSync('db.json'));
global.exiting = false;

const $depositCanExit = global.$depositCanExit = trkl(true);
const $withdrawCanExit = global.$withdrawCanExit = trkl(true);
const $canExit = global.$canExit = trkl.computed(() => $depositCanExit() && $withdrawCanExit());

const app = express();
const server = http.createServer(app);

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
}).unless({
        path: [ '/api/register', '/api/login', '/api/logout' ]
}));

app.use((err, req, res, next) => {
        // Disable UnauthorizedError log from express-jwt
        if (err.name === 'UnauthorizedError')
                res.status(401).json({ error: 'Unauthorized' });
        else
                next(err);
});

app.use('/api', api);

const server2 = server.listen(+process.env.PORT, () => {
        console.log(`Listening on port ${process.env.PORT}`);
});

const publicKey = process.env.STELLAR_PUB;

let checkingDeposits = false;
let depositAbortController = null;

const depositTimer = setInterval(async () => {
        if (global.exiting || checkingDeposits)
                return;

        checkingDeposits = true;
        $depositCanExit(false);

        depositAbortController = new AbortController();

        try {
                const { data } = await axios.get(
                        `https://horizon.stellar.org/accounts/${publicKey}/payments?cursor=${db.cursor}&limit=100&order=asc`,
                        { signal: depositAbortController.signal }
                );

                if (data._embedded.records.length === 0)
                        return;

                for (const record of data._embedded.records) {
                        if (global.exiting)
                                return;

                        const {
                                amount,
                                to,
                                asset_type,
                                asset_code,
                                transaction_hash,
                                asset_issuer
                        } = record;

                        if (
                                to !== publicKey ||
                                asset_type !== 'credit_alphanum4' ||
                                asset_code !== 'USDC' ||
                                asset_issuer.toUpperCase() !== 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN'
                        ) {
                                continue;
                        }

                        const { data: data2 } = await axios.get(
                                `https://horizon.stellar.org/transactions/${transaction_hash}`,
                                { signal: depositAbortController.signal }
                        );

                        if (data2.memo_type !== 'text')
                                continue;

                        const user = db.memos[data2.memo.toLowerCase()];

                        if (!user)
                                continue;

                        db.users[user].balance += +amount;
                        db.users[user].deposits += +amount;

                        console.log(`deposit: ${user} - $${+amount}`);

                        io.to(user).emit('state', filteredState(user));
                }

                db.cursor = data._embedded.records[data._embedded.records.length - 1].paging_token;
        } catch (e) {
                if (!global.exiting)
                        console.log('Can\'t fetch deposits, no connection.');
        } finally {
                depositAbortController = null;
                checkingDeposits = false;
                $depositCanExit(true);
        }
}, 5000);

depositTimer.unref();

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

let shutdownStarted = false;

const shutdown = signal => {
        if (shutdownStarted)
                return;

        shutdownStarted = true;

        console.log(`Received ${signal}, shutting down...`);

        global.exiting = true;

        clearInterval(depositTimer);

        if (depositAbortController) {
                try {
                        depositAbortController.abort();
                } catch {}
        }

        try {
                myRL.close?.();
        } catch {}

        try {
                process.stdin.pause();
        } catch {}

        const finishWhenSafe = () => {
                if ($canExit()) {
                        exitProc();
                        return;
                }

                const unsubscribe = $canExit.subscribe(canExit => {
                        if (!canExit)
                                return;

                        if (typeof unsubscribe === 'function')
                                unsubscribe();

                        exitProc();
                });
        };

        io.close(() => {
                finishWhenSafe();
        });

        setTimeout(() => {
                console.error('Graceful shutdown timed out, forcing exit.');
                exitProc();
        }, 8000).unref();
};

process.once('SIGTERM', () => shutdown('SIGTERM'));
process.once('SIGINT', () => shutdown('SIGINT'));

myRL.on('SIGINT', () => shutdown('SIGINT'));

process.on('uncaughtExceptionMonitor', err => {
        writeFileSync('exception.out', err.stack);
});

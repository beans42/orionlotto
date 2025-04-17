const crypto = require('crypto');

const INSTANT_CRASH_PERCENTAGE = +process.env.INSTANT_CRASH_PERCENTAGE;
function rollCrash(seed) {
	const hash = crypto.createHmac('sha256', seed).digest('hex');
	const h = parseInt(hash.slice(0, 52 / 4), 16);
	const e = Math.pow(2, 52);
	const result = (100 * e - h) / (e - h);
	const houseEdgeModifier = 1 - INSTANT_CRASH_PERCENTAGE / 100;
	const endResult = Math.max(100, result * houseEdgeModifier);
	return Math.floor(endResult) / 100;
}

function rollTime(roll) {
	return Math.log(roll) / Math.log(1.0618317554);
}

function calculateRate(msPassed) {
	return Math.pow(1.0618317554, msPassed / 1000);
}

module.exports = { rollCrash, rollTime, calculateRate };
function parseJWT(token) {
	const base64Url = token.split('.')[1];
	const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
	const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
		return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
	}).join(''));
	return JSON.parse(jsonPayload);
};

function isValidJWT(token) {
	try {
		const parsed = parseJWT(token);
		return new Date().getTime() < parsed.exp * 1000 && global.db.users[parsed.user];
	} catch (e) {
		return false;
	}
}

module.exports = { parseJWT, isValidJWT };
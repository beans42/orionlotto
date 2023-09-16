export function getCookie(name) {
	name += '=';
	const decodedCookie = decodeURIComponent(document.cookie);
	for (let c of decodedCookie.split(';')) {
		while (c.charAt(0) === ' ')
			c = c.substring(1);
		if (c.indexOf(name) == 0)
			return c.substring(name.length, c.length);
	}
	return '';
}

export function parseJWT(token) {
	const base64Url = token.split('.')[1];
	const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
	const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
		return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
	}).join(''));
	return JSON.parse(jsonPayload);
};

export function isValidJWT() {
	try {
		const parsed = parseJWT(getCookie('token'));
		return new Date().getTime() < parsed.exp * 1000;
	} catch (e) {
		return false;
	}
}
import { Outlet } from '@solidjs/router';
import { onMount, onCleanup } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import axios from 'axios';
import io from 'socket.io-client';

import { isValidJWT, parseJWT, getCookie } from '../utils/auth';
import { user, setUser } from '../utils/state';
import { socket, setSocket } from '../utils/socket';
import { initialize } from '../utils/ts';

export default () => {
	const navigate = useNavigate();

	onMount(() => {
		if (!isValidJWT())
			navigate(`${import.meta.env.BASE_URL}login`, { replace: true });
		else {
			axios.get(`${import.meta.env.VITE_API}/api/getUser`).then(res => {
				if (res.status === 200) {
					const newState = {
						user: parseJWT(getCookie('token')).user,
						...res.data
					};
					setUser(newState);
				}
			}).catch(() => {
				
			});
		}
		const ret = io(import.meta.env.VITE_API, {
			withCredentials: true,
			auth: {
				token: getCookie('token')
			}
		});
		ret.on('state', x => {
			const newState = { ...user(), ...x };
			setUser(newState);
		});
		setSocket(ret);
		initialize();
	});
	onCleanup(() => socket()?.close());

	return (
		<Outlet />
	);
}
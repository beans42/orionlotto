import { Outlet } from '@solidjs/router';
import { onMount, onCleanup } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import axios from 'axios';
import io from 'socket.io-client';

import { user, setUser } from '~/utils/state';
import { socket, setSocket } from '~/utils/socket';
import { initialize } from '~/utils/ts';

export default () => {
	const navigate = useNavigate();

	onMount(() => {
		axios.get('/api/getUser').then(res => {
			if (res.status === 401) {
				navigate(`${import.meta.env.BASE_URL}login`, { replace: true });
				return;
			} else if (res.status !== 200) {
				return;
			}
			setUser(res.data);
			const ret = io(import.meta.env.VITE_API, {
				withCredentials: true,
			});
			ret.on('state', x => {
				const newState = { ...user(), ...x };
				setUser(newState);
			});
			setSocket(ret);
			initialize();
		}).catch(() => {
			
		});
	});
	onCleanup(() => socket()?.close());

	return (
		<Outlet />
	);
}
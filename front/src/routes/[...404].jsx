import { Title } from '@solidjs/meta';
import { useLocation } from '@solidjs/router';
import { createSignal, createEffect } from 'solid-js';

import Link from '~/utils/Link';

export default () => {
	const location = useLocation();
	
	const [inApp, setInApp] = createSignal(location.pathname.startsWith('/app'));
	createEffect(() => setInApp(location.pathname.startsWith('/app')));

	return (
		<>
			<Title>404 Not Found</Title>
			<div class='p-2 mx-auto container'>
				Invalid path.<br />
				<Link root href={inApp() ? 'app' : ''} class='underline decoration-blue-600'>
				   Go home...
				</Link>
			</div>
		</>
	);
};
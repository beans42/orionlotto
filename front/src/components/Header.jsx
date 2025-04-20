import { createSignal, Show, createEffect } from 'solid-js';
import { useNavigate } from 'solid-start';
import { HStack, IconButton, Drawer } from '@hope-ui/core';
import axios from 'axios';
import { useLocation } from '@solidjs/router';

import Link from '~/utils/Link';
import { user } from '~/utils/state';
import Logo from './svg/Logo';
import Hamburger from './svg/Hamburger';
import ThemeChanger from './ThemeChanger';

const LandingLinks = () => {
	const style = 'block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700 no-underline';
	return (
		<>
			<a href='mailto:help.orionlotto@gmail.com' class={style}>
				Support
			</a>
			<Link root href='fair' class={style}>
				Provably Fair
			</Link>
			<Link root href='app' class={style}>
				App
			</Link>
		</>
	);
};

const AuthLinks = () => {
	const [short, setShort] = createSignal(true);
	const navigate = useNavigate();
	const style = 'block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700 no-underline';
	return (
		<>
			<Link root href='app/crash' class={style}>
				Crash
			</Link>
			<Link root href='fair' class={style}>
				Provably Fair
			</Link>
			<Link root href='app/deposit' class={style}>
				Deposit
			</Link>
			<Link root href='app/withdraw' class={style}>
				Withdraw
			</Link>
			<a href='mailto:help.orionlotto@gmail.com' class={style}>
				Support
			</a>
			<div class={style+' cursor-pointer'} onClick={async () => {
				await axios.post('/api/logout');
				navigate(`${import.meta.env.BASE_URL}login`, { replace: true });
			}}>
				Log Out
			</div>
			{user()?.user &&
				<span class={style+' cursor-pointer group'} onClick={(() => setShort(x => !x))}>
					<span class='font-bold mr-1 group-hover:text-blue-700 dark:group-hover:text-white'>$</span>
					<span class={user().staked ? 'text-yellow-700 group-hover:text-yellow-500' : 'text-green-700 group-hover:text-green-500'}>
						{ user().balance?.toFixed(short() ? 2 : 7) }
					</span>
				</span>
			}
		</>
	);
};

export default () => {
	const [isOpen, setIsOpen] = createSignal(false);
	const location = useLocation();
	
	const [inApp, setInApp] = createSignal(location.pathname.startsWith('/app'));
	createEffect(() => setInApp(location.pathname.startsWith('/app')));

	return (
		<Show when={location.pathname !== '/login'} fallback={null}>
			<header class='sticky top-0 z-10 px-2 sm:px-4 py-2.5 flex justify-center bg-gray-100 dark:bg-gray-800'>
				<nav class='container flex justify-between items-center align-middle'>
					<HStack gap={2}>
						<ThemeChanger />
						<Link root href={inApp() ? 'app' : ''}>
							<Logo class='h-7' />
						</Link>
					</HStack>
					<div class='md:hidden' onClick={() => setIsOpen(true)}>
						<IconButton variant='ghost'>
							<Hamburger />
						</IconButton>
					</div>
					<div class='hidden w-full md:block md:w-auto md:ml-5'>
						<div class='flex flex-col items-center mt-4 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium'>
							{inApp() ? <AuthLinks /> : <LandingLinks />}
						</div>
					</div>
				</nav>
			</header>
			<Drawer isOpen={isOpen()} onClose={() => setIsOpen(false)} placement='top'>
				<Drawer.Overlay />
				<Drawer.Content>
					{inApp() ? <AuthLinks /> : <LandingLinks />}
				</Drawer.Content>
			</Drawer>
		</Show>
	)
};
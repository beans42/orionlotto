// @refresh reload
import { Suspense } from 'solid-js';
import {
	Body,
	ErrorBoundary,
	FileRoutes,
	Head,
	Html,
	Link,
	Meta,
	Routes,
	Scripts,
	Title
} from 'solid-start';
import { ColorModeScript, HopeProvider, injectCriticalStyle } from '@hope-ui/core';
import { Toaster } from 'solid-toast';

import 'tailwindcss/tailwind.css';
import './preflight.css';

import Header from './components/Header';

import axios from 'axios';
axios.defaults.baseURL = import.meta.env.VITE_API;
axios.defaults.validateStatus = () => true;
axios.defaults.withCredentials = true;

export default () => {
	injectCriticalStyle();

	return (
		<Html lang='en'>
			<Head>
				<Meta charset='utf-8' />
				<Title>Orion Lotto</Title>
				<Meta name='viewport' content='width=device-width, initial-scale=1' />
				<Meta name='theme-color' content='#000000' />
				<Link rel='icon' type='image/svg+xml' href='/favicon.svg' />
				<Link rel='icon' type='image/png' href='/favicon.png' />
				<script async src='https://www.googletagmanager.com/gtag/js?id=G-JSPQPCY3JF' />
				<script>
					{`window.dataLayer = window.dataLayer || [];
					function gtag(){dataLayer.push(arguments);}
					gtag('js', new Date());
					gtag('config', 'G-JSPQPCY3JF');`}
				</script>
			</Head>
			<Body class='min-h-screen'>
				<noscript>You need to enable JavaScript to run this app.</noscript>
				<ColorModeScript initialColorMode='light' />
				<Toaster position='top-right' />
				<Suspense>
					<ErrorBoundary>
						<HopeProvider initialColorMode='light'>
								<Header />
								<Routes>
									<FileRoutes />
								</Routes>
						</HopeProvider>
					</ErrorBoundary>
				</Suspense>
				<Scripts />
			</Body>
		</Html>
	);
};
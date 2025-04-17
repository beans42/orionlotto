import solid from 'solid-start/vite';
import { defineConfig } from 'vite';
import { readFileSync } from 'fs';

export default defineConfig({
	server: {
		host: '0.0.0.0',
		port: 3390,
		strictPort: true,
		https: {
			cert: readFileSync('ssl/fullchain.pem'),
			key: readFileSync('ssl/privkey.pem'),
		},
		proxy: {},
		hmr: {
			protocol: 'wss',
			host: 'vps1.ebra.dev',
			port: 3390,
		},
	},
	plugins: [
		solid({
			adapter: 'solid-start-static',
			ssr: true
		})
	],
	ssr: {
		noExternal: ['@hope-ui/core', '@hope-ui/styles']
	},
	build: {
		target: 'esnext'
	},
	base: '/'
});

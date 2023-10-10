import solid from 'solid-start/vite';
import { defineConfig } from 'vite';
import { readFileSync } from 'fs';

export default defineConfig({
	server: {
		https: {
			cert: readFileSync('ssl/fullchain.pem'),
			key: readFileSync('ssl/privkey.pem')
		},
		port: 443
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

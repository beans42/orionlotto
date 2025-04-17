/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./src/**/*.{html,js,jsx}'
	],
	corePlugins: {
		preflight: false
	},
	darkMode: ['class', '[data-theme="dark"]'],
	theme: {
		extend: {}
	},
	plugins: []
};
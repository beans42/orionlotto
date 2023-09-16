import { useColorMode } from '@hope-ui/core';

import Sun from './svg/Sun';
import Moon from './svg/Moon';

export default () => {
	const { toggleColorMode } = useColorMode();
	return (
		<div onClick={toggleColorMode} class='w-7 h-7 cursor-pointer fill-black dark:fill-white'>
			<div class='dark:hidden'><Sun /></div>
			<div class='hidden dark:block'><Moon /></div>
		</div>
	);
};
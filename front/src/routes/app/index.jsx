import { Title } from '@solidjs/meta';
import Link from '../../utils/Link';
import { Box } from '@hope-ui/core';
import { user } from '../../utils/state';

import crashPic from '../../assets/crash.jpg';

const Game = props => {
	return (
		<Link href={props.url}>
			<div class='inline-block cursor-pointer max-w-sm bg-slate-200 dark:bg-slate-700 hover:opacity-70 rounded-lg overflow-hidden'>
				<Box as='img' src={props.imageUrl} />
				<div class='p-6'>
					<h4 class='mt-1 font-semibold'>
						{props.title}
					</h4>
					{props.description}
				</div>
			</div> 
		</Link>
	);
}

export default () => {
	return (
		<>
			<Title>Games List</Title>
			<div class='p-2 mx-auto container'>
				<div class='text-4xl mb-2'>
					Hello <span class='font-bold'>{user().user}</span>!
				</div>
				<div class='text-3xl'>Games</div>
				<Game
					url='crash'
					title='Crash'
					description='Your money grows while you keep it in the market. If you cash out too late, you lose it all!'
					imageUrl={crashPic}
				/>
			</div>
		</>
	);
};
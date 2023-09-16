import { splitProps } from 'solid-js';

export default props => {
	const [local, others] = splitProps(props, ['label', 'type', 'class']);
	return props.label ? (
		<div class='flex'>
			<span class='inline-flex items-center px-3 text-gray-900 bg-gray-100 border border-r-0 border-gray-300 rounded-l dark:bg-neutral-800 dark:text-slate-200 dark:border-zinc-700'>
				{props.label}
			</span>
			<input
				type={props.type || 'text'}
				class={'disabled:opacity-75 disabled:cursor-not-allowed rounded-none rounded-r border text-gray-900 bg-transparent focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full border-gray-300 p-2  dark:border-zinc-700 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 '+props.class}
				{...others}
			/>
		</div>
	) : (
		<input
			type={props.type || 'text'}
			class={'disabled:opacity-75 disabled:cursor-not-allowed rounded border text-gray-900 bg-transparent focus:ring-blue-500 focus:border-blue-500 min-w-0 border-gray-300 p-2  dark:border-zinc-700 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 '+props.class}
			{...others}
		/>
	);
};
import { splitProps } from 'solid-js';
import { A } from 'solid-start';

export default (props) => {
	const [local, others] = splitProps(props, ['children', 'root', 'href']);
	return (
		<A href={`${props.root ? import.meta.env.BASE_URL : ''}${props.href}`} {...others}>
			{ props.children }
		</A>
	);
};
import { createSignal } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import axios from 'axios';
import { Title } from '@solidjs/meta';
import { Button, VStack } from '@hope-ui/core';
import toast from 'solid-toast';

import Input from '~/components/Input';

export default () => {
	const navigate = useNavigate();
	const [user, setUser] = createSignal('');
	const [pass, setPass] = createSignal('');

	const handler = async (e, isRegister) => {
		e.preventDefault();
		const response = await axios.post('/api/' + (isRegister ? 'register' : 'login'), {
			user: user(),
			pass: pass()
		});
		if (response.status === 200) {
			navigate(`${import.meta.env.BASE_URL}app`, { replace: true });
		} else
			toast.error(response.data.error);
	};

	return (
		<>
			<Title>Login/Register</Title>
			<div class='h-screen flex p-5 justify-center bg-neutral-100 text-black dark:bg-neutral-900 dark:text-white'>
				<div class='relative mt-10 max-w-3xl'>
					<form onSubmit={e => handler(e, false)}>
						<VStack spacing='8px'>
							<Input label='user' value={user()} onInput={e => setUser(e.target.value)} placeholder='austin316' />
							<Input type='password' label='pass' value={pass()} onInput={e => setPass(e.target.value)} password />
							<div class='w-full flex flex-row gap-2'>
								<Button type='button' variant='outlined' onClick={e => handler(e, true)}>
									Register
								</Button>
								<Button type='submit' variant='solid' isFullWidth class='bg-[#0967d2]'>
									Login
								</Button>
							</div>
						</VStack>
					</form>
				</div>
			</div>
		</>
	);
};
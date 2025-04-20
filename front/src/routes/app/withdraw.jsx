import { Title } from '@solidjs/meta';
import { createSignal } from 'solid-js';
import { Heading, Button } from '@hope-ui/core';
import axios from 'axios';
import toast from 'solid-toast';

import Input from '~/components/Input';

export default () => {
	const [destination, setDestination] = createSignal('');
	const [amount, setAmount] = createSignal('');
	const [loading, setLoading] = createSignal(false);

	const submit = async e => {
		e?.preventDefault();
		setLoading(true);
		const res = await axios.post('/api/withdraw', {
			amount: amount().toString(),
			destination: destination()
		});
		if (res.status === 200)
			toast.success(`You withdrew $${res.data.amount}.`);
		else
			toast.error(res.data.error);
		setLoading(false);
	};

	return (
		<>
			<Title>Withdraw</Title>
			<div class='p-2 mx-auto container'>
				<div class='mb-2'>
					<Heading size='3xl'>Withdraw</Heading>
				</div>
				<div class='max-w-xs'>
					<form onSubmit={submit}>
						<div>
							Destination stellar account:<br />
							<Input
								class='w-full'
								value={destination()}
								onInput={e => setDestination(e.target.value)}
							/>
						</div>
						<div class='mb-2'>
							Amount:
							<Input
								class='w-full'
								type='number'
								step='any'
								label='$'
								value={amount()}
								onInput={e => setAmount(+e.target.value)}
							/>
						</div>
						<Button
							type='submit'
							isFullWidth
							variant='solid'
							colorScheme='success'
							isLoading={loading()}
						>
							Withdraw
						</Button>
					</form>
				</div>
			</div>
		</>
	);
};
import { Title } from '@solidjs/meta';
import { user } from '../../utils/state';
import { socket } from '../../utils/socket';
import { onMount, onCleanup, createSignal, Show } from 'solid-js';
import { Button, HStack, VStack, Modal } from '@hope-ui/core';
import { offset } from '../../utils/ts';
import Input from '../../components/Input';
import Badge from '../../components/Badge';
import toast from 'solid-toast';

const time = () => Date.now() + offset();
const calculateRate = msPassed => Math.pow(1.0618317554, msPassed / 1000);
const MAX_BET = 10;

export default () => {
	const [crash, setCrash] = createSignal({ inProgress: null, t1: null, nextGame: null, yourStake: null, previousGames: [] });
	const [stake, setStake] = createSignal('');
	const [modal, setModal] = createSignal({});
	const [now, setNow] = createSignal(time());
	const [isOpen, setIsOpen] = createSignal(false);
	onMount(() => {
		socket().emit('crash join');
		socket().on('crash state', x => setCrash({ ...crash(), ...x }));
		socket().on('crash boom', () => {
			if (crash().yourStake)
				toast.error(`You lost $${crash().yourStake.amount}.`);
			setCrash({ ...crash(), yourStake: null });
		});
	});
	onCleanup(() => {
		socket()?.off?.('crash update');
	});

	const placeBet = e => {
		e?.preventDefault();
		if (stake() > user().balance)
			return toast.error('Bet amout exceeds account balance.');
		if (stake() <= 0)
			return toast.error('Bet amout must be above $0.');
		if (stake() > MAX_BET)
			return toast.error(`Bet amout exceeds max bet of $${MAX_BET}.`);
		socket().emit('crash stake', stake());
		setCrash({
			...crash(),
			yourStake: { amount: stake() }
		});
	};

	const cashout = () => {
		if (crash().inProgress)
			toast.success(`You gained $${(crash().yourStake.amount * (calculateRate(now() - crash().t1) - 1)).toFixed(2)}.`);
		socket().emit('crash cashout');
		setCrash({
			...crash(),
			yourStake: null
		});
	};

	const maxBet = () => {
		setStake(Math.min(MAX_BET, user().balance));
		placeBet();
	};

	setInterval(() => setNow(time()), 20);
	const rate = () => calculateRate(now() - crash().t1);

	return (
		<>
			<Title>Crash</Title>
			<div class='p-2 mx-auto container'>
				<VStack>
					<HStack spacing='6px' wrap='wrap'>
						{crash().previousGames.slice(0).reverse().map(x => (
							<div class='flex-none cursor-pointer' onClick={() => {
								setModal(x);
								setIsOpen(true);
							}}>
								<Badge colorScheme={
									x.roll >= 3 ? 'success' :
									x.roll >= 2 ? 'warning' : 'neutral'
								}>{x.roll.toFixed(2)}</Badge>
							</div>
						))}
					</HStack>
					<Show when={crash().inProgress}>
						<span class='text-green-600 text-4xl'>x{rate().toFixed(2)}</span>
						<Show when={crash().yourStake}>
							<div class='text-green-600'>
								${crash().yourStake.amount.toFixed(2)} -&gt; ${(crash().yourStake.amount * rate()).toFixed(2)}
							</div> 
						</Show>
					</Show>
					<Show when={!crash().inProgress}>
						<Show when={crash().nextGame - 10000 < now()} fallback={
							<span class='text-red-600 text-4xl'>x{calculateRate((crash().nextGame - 12000) - crash().t1).toFixed(2)}</span>
						}>
							<span class='text-yellow-600 text-2xl'>next round in {((crash().nextGame - now()) / 1000).toFixed(2)}s</span>
						</Show>
					</Show>
					<VStack spacing='6px'>
						<form class='w-[240px]' onSubmit={placeBet}>
							<Input
								disabled={crash().inProgress || crash().yourStake}
								label='$'
								class='w-full'
								type='number'
								value={stake()}
								onInput={e => setStake(+e.target.value)}
								placeholder={`Max bet: $${MAX_BET}`}
							/>
						</form>
						<HStack spacing='6px'>
							<div class='w-[240px] flex'>
								<div class='flex-grow pr-[6px]'>
									<Show when={crash().inProgress}>
										<Show when={crash().yourStake} fallback={
											<Button isFullWidth disabled>Bet</Button>
										}>
											<Button isFullWidth variant='solid' colorScheme='danger' onClick={cashout}>Cash Out</Button>
										</Show>
									</Show>
									<Show when={!crash().inProgress}>
										<Show when={crash().yourStake} fallback={
											<Button isFullWidth variant='solid' colorScheme='success' onClick={placeBet}>Bet</Button>
										}>
											<Button isFullWidth variant='solid' colorScheme='danger' onClick={cashout}>Cancel</Button>
										</Show>
									</Show>
								</div>
								<Button
									disabled={crash().inProgress || crash().yourStake}
									variant='solid'
									colorScheme='warning'
									onClick={maxBet}>
										Max
								</Button>
							</div>
						</HStack>
					</VStack>
				</VStack>
			</div>
			<Modal isOpen={isOpen()} onClose={() => setIsOpen(false)}>
				<Modal.Overlay />
				<Modal.Content p={4}>
					<HStack alignItems='flex-start' justifyContent='space-between' mb={4}>
						<Modal.Heading fontWeight='semibold'>Round results</Modal.Heading>
						<Modal.CloseButton />
					</HStack>
					hash: <code class='break-words'>{modal().hash}</code>
					roll: {modal().roll.toFixed(2)}<br />
					start time: {new Date(modal().startTime).toISOString()}<br />
					crash time: {new Date(modal().crashTime).toISOString()}
				</Modal.Content>
			</Modal>
		</>
	);
};

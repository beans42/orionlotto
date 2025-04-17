import { Title } from 'solid-start';
import Link from '../utils/Link';

export default () => {
	return (
		<>
			<Title>Welcome to Orion!</Title>
			<div class='p-2 mx-auto container'>
				<div class='text-5xl font-bold'>
					Welcome to{' '}
					<span class='text-transparent bg-clip-text bg-gradient-to-br from-pink-400 to-red-600'>Orion</span>
					!
				</div>
				<div class='mb-4'>
					A provably fair, fully anonymous, crypto gambling site.
				</div>
				<ul>
					<li class='before:content-["→"]'>
						Provably fair: Pre-generated chain of hashes ensure random and auditable results. <Link href='fair' class='underline decoration-blue-600'>Read more...</Link>
					</li>
					<li class='before:content-["→"]'>
						Fully anonymous: No KYC or identification needed (not even an email).
					</li>
					<li class='before:content-["→"]'>
						No currency fluctuation: Funds are stored in stablecoins (Stellar USDC).
					</li>
					<li class='before:content-["→"]'>
						Instant deposits and withdrawals: The stellar blockchain allows for low-fee, near-instant transfer of funds.
					</li>
				</ul>
				<div class='mt-2'>
					<Link href='login' class='underline decoration-blue-600'>
						Make an account!
					</Link>
				</div>
			</div>
		</>
	)
}
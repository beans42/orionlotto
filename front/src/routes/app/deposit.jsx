import { Title } from '@solidjs/meta';
import { Heading, Anchor, Button, HStack } from '@hope-ui/core';

import { user } from '~/utils/state';

function fallbackCopyTextToClipboard(text) {
	const textArea = document.createElement('textarea');
	textArea.value = text;
	textArea.style.top = '0';
	textArea.style.left = '0';
	textArea.style.position = 'fixed';
	document.body.appendChild(textArea);
	textArea.focus();
	textArea.select();
	try {
		document.execCommand('copy');
	} catch (err) {}
	document.body.removeChild(textArea);
}

function copyTextToClipboard(text) {
	if (!navigator.clipboard) {
		fallbackCopyTextToClipboard(text);
		return;
	}
	navigator.clipboard.writeText(text);
}

export default () => {
	const style = 'text-[#0894b3] dark:text-[#00b1cc]';
	return (
		<>
			<Title>Deposit</Title>
			<div class='p-2 mx-auto container'>
				<Heading size='3xl'>Deposit</Heading>
				<ol class='list-decimal ml-4'>
					<li>
						Create and fund a stellar account. (You can use <Anchor isExternal class={style} href='https://stellarterm.com/signup/'>StellarTerm</Anchor>)
					</li>
					<li>
						Convert your XLM to USDC. <Anchor isExternal class={style} href='https://stellarterm.com/exchange/USDC-www.centre.io/XLM-native'>Convert on StellarTerm</Anchor>
					</li>
					<li>
						Set the recipient as <code class='break-words'>{import.meta.env.VITE_WALLET_PUB}</code>. <Anchor isExternal class={style} href='https://stellarterm.com/account/send?asset=USDC-www.centre.io'>Send on StellarTerm</Anchor>
					</li>
					<li>
						Set the "Memo type" to "Memo text" and set the "Memo content" to <code class='break-words'>{user().memo}</code>.<br />
						This memo corresponds to your account, make sure you use the right one.
					</li>
					<li>
						Ensure "Asset" is USDC and not XLM.
					</li>
					<li>
						Click send. Your funds will arrive in less than a minute.
					</li>
				</ol>
				<HStack class='mb-4' spacing='6px'>
					<Button onClick={() => copyTextToClipboard(import.meta.env.VITE_WALLET_PUB)}>
						Copy Address
					</Button>
					<Button onClick={() => copyTextToClipboard(user().memo)}>
						Copy Memo
					</Button>
				</HStack>
				Note: You can buy USDC directly on <Anchor isExternal class={style} href='https://www.moonpay.com/buy'>MoonPay</Anchor> and have it sent to your Orion account using a credit card (you may need ID). Make sure to set "USD Coin (Stellar)" as the target currency. Also make sure to set the "Tag (optional)" field to your account's memo.
			</div>
		</>
	);
};
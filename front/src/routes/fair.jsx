import { Title } from '@solidjs/meta';
import { createSignal, Switch, Match } from 'solid-js'

const code = `<!-- HTML generated using hilite.me --><div style="background: #000000; overflow:auto;width:auto;border:solid gray;border-width:.1em .1em .1em .8em;padding:.2em .6em;"><pre style="margin: 0; line-height: 125%"><span style="color: #cdcd00">const</span> <span style="color: #cccccc">INSTANT_CRASH_PERCENTAGE</span> <span style="color: #3399cc">=</span> <span style="color: #cd00cd">6.66</span><span style="color: #cccccc">;</span>
<span style="color: #00cd00">function</span> <span style="color: #cccccc">rollCrash(seed)</span> <span style="color: #cccccc">{</span>
	<span style="color: #cdcd00">const</span> <span style="color: #cccccc">hash</span> <span style="color: #3399cc">=</span> <span style="color: #cccccc">crypto.createHmac(</span><span style="color: #cd0000">&#39;sha256&#39;</span><span style="color: #cccccc">,</span> <span style="color: #cccccc">seed).digest(</span><span style="color: #cd0000">&#39;hex&#39;</span><span style="color: #cccccc">);</span>
	<span style="color: #cdcd00">const</span> <span style="color: #cccccc">h</span> <span style="color: #3399cc">=</span> <span style="color: #cd00cd">parseInt</span><span style="color: #cccccc">(hash.slice(</span><span style="color: #cd00cd">0</span><span style="color: #cccccc">,</span> <span style="color: #cd00cd">52</span> <span style="color: #3399cc">/</span> <span style="color: #cd00cd">4</span><span style="color: #cccccc">),</span> <span style="color: #cd00cd">16</span><span style="color: #cccccc">);</span>
	<span style="color: #cdcd00">const</span> <span style="color: #cccccc">e</span> <span style="color: #3399cc">=</span> <span style="color: #cd00cd">Math</span><span style="color: #cccccc">.pow(</span><span style="color: #cd00cd">2</span><span style="color: #cccccc">,</span> <span style="color: #cd00cd">52</span><span style="color: #cccccc">);</span>
	<span style="color: #cdcd00">const</span> <span style="color: #cccccc">result</span> <span style="color: #3399cc">=</span> <span style="color: #cccccc">(</span><span style="color: #cd00cd">100</span> <span style="color: #3399cc">*</span> <span style="color: #cccccc">e</span> <span style="color: #3399cc">-</span> <span style="color: #cccccc">h)</span> <span style="color: #3399cc">/</span> <span style="color: #cccccc">(e</span> <span style="color: #3399cc">-</span> <span style="color: #cccccc">h);</span>
	<span style="color: #cdcd00">const</span> <span style="color: #cccccc">houseEdgeModifier</span> <span style="color: #3399cc">=</span> <span style="color: #cd00cd">1</span> <span style="color: #3399cc">-</span> <span style="color: #cccccc">INSTANT_CRASH_PERCENTAGE</span> <span style="color: #3399cc">/</span> <span style="color: #cd00cd">100</span><span style="color: #cccccc">;</span>
	<span style="color: #cdcd00">const</span> <span style="color: #cccccc">endResult</span> <span style="color: #3399cc">=</span> <span style="color: #cd00cd">Math</span><span style="color: #cccccc">.max(</span><span style="color: #cd00cd">100</span><span style="color: #cccccc">,</span> <span style="color: #cccccc">result</span> <span style="color: #3399cc">*</span> <span style="color: #cccccc">houseEdgeModifier);</span>
	<span style="color: #cdcd00">return</span> <span style="color: #cd00cd">Math</span><span style="color: #cccccc">.floor(endResult)</span> <span style="color: #3399cc">/</span> <span style="color: #cd00cd">100</span><span style="color: #cccccc">;</span>
<span style="color: #cccccc">}</span>
</pre></div>`;

export default () => {
	const [tab, setTab] = createSignal(1);

	const style = 'inline-block ml-0 p-2.5 border-b-2 border-neutral-200 cursor-pointer';
	const selected = style+' border-blue-500';
	return (
		<>
			<Title>Provably Fair</Title>
			<div class='p-2 mx-auto container'>
				<ul class='list-none p-0 mb-0'>
					<li class={tab() === 1 ? selected : style} onClick={() => setTab(1)}>
						Crash
					</li>
				</ul>
				<Switch>
					<Match when={tab() === 1}>
						Firstly, a server-side secret is hashed to provide H1. H1 is fed into the same hash function to provide H2. This goes on until H1000.
						The hashes are fed into the roll function in reverse order (H1000 first). After the round is done, the hash that was used that round is published.
						This means that the hash of the current round's seed is the previous round's seed. This makes it impossible to reverse but easy to audit fairness.
						<br /><br />Below is the code of the crash roll function:
						<div innerHTML={code}></div>
					</Match>
				</Switch>
			</div>
		</>
	);
};
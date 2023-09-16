import { createSignal } from 'solid-js';

const ret = createSignal({
	user: null,
	balance: null,
	memo: null,
	staked: null
});

export const user = ret[0];
export const setUser = ret[1];
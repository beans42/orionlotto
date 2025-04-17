import { createSignal } from 'solid-js';

const ret = createSignal(null);

export const socket = ret[0];
export const setSocket = ret[1];
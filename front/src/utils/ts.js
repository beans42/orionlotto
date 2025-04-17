import { createSignal } from 'solid-js';
import axios from 'axios';

const [offset, setOffset] = createSignal(null);

const runs = 3;
export const initialize = async () => {
	let measures = [];
	for (let i = 0; i < runs; ++i) {
		const t0 = Date.now();
		const res = await axios.get(`${import.meta.env.VITE_API}/now`);
		const t3 = Date.now();
		if (res.status === 200) {
			const ts = res.data;
			measures.push(Math.round(((ts - t0) + (ts - t3)) / 2));
		} else
			measures.push(0);
	}
	measures.sort((x, y) => x - y);
	setOffset(measures[Math.floor((runs - 1) / 2)]);
};
export { offset };
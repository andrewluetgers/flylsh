import {matrix} from './matrix'

let Ziggurat = require('node-ziggurat');

export function normal(seed) {
	seed = seed || new Date().getTime();
	let z = new Ziggurat(seed);
	return z.nextGaussian;
}

// https://en.wikipedia.org/wiki/Xorshift
export function uniform(seed) {
	seed = seed || new Date().getTime();
	let w = 0, max32BitInt = 2147483647;
	
	// Set up generator function.
	function xor() {
		let t = seed ^ (seed << 11);
		w ^= (w >> 19) ^ t ^ (t >> 8);
		seed = w;
		return seed / max32BitInt;
	}
	
	// discard first 64 vals
	for (let k = 64; k > 0; --k) {
		xor();
	}
	
	return xor;
}

// Compute a pseudo random integer in range [0, 32767]
// 32767 = 2^15 - 1. The maximum signed 16 bit value.
export function randInt() {
	g_seed = (Math.imul(214013*g_seed)+(2531011|0))|0;
	return (g_seed>>16)&32767;
}


/**
 * returns n random sample indices
 * without replacement (no duplicates) from n possibilities
 *
 * @param s {Number} source array to sample from
 * @param n {Number} number of samples
 * @param rand {Function} BYOPRNG! defaults to Math.random
 * @returns {Array} n random indices into source
 */
export function randomIndices(s, n, rand) {
    rand = rand || Math.random;
	let bucket = Object.keys(s),
        indices = [];

	if (n>s.length) {
		throw new Error("n should be <= s.length");
	}

	for (let i=0; i<n; i++) {
		indices.push(bucket.splice(Math.floor(rand()*bucket.length), 1)[0]);
	}

	return indices;
}


/**
 * produces a new 2D Array of cols width, rows height
 * each row will have samples # of random 1s set
 * all other values will be 0
 *
 * @param rows {Number}
 * @param cols {Number}
 * @param samples {Number} number of random 1s per row
 * @param rand {Function} BYOPRNG! defaults to Math.random
 * @returns {Array} 2D array of cols width and rows height
 */
export function binaryRandomMatrix(rows, cols, samples, rand) {
	if (samples > cols) {
		throw new Error("Samples should not exceed number of cols.");
	}

	let mat = matrix(rows, cols, ()=>0);
	mat.forEach(row => randomIndices(row, samples, rand).forEach(i => row[i] = 1));

	return mat;
}
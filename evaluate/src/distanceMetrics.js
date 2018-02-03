
/**
 * calculates the L2 (euclidean) distance of two arrays
 *
 * @param x {Array} some numbers
 * @param y {Array} some numbers
 * @returns {Number} L2 distance
 */
function l2Distance(x, y) {
	let len = x.length,
		t = 0, s = 1, r;
	
	if (!x || !y) {
		throw new Error("Expected two input arrays");
	}
	
	if (x.length !== y.length) {
		throw new Error("Input array lengths must be the same");
	}
	
	for (let i = 0; i<len; i++) {
		let val = x[i] - y[i],
			abs = Math.abs(val);
		
		if (abs) {
			if (abs>t) {
				r = t / val;
				s = 1 + s*r*r;
				t = abs;
			} else {
				r = val / t;
				s += r*r;
			}
		}
	}
	
	return t * Math.sqrt(s);
}


/**
 * calculates the L1 (manhattan) distance of two arrays
 *
 * @param x {Array} some numbers
 * @param y {Array} some numbers
 * @returns {Number} L1 distance
 */
function l1Distance(x, y) {
	d = 0;
	x.forEach((xi, i) => d += Math.abs(xi - y[i]));
	return d;
}

module.exports = {
	l1: l1Distance,
	l2: l2Distance
};
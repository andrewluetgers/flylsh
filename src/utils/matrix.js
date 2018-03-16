
/**
 * @param rows {Number}
 * @param cols {Number}
 * @param valFn {Function} given row and column return value for that cell of the matrix
 * @returns {Array} 2D array of cols width and rows depth having values produced by valFn
 */
export function matrix(rows, cols, valFn) {
	let vals = [], rVals;
	for (let r=0; r<rows; r++) {
		vals[r] = rVals = [];
		for (let c=0; c<cols; c++) {
			rVals[c] = valFn(r, c);
		}
	}
	return vals;
}

/**
 * @param matrix {Array} 2D array
 * @param fn {Function} is called with row and column indices and matrix
 * iterates over all column values in row order before advancing to next column
 */
export function byColumn(matrix, fn) {
	let cols = matrix[0].length,
		rows = matrix.length;
	
	for (let c=0; c<cols; c++) {
		for (let r=0; r<rows; r++) {
			fn(r, c, matrix);
		}
	}
}

/**
 * matrix multiplication
 *
 * @param a {Array} 2D matrix of numbers
 * @param b {Array} 2D matrix of numbers
 * @returns {Array|*|{}}
 */
export function multiply(a, b) {
	if (a[0].length !== b.length) {
		throw new Error('Columns of a '+a[0].length+' must equal rows of b '+b.length);
	}
	return a.map(x => transpose(b).map(y => dot(x, y)));
}

/**
 * matrix multiplication using a binary matrix
 *
 * @param a {Array} 2D matrix of numbers
 * @param b {Array} 2D matrix of numbers either 0 or 1
 * @returns {Array|*|{}}
 */
export function multiplyB(a, b) {
	if (a[0].length !== b.length) {
		throw new Error('Columns of a '+a[0].length+' must equal rows of b '+b.length);
	}
	return a.map(x => transpose(b).map(y => dotB(x, y)));
}

export function dot(a, b) {
	let res = 0;
	for (let i=0, len=a.length; i<len; i++) {
		res += b[i] * a[i];
	}
	return res;
}

export function dotB(a, b) {
	let res = 0;
	for (let i=0, len=a.length; i<len; i++) {
		res += (b[i]|0) === (1|0) ? a[i] : 0;
	}
	return res;
}

export function multiplyWeblas(a, b) {
	if (a[0].length !== b.length) {
		throw new Error('Columns of a '+a[0].length+' must equal rows of b '+b.length);
	}
	
	let height_A = a.length, width_A = a[0].length,
		height_B = b.length, width_B = b[0].length,
		A = new Float32Array([].concat.apply([], a)),
		B = new Float32Array([].concat.apply([], b)),
		M = height_A,
		N = width_B,
		K = height_B, // must match width_A
		alpha = 1.0,
		beta = 0.0;

	// result will contain matrix multiply of A x B (times alpha)
	return weblas.sgemm(M, N, K, alpha, A, B, beta, null);
}

/**
 * modifies given matrix by
 * dividing all values by width
 * and flooring the value
 *
 * @param matrix {Array} 2D array of numbers
 * @param width {Number} width of each bucket to quantize values into
 */
export function quantize(matrix, width) {
	byColumn(matrix, (r, c) => {
		matrix[r][c] = Math.floor(matrix[r][c]/width);
	});
}

/**
 * @param matrix {Array} 2D array to transpose
 * @returns {Array} a new transposed copy of input matrix
 */
export function transpose(matrix) {
	return matrix[0].map((v, c) => matrix.map(row => row[c]));
}

export function chunk(_array, size) {
	
	let array = Array.prototype.slice.call(_array),
		ret = [];
	
	for (let i=0, len=array.length; i<len; i+=size) {
		ret.push(array.slice(i, i+size));
	}
	
	return ret;
}

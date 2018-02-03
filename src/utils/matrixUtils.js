
/**
 * @param rows {Number}
 * @param cols {Number}
 * @param valFn {Function} given row and column return value for that cell of the matrix
 * @returns {Array} 2D array of cols width and rows depth having values produced by valFn
 */
function matrix(rows, cols, valFn) {
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
function byColumn(matrix, fn) {
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
 * you must transpose b as needed it is not assumed by this function
 *
 * @param a {Array} 2D matrix of numbers
 * @param b {Array} 2D matrix of numbers
 * @returns {Array|*|{}}
 */
function multiply(a, b) {
	if (a[0].length !== b[0].length) {
		throw new Error('Width of a '+a[0].length+' must equal width of b '+b[0].length);
	}
	return a.map(x => b.map(y => dot(x, y)));
}

function dot(a, b) {
	return a.map((x, i) => x * b[i]).reduce((m, n) => m + n || 0);
}

/**
 * modifies given matrix by
 * dividing all values by width
 * and flooring the value
 *
 * @param matrix {Array} 2D array of numbers
 * @param width {Number} width of each bucket to quantize values into
 */
function quantize(matrix, width) {
	byColumn(matrix, (r, c) => {
		matrix[r][c] = Math.floor(matrix[r][c]/width);
	});
}

/**
 * @param matrix {Array} 2D array to transpose
 * @returns {Array} a new transposed copy of input matrix
 */
function transpose(matrix) {
	return matrix[0].map((v, c) => matrix.map(row => row[c]));
}

module.exports = {
	// generators
	matrix: matrix,
	dot: dot,
	multiply: multiply,
	transpose: transpose,
	
	// modifiers
	byColumn: byColumn,
	quantize: quantize,
};


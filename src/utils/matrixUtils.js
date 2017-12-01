
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
 * @param matrix {Array} 2D array to transpose
 * @returns {Array} a new transposed copy of input matrix
 */
function transpose(matrix) {
	return matrix[0].map((v, c) => matrix.map(row => row[c]));
}

module.exports = {
	matrix: matrix,
	byColumn: byColumn,
	transpose: transpose
};


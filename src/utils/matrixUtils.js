
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

function dot(a, b) {
	
	console.log(b);
	
	let result = [];
	
	if (a[0].length !== b.length) {
		throw new Error("Columns in a must equal rows in b");
	}
	
	for (let i = 0; i < a.length; i++) {
		result[i] = [];
		
		for (let j = 0; j < b[0].length; j++) {
			let sum = 0;
			
			for (let k = 0; k < a[0].length; k++) {
				sum += a[i][k] * b[k][j];
			}
			
			result[i][j] = sum;
			//console.log(result[i][j]);
		}
	}
	return result;
}

/**
 * modifies given matrix by
 * dividing all values by buckets
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
	transpose: transpose,
	
	// modifiers
	byColumn: byColumn,
	quantize: quantize,
};


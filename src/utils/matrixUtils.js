
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

function byColumn(matrix, fn) {
	let cols = matrix[0].length,
		rows = matrix.length;
	
	for (let c=0; c<cols; c++) {
		for (let r=0; r<rows; r++) {
			fn(r, c, matrix);
		}
	}
}

function transpose(m) {
	return m[0].map((v, c) => m.map(row => row[c]));
}

module.exports = {
	matrix: matrix,
	byColumn: byColumn,
	normalize: normalize,
	transpose: transpose
};
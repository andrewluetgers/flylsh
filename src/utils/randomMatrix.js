
let nRandZiggurat = require('./nRandZiggurat'),
	m = require('./matrixUtils');


let seed, rand,
	zeros = (r, c) => m.matrix(r, c, ()=>0),
	randn = (r, c) => m.matrix(r, c, rand);

function setSeed(randomSeed) {
	seed = randomSeed || 1234567890;
	rand = nRandZiggurat(seed);
}

setSeed();

/**
 * returns s random (uniform distribution) sample indexes
 * without replacement (no duplicates) from n possibilities
 *
 * @param s {number} number of samples
 * @param n {number} size of array to sample from
 * @returns {Array} list of random indexes into an array of n length
 */
function randomSamples(s, n) {
	let bucket = [], indexes = [];
	
	for (let i=0; i<n; i++) {
		bucket.push(i);
	}
	
	for (let i=0; i<s; i++) {
		indexes.push(bucket.splice(Math.floor(Math.random()*bucket.length), 1)[0]);
	}
	
	return indexes;
}

/**
 * will produce a new matrix by
 * scaling given matrix rows such that
 * all rows will share the same mean
 *
 * @param matrix {Array} 2d matrix of numbers
 * @param targetMean {Number} optional, defaults to 100
 * @returns {Array} new matrix
 */
function centerRowMeans(matrix, targetMean) {
	targetMean = typeof targetMean === "number" ? targetMean : 100;
	
	return matrix.map(row => {
		let sum = row.reduce((p,c) => p + c),
			mean = sum / row.length,
			mult = mean ? targetMean/mean : 0;
		
		return row.map(col => col * mult);
	});
}

/**
 * will modify provided matrix scaling columns
 * such that all columns share the same target min value
 * subsequently every column will have (at some row)
 * at least 1 instance of the target min value
 *
 * @param matrix {Array} 2d matrix of numbers
 * @param targetMin {Number} optional, defaults to 0
 */
function setColumnMins(matrix, targetMin) {
	targetMin = targetMin || 0;
	let mins = []; // mins by column
	m.byColumn(matrix, (r, c) => mins[c] = Math.min(mins[c]||Infinity, matrix[r][c]));
	//mins = mins.map(Math.abs);
	//m.byColumn(matrix, (r, c) => matrix[r][c] += (mins[c]+targetMin));
	m.byColumn(matrix, (r, c) => matrix[r][c] -= (mins[c]+targetMin));
}

/**
 * modifies the given matrix by:
 * 1) normalizing columns to positive values
 * 2) centering row means to targetMean
 *
 * @param matrix {Array} 2d array of numbers
 * @param targetMean {Number} optional defaults to 100
 * @returns {Array} the normalized matrix
 */
function normalizeMatrix(matrix, targetMean) {
	// normalize to positive values
	setColumnMins(matrix);
	
	// center the means to targetMean
	return centerRowMeans(matrix);
}

/**
 * @param rows {number} corresponds to number of kenyan cells in algorithm
 * @param cols {number} corresponds to number of dimensions in data
 * @param samples {number} (optional)
 * @returns 2d array of cols width and rows height
 * if # of samples is given a sparse binary matrix is returned
 * where samples = # of random 1s per row
 * if # of samples is not given a dense gaussian matrix is returnd
 * where values are normally distributed, positive, with means centered
 */
function randomMatrix(rows, cols, samples) {
	let matrix;
	
	if (samples) {
		// sparse binary random matrix
		if (samples > cols) {
			throw new Error("Sparse binary samples should not exceed number of dimensions.");
		}
		
		matrix = zeros(rows, cols);
		matrix.forEach(row => randomSamples(samples, cols).forEach(i => row[i] = 1));
		
	} else {
		// dense gaussian random matrix
		matrix = normalizeMatrix(randn(rows, cols));
	}
	
	return matrix;
}

module.exports = {
	setSeed: setSeed,
	zeros: zeros,
	randn: randn,
	randomSamples: randomSamples,
	normalizeMatrix: normalizeMatrix,
	randomMatrix: randomMatrix
};


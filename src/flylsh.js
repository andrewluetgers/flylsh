

// setupRandom numbers
let Ziggurat = require('./utils/ziggurat'),
	m = require('./utils/matrixUtils');


let rand;
function setSeed(randomSeed) {
	let seed = randomSeed || (new Date().getTime()),
		z = new Ziggurat();
	
	z.init(seed);
	rand = z.nextGaussian;
}

setSeed();


/**
 * returns s random (uniformly distributed) sample indices
 * without replacement (no duplicates) from n possibilities
 *
 * @param s {Number} number of samples
 * @param n {Number} size of array to sample from
 * @returns {Array} list of random indices into an array of n length
 */
function randomSamples(s, n) {
	let bucket = [], indices = [];
	
	if (s>n) {
		throw new Error("s should be <= n");
	}
	
	for (let i=0; i<n; i++) {
		bucket.push(i);
	}
	
	for (let i=0; i<s; i++) {
		indices.push(bucket.splice(Math.floor(Math.random()*bucket.length), 1)[0]);
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
 * @returns {Array} 2D array of cols width and rows height
 */
function binaryRandomMatrix(rows, cols, samples) {
	if (samples > cols) {
		throw new Error("Binary samples should not exceed number of cols.");
	}
	
	let matrix = m.matrix(rows, cols, ()=>0);
	matrix.forEach(row => randomSamples(samples, cols).forEach(i => row[i] = 1));
	
	return matrix;
}


/**
 * will modify provided matrix shifting columns
 * such that all columns share the same target min value
 * subsequently every column will have (at some row)
 * at least 1 instance of the target min value
 *
 * @param matrix {Array} 2d matrix of numbers
 * @param targetMin {Number} optional, defaults to 0
 */
function normalizeColumnMins(matrix, targetMin) {
	targetMin = targetMin || 0;
	let mins = [];
	
	// set mins by column
	m.byColumn(matrix, (r, c) => mins[c] = Math.min(mins[c]||Infinity, matrix[r][c]));
	
	// todo determine if option 2 is the best answer
	
	//option 1: raise everything by the same amount (same as original)
	mins = mins.map(Math.abs);
	m.byColumn(matrix, (r, c) => matrix[r][c] += (mins[c]+targetMin));
	
	//option 2: raise or lower so all share the same min (seems more "normalized")
	//m.byColumn(matrix, (r, c) => matrix[r][c] -= (mins[c]+targetMin));
}


/**
 * produced a new matrix by scaling given matrix rows
 * such that all rows will share the same mean
 *
 * @param matrix {Array} 2d matrix of numbers
 * @param targetMean {Number} optional, defaults to 100
 * @returns {Array} new matrix
 */
function normalizeRowMeans(matrix, targetMean) {
	targetMean = (typeof targetMean === "number") ? targetMean : 100;
	
	// zerofix if targetMean is 0
	// so that we don't zero-out all values set the mean to 1
	// then subtract 1 after multiplying
	let zeroFix = targetMean === 0 ? 1 : 0;
	targetMean = targetMean || 1;
	
	return matrix.map(row => {
		let sum = row.reduce((p,c) => p + c),
			mean = sum / row.length,
			mult = mean && targetMean/mean;
		
		return row.map(col => {
			let val = mean
				? col*mult
				: col+targetMean; // handle edge case mean = 0
			
			return val-zeroFix;
		});
	});
}


/**
 * modifies the given matrix by:
 * 1) normalizing columns to positive values or targetMin
 * 2) centering row means to 100 or targetMean
 *
 * @param matrix {Array} 2d array of numbers
 * @param targetMin {Number} optional defaults to 0
 * @param targetMean {Number} optional defaults to 100
 * @returns {Array} the normalized matrix
 */
function normalizeMatrix(matrix, targetMin, targetMean) {
	// normalize to positive values
	normalizeColumnMins(matrix, targetMin);
	// center the means to targetMean
	return normalizeRowMeans(matrix, targetMean);
}


/**
 * produces a new 2D random matrix as specified below
 *
 * @param rows {Number} corresponds to number of kenyan cells in algorithm
 * @param cols {Number} corresponds to number of dimensions in data
 * @param samples {Number} (optional) see description below
 * @returns 2d array of cols width and rows height
 *
 * if samples is given a sparse binary matrix is returned
 * where samples = number of random 1s per row
 *
 * if samples is not given a dense gaussian matrix is returned
 * where values are gaussian, positive, with row means at 100
 */
function randomMatrix(rows, cols, samples) {
	if (samples) {
		// sparse binary random matrix
		return binaryRandomMatrix(rows, cols, samples);
	} else {
		// dense gaussian random matrix
		return normalizeMatrix(m.matrix(rows, cols, rand));
	}
}


module.exports = {
	setSeed: setSeed,
	randomSamples: randomSamples,
	binaryRandomMatrix: binaryRandomMatrix,
	normalizeColumnMins: normalizeColumnMins,
	normalizeRowMeans: normalizeRowMeans,
	randomMatrix: randomMatrix
};
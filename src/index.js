
let Ziggurat =      require('node-ziggurat'),
	quickselect =   require('quickselect'),
	m =             require('./utils/matrixUtils');


// setup how random numbers are generated, algorithm calls for
// normally distributed Ziggurat is the fastest impl I can find
// see https://github.com/andrewluetgers/nRandTest
let rand;
function setSeed(seed) {
	let z = new Ziggurat(seed);
	rand = z.nextGaussian;
	return rand;
}

setSeed(); // uses timestamp by default


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
	
	//console.log("mins", mins);
	// todo determine if option 2 is the best answer
	
	//option 1: raise everything by the same amount (same as original)
	mins = mins.map(Math.abs);
	console.log("mins", mins);
	console.log("matrix", matrix[0]);
	m.byColumn(matrix, (r, c) => matrix[r][c] = (matrix[r][c]||0) + (mins[c]+targetMin));
	
	console.log("row 10", matrix[10]);
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
	
	let rows = matrix.length,
		cols = matrix[0].length;
	
	if (targetMean <= 0) {
		throw new Error("positive number expected");
	}
	
	for (let r=0; r<rows; r++) {
		let row = matrix[r],
			sum = row.reduce((p,c) => p + c),
			mean = sum / cols,
			mult = mean ? targetMean/mean : 1;
		
		// hot code, avoiding iterator function call overhead of array methods
		if (!sum && !mean) {
			for (let c=0; c<cols; c++) {row[c] = row[c]+targetMean}
		} else {
			for (let c=0; c<cols; c++) {row[c] = row[c]*mult}
		}
	}
}

/**
 * modifies given data in-place!!
 *
 * @param data {Array} 2D array of numbers
 * @returns {Array}
 */
function normalize(data) {
	// normalize to positive values
	normalizeColumnMins(data, 0);
	
	
	// center the means to targetMean
	normalizeRowMeans(data, 100);
	console.log("n2", data[0]);
}

// return a completed set of options
// uses defaults for those not given
function getOpts(opts={}) {
	

	
	let o = {
		debug:          opts.debug          || false,
		reps:           opts.reps           || 50,
		kCells:         opts.kCells         || 50,
		samples:        opts.samples        || undefined,
		bucketWidth:    opts.bucketWidth    || 10,
		hashLength:     opts.hashLength     || 16,
		tagType:        opts.tagType        || "top"
	};
	
	if (o.tagType === "all") {
		o.hashLength = o.kCells;
	}
	
	return o;
}

/**
 * flylsh implementation
 *
 * @param data {Array} 2D matrix of numbers
 * @param opts {Object} optional
 *   debug           turns on logging                               (default=false)
 *   kCells          number of Kenyon cells                         (default=50)
 *   bucketWidth     modifies the quantization process              (default=10)
 *   hashLength      number of returned values per row              (default=1r)
 *   tagType         winner-take-all method all|top|bottom|random   (default="top")
 *   samples         set for sparse binary projection type          (default=undefined)
 *                   recommended value = data dimensions/10
 *                   default value = traditional LSH behavior
 *
 * ------------------------------------------------------------------------------------
 * all quotations and details from https://doi.org/10.1101/180471
 * ------------------------------------------------------------------------------------
 *
 * Fly Olfactory Model and Terminology:
 *
 * input data corresponds to scents
 * each data column corresponds a specific odorant receptor neuron (ORN) type
 * thus a row represents the total ORN response to a given scent
 **
 * ORNs connect to projection neurons (PNs) in structures called glomeruli
 * this is a feed-forward / 1-to-1 mapping
 * in this code data columns (cols), dimensions, ORNs, and PNs are equivalent
 *
 * PNs project randomly to the Kenyon cells (KCs) https://en.wikipedia.org/wiki/Kenyon_cell
 * there are many more Kenyon cells than PNs
 *
 * "40-fold expansion in the number of neurons 50 PNs project to 2000 Kenyon cells (KCs),
 * connected by a sparse, binary random connection matrix (14). Each Kenyon cell
 * receives and sums the firing rates from about 6 randomly selected PNs"
 *
 * the above quote would look like the following
 * input data would have 50 columns/dimensions
 *
 * hash(data, {kCells: 2000, samples: 6})
 *
 *
 * Basic Steps:
 *
 * ------ step 1 normalize ------
 * input data is normalized:
 *  1 columns are shifted to have positive values
 *  2 row values are scaled so that all rows share the same mean
 *    see https://en.wikipedia.org/wiki/Normalization_model
 *
 * ------ step 2 project ------
 * large expansion of neurons (a signature feature of the fly algorithm)
 *
 * ------ step 3 winner take all ------
 * "a winner-take-all circuit using strong inhibitory feedback from a single
 * inhibitory neuron, called APL. As a result, all but the highest firing 5% of
 * Kenyon cells are silenced (3, 5, 6, 15). The firing rates of the remaining 5%
 * corresponds to the tag assigned to the input odor."
 *
 * ------------------------------------------------------------------------------------
 *
 * Discussion:
 * "three differences between the fly’s algorithm versus conventional LSH algorithms.
 *
 * First, the fly uses sparse, binary random projections,
 * whereas LSH functions typically use dense, i.i.d. Gaussian random projections
 * that are much more expensive to compute.
 *
 * Second, the fly expands the dimensionality of the input after projection (d ≪ m),
 * whereas LSH contracts the dimension (d ≫ m).
 *
 * Third, the fly sparsifies the higher-dimensionality representation
 * using a winner-take-all (WTA) mechanism,
 * whereas LSH preserves a dense representation."
 *
 * ------------------------------------------------------------------------------------
 *
 * Examples for Figure 3:
 *
 * Fly example:
 * Sparse, binary random projection where each Kenyon cell
 * samples 12 inputs, with 1280 Kenyon cells, selecting the
 * top 16 firing neurons for the hash length, evaluated on
 * e.g. hash(data, {samples: 12, kCells: 1280, hashLength: 16, tagType: "top"})
 *
 * LSH example:
 * Dense, Gaussian random projection with a hash length of 16
 * e.g. hash(data, {kCells: 16, hashLength: 16, tagType: "all"})
 */

function hash(data, opts) {
	
	let d = data || [[]],
		o = getOpts(opts),
		rows = d.length,        // rows of data
		cols = d[0].length,     // columns in data (dimensions)
		matrix,                 // the random projection matrix
		product,                // the computed Kenyon cell activity
		hashVals;               // hash values for provided data
	
	if (rows < 10) {throw new Error('Minimum of 10 rows required')}
	
	
	// ------------ step 1 normalize ------------
	normalize(d);
	//console.log("normalized", rows, cols, d[20]);
	
	// ------------ step 2 project ------------
	// create random projection matrix of size Kenyon cells by ORNS.
	if (o.samples) {
		// sparse binary random matrix (FLY)
		matrix = binaryRandomMatrix(o.kCells, cols, o.samples);
	} else {
		// dense gaussian random matrix (LSH)
		matrix = m.matrix(o.kCells, cols, rand);
	}

	// compute KC firing activity
	product = m.multiply(d, matrix);
	
	// "an additional quantization step is used for discretization"
	m.quantize(product, o.bucketWidth);
	
	console.log("quantized", product[10]);
	
	// ------------ step 3 winner take all ------------
	// start with 0s
	hashVals = m.matrix(rows, o.kCells, ()=>0);
	
	// apply WTA to KCs: firing rates at indices corresponding to top/bot/rand/all KCs; 0s elsewhere.
	if (o.tagType === "random") {
		// fix indices for all odors, otherwise, can't compare.
		randomIndices = randomSamples(o.hashLength, o.kCells);
	}
	
	let index, indices, randomIndices;
	for (let r=0; r<rows; r++) {
		// winner take all
		switch(o.tagType) {
			case "all":
				hashVals[r] = product[r];
				break;
				
			case "random":
				indices = randomIndices;
				break;
				
			default:
			case "top":
				let row = product[r];
				indices = Object.keys(row);
				quickselect(indices, o.hashLength, null, null, function(ai ,bi) {
					let a = row[ai], b = row[bi];
					return a < b ? -1 : a > b ? 1 : 0;
				});
				//console.log("indices", indices);
				//let last = indices.length-1;
				indices = indices.slice(0, o.hashLength-1);
				//indices = indices.slice(last - o.hashLength, last);
				break;
		}
		
		if (o.tagType !== "all") {
			let hRow = hashVals[r],
				pRow = product[r],
				debug = [];
			
			for (let h=o.hashLength-2; h>=0; h--) {
				index = indices[h];
				(r === 10) && console.log(index);
				debug[index] = hRow[index] = pRow[index];
			}
			
			let sorted = pRow.sort(),
				min = sorted[0],
				max = sorted[sorted.length-1];
			
			(r === 10) && console.log({debug, pRow, min, max});
		}
	}
	
	return hashVals;
}


module.exports = {
	hash: hash,
	setSeed: setSeed,
	randomSamples: randomSamples,
	binaryRandomMatrix: binaryRandomMatrix,
	normalizeRowMeans: normalizeRowMeans,
	normalizeColumnMins: normalizeColumnMins
};
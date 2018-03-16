/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.matrix = matrix;
exports.byColumn = byColumn;
exports.multiply = multiply;
exports.multiplyB = multiplyB;
exports.dot = dot;
exports.dotB = dotB;
exports.multiplyWeblas = multiplyWeblas;
exports.quantize = quantize;
exports.transpose = transpose;
exports.chunk = chunk;

/**
 * @param rows {Number}
 * @param cols {Number}
 * @param valFn {Function} given row and column return value for that cell of the matrix
 * @returns {Array} 2D array of cols width and rows depth having values produced by valFn
 */
function matrix(rows, cols, valFn) {
	var vals = [],
	    rVals = void 0;
	for (var r = 0; r < rows; r++) {
		vals[r] = rVals = [];
		for (var c = 0; c < cols; c++) {
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
	var cols = matrix[0].length,
	    rows = matrix.length;

	for (var c = 0; c < cols; c++) {
		for (var r = 0; r < rows; r++) {
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
function multiply(a, b) {
	if (a[0].length !== b.length) {
		throw new Error('Columns of a ' + a[0].length + ' must equal rows of b ' + b.length);
	}
	return a.map(function (x) {
		return transpose(b).map(function (y) {
			return dot(x, y);
		});
	});
}

/**
 * matrix multiplication using a binary matrix
 *
 * @param a {Array} 2D matrix of numbers
 * @param b {Array} 2D matrix of numbers either 0 or 1
 * @returns {Array|*|{}}
 */
function multiplyB(a, b) {
	if (a[0].length !== b.length) {
		throw new Error('Columns of a ' + a[0].length + ' must equal rows of b ' + b.length);
	}
	return a.map(function (x) {
		return transpose(b).map(function (y) {
			return dotB(x, y);
		});
	});
}

function dot(a, b) {
	var res = 0;
	for (var i = 0, len = a.length; i < len; i++) {
		res += b[i] * a[i];
	}
	return res;
}

function dotB(a, b) {
	var res = 0;
	for (var i = 0, len = a.length; i < len; i++) {
		res += (b[i] | 0) === (1 | 0) ? a[i] : 0;
	}
	return res;
}

function multiplyWeblas(a, b) {
	if (a[0].length !== b.length) {
		throw new Error('Columns of a ' + a[0].length + ' must equal rows of b ' + b.length);
	}

	var height_A = a.length,
	    width_A = a[0].length,
	    height_B = b.length,
	    width_B = b[0].length,
	    A = new Float32Array([].concat.apply([], a)),
	    B = new Float32Array([].concat.apply([], b)),
	    M = height_A,
	    N = width_B,
	    K = height_B,
	    // must match width_A
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
function quantize(matrix, width) {
	byColumn(matrix, function (r, c) {
		matrix[r][c] = Math.floor(matrix[r][c] / width);
	});
}

/**
 * @param matrix {Array} 2D array to transpose
 * @returns {Array} a new transposed copy of input matrix
 */
function transpose(matrix) {
	return matrix[0].map(function (v, c) {
		return matrix.map(function (row) {
			return row[c];
		});
	});
}

function chunk(_array, size) {

	var array = Array.prototype.slice.call(_array),
	    ret = [];

	for (var i = 0, len = array.length; i < len; i += size) {
		ret.push(array.slice(i, i + size));
	}

	return ret;
}

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.normalizeColumnMins = normalizeColumnMins;
exports.centerRowMeans = centerRowMeans;
exports.hash = hash;

var _quickselect = __webpack_require__(2);

var _quickselect2 = _interopRequireDefault(_quickselect);

var _matrix = __webpack_require__(0);

var mat = _interopRequireWildcard(_matrix);

var _random = __webpack_require__(3);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var rand = Math.random;

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
	var mins = [];

	// set mins by column
	mat.byColumn(matrix, function (r, c) {
		return mins[c] = Math.abs(Math.min(mins[c] || 0, matrix[r][c]));
	});

	//console.log("mins", mins);
	// todo determine if option 2 is the best answer

	//option 1: raise everything by the same amount (same as original)
	mins = mins.map(Math.abs);
	//console.log("mins", mins);
	//console.log("matrix", matrix[0]);
	mat.byColumn(matrix, function (r, c) {
		return matrix[r][c] = (matrix[r][c] || 0) + (mins[c] + targetMin);
	});

	//option 2: raise or lower so all share the same min (seems more "normalized")
	//mat.byColumn(matrix, (r, c) => matrix[r][c] -= (mins[c]+targetMin));
}

/**
 * produced a new matrix by scaling given matrix values
 * such that all rows will share the same mean
 *
 * @param matrix {Array} 2d matrix of numbers
 * @param targetMean {Number} optional, defaults to 100
 * @returns {Array} new matrix
 */
function centerRowMeans(matrix, targetMean) {
	targetMean = typeof targetMean === "number" ? targetMean : 100;

	var rows = matrix.length,
	    cols = matrix[0].length;

	if (targetMean <= 0) {
		throw new Error("positive number expected");
	}

	for (var r = 0; r < rows; r++) {
		var row = matrix[r],
		    sum = 0,
		    mean = void 0,
		    mult = void 0;

		for (var c = 0; c < cols; c++) {
			sum += row[c];
		}

		mean = sum / cols, mult = mean ? targetMean / mean : 1;

		// hot code, avoiding iterator function call overhead of array methods
		// todo verify what to do in case of 0 mean
		for (var _c = 0; _c < cols; _c++) {
			row[_c] = row[_c] * mult;
		}
	}
}

// return a completed set of options
// uses defaults for those not given
function getOpts() {
	var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	var o = {
		debug: opts.debug || false,
		reps: opts.reps || 50,
		kCells: opts.kCells || 50,
		samples: opts.samples || undefined,
		bucketWidth: opts.bucketWidth || 10,
		hashLength: opts.hashLength || 16,
		tagType: opts.tagType || "top"
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
 *   debug           returns intermediate values                    (default=false)
 *   kCells          number of Kenyon cells                         (default=50)
 *   bucketWidth     modifies the quantization process              (default=10)
 *   hashLength      number of returned values per row              (default=16)
 *   tagType         winner-take-all method all|top|bottom|random   (default="top")
 *   samples         set for sparse binary projection type          (default=undefined)
 *                   undefined (default):
 *                      produces traditional LSH behavior
 *                   recommended value: dimensions/10
 *                      produces FLY LSH behavior
 *
 * ------------------------------------------------------------------------------------
 * quotations from https://doi.org/10.1101/180471
 * ------------------------------------------------------------------------------------
 *
 * Fly Olfactory Model and Terminology:
 *
 * input data corresponds to scents
 * each data column corresponds a specific odorant receptor neuron (ORN) type
 * thus a row represents the total ORN response to a given scent
 *
 * ORNs connect to projection neurons (PNs) in structures called glomeruli
 * this is a feed-forward / 1-to-1 mapping
 * in this code data columns (cols), dimensions, ORNs, and PNs are equivalent
 *
 * PNs project randomly to the Kenyon cells (KCs) https://en.wikipedia.org/wiki/Kenyon_cell
 * there are many more Kenyon cells than PNs
 *
 * "40-fold expansion in the number of neurons 50 PNs project to 2000 Kenyon cells,
 * connected by a sparse, binary random connection matrix. Each Kenyon cell
 * receives and sums the firing rates from about 6 randomly selected PNs"
 *
 * the above quote would look like the following:
 *  (input data would have 50 columns/dimensions)
 *  hash(data, {kCells: 2000, samples: 6})
 *
 *
 * Basic Steps of the Algorithm:
 *
 * ------ step 1 normalization ------
 *  1 columns are shifted to have positive values
 *  2 row values are scaled so that all rows share the same mean
 *    see https://en.wikipedia.org/wiki/Normalization_model
 *
 * ------ step 2 random projection ------
 * large expansion of neurons (a signature feature of the fly algorithm)
 *
 * ------ step 3 winner take all ------
 * "a winner-take-all circuit using strong inhibitory feedback from a single
 * inhibitory neuron, called APL. As a result, all but the highest firing 5% of
 * Kenyon cells are silenced. The firing rates of the remaining 5%
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

	var dbgOut = {},
	    d = data || [[]],
	    o = getOpts(opts),
	    rows = d.length,
	    // rows of data
	cols = d[0].length,
	    // columns in data (dimensions)
	matrix = void 0,
	    // the random projection matrix
	product = void 0,
	    // the computed Kenyon cell activity
	hashVals = void 0,
	    // hash values for provided data
	randIndices = void 0;

	if (rows < 10) {
		throw new Error('Minimum of 10 rows required');
	}

	function debugOut(name, obj, isArrayMember) {
		if (o.debug) {
			var array = void 0;
			if (isArrayMember) {
				array = dbgOut[name] = dbgOut[name] || [];
				array.push(obj);
			} else {
				dbgOut[name] = JSON.parse(JSON.stringify(obj || {}));
			}
		}
	}

	debugOut("step0_data", data);

	// ------------ step 1 normalize ------------
	// the following 2 operations modify the data in place !!

	// normalize to positive values
	normalizeColumnMins(data, 0);
	debugOut("step1_normalizeColumnMins", data);

	// center the means to targetMean
	centerRowMeans(data, 100);
	debugOut("step1_centerRowMeans", data);

	// ------------ step 2 project ------------
	// create random projection matrix of size Kenyon cells by ORNS.
	if (o.samples) {
		// sparse binary random matrix (FLY)
		matrix = (0, _random.binaryRandomMatrix)(cols, o.kCells, o.samples, rand);
		// compute KC firing activity
		//console.time("matB");
		//product = mat.multiplyB(d, matrix);
		//console.timeEnd("matB");
		console.time("matWeblas");
		product = mat.chunk(mat.multiplyWeblas(d, matrix), matrix[0].length);
		console.timeEnd("matWeblas");
	} else {
		// dense gaussian random matrix (LSH)
		//matrix = mat.matrix(o.kCells, cols, nrand); // why normal random?
		matrix = mat.matrix(cols, o.kCells, rand);
		// compute KC firing activity
		//product = mat.multiply(d, matrix);
		product = mat.multiplyWeblas(d, matrix);
	}

	debugOut("step2_matrix", matrix);
	debugOut("step3_product", product);

	// "an additional quantization step is used for discretization"
	mat.quantize(product, o.bucketWidth);
	debugOut("step4_quantized", product);

	console.log("product", product);

	// ------------ step 3 winner take all ------------
	// start with 0s
	hashVals = mat.matrix(rows, o.kCells, function () {
		return 0;
	});
	//debugOut("step7-0_hashvals", hashVals);

	// apply WTA to KCs: firing rates at indices corresponding to top/bot/rand/all KCs; 0s elsewhere.
	if (o.tagType === "random") {
		// fix indices for all odors, otherwise, can't compare.
		randIndices = (0, _random.randomIndices)(o.kCells, o.hashLength, rand);
	}

	var allInds = [],
	    allVals = [];

	var _loop = function _loop(r) {
		// winner take all
		var indsRow = void 0;
		switch (o.tagType) {
			case "all":
				hashVals[r] = product[r];
				debugOut("step6_indices_all", hashVals[r], true);
				break;

			case "random":
				indices = randIndices;
				debugOut("step6_indices_random", indices, true);
				break;

			default:
			case "top":
				var row = product[r],
				    valsRow = [];
				indsRow = Object.keys(row).map(Number);
				// quickselect uses https://en.wikipedia.org/wiki/Floyd-Rivest_algorithm
				(0, _quickselect2.default)(indsRow, o.hashLength, null, null, function (ai, bi) {
					var a = row[ai],
					    b = row[bi];
					return a < b ? 1 : a > b ? -1 : 0;
				});

				indsRow = indsRow.slice(0, o.hashLength); // comment out to debug selection
				indsRow.forEach(function (i) {
					hashVals[r][i] = row[i];
					valsRow.push(row[i]);
				});
				allInds.push(indsRow);
				allVals.push(valsRow);
				break;
		}
	};

	for (var r = 0; r < rows; r++) {
		_loop(r);
	}

	debugOut("step7_allTopIndices", allInds);
	debugOut("step7_allTopVals", allVals);
	debugOut("hashVals", hashVals);

	return o.debug ? dbgOut : { hashVals: hashVals };
}

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = quickselect;
module.exports.default = quickselect;

function quickselect(arr, k, left, right, compare) {
    quickselectStep(arr, k, left || 0, right || (arr.length - 1), compare || defaultCompare);
};

function quickselectStep(arr, k, left, right, compare) {

    while (right > left) {
        if (right - left > 600) {
            var n = right - left + 1;
            var m = k - left + 1;
            var z = Math.log(n);
            var s = 0.5 * Math.exp(2 * z / 3);
            var sd = 0.5 * Math.sqrt(z * s * (n - s) / n) * (m - n / 2 < 0 ? -1 : 1);
            var newLeft = Math.max(left, Math.floor(k - m * s / n + sd));
            var newRight = Math.min(right, Math.floor(k + (n - m) * s / n + sd));
            quickselectStep(arr, k, newLeft, newRight, compare);
        }

        var t = arr[k];
        var i = left;
        var j = right;

        swap(arr, left, k);
        if (compare(arr[right], t) > 0) swap(arr, left, right);

        while (i < j) {
            swap(arr, i, j);
            i++;
            j--;
            while (compare(arr[i], t) < 0) i++;
            while (compare(arr[j], t) > 0) j--;
        }

        if (compare(arr[left], t) === 0) swap(arr, left, j);
        else {
            j++;
            swap(arr, j, right);
        }

        if (j <= k) left = j + 1;
        if (k <= j) right = j - 1;
    }
}

function swap(arr, i, j) {
    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
}

function defaultCompare(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
}


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.normal = normal;
exports.uniform = uniform;
exports.randInt = randInt;
exports.randomIndices = randomIndices;
exports.binaryRandomMatrix = binaryRandomMatrix;

var _matrix = __webpack_require__(0);

var Ziggurat = __webpack_require__(4);

function normal(seed) {
	seed = seed || new Date().getTime();
	var z = new Ziggurat(seed);
	return z.nextGaussian;
}

// https://en.wikipedia.org/wiki/Xorshift
function uniform(seed) {
	seed = seed || new Date().getTime();
	var w = 0,
	    max32BitInt = 2147483647;

	// Set up generator function.
	function xor() {
		var t = seed ^ seed << 11;
		w ^= w >> 19 ^ t ^ t >> 8;
		seed = w;
		return seed / max32BitInt;
	}

	// discard first 64 vals
	for (var k = 64; k > 0; --k) {
		xor();
	}

	return xor;
}

// Compute a pseudo random integer in range [0, 32767]
// 32767 = 2^15 - 1. The maximum signed 16 bit value.
function randInt() {
	g_seed = Math.imul(214013 * g_seed) + (2531011 | 0) | 0;
	return g_seed >> 16 & 32767;
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
function randomIndices(s, n, rand) {
	rand = rand || Math.random;
	var bucket = Object.keys(s),
	    indices = [];

	if (n > s.length) {
		throw new Error("n should be <= s.length");
	}

	for (var i = 0; i < n; i++) {
		indices.push(bucket.splice(Math.floor(rand() * bucket.length), 1)[0]);
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
function binaryRandomMatrix(rows, cols, samples, rand) {
	if (samples > cols) {
		throw new Error("Samples should not exceed number of cols.");
	}

	var mat = (0, _matrix.matrix)(rows, cols, function () {
		return 0;
	});
	mat.forEach(function (row) {
		return randomIndices(row, samples, rand).forEach(function (i) {
			return row[i] = 1;
		});
	});

	return mat;
}

/***/ }),
/* 4 */
/***/ (function(module, exports) {


function Ziggurat(seed) {
  seed = arguments.length
	  ? seed
	  : new Date().getTime();
  
  var jsr = 123456789;

  var wn = Array(128);
  var fn = Array(128);
  var kn = Array(128);

  function RNOR(){
    var hz = SHR3();
    var iz = hz & 127;
    return (Math.abs(hz) < kn[iz]) ? hz * wn[iz] : nfix(hz, iz);
  }

  this.nextGaussian = function(){
    return RNOR();
  };

  function nfix(hz, iz){
    var r = 3.442619855899;
    var r1 = 1.0 / r;
    var x;
    var y;
    while(true){
      x = hz * wn[iz];
      if( iz == 0 ){
        x = (-Math.log(UNI()) * r1); 
        y = -Math.log(UNI());
        while( y + y < x * x){
          x = (-Math.log(UNI()) * r1); 
          y = -Math.log(UNI());
        }
        return ( hz > 0 ) ? r+x : -r-x;
      }

      if( fn[iz] + UNI() * (fn[iz-1] - fn[iz]) < Math.exp(-0.5 * x * x) ){
         return x;
      }
      hz = SHR3();
      iz = hz & 127;
 
      if( Math.abs(hz) < kn[iz]){
        return (hz * wn[iz]);
      }
    }
  }

  function SHR3(){
    var jz = jsr;
    var jzr = jsr;
    jzr ^= (jzr << 13);
    jzr ^= (jzr >>> 17);
    jzr ^= (jzr << 5);
    jsr = jzr;
    return (jz+jzr) | 0;
  }

  function UNI(){
    return 0.5 * (1 + SHR3() / -Math.pow(2,31));
  }

  function zigset(seed) {
    // seed generator based on current time
    jsr ^= seed;

    var m1 = 2147483648.0;
    var dn = 3.442619855899;
    var tn = dn;
    var vn = 9.91256303526217e-3;
    
    var q = vn / Math.exp(-0.5 * dn * dn);
    kn[0] = Math.floor((dn/q)*m1);
    kn[1] = 0;

    wn[0] = q / m1;
    wn[127] = dn / m1;

    fn[0] = 1.0;
    fn[127] = Math.exp(-0.5 * dn * dn);

    for(var i = 126; i >= 1; i--){
      dn = Math.sqrt(-2.0 * Math.log( vn / dn + Math.exp( -0.5 * dn * dn)));
      kn[i+1] = Math.floor((dn/tn)*m1);
      tn = dn;
      fn[i] = Math.exp(-0.5 * dn * dn);
      wn[i] = dn / m1;
    }
  }

  zigset(seed);
}

module.exports = Ziggurat;


/***/ })
/******/ ]);
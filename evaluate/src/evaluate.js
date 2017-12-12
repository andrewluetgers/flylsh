let flylsh =    require('../../src/index'),
	mnist =     require('../../data/mnist/mnist10k.json');

// dimensions
// sift 128
// gist 960
// mnist 784
// glove 300

function evaluate() {
	let d = mnist.slice(0, 100);

	// lsh mode
	//let hashVals = flylsh.hash(d, {
	//	kCells:         16,
	//	hashLength:     16,
	//	tagType:        "all",
	//});
	
	// fly mode
	let hashVals = flylsh.hash(d, {
		samples:        12,
		kCells:         1280,
		hashLength:     16,
		filter:         "top",
		bucketWidth:    .1
	});
	
	console.log(hashVals[0]);
}

console.log("test");

window.evaluate = evaluate;


module.exports = {
	evaluate: evaluate,
	mnist: mnist
};
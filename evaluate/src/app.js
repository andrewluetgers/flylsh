let flylsh = require('../../src/index'),
	request = require('superagent');

let data;

function test() {
	
	if (!data) {
		console.log("loading data...");
		request('GET', '/data/mnist/mnist10k.json').end((err, res) => {
			data = res.body;
			test();
		});
	} else {
		console.log("data loaded, evaluating flylsh...");
		let d = data.slice(0, 100);
		
		let hashVals = flylsh.hash(d, {
			samples:        12,
			kCells:         1280,
			hashLength:     16,
			filter:         "top",
			bucketWidth:    .1
		});
		
		console.log("flylsh hash vals", hashVals);
	}
	

}

test();



//
//loadData('../data/glove/glove10k.txt', function(data) {
////loadData('../data/mnist/mnist10k.txt', function(data) {
//	let d = data.slice(0, 100);
//
//	// lsh mode
//	//let hashVals = flylsh.hash(d, {
//	//	kCells:         16,
//	//	hashLength:     16,
//	//	tagType:        "all",
//	//});
//
//	// fly mode
//	let hashVals = flylsh.hash(d, {
//		samples:        12,
//		kCells:         1280,
//		hashLength:     16,
//		tagType:        "top",
//		bucketWidth:    .1
//	});
//
//	//console.log(hashVals[0]);
//});


let flylsh = require('../../src/index'),
	request = require('superagent'),
	densityPlot = require('./densityPlot');

let data;

let plotData = [];
for(let row=0; row<1000; row++) {
	let r = [];
	for(let col=0; col<1000; col++) {
		r[col] = Math.round(Math.random() * 1e3);
	}
	plotData[row] = r;
}

densityPlot.plot("chart", plotData, 1000, 1000);
//densityPlot.plot("chart2", plotData);
//densityPlot.plot("chart3", plotData);
//densityPlot.plot("chart4", plotData);
//densityPlot.plot("chart5", plotData);
//densityPlot.plot("chart6", plotData);
//densityPlot.plot("chart7", plotData);

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

//test();



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


let flylsh = require('../../src/index'),
	request = require('superagent'),
	densityPlot = require('./densityPlot');

let data;

let plotData = [];
for(let row=0; row<100; row++) {
	let r = [];
	for(let col=0; col<100; col++) {
		r[col] = Math.round(Math.random() * 1e3);
	}
	plotData[row] = r;
}

densityPlot.plot("chart10", plotData, 200, 200, "BrBG");
//densityPlot.plot("chart10", plotData, 200, 200, "piyg");


densityPlot.plot("chart", plotData, 200, 200, "Viridis");
densityPlot.plot("chart1", plotData, 200, 200, "Rainbow");
densityPlot.plot("chart2", plotData, 200, 200, "Warm");
densityPlot.plot("chart3", plotData, 200, 200, "Cool");
densityPlot.plot("chart4", plotData, 200, 200, "Plasma");
densityPlot.plot("chart5", plotData, 200, 200, "Magma");
densityPlot.plot("chart5", plotData, 200, 200, "Inferno");
densityPlot.plot("chart6", plotData, 200, 200);




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

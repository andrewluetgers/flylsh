
let flylsh = require('../../src/index'),
	request = require('superagent'),
	densityPlot = require('./densityPlot');

let data;

function genData(x, y, max) {
	let plotData = [];
	for(let row=0; row<x; row++) {
		let r = [];
		for(let col=0; col<y; col++) {
			r[col] = Math.round(Math.random() * max);
		}
		plotData[row] = r;
	}
	return plotData;
}


densityPlot.plot("chart10", genData(100, 100, 1e3));
densityPlot.plot("chart10", genData(10, 10, 1e3), {simple: true, width: 200, height: 200});

let data11 = genData(10, 10, 1e3);
densityPlot.plot("chart11", data11, {
	scale: 20,
	color: "Cool",
	mousemove: function(x, y) {
		console.log(x, y, data11[y][x]);
	}
});



//densityPlot.plot("chart", plotData, 200, 200, "Viridis");
//densityPlot.plot("chart1", plotData, 200, 200, "Rainbow");
//densityPlot.plot("chart2", plotData, 200, 200, "Warm");
//densityPlot.plot("chart3", plotData, 200, 200, "Cool");
//densityPlot.plot("chart4", plotData, 200, 200, "Plasma");
//densityPlot.plot("chart5", plotData, 200, 200, "Magma");
//densityPlot.plot("chart5", plotData, 200, 200, "Inferno");
//densityPlot.plot("chart6", plotData, 200, 200);




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
		
		// lsh mode
		let vals = flylsh.hash(d, {
			debug:          true,
			kCells:         16,
			hashLength:     16,
			tagType:        "all",
		});
		
		//let hashVals = flylsh.hash(d, {
		//	samples:        12,
		//	kCells:         1280,
		//	hashLength:     16,
		//	filter:         "top",
		//	bucketWidth:    .1
		//});
		
		console.log("lsh vals", vals);
		//console.log("flylsh hash vals", hashVals);
		
	}

}

test();



//
//loadData('../data/glove/glove10k.txt', function(data) {
//loadData('../data/mnist/mnist10k.txt', function(data) {
//	let d = data.slice(0, 100);
//
//	// lsh mode
//	let hashVals = flylsh.hash(d, {
//		kCells:         16,
//		hashLength:     16,
//		tagType:        "all",
//	});
//
//	// fly mode
//	//let hashVals = flylsh.hash(d, {
//	//	samples:        12,
//	//	kCells:         1280,
//	//	hashLength:     16,
//	//	tagType:        "top",
//	//	bucketWidth:    .1
//	//});
//
//	console.log(hashVals);
//});

let fs =        require("fs"),
	flylsh =    require('../src/flylsh');


function loadData(path, fn) {
	fs.readFile(path, function(err, data) {
		err && console.log(err);
		if (data) {
			let d = data.toString().split(/\n/g);
			if (fn && d.length) {
				let matrix = d.map(row => row.split(',').map(Number)),
					lastItem = matrix[matrix.length-1];
				if (!lastItem || !lastItem.length
					|| lastItem.length===1 && !lastItem[0]) {
					matrix.pop();
				}
				fn(matrix);
			}
		}
	});
}

loadData('../data/glove/glove10k.txt', function(data) {
//loadData('../data/mnist/mnist10k.txt', function(data) {
	let d = data.slice(0, 100);
	
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
		tagType:        "top"
	});
	
	//console.log(hashVals[0]);
});

let fs =        require("fs"),
	flylsh =    require('../src/flylsh');


function loadData(path, fn) {
	fs.readFile(path, function(err, data) {
		err && console.log(err);
		if (data) {
			let d = data.toString().split(/\n/g);
			if (fn && d.length) {
				let matrix = d.map(row => row.split(',')),
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

loadData('../data/mnist/mnist10k.txt', function(data) {
	let d = data.slice(0, 100);
	//console.log(d[0]);
	let hashVals = flylsh.hash(d, {kCells: 16, hashLength: 16, tagType: "all"});
	//console.log(hashVals[0]);
});

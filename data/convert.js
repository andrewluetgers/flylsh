let fs =        require("fs");

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

let data = [
	{path: './gist/', name: 'gist10k'},
	{path: './glove/', name: 'glove10k'},
	{path: './mnist/', name: 'mnist10k'},
	{path: './sift/', name: 'sift10k'}
];

data.forEach(d => {
	loadData(d.path + d.name + ".txt", function(data) {
		let newFile = d.path + d.name + ".json";
		fs.writeFile(newFile, JSON.stringify(data), function(err) {
			if (err) {
				console.log(err, newFile);
			} else {
				console.log('wrote file ' +newFile);
			}
			
		});
	});
});


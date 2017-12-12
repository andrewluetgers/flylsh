
let express = require('express'),
	path = require('path');

let app = express(),
	port = 3000;

app.use(express.static(path.join(__dirname, 'assets')));
app.use("/data", express.static(path.join(__dirname, '../data')));

console.log("serving", path.join(__dirname, 'assets'));

// Listen for requests
app.listen(port, function() {
	console.log('Serving LSH evaluation app on port ' + port);
});
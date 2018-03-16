
import request from 'superagent'
import {hash} from '../../src/index'
import {transpose} from '../../src/utils/matrix'
import {densityPlot} from 'density-plot'
import {meanAvgPrecision} from './meanAvgPrecision'

	//heapq = require('@aureooms/js-heapq'),


let data, labels,
	dataPath = '/data/mnist/mnist10k.json',
	//dataPath = '/data/mnist/emnist-mnist-test-images.json',
	//labelsPath = '/data/mnist/emnist-mnist-test-labels.json',
	samples = 1000,
	dimensions = 28 * 28;

function test() {
	if (!data) {
		console.log("loading data...");
		//request('GET', labelsPath).end((err, res) => {labels = res.body});
		request('GET', dataPath).end((err, res) => {data = res.body; test();});
		
	} else {
		console.log("data loaded, evaluating flylsh...");
		let d = data.slice(0, samples);
			//l = labels.slice(0, samples),
			//k2v = {},
			//v2k = new Map(d.map((val, i) => {
			//	let key = l[i], bin = k2v[key];
			//	bin ? bin.push(val) : k2v[key] = [val];
			//	return [val, key];
			//}));
		
		// lsh mode
		//let vals = flylsh.hash(d, {
		//	debug:          true,
		//	kCells:         16,
		//	hashLength:     16,
		//	tagType:        "all",
		//});
		
		//console.time("flylsh no debug");
		//hash(data.slice(0, 1000), {
		//	debug:          false,
		//	samples:        12,
		//	kCells:         1000,
		//	hashLength:     16,
		//	tagType:        "top",
		//	//bucketWidth:    .1
		//});
		//console.timeEnd("flylsh no debug");
		
		console.time("flylsh");
		let vals = hash(d, {
			debug:          true,
			samples:        12,
			kCells:         1000,
			hashLength:     16,
			tagType:        "top",
			//bucketWidth:    .1
		});
		console.timeEnd("flylsh");
		//console.log("lsh vals", vals);
		console.log("flylsh hash vals", vals);
		
		console.time("map");
		let map = meanAvgPrecision(d, vals.hashVals);
		console.timeEnd("map");
		
		vals.mapInfo = map;
		vals.labeledData = {
		
		};
		
		let table = document.getElementById("debugTable"),
			steps = Object.keys(vals);

		table.innerHTML = steps.map(s => {
			return `
				<tr>
					<td>
						<h3>${s}</h3>
						<div id="${s}Data"></div>
					</td>
					<td class="detail">
						<div id="${s}Detail"></div>
						<!--<textarea id="${s}DetailTxt" class="txt"></textarea>-->
					</td>
				</tr>`;
		}).join("");
		
		

		steps.forEach(s => {
			let v = vals[s];
			console.log(s+"Data", v);
			
			if (s.match(/info/i)) {
				infoOut("Mean Average Precision: " + map, "info");
				
			} else if (s === "labeledData") {
				// render nns
				// render actuals
				
			} else {
				v && densityPlot(v, {
					target:     document.getElementById(s+"Data"),
					zTicks:		7,
					color:      "Viridis",
					height:     samples,
					width:      dimensions, // number of dimensions, others will be stretched
					mousemove:  getHandler(v, s+"Detail")
				});
			}
		});
		
		
	}
}


test();


let tipX, tipY, tipId,
	details = {};

function getHandler(data, renderDetailId) {
	
	renderDetailId && (details[renderDetailId] = data);
	
	return (x, y, e) => {
		let doc = document.documentElement,
			left = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0),
			top = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0),
			val = data && y>-1 && data[y] && data[y][x] || 0;
		
		tip.innerText = "Row: " + y + " Col: " + x + " Val: " +Math.round(val*100)/100;
		tip.setAttribute("style", "top:" +(e.clientY+top)+"px; left:"+(e.clientX+left)+"px");
		
		// render detail plot
		renderDetailId && renderDetails(x, y);
		
		// update priors
		tipX = x; tipY = y; tipId = e.target.id;
	};
}

function renderDetails(x, y) {
	Object.keys(details).forEach(id => renderDetail(id, details[id], y));
}

function renderDetail(id, data, y) {
	if (y !== tipY && y > -1 && y < data.length) {
		let mat = toMatrix(data[y], null);
		//console.log(renderDetailId, mat);
		if (mat) {
			densityPlot(mat, {
				target:    document.getElementById(id),
				//simple:       true,
				//scale:        4,
				zTicks:    7,
				color:     "Viridis",
				mousemove: getHandler(mat)
			});
			//txtOut(data[y], renderDetailTxtId);
		}
	}
}

function toMatrix(data, cols, transposed) {
	cols = cols || Math.ceil(Math.sqrt(data.length));
	let mat = [];
	for (let i=0, j=data.length; i<j; i+=cols) {
		mat.push(data.slice(i, i+cols));
	}
	return transposed ? transpose(mat) : mat;
}

function txtOut(data, id, spacer) {
	let el = document.getElementById(id);
	el.innerText = data.join(spacer || " ");
}

function infoOut(info, id, append) {
	let el = document.getElementById(id);
	
	if (append) {
		el.innerHTML += info;
	} else {
		el.innerHTML = info;
	}
}
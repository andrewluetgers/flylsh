
import {randomIndices} from '../../src/utils/random'
import {l2} from './distanceMetrics'


function nns(searchVal, vals, _numNNs, distanceMetric) {
	let nns = [],
		numNNs = _numNNs || vals.length,
		dist = distanceMetric || l2,
		sortFn = (a, b) => b[0] - a[0]; // todo use k-select or kd-tree
	
	for (let j = 0; j < numNNs; j++) {
		if (searchVal === vals[j]) {continue}
		nns[j] = [dist(searchVal, vals[j]), j, vals[j]];
	}
	
	return distances.sort(sortFn);
}
	
function meanAvgPrecision(actuals, estimates, _numNNs, _sampleSize, distanceMetric) {
	let map = [],
		dist = distanceMetric || l2,
		sampleSize = _sampleSize || actuals.length,
		numNNs = _numNNs || Math.max(10, Math.round(sampleSize*.02)),
		indices = randomIndices(actuals, sampleSize),
		nnHit = (n, nns) => nns.find(t => t[1] === n[1]),
		sum = vals => vals.reduce((a, b) => a + b),
		mean = vals => sum(vals) / vals.length,
		sortFn = (a, b) => b[0] - a[0];
	
	console.log(actuals.length, estimates.length, sampleSize, numNNs, indices);
	
	indices.forEach(i => {
		let hits = 0,
			apVals = [],
			inputDistRow = [],
			hashDistRow = [],
			trueNNs, hashNNs,
			iDist, hDist;
		
		for (let j=0; j<sampleSize; j++) {
			if (i === j) {continue}
			iDist = dist(actuals[i], actuals[j]);
			if (iDist <= 0) {continue}
			hDist = dist(estimates[i], estimates[j]);
			inputDistRow[j] = [iDist, actuals[j], j];
			hashDistRow[j] = [hDist, actuals[j], j];
		}
		
		trueNNs = inputDistRow.sort(sortFn).slice(0, numNNs-1);
		hashNNs = hashDistRow.sort(sortFn).slice(0, numNNs-1);
		
		hashNNs.forEach((n, idx) => {
			apVals.push(nnHit(n, trueNNs) ? (++hits)/(idx+1) : 0);
			//console.log(nnHit(n, trueNNs), n, trueNNs, hits, idx);
		});
		
		//console.log("apVals", apVals);
		
		map.push(mean(apVals));
	});
	
	//console.log("map", map);
	
	return mean(map);
}

module.exports = {
	nns: nns,
	meanAvgPrecision: meanAvgPrecision,
};
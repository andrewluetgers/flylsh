
import {randomIndices} from '../../src/index'
import {l2} from './distanceMetrics'


function meanAvgPrecision(data, hashes, _sampleSize, _numNNs) {
	let map = [],
		sampleSize = _sampleSize || data.length,
		numNNs = _numNNs || Math.max(10, Math.round(sampleSize*.02)),
		indices = randomIndices(data.length, sampleSize),
		nnHit = (n, nns) => nns.find(t => t[1] === n[1]),
		sum = vals => vals.reduce((a, b) => a + b),
		mean = vals => sum(vals) / vals.length,
		sortFn = (a, b) => b[0] - a[0];
	
	//console.log(data, hashes, sampleSize, numNNs)
	
	indices.forEach(i => {
		let hits = 0,
			apVals = [],
			inputDistRow = [],
			hashDistRow = [],
			trueNNs, hashNNs,
			iDist, hDist;
		
		for (let j=0; j<sampleSize; j++) {
			if (i === j) {continue}
			iDist = l2(data[i], data[j]);
			if (iDist <= 0) {continue}
			hDist = l2(hashes[i], hashes[j]);
			inputDistRow[j] = [iDist, data[j], j];
			hashDistRow[j] = [hDist, data[j], j];
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
	meanAvgPrecision: meanAvgPrecision,
};
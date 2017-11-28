

// basic test
//console.log({
//	l1: l1Distance(
//		[ 2, 4, 5, 3, 8, 2 ],
//		[ 3, 1, 5, -3, 7, 2 ]),
//	l1Exp: 11,
//	l2: l2Distance(
//		[ 2, 4, 5, 3, 8, 2 ],
//		[ 3, 1, 5, -3, 7, 2 ]),
//	l2Exp: 6.855655,
//});


let mVals = randomMatrix(3, 3);

console.log({
	//z: zeros(2,3),
	//r: randn(10, 3),
	//zn: m.normalize(zeros(2,3)),
	//rn: m.normalize(randn(10, 3)),
	//samples: randomSamples(100, 10),
	//sb10: randomProjection(10, 10, 5),
	//dg: randomProjection(10, 10),
	m: mVals,
	mt: m.transpose(mVals)
});


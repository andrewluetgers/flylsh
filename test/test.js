
let assert =    require('assert'),
	distance =  require('../evaluate/distanceMetrics'),
	flylsh =    require('../src/flylsh'),
	m =         require('../src/utils/matrixUtils');


describe("Matrix Utils", function() {
	
	describe("transpose", function() {
		let matrix = [[1,2,3],[4,5,6],[7,8,9]],
			transposed = [[1,4,7],[2,5,8],[3,6,9]];
		
		it("rows become columns", function() {
			assert.deepEqual(m.transpose(matrix), transposed);
		});
		
		it("transpose again matches original", function() {
			assert.deepEqual(m.transpose(transposed), matrix);
		});
	});
	
	
	let m1 = [['00','01','02'],['10','11','12']];
	
	describe("matrix", function() {
		function fn(r, c) {return r +''+ c};
		it("produces a 2d array", function() {
			assert.deepEqual(m.matrix(2, 3, fn), m1);
		});
	});
	
	
	describe("byColumn", function() {
		
		it("iterates over colunms", function() {
			let result = [],
				expected = ['00', '10', '01', '11', '02', '12'];
			
			m.byColumn(m1, function(r, c, m) {
				result.push(m[r][c]);
			});
			assert.deepEqual(result, expected);
		});
	});
	
	
	describe("dot", function() {
		it("computes a matrix dot product", function() {
			let a = [[1,0], [0,1]],
				b = [[4,1], [2,2]],
				a2 = [[1,0], [0,1], [0,0], [1,1]],
				b2 = [[4,1,3], [2,2,3]],
				c2 = [[4,1], [2,2], [0,0], [6,3]];
			
			assert.deepEqual(m.dot(a, b), b);
			assert.deepEqual(m.dot(a, b2), b2);
			assert.deepEqual(m.dot(a2, b), c2);
		});
		
		it("throws if shapes not aligned", function() {
			let a = [[1, 0, 3], [0, 1, 3]],
				b = [[4, 1], [2, 2]];
			
			assert.throws(()=> {m.dot(a, b)}, Error);
		});
	});
	
});



describe("Distance Metrics", function() {
	let v11 = [ 2, 4, 5, 3, 8, 2 ],
		v12 = [ 3, 1, 5, -3, 7, 2 ],
		l1_1Exp = 11,
		l2_1Exp = 6.855654600401044,
		
		v21 = [0,3,4,5],
		v22 = [7,6,3,-1],
		l2_2Exp = 9.746794344808965,
		
		v31 = [10,20,10],
		v32 = [10,20,20],
		l1_3Exp = 10;
	
	it("l1 distance is correct", function() {
		assert.equal(distance.l1(v11, v12), l1_1Exp);
		assert.equal(distance.l1(v31, v32), l1_3Exp);
	});
	
	it("l2 distance is correct", function() {
		assert.equal(distance.l2(v11, v12), l2_1Exp);
		assert.equal(distance.l2(v21, v22), l2_2Exp);
	});
});




describe("Fly LSH", function() {
	
	describe("randomSamples", function() {
		it("length should = s", function() {
			assert.deepEqual(flylsh.randomSamples(5, 50).length, 5);
			assert.deepEqual(flylsh.randomSamples(5, 5).length, 5);
			assert.deepEqual(flylsh.randomSamples(50, 500).length, 50);
			assert.deepEqual(flylsh.randomSamples(1, 5).length, 1);
			assert.deepEqual(flylsh.randomSamples(3, 500).length, 3);
		});
		
		it("throws if s > n", function() {
			assert.throws(function() {flylsh.randomSamples(500, 50)}, Error);
		});
		
		it("returns only an array of indexes < n", function() {
			let indices = [0,1,2,3,4,5,6,7,8,9],
				result = flylsh.randomSamples(10, 10);
			
			result.forEach(function(v) {
				assert.equal(indices.indexOf(v), v);
			});
		});
	});
	
	
	describe("binaryRandomMatrix", function() {
		let rows = 5,
			cols = 3,
			mat0 = flylsh.binaryRandomMatrix(rows, cols, 0),
			mat1 = flylsh.binaryRandomMatrix(rows, cols, 3),
			mat2 = flylsh.binaryRandomMatrix(rows, cols, 1);
		
		it("should return a matrix rows tall and cols wide", function() {
			assert.equal(mat0.length, rows);
			assert.equal(mat0[0].length, cols);
		});
		
		it("should return all zeros", function() {
			let res = 0;
			mat0.forEach(row => row.forEach(val => res += val));
			assert.equal(res, 0);
		});
		
		it("should return all ones", function() {
			let res = 0;
			mat1.forEach(row => row.forEach(val => res += val));
			assert.equal(res, 15);
		});
		
		it("should return some ones", function() {
			let res = 0;
			mat2.forEach(row => row.forEach(val => res += val));
			assert.equal(res, 5);
		});
		
		it("throws if samples > cols", function() {
			assert.throws(function() {flylsh.binaryRandomMatrix(20, 5, 500)}, Error);
		});
	});
	
	
	describe("normalizeColumnMins", function() {
		let mat = [[1,5,3],[4,2,-1],[-7,0,1]],
			expected = [[8,5,4],[11,2,0],[0,0,2]];
		
		it("should shift column values by abs min value for the column", function() {
			flylsh.normalizeColumnMins(mat);
			assert.deepEqual(mat, expected);
		});
	});
	
	describe("normalizeRowMeans", function() {
		let mat = [[30,1,2],[2,1,0],[9,9,9]],
			mat2 = [[8,5,4],[11,2,0],[0,0,0]]; // row of zeros is intentionally included here to test an edge case
		
		([100, 1000, 1]).forEach(targetMean => {
			it("should scale row values such that all row means = "+targetMean, function() {
				flylsh.normalizeRowMeans(mat, targetMean);
				flylsh.normalizeRowMeans(mat2, targetMean);
				mat.forEach(r => assert.equal(Math.round((r[0] + r[1] + r[2]) / 3), targetMean));
				mat2.forEach(r => assert.equal(Math.round((r[0] + r[1] + r[2]) / 3), targetMean));
			});
			
			it("should throw for numbers <= 0", function() {
				assert.throws(function() {flylsh.normalizeRowMeans(mat, 0)}, Error);
			});
		});
	});
	
	
	//describe("hash", function() {
	//
	//	let fs = require("fs");
	//
	//	it("should should hash data", function() {
	//
	//	});
	//
	//	//flylsh.hash();
	//
	//});
	

});

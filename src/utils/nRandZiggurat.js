// from https://www.filosophy.org/post/35/normaldistributed_random_values_in_javascript_using_the_ziggurat_algorithm/
function Ziggurat() {
	
	let jsr = 123456789,
		wn = new Array(128),
		fn = new Array(128),
		kn = new Array(128),
		r = 3.442619855899,
		r1 = 1.0 / r,
		x, y, fiz,
		log = Math.log,
		abs = Math.abs,
		pow = Math.pow,
		exp = Math.exp;
	
	function rnor(){
		let jz = jsr;
		let jzr = jsr;
		jzr ^= (jzr << 13);
		jzr ^= (jzr >>> 17);
		jzr ^= (jzr << 5);
		jsr = jzr;
		let hz = (jz+jzr) | 0;
		let iz = hz & 127;
		return (abs(hz) < kn[iz]) ? hz * wn[iz] : nfix(hz, iz);
	}
	
	this.nextGaussian = rnor;
	
	this.init = function(seed) {
		zigset(seed || new Date().getTime());
	};
	
	function nfix(hz, iz) {
		while (true) {
			x = hz * wn[iz];
			if (iz === 0) {
				x = -log(uni()) * r1;
				y = -log(uni());
				fiz = fn[iz];
				
				while (y + y < x * x) {
					x = (-log(uni()) * r1);
					y = -log(uni());
				}
				return (hz > 0) ? r+x : -r-x;
			}
			
			if (fiz + uni() * (fn[iz-1] - fiz) < exp(-0.5 * x * x) ) {
				return x;
			}
			
			let jz = jsr;
			let jzr = jsr;
			jzr ^= (jzr << 13);
			jzr ^= (jzr >>> 17);
			jzr ^= (jzr << 5);
			jsr = jzr;
			hz = (jz+jzr) | 0;
			iz = hz & 127;
			
			if (abs(hz) < kn[iz]){
				return (hz * wn[iz]);
			}
		}
	}
	
	function uni(){
		let jz = jsr,
			jzr = jsr;
		
		jzr ^= (jzr << 13);
		jzr ^= (jzr >>> 17);
		jzr ^= (jzr << 5);
		jsr = jzr;
		return 0.5 * (1 + ((jz+jzr) | 0) / -pow(2, 31));
	}
	
	function zigset(seed) {
		// seed generator based on current time
		jsr ^= seed;
		
		let m1 = 2147483648.0,
			dn = 3.442619855899,
			tn = dn,
			vn = 9.91256303526217e-3,
			q = vn / Math.exp(-0.5 * dn * dn);
		
		kn[0] = Math.floor((dn/q)*m1);
		kn[1] = 0;
		
		wn[0] = q / m1;
		wn[127] = dn / m1;
		
		fn[0] = 1.0;
		fn[127] = Math.exp(-0.5 * dn * dn);
		
		for(let i = 126; i >= 1; i--) {
			dn = Math.sqrt(-2.0 * Math.log( vn / dn + Math.exp( -0.5 * dn * dn)));
			kn[i+1] = Math.floor((dn/tn)*m1);
			tn = dn;
			fn[i] = Math.exp(-0.5 * dn * dn);
			wn[i] = dn / m1;
		}
	}
}

function getNormRandZiggurat(seed) {
	let z = new Ziggurat();
	z.init(seed);
	
	return z.nextGaussian;
}

module.exports = getNormRandZiggurat;

import {
	scaleLinear, scaleSequential, interpolateViridis, interpolateRainbow,
	interpolateCool, interpolateWarm, interpolateMagma, interpolatePlasma,
	interpolateInferno, interpolateCubehelixDefault
} from "d3-scale";
import * as chroma from "d3-scale-chromatic"
import { axisBottom, axisLeft } from "d3-axis";
import { max, min } from "d3-array";
import { color } from "d3-color";
import { select } from "d3-selection";
import { memoize, debounce } from 'lodash'

// https://github.com/lodash/lodash/issues/2403
function activate(func, wait=0, options={}) {
	let mem = _.memoize(function() {
		return _.debounce(func, wait, options)
	}, options.resolver);
	return function(){mem.apply(this, arguments).apply(this, arguments)}
}

let scales = Object.assign({}, {interpolateViridis, interpolateRainbow,
	interpolateCool, interpolateWarm, interpolateMagma, interpolatePlasma,
	interpolateInferno, interpolateCubehelixDefault}, chroma);

// see https://github.com/d3/d3-scale-chromatic and https://github.com/d3/d3-scale for scale options
function plot(id, buckets, opts) {
	opts = opts || {};
	let o = opts,
		simple = o.simple,
		noAxes = simple || o.noAxes,
		noLegend = simple || o.noLegend,
		mSize = simple ? 10 : 20,
		intScale = scales['interpolate'+o.color] || interpolateCool,
		margin = {
			top:    mSize,
			right:  noLegend ? mSize : 50,
			bottom: noAxes ? 0 : 30,
			left:   noAxes ? 0 : 50
		},
		dimX = buckets[0].length,
		dimY = buckets.length,
		yScale = o.scale || (o.width ? o.width/dimX : 1),
		xScale = o.scale || (o.height ? o.height/dimY : 1),
		width = o.width || dimX * xScale,
		height = o.height || dimY * yScale,
		totalWidth = width+margin.left+margin.right,
		totalHeight = height+margin.top+margin.bottom,
		x = scaleLinear().range([0, width]),
		y = scaleLinear().range([height, 0]),
		z = scaleSequential(intScale),
		div = document.createElement("div");
	
	let s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	s.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
	
	div.setAttribute("id", id);
	div.setAttribute("class", "plot");
	div.setAttribute("style", `width:${totalWidth}px; height:${totalHeight}px`);
	div.appendChild(s);
	document.body.appendChild(div);
	
	let svg = select(s)
		.attr("id", id+"svg")
		.attr("width", totalWidth)
		.attr("height", totalHeight)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		
	// Compute the scale domains.
	let zMax =  max(buckets, r => max(r)),
		zMin =  min(buckets, r => min(r));
	
	z.domain([0, zMax]);
	x.domain([0, buckets[0].length]);
	y.domain([0, buckets.length]);
	
	if (!noLegend) {
		// legend
		let labelIncrement = o.legendIncrement, // will show label if val % labelIncrement == 0
			segments = o.legendSegments || 10,
			legendWidth = 10,
			textMargin = 6,
			segHeight = height / segments,
			legend;
		
		legend = svg.selectAll(".legend")
			.data(z.ticks(segments).reverse())
			.enter().append("g")
			.attr("class", "legend")
			.attr("transform", function(d, i) {
				return "translate(" + (width + legendWidth) + "," + (i * segHeight) + ")";
			});
		
		legend.append("rect")
			.attr("width", legendWidth)
			.attr("height", segHeight)
			.style("fill", z);
		
		console.log("zMin", zMin);
		
		let simpleFilter = d => d === zMin || d === zMax || d === (zMax-zMin)/2,
			modFilter = d => d === zMin || d === zMax || !(d % labelIncrement);
		
		legend.append("text")
			.filter(labelIncrement ? modFilter : simpleFilter)
			.attr("x", legendWidth + textMargin)
			.attr("y", (d) => {return d === zMin ? -2 : (d === zMax ? 3 : 1)})
			.attr("dy", ".35em")
			.text(String);
	}
	
	if (!noAxes) {
		// x-axis
		
		let xTicks = o.xTicks || 2,
			yTicks = o.yTicks || 2;
		
		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(axisBottom().ticks(xTicks).scale(x))
			.append("text")
			.attr("class", "label")
			.attr("x", width)
			.attr("y", -6)
			.attr("text-anchor", "end");
		
		// y-axis
		svg.append("g")
			.attr("class", "y axis")
			.call(axisLeft().ticks(yTicks).scale(y))
			.append("text")
			.attr("class", "label")
			.attr("y", 6)
			.attr("dy", ".71em")
			.attr("text-anchor", "end")
			.attr("transform", "rotate(-90)");
	}
	
	// canvas plot
	let c = document.createElement("canvas"),
		ctx = c.getContext('2d');
	
	c.setAttribute("class", 'plotCanvas');
	c.setAttribute("width", dimX);
	c.setAttribute("height", dimY);
	c.setAttribute("style", `width:${width}px; height:${height}px; margin-left:${margin.left+1}px; margin-top:${margin.top}px`);
	div.appendChild(c);
	
	if (o.mousemove) {
		
		let fn = activate(o.mousemove, 100, {
			'leading': true,
			'trailing': false
		});
		
		c.addEventListener("mousemove", e => {
			let m = getMousePos(c, e);
			fn(Math.floor(m.x/xScale), Math.floor(m.y/yScale));
		});
	}
	
	
	function getMousePos(canvas, e) {
		let rect = canvas.getBoundingClientRect();
		return {x: e.clientX - rect.left, y: e.clientY - rect.top};
	}
	
	let imageData = ctx.getImageData(0, 0, c.width, c.height),
		rgb = imageData.data,
		i = 0;
	
	buckets.forEach(row => {
		row.forEach(val => {
			let c = color(z(val));
			rgb[i]     = c.r; // red
			rgb[i + 1] = c.g; // green
			rgb[i + 2] = c.b; // blue
			rgb[i + 3] = 255; // blue
			i += 4;
		});
	});
	ctx.putImageData(imageData, 0, 0);
}


module.exports = {
	plot: plot
};

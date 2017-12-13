import {
	scaleLinear, scaleSequential, interpolateViridis, interpolateRainbow,
	interpolateCool, interpolateWarm, interpolateMagma, interpolatePlasma,
	interpolateInferno, interpolateCubehelixDefault
} from "d3-scale";
import * as chroma from "d3-scale-chromatic"
import { axisBottom, axisLeft } from "d3-axis";
import { max } from "d3-array";
import { color } from "d3-color";
import { select } from "d3-selection";

let scales = Object.assign({}, {interpolateViridis, interpolateRainbow,
	interpolateCool, interpolateWarm, interpolateMagma, interpolatePlasma,
	interpolateInferno, interpolateCubehelixDefault}, chroma);

// see https://github.com/d3/d3-scale-chromatic for scale options
function plot(id, buckets, w, h, scale) {
	
	let intScale = scales['interpolate'+scale] || interpolateRainbow,
		dimX = buckets[0].length,
		dimY = buckets.length,
		margin = {top: 20, right: 50, bottom: 30, left: 50},
		width = w || 200,
		height = h || 200,
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
	let zMax =  max(buckets, r => max(r));
	z.domain([0, zMax]);
	x.domain([0, buckets[0].length]);
	y.domain([0, buckets.length]);
	
	// Add a legend for the color values.
	let labels = 11,
		yUnit = zMax / height,
		labelSpace = height / labels,
		labelIncrement = 100, // will show label if val % labelIncrement == 0
		segments = 100,
		legendWidth = 10,
		textMargin = 6,
		segHeight = (height) / segments,
		legend = svg.selectAll(".legend")
		.data(z.ticks(segments+1).slice(1).reverse())
		.enter().append("g")
		.attr("class", "legend")
		.attr("transform", function(d, i) { return "translate(" + (width + legendWidth) + "," + (i * segHeight) + ")"; });
	
	legend.append("rect")
		.attr("width", legendWidth)
		.attr("height", segHeight)
		.style("fill", z);
	
	
	legend.append("text")
		.filter(d => !d || !(d % labelIncrement))
		.attr("x", legendWidth + textMargin)
		.attr("y", 10)
		.attr("dy", ".35em")
		.text(String);
	
	// Add an x-axis with label.
	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(axisBottom().scale(x))
		.append("text")
		.attr("class", "label")
		.attr("x", width)
		.attr("y", -6)
		.attr("text-anchor", "end")
		.text("Date");
	
	// Add a y-axis with label.
	svg.append("g")
		.attr("class", "y axis")
		.call(axisLeft().scale(y))
		.append("text")
		.attr("class", "label")
		.attr("y", 6)
		.attr("dy", ".71em")
		.attr("text-anchor", "end")
		.attr("transform", "rotate(-90)")
		.text("Value");
	
	// canvas plot
	let c = document.createElement("canvas"),
		ctx = c.getContext('2d');
	
	c.setAttribute("class", 'plotCanvas');
	c.setAttribute("width", dimX);
	c.setAttribute("height", dimY);
	c.setAttribute("style", `width:${width}px; height:${height}px; margin-left:${margin.left+1}px; margin-top:${margin.top}px`);
	div.appendChild(c);
	
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

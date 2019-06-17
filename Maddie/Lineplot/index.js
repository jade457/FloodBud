import * as scraper from './api_scraper.js';

scraper.get_water_obs_links().then(console.log);
scraper.get_water_obs_links().then(links => {scraper.get_obs_for_link(links[0].link).then(console.log)});
/* 
create svg window 
*/ 

var svgWidth = 800; 
var svgHeight = 600; 

var margin = { top: 20, right: 20, bottom:30, left: 30}; 
var width = svgWidth - margin.left - margin.right ; 
var height = svgHeight - margin.top - margin.bottom ; 

var svg = d3.select('svg')
	.attr('width', svgWidth)
	.attr('height', svgHeight); 

/* 
read the data and save it to a dictionary 
*/ 

var dict = {}
var times =[]
var levels = []
// d3.csv("sensor_data_April.csv", function(data) {
// 	data.forEach(function(d){ 
// 		if (dict[d.sensorDescription] == null){ 
// 			dict[d.sensorDescription] = { 
// 				'name' : d.sensorDescription, 
// 				'level' : [] , 
// 				'timestamp' : []
// 			}	
// 			if (d.measurementName =='Water Level'){ 
// 				dict[d.sensorDescription]['level'].push(parseFloat(+d.value))
// 				dict[d.sensorDescription]['timestamp'].push((new  Date(d.timestamp)))
// 				}
// 			} 
// 		else { 
// 			if (d.measurementName == 'Water Level'){ 
// 				dict[d.sensorDescription]['level'].push(parseFloat(+d.value))
// 				dict[d.sensorDescription]['timestamp'].push((new Date(d.timestamp)))	
// 				} 
// 			}
// 	});

	d3.csv("sensor_data_April.csv", function(data) {
	data.forEach(function(d){ 
		if (dict[d.sensorDescription] == null){ 
			dict[d.sensorDescription] = { 
				'name' : d.sensorDescription, 
				'pairs' : []
			}	
			if (d.measurementName =='Water Level'){ 
				dict[d.sensorDescription]['pairs'].push({'y': +d.value, 'x': new Date(d.timestamp)}) 
				levels.push(+d.value)
				times.push((new Date(d.timestamp)).getTime())
				}
			} 
		else { 
			if (d.measurementName == 'Water Level'){ 
				dict[d.sensorDescription]['pairs'].push({'y': +d.value, 'x': new Date(d.timestamp)}) 
				levels.push(+d.value)
				times.push((new Date(d.timestamp)).getTime())
				} 
			}	
	});
	
	// dict is now just a list of key value pairs 
	dict =  Object.values(dict)  
	console.log("here");
	console.log(dict);
	
	//console.log(dict[0].pairs)
	
	/* 
	create x axis 
	make x scale 
	make axis object and translate it o the bottom on the svg 
	*/ 
		
	// calculate the bounds for x domain 	
	var overallMaxT = d3.max(times)
	var overallMinT = d3.min(times)
	
	var x = d3.scaleTime()
		//.domain(d3.extent(dict[0].timestamp))
		.domain([overallMinT, overallMaxT]) 
		.range([margin.left, width - margin.right]);

	var xAxis = g => g
		.attr('transform', 'translate(0,'+ (height - margin.bottom).toString()+')') 
		.call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0)) 
	
	svg.append('g')
		.call(xAxis); 

	/* 
	create y axis 
	make y scale 
	*/ 
	
	// calculate the domin for the y axis 	

	var overallMaxD = d3.max(levels)
	var overallMinD = d3.min(levels)
		
	var y = d3.scaleLinear()
    	.domain([overallMinD, overallMaxD])
    	.range([height - margin.bottom, margin.top])

	var yAxis = g => g
		.attr('transform', 'translate('+(margin.left).toString() + ',0)') 
		.call(d3.axisLeft(y))
		.call(g => g.select(".domain").remove())
		.call(g => g.select(".tick:last-of-type text").clone()
			.attr("x", 3)
			.attr("text-anchor", "start")
			.attr("font-weight", "bold")
			.text('Water Depth')) 
	
	svg.append('g')  
		.call(yAxis); 

	/* 
	make d3 line object to be called with the data 
	*/ 
	
	var line = d3.line()
   		.x(function(d) { return x(d.x); })
    	.y(function(d) { return y(d.y); });

	/*
	making the lines go on the chart 
	*/ 
	
	// var path = svg.append('g')
// 		.datum(dict[1].pairs)
// 		.attr('d', line)
		
	console.log('done')
	dict.forEach(function(d) { 
		//console.log(d.pairs)
		var path = svg.append("g")
		  .attr("fill", "none")
		  .attr("stroke", "steelblue")
		  .attr("stroke-width", 1.5)
		  .attr("stroke-linejoin", "round")
		  .attr("stroke-linecap", "round")
		.selectAll("path")
		.data(d.pairs)
		.enter().append('path') 
		  .style("mix-blend-mode", "multiply")
		  .attr("d", line);
	
	});	
	
}); 



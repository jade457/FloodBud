
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

d3.csv("sensor_data_full.csv", function(data) {

	
	var dict = d3.nest() 
		.key(function(d){return d.sensorDescription})
		.entries(data)
	// dict is now just a list of key value pairs 
	
	console.log(dict)	
	/* 
	create x axis 
	make x scale 
	make axis object and translate it o the bottom on the svg 
	*/ 
		
	//calculate the bounds for x domain 
	
	var x = d3.scaleTime()
		//.domain(d3.extent(dict[0].timestamp))
    	.domain(d3.extent(dict, function(d) { return d.value; }))
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
	
	var y = d3.scaleLinear()
    	.domain([0, 200])
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
		.x((d) => x(d.timestamp)) 
		.y(d => y(d)) // for all the lines 
		//.y((d, i) => y(dict[0].level[i])) // just one line 

	/*
	making the lines go on the chart 
	*/ 
	  var path = svg.append("g")
		  .attr("fill", "none")
		  .attr("stroke", "steelblue")
		  .attr("stroke-width", 1.5)
		  .attr("stroke-linejoin", "round")
		  .attr("stroke-linecap", "round")
		.selectAll("path")
		.data(dict)
		//.join("path")
		.enter().append('path') 
		  .style("mix-blend-mode", "multiply")
		  .attr("d", line(dict));		


 	
}); 

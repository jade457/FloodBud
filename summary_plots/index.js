
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
var sum_data = {}
var times =[]
var sum_times = []
var levels = []
var sum_levels = []

	d3.csv("sensor_data_trimmed.csv", function(data) {
		var filter_data = data.filter(x => x.measurementName == "Water Level");
		var new_data = d3.nest()
		.key( d => d.sensorDescription)
		.key(d => ((d3.isoParse(d.timestamp).getMonth() + 1) + "-" +d3.isoParse(d.timestamp).getDate()))
		.entries(filter_data);

		new_data.forEach(function (d){
			sum_data[d.key] = {
				'max': [],
				'min': [],
				'avg': []
			}
			//console.log("d");
			//console.log(d);
				d.values.forEach(function (sensor){
					//console.log("sensor.values");
					//console.log(sensor.values);
					let s_values = sensor.values.map(x => (+x.sensorElevation) - (+x.value));
					//console.log("s_values");
					//console.log(s_values);
						mod_date = new Date(sensor.key);
						sum_times.push(mod_date);
						sum_levels.push(d3.max(s_values));
						sum_data[d.key].max.push({'date': mod_date, 'max': d3.max(s_values)});
						sum_data[d.key].min.push({'date': mod_date, 'min': d3.min(s_values)});
						sum_data[d.key].avg.push({'date': mod_date, 'avg': d3.mean(s_values)});
				});


		});
		console.log("sum data");
		console.log(sum_data);

	// data.forEach(function(d){
	// 	if (dict[d.sensorDescription] == null){
	// 		dict[d.sensorDescription] = {
	// 			'name' : d.sensorDescription,
	// 			'pairs' : []
	// 		}
	// 		if (d.measurementName =='Water Level'){
	// 			dict[d.sensorDescription]['pairs'].push({'y': +d.value, 'x': new Date(d.timestamp)})
	// 			levels.push(+d.value)
	// 			times.push((new Date(d.timestamp)).getTime())
	// 			}
	// 		}
	// 	else {
	// 		if (d.measurementName == 'Water Level'){
	// 			dict[d.sensorDescription]['pairs'].push({'y': +d.value, 'x': new Date(d.timestamp)})
	// 			levels.push(+d.value)
	// 			times.push((new Date(d.timestamp)).getTime())
	// 			}
	// 		}
	// });



	// dict is now just a list of key value pairs
	//dict =  Object.values(dict)
	sum_data = Object.values(sum_data)

	//console.log(dict);

	// for (var i=0; i<dict.length; i++){
	// 	if (dict[i].pairs.length ==0){
	// 		dict.splice(i,1)
	// 	}
	// }

	//console.log(dict);


	/*
	create x axis
	make x scale
	make axis object and translate it o the bottom on the svg
	*/

	// calculate the bounds for x domain
	// var overallMaxT = d3.max(times)
	// var overallMinT = d3.min(times)

	var overallMaxT = d3.max(sum_times)
	var overallMinT = d3.min(sum_times)

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

	// var overallMaxD = d3.max(levels)
	// var overallMinD = d3.min(levels)

	var overallMaxD = d3.max(sum_levels)
	var overallMinD = d3.min(sum_levels)

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

	// var line = d3.line()
  //  		.x(function(d) { return x(d.x); })
  //   	.y(function(d) { return y(d.y); });


			var line_max = d3.line()
		   		.x(function(d) { return x(d.date); })
		    	.y(function(d) { return y(d.max); });

	/*
	making the lines go on the chart
	*/
	var color = d3.scaleOrdinal(d3.schemeCategory10);
	var g = svg.append('g')
	.attr('transform', 'translate('+margin.left +','+margin.top + ')');

	let lines = svg.append('g')
	  .attr('class', 'lines');

	console.log(dict);
	console.log(sum_data);

	lines.selectAll('.line-group') // plots one line
		.data(sum_data)
		.enter()
		.append("path")
		.attr('class', 'line')
		.style("mix-blend-mode", "multiply")
		.attr('fill', 'none')
		.attr('stroke', (d, i) => color(i))
		.attr('stroke-linejoin', 'round')
		.attr('stroke-linecap', 'round')
		.attr('stroke-width', 1.5)
		.attr('d', d => line_max(d.max));


	  // const path = svg.append("g") // plots all but connected
		//   .attr("fill", "none")
		//   .attr("stroke", "steelblue")
		//   .attr("stroke-width", 1.5)
		//   .attr("stroke-linejoin", "round")
		//   .attr("stroke-linecap", "round")
		// .selectAll("path")
		// .data(dict)
		// .enter().append('path')
		//   .style("mix-blend-mode", "multiply")
		//   .attr("d", d => line(d.pairs));



	console.log('done')
});

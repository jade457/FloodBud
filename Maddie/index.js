// javascript 

/* 

// selection 

d3.select(); 
d3.selectAll(); // returns all elements 

d3.select('h1').style('color', 'red') // returns first found h1 tag 
.attr('class', 'heading')
.text('Updated h1 tag'); 

d3.select('body').append('p').text('first paragraph');
d3.select('body').append('p').text('2 paragraph');
d3.select('body').append('p').text('3 paragraph');

d3.selectAll('p').style('color', 'blue');

*/ 

/* 

beginning data 

var dataset = [1,2,3,4,5]

d3.select('body')
	.selectAll('p')
	.data(dataset)
	.enter() // takes data items one by one to perform further operations 
	.append('p') 
	//.text('D3 is awesome :)') ; 
	.text(function(d) { return d ;}); 
	
*/ 

/* 

// bar chart 

add to html  <svg class ='bar-chart'></svg>  

//var dataset = [80, 100, 56, 120, 180, 30, 40 , 120, 160]


var dataset = [1,2,3,4,5]

var svgWidth = 500, svgHeight = 300, barPadding = 5; 
var barWidth = (svgWidth/dataset.length)

var svg = d3.select('svg')
	.attr('width', svgWidth)
	.attr('height', svgHeight); 
	
 var yscale = d3.scaleLinear() 
 	.domain([0,d3.max(dataset)])
 	.range([0,svgHeight]) ; 

var barChart = svg.selectAll('rect')
	.data(dataset)
	.enter()
	.append('rect') // makes a rectangle 
	.attr('y', function(d) { return svgHeight-yscale(d) ; } )   // changes location drawn from 
	.attr('height', function(d) { return yscale(d); })
	.attr('width', barWidth-barPadding)
	// move the bars over 
	.attr('transform', function(d,i) {  var translate = [barWidth*i, 0]; return 'translate('+translate+')' ; }); 


// creating labels for the bar chart 

var text = svg.selectAll('text')
	.data(dataset)
	.enter() 
	.append('text')
	.text(function(d) { return d  ; } )
	.attr('y', function(d,i) { return svgHeight - d - 2 ; })
	.attr('x', function(d,i) { return barWidth * i ; } )
	.attr('fill', 'green');  


// scales -- transform the data 


*/ 

// axes 

/* 
var data = [80,100, 56, 120, 180, 30, 40, 120 , 160]; 

var svgWidth = 500, svgHeight = 300 ; 

var svg = d3.select('svg')
	.attr('width', svgWidth)
	.attr('height', svgHeight); 
	
var xScale = d3.scaleLinear()
	.domain([0, d3.max(data)])
	.range([0, svgWidth])

var yScale = d3.scaleLinear()
    .domain([0, d3.max(data)])
    .range([svgHeight, 0]);
    
var x_axis = d3.axisBottom().scale(xScale)

var y_axis = d3.axisLeft().scale(yScale) 

svg.append('g') // group element 
	.attr('transform', 'translate(50,10)')
	.call(y_axis)

var xAxisTranslate = svgHeight-20 ; 

svg.append('g')
	.attr('transform', 'translate(50, ' +xAxisTranslate +")")
	.call(x_axis); 


*/ 

// creating svg elements - scalable vector graphics 

/* 

  <svg></svg> 

var svgWidth = 600 , svgHeight = 500; 

var svg = d3.select('svg')
	.attr('width', svgWidth)
	.attr('height', svgHeight)
	.attr('class', 'svg-container'); 
	
var line = svg.append('line')
	.attr('x1', 100)
	.attr('x2', 500)
	.attr('y1', 50)
	.attr('y2', 50)
	.attr('stroke', 'green')
	.attr('stroke-width', 5)

var rect = svg.append('rect')
	.attr('x', 100)
	.attr('y', 100)
	.attr('width', 200)
	.attr('height', 100)
	.attr('fill', 'red')

var circle = svg.append('circle')
	.attr('cx', 200)
	.attr('cy', 300)
	.attr('r', 80)
	.attr('fill', 'black')

*/ 

// pie chart 

/* 

    <svg class="pie-chart"></svg>

var data = [     
	{"platform" : "Android", "percentage": 40.11}, 
	{"platform": "Windows", "percentage": 36.69}, 
	{"platform": "iOS", "percentage": 13.06}
 ] ; 
 
var svgWidth = 500, svgHeight = 300, radius = Math.min(svgWidth, svgHeight)/2 ; 

var svg = d3.select('svg')
	.attr('width', svgWidth)
	.attr('height', svgHeight); 

var g = svg.append('g')
	.attr('transform', 'translate('+radius+ ','+radius+')'); 

var color = d3.scaleOrdinal(d3.schemeCategory10);

var pie = d3.pie().value(function(d) { return d.percentage ; }) ; 

var path = d3.arc() 
	.outerRadius(radius)
	.innerRadius(0); 

var arc = g.selectAll('arc')
	.data(pie(data))
	.enter()
	.append('g')

arc.append('path')
	.attr('d', path)
	.attr('fill', function(d) { return color(d.data.percentage) ;  }) ; 

var label = d3.arc()
	.outerRadius(radius)
	.innerRadius(0)

arc.append('text')
	.attr('transform', function(d) { return 'translate('+label.centroid(d) +')' })  
	.attr('text-anchor', 'middle')
	.text(function(d) { return d.data.platform+':'+d.data.percentage+'%';}); 
	
	
*/ 

// line chart 

const api = 'https://api.coindesk.com/v1/bpi/historical/close.json?start=2017-12-31&end=2018-04-01';

document.addEventListener('DOMContentLoaded', function(event) {
fetch(api)
	.then(function(response){ return response.json(); })
	.then(function(data) { 
		var parsedData = parseData(data); 
		drawChart(parsedData); 
	})
	.catch(function(err) { console.log(err) ; } ) 

}) ;

function parseData(data) { 
	var arr = []; 
	for (var i in data.bpi){ 
		arr.push({ 
			date: new Date(i) , 
			value: +data.bpi[i]		
		}); 
	}
	return arr ; 
} 



function drawChart(data) { 

var svgWidth = 600, svgHeight = 400; 
var margin = { top: 20, right: 20, bottom:30, left: 50}; 
var width = svgWidth - margin.left - margin.right 
var height = svgHeight - margin.top - margin.bottom 

var svg = d3.select('svg')
	.attr('width', svgWidth)
	.attr('height', svgHeight); 

var g = svg.append('g')
	.attr('transform', 'translate('+margin.left +','+margin.top + ')'); 

var x = d3.scaleTime()
	.rangeRound([0,width]); 

var y = d3.scaleLinear()
	.rangeRound([height, 0]); 

var line = d3.line()
    .x(function(d) { return x(d.date)})
    .y(function(d) { return y(d.value)})
    x.domain(d3.extent(data, function(d) { return d.date }));
    y.domain(d3.extent(data, function(d) { return d.value }));

g.append('g')
	.attr('transform', 'translate(0,'+height+')')
	.call(d3.axisBottom(x))
	.select('.domain')
	.remove(); 

g.append('g')
	.call(d3.axisLeft(y))
	.append('text')
	.attr('fill', '#000')
	.attr('transform', 'rotate(-90)')
	.attr('y', 6)
	.attr('dy', '0.71em')
	.attr('text-anchor', 'end')
	.text('Price($)'); 

g.append('path')
	.datum(data)
	.attr('fill', 'none')
	.attr('stroke', 'steelblue')
	.attr('stroke-linejoin', 'round')
	.attr('stroke-linecap', 'round')
	.attr('stroke-width', 1.5)
	.attr('d', line); 
		
}







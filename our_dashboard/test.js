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

/* 
d3.csv("/Users/laurenlombardi/Documents/CDC_REU/Tutorials/D3_Tutorials/data-clean.csv").then(function(data) {
  console.log(data[0]);
});  

*/ 

d3.csv("data-clean.csv", function(d) {
  return {
    X0: d.X0, 
    X1: d.X1,
    Y: d.Y,
    console.log(d)
 };
}); 


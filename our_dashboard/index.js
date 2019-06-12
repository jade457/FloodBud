var mymap = L.map('mapid').setView([32.0809, -81.0912], 11);
const picker = datepicker(selector, options)

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
maxZoom: 18,
id: 'mapbox.streets',
accessToken: 'pk.eyJ1IjoibWNhcmxpbmk2IiwiYSI6ImNqd2h3ZW93cDAxaWo0M3A5bHFsb2l0NXIifQ.qiehHoOFMMN0VTrTg3_nDQ'
}).addTo(mymap);

var svgWidth = 600, svgHeight = 500; 

var svg = d3.select('svg')
        .attr('width' , svgWidth)
        .attr('height', svgHeight)
        .attr('class' , 'svg-container');

var arr     = []
var objects = []
var values  = []


d3.csv("Matthew_FilteredPeaks.csv", function(data) {

  data.forEach(function(d){ 
     arr.push({'latitude_dd':    d.latitude_dd,
               'longitide_dd':   d.longitude_dd,
               'peak_stage':    +d.peak_stage })
    values.push(+d.peak_stage)
  });
        
  function getColor(d) { 
    var norm = normalize(d)
    return 'rgb('+ parseInt(255*norm)+',0,'+ parseInt(255*(1-norm) )+')' 
  }	
        
  function normalize(d) { 
    console.log(d)
    var max = d3.max(values); 
    var min = d3.min(values);
    var range = max-min; 
    return (d-min)/range; 
  }
        
  arr.forEach(function(d) { 
    console.log(normalize(d.peak_stage))
    var circle = L.circle([d.latitude_dd, d.longitide_dd], 
    {
      color:        getColor(d.peak_stage),
      fillColor:    getColor(d.peak_stage),
      fillOpacity:  0.5,
      radius:       500
    });

    objects.push(circle)  
    circle.addTo(mymap)
  }); 
}); 

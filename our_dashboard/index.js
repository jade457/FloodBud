import { get_all_sensor_links, get_water_obs_links, get_obs_for_link } from './api_scraper.js';
var myMap = L.map('mapid').setView([32.0809, -81.0912], 11);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
maxZoom: 18,
id: 'mapbox.streets',
accessToken: 'pk.eyJ1IjoibWNhcmxpbmk2IiwiYSI6ImNqd2h3ZW93cDAxaWo0M3A5bHFsb2l0NXIifQ.qiehHoOFMMN0VTrTg3_nDQ'
}).addTo(myMap);

var svgWidth = 600, svgHeight = 500; 

var svg = d3.select('svg')
            .attr('width' , svgWidth)
            .attr('height', svgHeight)
            .attr('class' , 'svg-container');

var arr     = []
var objects = []
var values  = []

get_water_obs_links().then(data => {
  console.log(data);
  get_obs_for_link(data[0].link).then(console.log);
})
get_all_sensor_links().then(data => {
  //console.log(data);
})
d3.csv("sensor_data_full.csv", data => {
  var nested_data = {};

  data.forEach(d => {
    if(d.measurementName == 'Water Level') {
      if (!(d.sensorName in nested_data)) {
        nested_data[d.sensorName] = {
          lat:       d.sensorLat,
          lng:       d.sensorLng,
          elevation: d.sensorElevation,
          values:    [{
            time:    d.timestamp,
            level:   d.value
          }]
        };
      }
      else {
        nested_data[d.sensorName].values.push({
          time:  d.timestamp,
          level: +d.value
        })
      }
    }
  });

  var listed_data = []
  Object.keys(nested_data).forEach(sensor => {
    listed_data.push({
      sensor:    sensor,
      lat:       nested_data[sensor].lat,
      lng:       nested_data[sensor].lng,
      elevation: +nested_data[sensor].elevation,
      circle:    L.circle([nested_data[sensor].lat, nested_data[sensor].lng],
      {
        color:       'blue',
        fillColor:   'blue',
        fillOpacity: 0.5,
        radius:      500
      }),
      values: nested_data[sensor].values.slice(0, 100).reverse()
    })
  });
  listed_data.forEach(s => {
    s.circle.addTo(myMap);
  })
  var i = 0;
  setInterval(() => {
    listed_data.forEach(s => {
      myMap.removeLayer(s.circle);
      s.circle = L.circle([s.lat, s.lng],
      {
        color:       'blue',
        fillColor:   'blue',
        fillOpacity: 0.5,
        radius:      (s.elevation + s.values[i].level) * 500
      });
      s.circle.addTo(myMap);
    });
    i++;
  }, 1000);

  /**
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
    circle.addTo(myMap)
  }); 
  **/
}); 


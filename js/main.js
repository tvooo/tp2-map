/*globals L */

$(function() {
  var map = new L.map('map').setView([55.591757, 13.008027], 13),
      layerUrl = 'http://{s}.tiles.mapbox.com/v3/tvooo.map-krrh61ob/{z}/{x}/{y}.png',
      layerAttribution = 'Map data &copy; OpenStreetMap contributors, CC-BY-SA <a href="http://mapbox.com/about/maps" target="_blank">Terms &amp; Feedback</a>',
      layer = new L.TileLayer(layerUrl, {maxZoom: 19, attribution: layerAttribution, subdomains: 'abcd'});

      
      
  map.addLayer(layer);

var blue = '#4575b4';
var orange = '#ff7800';

$.getJSON('./config.json', function(c) {
  var config = c.config.split('-');
  $('#config .grid').html(config[0] + "x" + config[1]);
  $('#config .minRides').html(config[2]);
  $('#config .minPoints').html(config[3]);
  $('#config .ratio').html(config[4]);
  $.getJSON('./rides-' + c.config + '.json', function(d) {
  var rideLayer = L.geoJson(d,{style: {
      "color": orange,
      "weight": 1,
      "opacity": 0.05
    }}).addTo(map);

 $.getJSON('./fields-' + c.config + '.json', function(d) {
    /**/
  console.log(d); 
    d.forEach(function(field) {
      var b = field.bounds;
      var o = 1.5 * (field.slowRides / field.totalRides);
      //o = 0.9 * field.frequency;
      L.rectangle([[b[0][1],b[0][0]],[b[1][1],b[1][0]]], {color: blue, weight: 1, fillOpacity: o}).addTo(map);
    });
    
  });


  });

});

  
   });

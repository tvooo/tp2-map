/*globals L */

$(function() {
  var map = new L.map('map').setView([55.591757, 13.008027], 13),
      layerUrl = 'http://{s}.tiles.mapbox.com/v3/tvooo.map-krrh61ob/{z}/{x}/{y}.png',
      layerAttribution = 'Map data &copy; OpenStreetMap contributors, CC-BY-SA <a href="http://mapbox.com/about/maps" target="_blank">Terms &amp; Feedback</a>',
      layer = new L.TileLayer(layerUrl, {maxZoom: 19, attribution: layerAttribution, subdomains: 'abcd'});

      
      
  map.addLayer(layer);

var blue = '#4575b4';
var orange = '#ff7800';

function getGridFields(numx, numy) {
    if(!numx) numx = 10;
    if(!numy) numy = 10;

    var n = 55.62566995419465,
        w = 12.913227081298828,
        height = (55.55776753581523 - n) / numy,
        width = (13.102912902832031 - w) / numx;

    var fields = [];

    for(var x = 0; x < numx; x++) {
      for(var y = 0; y < numy; y++) {
        // ws, en
        var field = [[w + x * width, n + (y+1) * height], [w + (x + 1) * width, n + y * height]];
        fields.push({
          bounds: field
        });
      }
    }
    return fields;
}

$.getJSON('./config.json', function(c) {
  var config = c.config.split('-');
  $('#config .grid').html(config[0] + "x" + config[1]);

  var fields = getGridFields(config[0], config[1]);
  fields.forEach(function(field) {
  
      var b = field.bounds;
      var o = 1.5 * (field.slowRides / field.totalRides);
      L.rectangle([[b[0][1],b[0][0]],[b[1][1],b[1][0]]], {color: blue, weight: 1, fillOpacity: 0, strokeColor: blue}).addTo(map);
  });
});

});

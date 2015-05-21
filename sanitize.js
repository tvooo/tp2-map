var gju = require('geojson-utils');
var fs = require('fs');
var data = JSON.parse(fs.readFileSync('source.json'));
var _ = require('lodash');

gju.coordInBoundingBox = function (point, bounds) {
    return !(point[1] < bounds[0][1] || point[1] > bounds[1][1] || point[0] < bounds[0][0] || point[0] > bounds[1][0]) 
  }

var newfeatures = data.features.filter(function(feature) {
  return "LineString" === feature.geometry.type;
});

var area = [
  [12.913227081298828, 55.55776753581523],
  [13.102912902832031, 55.62566995419465]
];

newfeatures.forEach(function(feature) {
  feature.geometry.coordinates = feature.geometry.coordinates.filter(function(coord) {
    return gju.coordInBoundingBox(coord, area);
  });
})

fs.writeFileSync('sanitized.json', JSON.stringify({type: "FeatureCollection", features: newfeatures}));


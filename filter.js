var gju = require('geojson-utils');
var fs = require('fs');
var data = JSON.parse(fs.readFileSync('sanitized.json'));
var _ = require('lodash');
// Rides per field
var frequencyThreshold = 100;
// Data points per ride in a field
var slowThreshold = 10;
// Percentage of rides that must be above slowThreshold
var ratio = 0.2;
// Grid
var gridx = 120, gridy=80;

gju.coordInBoundingBox = function (point, bounds) {
    return !(point[1] < bounds[0][1] || point[1] > bounds[1][1] || point[0] < bounds[0][0] || point[0] > bounds[1][0]) 
  }

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

  function getRidesInField(field) {
    var rides = [];

    return data.features.filter(function(ride) {
      var result = false;
      if(ride.geometry.type === "LineString") {
        ride.geometry.coordinates.forEach(function(coord) {
          result = result || gju.coordInBoundingBox(coord, field.bounds)
        });
      }
      return result;
    });
  }

function getPointsInRideInField(ride, field) {
  return ride.geometry.coordinates.filter(function(coord) {
    return gju.coordInBoundingBox(coord, field.bounds);
  }).length;
}

console.log("Dividing area into grid of " + gridx + " x " + gridy + " fields...");

var fields = getGridFields(gridx,gridy);
var superImportantFields = [];
var maxTotalRides = 0;

console.log("Scanning for rides in each field...");

    fields.forEach(function(field) {
      var rides = getRidesInField(field);
      field.rides = rides;
      if(rides.length > maxTotalRides) maxTotalRides = rides.length;
    });

console.log("Scanning for density of rides in each field...")

    fields.forEach(function(field) {
      if(field.rides.length > frequencyThreshold) {
        var totalRides = field.rides.length;
        var slowRides = 0;
        var datapoints = 0;
        field.rides.forEach(function(ride) {
          datapoints += getPointsInRideInField(ride, field);
          if(getPointsInRideInField(ride, field) > slowThreshold) {
            slowRides++;
          }
        });
        if(slowRides >= totalRides * ratio) superImportantFields.push({
          bounds: field.bounds,
          slowRides: slowRides,
          totalRides: totalRides,
          frequency: totalRides / maxTotalRides,
          avgSlowness: datapoints / totalRides
        });
        //console.log(slowRides + " / " + totalRides);
      }
    });



console.log("Saving relevant fields...");


fs.writeFileSync('fields-'  + [gridx,gridy,frequencyThreshold,slowThreshold,ratio].join('-') +  '.json', JSON.stringify(superImportantFields));

var features = [];

fields.forEach(function(field) {
  if(field.rides.length > frequencyThreshold) {
    features = _.union(features, field.rides.filter(function(ride) { return getPointsInRideInField(ride, field) > slowThreshold; }));
  }
});

console.log("Saving " + features.length + " rides...");
fs.writeFileSync('rides-' + [gridx,gridy,frequencyThreshold,slowThreshold,ratio].join('-') + '.json', JSON.stringify({type: "FeatureCollection", features: features}));

console.log("Saving config: " + [gridx,gridy,frequencyThreshold,slowThreshold,ratio].join('-'));

fs.writeFileSync('config.json', JSON.stringify({config:  [gridx,gridy,frequencyThreshold,slowThreshold,ratio].join('-')}));

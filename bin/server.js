/**
 * Created by Letty on 11/12/15.
 */

var fs = require('fs');
var async = require('async');
var GeoJSON = require('GeoJSON');

async.parallel([
	function (callback) {
		fs.readFile('./data/lift.tsv', 'utf-8', function (err, data) {
			if (err) throw err;
			callback(null, data);
		});
	},
	function (callback) {
		fs.readFile('./data/stations.csv', 'utf-8', function (err, data) {
			if (err) throw err;
			callback(null, data);
		});
	}

], function (err, results) {
	var l_ = results[0];
	var s_ = results[1];
	var lookup = {};
	var ar = [];

	//geokoordinate 24 u 25
	var lifts = l_.split('\n');
	for (var i = 1; i < lifts.length; i++) {
		var lift = lifts[i].split('\t');
		if (lift[24] === '' || lift[25] === '') {
			if (!lookup[lift[5]]) {
				var o = lookup[lift[5]] = {
					station_id: lift[5],
					lifts: []
				};

				ar.push(lift[5]);
			}
			lookup[lift[5]].lifts.push({
				equipment_id: lift[2]
			});
		}
	}

	/**
	 * 3 bhf name
	 * 2 bhfnummer (staion von oben)
	 * 14 long
	 * 13 lath
	 // */
	var stations = s_.split('\n');
	for (var i = 1; i < stations.length; i++) {
		var station = stations[i].split('\,');
		if (lookup[station[2]]) {
			lookup[station[2]].name = station[3];
			lookup[station[2]].lng = parseFloat(station[14]);
			lookup[station[2]].lat = parseFloat(station[13]);

		}
	}

	var a = [];
	ar.forEach(function (id) {
		var current = lookup[id];
		if (!isNaN(current.lng) && !isNaN(current.lat)) {
			a.push(lookup[id]);
		}
		else {
			console.error("Can't parse Station for id: " + current.station_id);
		}
	});

	console.log("Checking...");

	GeoJSON.parse(a, {Point: ['lat', 'lng']}, function (geojson) {
		fs.writeFile('missingPoints.geojson', JSON.stringify(geojson, null, 3), 'utf8', function (err) {
			if(err) throw err;
			console.log('done');
		});
	});

});
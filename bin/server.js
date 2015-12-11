/**
 * Created by Letty on 11/12/15.
 */

var fs = require('fs');
var async = require('async');

async.parallel([
	function (callback) {
		fs.readFile('./data/lift.tsv', 'utf-8', function (err, data) {
			if(err) throw err;
			callback(null, data);
		});
	},
	function (callback) {
		fs.readFile('./data/stations.csv', 'utf-8', function (err, data) {
			if(err) throw err;
			callback(null, data);
		});
	}

], function (err, results) {
	var l_ = results[0];
	var s_ = results[1];
	var lift_objects = [];
	var lookup = {};

	//geokoordinate 24 u 25
	var lifts = l_.split('\n');
	for (var i = 1; i < lifts.length; i++) {
		var lift = lifts[i].split('\t');
		if(lift[24] === '' || lift[25] === ''){
			var ind = lift_objects.push({
				equipment : lift[2],
				station : lift[5]
			});
			lookup[lift[5]] = ind;
		}
	}

	/**
	 * 3 bhf name
	 * 2 bhfnummer (staion von oben)
	 * 14 long
	 * 13 lath
	 * @type {Array}
	 */
	var stations = s_.split('\n');
	for (var i = 1; i < stations.length; i++) {
		var station = stations[i].split('\t');
		if(lookup[station[2]]){
			//lookup[lift[5]] = true;
			//lift_objects.push({
			//	equipment : station[2],
			//	station : station[5]
			//});
		}
	}

});
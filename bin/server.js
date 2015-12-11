/**
 * Created by Letty on 11/12/15.
 */

var fs = require('fs');
var async = require('async')

async.parallel([
	function (callback) {
		fs.readFile('./data/lift.csv', 'utf-8', function (err, data) {
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
	var lifts = results[0];
	var stations = results[1];

	//here we go!


});
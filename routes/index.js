var express = require('express');
var router = express.Router();

// psql package import
var pg = require("pg");
 
var conString = "postgres://postgres:12345@127.0.0.1/patanostra";

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET pg json data.for tagged elevators */
router.get('/equipment/tagged', function (req, res) {
  var client = new pg.Client(conString);
  client.connect();
 
  var query = client.query("SELECT row_to_json(fc)"
    + "FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features "
    + "FROM ( SELECT 'Feature' As type "
    + ", ST_AsGeoJSON(lg.the_geom)::json As geometry "
//    + ", row_to_json((SELECT l FROM (SELECT standortequipment, technplatzbezeichng, equipment, equipmentname, ort, hersteller, baujahr, antriebsart,anzahl_haltestellen,anzahl_tueren_kabine, anzahl_tueren_schacht, lage, tragkraft, erweiterte_ortsangabe, min_tuerbreite, kabinentiefe, kabinenbreite, kabinenhoehe, tuerhohe, fabriknummer, tuerart, ausftextlichebeschreibung) As l)) As properties "
    + ", row_to_json((SELECT l FROM (SELECT equipment, ort) As l)) As properties "
    + "FROM aufzuege As lg WHERE the_geom IS NOT null) As f ) "
    + "As fc");

  query.on("row", function (row, result) {
    result.addRow(row);
  });
  query.on("end", function (result) {
    res.set('Content-Type', 'application/json');
    res.send(JSON.stringify(result.rows[0].row_to_json, null, 2));
    res.end();
  });
});

/* GET pg json data.for all stations with untagged elevators */
router.get('/stations/untagged', function (req, res) {
  var client = new pg.Client(conString);
  client.connect();

  var query = client.query("SELECT row_to_json(fc)"
    + "FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features "
    + "FROM ( SELECT 'Feature' As type "
    + ", ST_AsGeoJSON(stations.the_geom)::json As geometry"
    + ", row_to_json((SELECT l FROM (SELECT aufzuege.ort, array_to_json(array_agg(equipment)) as untagged_elevators) As l)) As properties "
    + "FROM aufzuege JOIN stations on (aufzuege.wirtschaftseinheit = stations.bahnhofnr) "
    + "WHERE aufzuege.the_geom IS null group by aufzuege.ort, stations.the_geom) As f ) "
    + "As fc");

  query.on("row", function (row, result) {
    result.addRow(row);
  });
  query.on("end", function (result) {
    res.set('Content-Type', 'application/json');
    res.send(JSON.stringify(result.rows[0].row_to_json, null, 2));
    res.end();
  });
});

/* GET details for elevator by equipment ID */
router.get('/equipment/:keyName', function (req, res) {

  var client = new pg.Client(conString);
  client.connect();
 
  var queryText = "SELECT row_to_json(fc)"
    + "FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features "
    + "FROM ( SELECT 'Feature' As type "
    + ", ST_AsGeoJSON(lg.the_geom)::json As geometry, row_to_json((SELECT l FROM (SELECT standortequipment, technplatzbezeichng, equipment, equipmentname, ort, hersteller, baujahr, antriebsart,anzahl_haltestellen,anzahl_tueren_kabine, anzahl_tueren_schacht, lage, tragkraft, erweiterte_ortsangabe, min_tuerbreite, kabinentiefe, kabinenbreite, kabinenhoehe, tuerhohe, fabriknummer, tuerart, ausftextlichebeschreibung) As l)) As properties FROM aufzuege AS lg WHERE equipment=$1) As f ) "
    + "As fc";

  client.query(queryText, [req.params.keyName], function(err, result) {
    if (err) {
      //TODO Handle error better?
      res.set('Content-Type', 'application/json');
      res.send(JSON.stringify({error: "+++Error At Address: 14, Treacle Mine Road, Ankh-Morpork+++"}, null, 2));
      res.end();
    }
    else {
      res.set('Content-Type', 'application/json');
      res.send(JSON.stringify(result.rows[0].row_to_json, null, 2));
      res.end();
    }
  });
});

router.get('/map', function(req,res) {
  res.render('map', {
  });
});

module.exports = router;

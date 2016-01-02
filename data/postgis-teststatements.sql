SELECT row_to_json(fc)
 FROM ( 
  SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features
  FROM (
   SELECT 'Feature' As type
   , ST_AsGeoJSON(lg.the_geom)::json As geometry
   , row_to_json(lp) As properties
   FROM aufzuege As lg
   INNER JOIN (
    SELECT standortequipment, technplatzbezeichng, equipment, equipmentname, aufzuege.ort, hersteller, baujahr, antriebsart,anzahl_haltestellen,anzahl_tueren_kabine, anzahl_tueren_schacht, lage, tragkraft, erweiterte_ortsangabe, min_tuerbreite, kabinentiefe, kabinenbreite, kabinenhoehe, tuerhohe, fabriknummer, tuerart, ausftextlichebeschreibung
    FROM aufzuege JOIN stations on (aufzuege.wirtschaftseinheit = stations.bahnhofnr) where aufzuege.the_geom is null) 
    As lp
   ON lg.Equipment = lp.Equipment  ) 
   As f )  
  As fc

SELECT row_to_json(fc)
 FROM ( 
  SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features
  FROM (
   SELECT 'Feature' As type
   , ST_AsGeoJSON(lg.the_geom)::json As geometry
   , row_to_json((SELECT l FROM (SELECT standortequipment, technplatzbezeichng, equipment, equipmentname, aufzuege.ort, hersteller, baujahr, antriebsart,anzahl_haltestellen,anzahl_tueren_kabine, anzahl_tueren_schacht, lage, tragkraft, erweiterte_ortsangabe, min_tuerbreite, kabinentiefe, kabinenbreite, kabinenhoehe, tuerhohe, fabriknummer, tuerart, ausftextlichebeschreibung) As l)) As properties
   FROM aufzuege JOIN stations on (aufzuege.wirtschaftseinheit = stations.bahnhofnr) As lg WHERE aufzuege.the_geom IS null) 
   As f )  
  As fc
  
# STATIONEN MIT UNGETAGGTEN AUFZUEGEN:

SELECT row_to_json(fc)
 FROM ( 
  SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features
  FROM (
   SELECT 'Feature' As type
   , ST_AsGeoJSON(stations.the_geom)::json As geometry
   , row_to_json((SELECT l FROM (SELECT standortequipment, technplatzbezeichng, equipment, equipmentname, stations.ort, hersteller, baujahr, antriebsart,anzahl_haltestellen,anzahl_tueren_kabine, anzahl_tueren_schacht, lage, tragkraft, erweiterte_ortsangabe, min_tuerbreite, kabinentiefe, kabinenbreite, kabinenhoehe, tuerhohe, fabriknummer, tuerart, ausftextlichebeschreibung) As l)) As properties
   FROM aufzuege JOIN stations on (aufzuege.wirtschaftseinheit = stations.bahnhofnr) WHERE aufzuege.the_geom IS null) 
   As f )  
  As fc

standortequipment, technplatzbezeichng, equipment, equipmentname, stations.ort, hersteller, baujahr, antriebsart,anzahl_haltestellen,anzahl_tueren_kabine, anzahl_tueren_schacht, lage, tragkraft, erweiterte_ortsangabe, min_tuerbreite, kabinentiefe, kabinenbreite, kabinenhoehe, tuerhohe, fabriknummer, tuerart, ausftextlichebeschreibung

SELECT equipment, stations.ort FROM aufzuege JOIN stations on (aufzuege.wirtschaftseinheit = stations.bahnhofnr) WHERE aufzuege.the_geom IS null

SELECT ST_AsGeoJSON(stations.the_geom)::json As geometry
   , row_to_json(l FROM (SELECT equipment, stations.ort) As l)) As properties
   FROM aufzuege JOIN stations on (aufzuege.wirtschaftseinheit = stations.bahnhofnr) WHERE aufzuege.the_geom IS null

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


# STATIONEN MIT JEWEILIGEM ARRAY UNGETAGGTER AUFZUEGE:

SELECT row_to_json(fc)
 FROM ( 
  SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features
  FROM (
   SELECT 'Feature' As type
   , ST_AsGeoJSON(stations.the_geom)::json As geometry, row_to_json((SELECT l FROM (SELECT aufzuege.ort, array_to_json(array_agg(equipment)) as untagged_elevators) As l)) As properties FROM aufzuege JOIN stations on (aufzuege.wirtschaftseinheit = stations.bahnhofnr) WHERE aufzuege.the_geom IS null group by aufzuege.ort, stations.the_geom) 
   As f )  
  As fc

# STATIONEN MIT JEWEILIGEM ARRAY ALLER AUFZUEGE

SELECT row_to_json(fc)
 FROM ( 
  SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features
  FROM (
   SELECT 'Feature' As type
   , ST_AsGeoJSON(stations.the_geom)::json As geometry, row_to_json((SELECT l FROM (SELECT aufzuege.ort, array_to_json(array_agg(equipment)) as elevators) As l)) As properties FROM aufzuege JOIN stations on (aufzuege.wirtschaftseinheit = stations.bahnhofnr) group by aufzuege.ort, stations.the_geom) 
   As f )  
  As fc

# EIN AUFZUG NACH EQUIPMENTNUMMER MIT ALLEN PARAMETERN

SELECT row_to_json(fc)
 FROM ( 
  SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features
  FROM (
   SELECT 'Feature' As type
   , ST_AsGeoJSON(lg.the_geom)::json As geometry, row_to_json((SELECT l FROM (SELECT standortequipment, technplatzbezeichng, equipment, equipmentname, ort, hersteller, baujahr, antriebsart,anzahl_haltestellen,anzahl_tueren_kabine, anzahl_tueren_schacht, lage, tragkraft, erweiterte_ortsangabe, min_tuerbreite, kabinentiefe, kabinenbreite, kabinenhoehe, tuerhohe, fabriknummer, tuerart, ausftextlichebeschreibung) As l)) As properties FROM aufzuege AS lg WHERE equipment = '') 
   As f )  
  As fc


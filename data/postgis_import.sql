CREATE TABLE aufzuege
(
  StandortEquipment character varying(50),
  TechnPlatzBezeichng character varying(50),
  Equipment integer,
  Equipmentname character varying(50),
  Ort character varying(50),
  Wirtschaftseinheit integer,
  Hersteller character varying(50),
  Baujahr integer,
  ANTRIEBSART character varying(50),
  ANZAHL_HALTESTELLEN integer,
  ANZAHL_TUEREN_KABINE integer,
  ANZAHL_TUEREN_SCHACHT integer,
  FOERDERGESCHWINDIGKEIT real,
  FOERDERHOEHE real,
  LAGE character varying(50),
  TRAGKRAFT real,
  ERWEITERTE_ORTSANGABE character varying(50),
  MIN_TUERBREITE integer,
  KABINENTIEFE integer,
  KABINENBREITE integer,
  KABINENHOEHE integer,
  TUERHOHE integer,
  FABRIKNUMMER character varying(50),
  TUERART character varying(50),
  GEOKOORDINATERECHTSWERT double precision,
  GEOKOORDINATEHOCHWERT double precision,
  Longitude double precision,
  Latitude double precision,
  the_geom geometry,
  AUSFTEXTLICHEBESCHREIBUNG character varying(150),

  CONSTRAINT aufzug_eqnr PRIMARY KEY (Equipment),
  CONSTRAINT enforce_dims_coords CHECK (st_ndims(the_geom) = 2),
  CONSTRAINT enforce_geotype_coords CHECK (geometrytype(the_geom) = 'POINT'::text OR the_geom IS NULL),
  CONSTRAINT enforce_srid_coords CHECK (st_srid(the_geom) = 4326)
);

-- Index: aufzuege_gist

-- DROP INDEX aufzuege_gist;

CREATE INDEX aufzuege_gist
  ON aufzuege
  USING gist
  (the_geom );


CREATE TABLE stations
(
  Bundesland character varying(25),
  Bahnhofsmanagement character varying(50),
  BahnhofNr integer,
  Station character varying(50),
  DS100 character varying(6),
  Bahnhofskategorie integer,
  Strasse character varying(50),
  PLZ character(5),
  Ort character varying(50),
  Aufgabentraeger character varying(70),
  Verkehrsverb character varying(10),
  Fernverkehr character varying(4),
  Nahverkehr character varying(4),
  lat double precision,
  lon double precision,
  the_geom geometry,

  CONSTRAINT station_bnr PRIMARY KEY (BahnhofNr),
  CONSTRAINT enforce_dims_coords CHECK (st_ndims(the_geom) = 2),
  CONSTRAINT enforce_geotype_coords CHECK (geometrytype(the_geom) = 'POINT'::text OR the_geom IS NULL),
  CONSTRAINT enforce_srid_coords CHECK (st_srid(the_geom) = 4326)
);

CREATE INDEX stations_gist
  ON stations
  USING gist
  (the_geom );

\copy stations(Bundesland, Bahnhofsmanagement, BahnhofNr, Station, DS100, Bahnhofskategorie, Strasse, PLZ, Ort, Aufgabentraeger, Verkehrsverb, Fernverkehr, Nahverkehr, lat, lon) FROM '/home/stk/datalove/patanostra/bin/data/stations.csv' DELIMITERS ',' CSV HEADER;

UPDATE stations
SET the_geom = ST_GeomFromText('POINT(' || lon || ' ' || lat || ')',4326);

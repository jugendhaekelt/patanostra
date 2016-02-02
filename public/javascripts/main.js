
  var map = L.map('map').setView([52, 10], 7);
  var activePin = -1;

  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
      '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
      id: 'osm'
  }).addTo(map);


  var sidebar = L.control.sidebar('sidebar', {
      closeButton: true,
      position: 'right'
  });
  map.addControl(sidebar);

  map.on('click', function () {
      sidebar.hide();
  })

  var geojsonMarkerOptions_valid = {
   radius: 4,
   fillColor: "#5CE5B1",
   color: "#000",
   weight: 1,
   opacity: 1,
   fillOpacity: 0.8
  };

  var geojsonMarkerOptions = {
   radius: 6,
   fillColor: "#e55c90",
   color: "#000",
   weight: 1,
   opacity: 0.6,
   fillOpacity: 0.8
  };

  var osmMarkerOptions = {
   radius: 4,
   fillColor: "#56B4E9",
   color: "#fff",
   weight: 1,
   opacity: 0.6,
   fillOpacity: 0.8
  };

$(document).ready(function(){



  var untagged_stations_geojson = $.getJSON("/stations/untagged");
  untagged_stations_geojson.then(function(data) {
      var untagged_stations = L.geoJson(data, {
          onEachFeature: onUntaggedStations,
          pointToLayer: function(feature, latlng) {
              return L.circleMarker(latlng, geojsonMarkerOptions);
          }
      });
      untagged_stations.addTo(map);
  });

  var osmtagged_stations_geojson = $.getJSON("/stations/osmtagged");
  osmtagged_stations_geojson.then(function(data) {
      var osmtagged_stations = L.geoJson(data, {
          onEachFeature: onOsmtaggedStations,
          pointToLayer: function(feature, latlng) {
              return L.circleMarker(latlng, osmMarkerOptions);
          }
      });
      osmtagged_stations.addTo(map);
  });

  var tagged_elevators_geojson = $.getJSON("/equipment/tagged");
  tagged_elevators_geojson.then(function(data) {
      var tagged_elevators = L.geoJson(data, {
          onEachFeature: onTaggedElevators,
          pointToLayer: function(feature, latlng) {
              return L.circleMarker(latlng, geojsonMarkerOptions_valid);
          }
      });
      tagged_elevators.addTo(map);
  });
});

  function onTaggedElevators(feature, layer) {
    layer.on({
      click: function (pin) {
        pinId = pin.target._leaflet_id;
        if (pinId === activePin) {
          activePin = -1;
        } else {
          activePin = pinId;
          var currentElevatorId = pin.target.feature.properties.equipment;
          displayEquipment(currentElevatorId);
        }
      }
   });
  }


  function onUntaggedStations(feature, layer) {
    layer.on({
      click: function (pin) {
        pinId = pin.target._leaflet_id;

        if (pinId === activePin) {
          activePin = -1;
        } else {
          activePin = pinId;
          var feature = pin.target.feature;

          $('#sidebar').empty();
          $('#sidebar').append("<h1>" + feature.properties.ort + "</h1><hr />" + " <h2>Aufzüge ohne Koordinaten</h2><ul>");
          for (var prop in feature.properties.untagged_elevators) {
            var curElevId = feature.properties.untagged_elevators[prop];
            var newLink = $('<li><a href="#" id ="' + curElevId + '_link">' + curElevId + '</a></li>');
            newLink.click(function(k) {
              return function() {
                displayEquipment(feature.properties.untagged_elevators[k]);
              }
            }(prop));
            $('#sidebar').append(newLink);
          }
          sidebar.show();
        }
      }
   });
  }

  function onOsmtaggedStations(feature, layer) {
    layer.on({
      click: function (pin) {
        pinId = pin.target._leaflet_id;

        if (pinId === activePin) {
          activePin = -1;
        } else {
          activePin = pinId;
          var feature = pin.target.feature;

          $('#sidebar').empty();
          $('#sidebar').append("<h1>" + feature.properties.ort + "</h1><hr />" + " <h2>Aufzüge, die in OSM, aber nicht der DB-Datenbank sind</h2><ul>");
          for (var prop in feature.properties.osmtagged_elevators) {
            var curElevId = feature.properties.osmtagged_elevators[prop];
            var newLink = $('<li><a href="#" id ="' + curElevId + '_link">' + curElevId + '</a></li>');
            newLink.click(function(k) {
              return function() {
                displayEquipment(feature.properties.osmtagged_elevators[k]);
              }
            }(prop));
            $('#sidebar').append(newLink);
          }
          sidebar.show();
        }
      }
   });
  }

 /*
  Routine lifts the submit function of the form, serializes the
  form data and performs an AJAX POST request to the server
 */

  $(document).on('submit', '#elevator_form', function(e){
    var frmdata = $("#elevator_form");
    var frmdata_json = frmdata.serializeObject();
    console.log(frmdata_json);
    
    $.ajax({
      type        : 'POST', // define the type of HTTP verb we want to use (POST for our form)
      contentType: "application/json",
      url         : '/equipment/update', // the url where we want to POST
      data        : JSON.stringify(frmdata_json), // our data object
      dataType    : 'json', // what type of data do we expect back from the server
                  encode          : true
     }).done(function(data) {
        // log data to the console so we can see
          console.log(data); 
        // here we will handle errors and validation messages
        swal("Daten aktualisiert", "Alle Eingaben wurden gespeichert. Dankeschön!", "success");
        alert("success");
      });
    return false;
  });

  /*
    Performs an AJAX get to inform the server this elevator is mapped in OSM
  */

//  function isInOSM(id) {

//    var equipment = 
//    $.ajax({
//      type        : 'GET',
//      url         : '/equipment/ignore/' + id, // the url where we want to POST
//     }).done(function(data) {
//        alert("Aufzug als in OSM gemappt markiert!");
//      });
//  };


  /*
   Custom serialization function in order to get JSON post parameters
   shamelessly lifted from https://jsfiddle.net/gabrieleromanato/bynaK/
  */

  $.fn.serializeObject = function()
  {
      var o = {};
      var a = this.serializeArray();
      $.each(a, function() {
          if (o[this.name] !== undefined) {
              if (!o[this.name].push) {
                  o[this.name] = [o[this.name]];
              }
              o[this.name].push(this.value || null);
          } else {
              if (this.value == '') {
                o[this.name] = null;
              } else {
                o[this.name] = this.value;
              }
          }
      });
      return o;
  };

  /*
  * displayEquipment(int)
  *
  * Requests (Geo)JSON information for the elevator id passed as
  *  an argument, formats the parameters into HTML and displays
  *  it into the #sidebar div
  */

  function displayEquipment(elevatorId) {
    $.getJSON("/equipment/" + elevatorId, function( data ) {
      $('#sidebar').empty();
      $('#sidebar').append('<h1>Aufzug ID ' + elevatorId + '</h1><hr />');
      $('#sidebar').append('<p>Bahnhof ' + data.features[0].properties["ort"] + '</p><p> Standortbeschreibungen: ' 
      + '<ul>' 
      + '<li>' + data.features[0].properties["standortequipment"] + '</li>' 
      + '<li>' + data.features[0].properties["technplatzbezeichng"] + '</li>' 
      + '<li>' + data.features[0].properties["equipmentname"] + '</li>' 
      + '<li>' + data.features[0].properties["lage"] + '</li>' 
      + '<li>' + data.features[0].properties["erweiterte_ortsangabe"] + '</li>' 
      + '<li>' + data.features[0].properties["ausftextlichebeschreibung"] 
      + '</li>'
      + '</ul></p>');
      $('#sidebar').append( '<form id="elevator_form" class="bootstrap-frm">' );
//      if (!data.features[0].geometry) {
//        $('#sidebar form').append('<input class="button" type="button" value="In OSM vorhanden" onClick="isInOSM(' + elevatorId + ')"/> <input class="button" type="button" value="Nicht öffentlich/nicht für Reisende" />')
//      }
      $.each( data.features, function( key, val ) {
        var coordsField = '<label for="coords">Coordinates (lon, lat):</label><input type="text" id="coords" placeholder="Coordinates (longitude, latitude)" name="coords"';
        if (val.geometry != null) {
          coordsField += ' value = "' + val.geometry.coordinates + '"';
        }
        coordsField += ('></input><br />');

        coordsField += '<input type="hidden" name="equipment" value="' + val.properties.equipment+ '" />';

        $('#sidebar form').append(coordsField);
        
        $.each(val.properties, function(columnHeader,columnContent){

          if ($.inArray(columnHeader, ['standortequipment', 'ausftextlichebeschreibung', 'technplatzbezeichng', 'equipment', 'equipmentname', 'ort', 'lage', 'erweiterte_ortsangabe']) >= 0 ) { return; }

          var formField = '<label for="' + columnHeader + '">' + columnHeader + ':</label>';
          formField += ('<input type="text" id="' + columnHeader + '" name="' + columnHeader + '" placeholder="' + columnHeader + '"');
            if (columnContent != null) {
              formField += (' value = "' + columnContent + '"');
            }
          formField += ('></input><br />');
          $('#sidebar form').append(formField);
        });
        
        });
      $('#sidebar form').append('<input class="button" type="submit" value="Änderungen speichern"/>');
      sidebar.show();
    });
  }


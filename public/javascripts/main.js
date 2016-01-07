$(document).ready(function () {
  var map = L.map('map').setView([52, 10], 7);
  var activePin = -1;

  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
      '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
      id: 'osm'
  }).addTo(map);

  var geojsonMarkerOptions_valid = {
   radius: 4,
   fillColor: "#00ff00",
   color: "#000",
   weight: 1,
   opacity: 1,
   fillOpacity: 0.8
  };

  var geojsonMarkerOptions = {
   radius: 6,
   fillColor: "#ff0000",
   color: "#000",
   weight: 1,
   opacity: 0.6,
   fillOpacity: 0.8
  };

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


  function onTaggedElevators(feature, layer) {
    layer.on({
      click: function (pin) {
        pinId = pin.target._leaflet_id;

        if (pinId === activePin) {
          activePin = -1;
        } else {
          activePin = pinId;
          var currentElevatorId = pin.target.feature.properties.equipment;
          $.getJSON("/equipment/" + currentElevatorId, function( data ) {
            var items = [];
            items.push('<h1>Aufzug ID ' + currentElevatorId + '</h1><hr>');
            $.each( data.features, function( key, val ) {
              $.each(val.properties, function(columnHeader,columnContent){
                items.push('<li id="' + columnHeader + '">' + columnContent + '</li>');
              });
            });
          
            var htmlstring = $( "<ul/>", {
               html: items.join( "" )
            });
            $('#info').html(htmlstring);
            
          });
          console.log(feature);
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

          $('#info').empty();
          $('#info').append("<h1>" + feature.properties.ort + "</h1><hr />" + " <h2>Aufzüge ohne Koordinaten</h2><ul>");
          for (var prop in feature.properties.untagged_elevators) {
            var curElevId = feature.properties.untagged_elevators[prop];
            var newLink = $('<li><a href="#" id ="' + curElevId + '_link">' + curElevId + '</a></li>');
            newLink.click(function() {
              $.getJSON("/equipment/" + curElevId, function( data ) {
                var items = [];
                items.push('<h1>Aufzug ID ' + curElevId + '</h1><hr>');
                $.each( data.features, function( key, val ) {
                  $.each(val.properties, function(columnHeader,columnContent){
                    items.push('<li id="' + columnHeader + '">' + columnContent + '</li>');
                  });
                });

                var new_htmlstring = $( "<ul/>", {
                   html: items.join( "" )
                });
                $('#info').html(new_htmlstring);

              });
            });
            $('#info').append(newLink);
          }

          if (feature.lifts)
            feature.lifts.forEach(function (item) {
             htmlstring += "<li>DB-ID: " + item.equipment_id + "</li>";
              if (!item.tagged) {
               htmlstring += '<div class="button_wrap"><button id="tagme">Tag me</button></div>';
              }
            });
        }
      }
   });
  }


  function getPopUp(feature) {
    swal({
          title: "Tag Lift",
          text: "Input Latitude:",
          type: "input",
          showCancelButton: true,
          closeOnConfirm: false,
          animation: "slide-from-top",
          inputPlaceholder: "Latitude"
        },
        function (latitude) {
          if (latitude === false) return false;
          if (parseFloat(latitude) !== NaN) {
            swal.showInputError("Error, ungültiger Wert");
            return false
          }
          swal({
                title: "Tag Lift",
                text: "Input Longitude",
                type: "input",
                showCancelButton: true,
                closeOnConfirm: false,
                animation: "slide-from-top",
                inputPlaceholder: "Longitude"
              },
              function (longitude) {
                if (longitude === false) return false;
                if (parseFloat(longitude) !== "") {
                  swal.showInputError("Invalid Value");
                  return false
                }
                swal({
                      title: "Nice!",
                      text: "You wrote:<br />Latitude: " + latitude + "<br/>Longitude:" + longitude,
                      html: true,
                      showConfirmButton: "true",
                      confirmButtonText: "Send Mail",
                      closeOnConfirm: false,
                    },
                    function () {

                      $.ajax({
                        'type': 'POST',
                        'url': 'https://mandrillapp.com/api/1.0/messages/send.json',
                        'data': {
                          'key': 'qpHU2y0BBP2bvtBUCp7XTQ',
                          'message': {
                            'from_email': 'mail@patanostra.me',
                            'to': [{
                                    'email': 'knut.perseke@gmail.com',
                              'name': 'Knut Perseke',
                              'type': 'to'
                            },
                            {
                              'email': 'knut.perseke@okfn.de',
                              'name': 'Knut Perseke',
                              'type': 'to'
                            }
                          ],
                          'autotext': 'true',
                          'subject': 'Juhu, ein Aufzug wurde gefunden!',
                          'html': 'Liebe Open-Data-Begeisterte bei der DB, <br /><br />ein heimatloser Aufzug hat ' +
                          'seine Orientierung gefunden  \\o/<br /><br />Über paternoster wurde durch eine großzügige ' +
                          'Datenspende unter CC-0-Lizenz von der awesomen Community der Aufzug mit der ' +
                          'Equipmentnummer ' + feature.lifts[0].equipment_id + ' in ' + feature.name + ' und der Koordinate ' + latitude +  ', ' + longitude + ' zugeordnet! <br /><br />Das ist ein Grund ' +
                          'zu feiern – und wir freuen uns sehr über einen vielleicht bald noch viel ' +
                          'passenderen Prozess, um euch die paar restlichen Aufzüge mit _allen_ fehlenden ' +
                          'Daten nach und nach geben zu dürfen <3 <br /><br />Mit vielen Grüßen und Dank für euren Einsatz,' +
                          '<br />die paternostra-datenmafia'
                          }
                        }
                      }).done(function(response) {
                        console.log(response); // if you're into that sorta thing
                      });
                      swal("Mail sent", "Sent Mail to Deutsche Bahn", "success");
                    });
              });
        });
  }


});

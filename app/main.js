$(document).ready(function() {
    swal({
            title: "Tag Lift",
            text: "Input Latitude:",
            type: "input",
            showCancelButton: true,
            closeOnConfirm: false,
            animation: "slide-from-top",
            inputPlaceholder: "Latitude" },
        function(latitude){ if (latitude === false) return false;
            if (latitude === "") {
                swal.showInputError("Error");
                return false
            }
            swal({
                    title: "Tag Lift",
                    text: "Input Longitude",
                    type: "input",
                    showCancelButton: true,
                    closeOnConfirm: false,
                    animation: "slide-from-top",
                    inputPlaceholder: "Longitude" },
                function(longitude){ if (longitude === false) return false;
                    if (longitude === "") {
                        swal.showInputError("Invalid Value");
                        return false
                    }
                    swal({
                            title:"Nice!",
                            text: "You wrote:<br />Latitude: " + latitude + "<br/>Longitude:" + longitude,
                            html:true,
                            showConfirmButton: "true",
                            confirmButtonText: "Send Mail",
                            closeOnConfirm: false,
                        },
                        function() {
                            swal("Mail snet", "Sent Mail to Deutsche Bahn", "success")
                        });
                });
        });

    var map = L.map('map').setView([52, 10], 7);
    var activePin = -1;

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IjZjNmRjNzk3ZmE2MTcwOTEwMGY0MzU3YjUzOWFmNWZhIn0.Y8bhBaUMqFiPrDRW9hieoQ', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
        id: 'mapbox.light'
    }).addTo(map);

    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#ff0000",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    var geojsonMarkerOptions_valid = {
        radius: 8,
        fillColor: "#00ff00",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    function onEachFeature(feature, layer) {
        var popupContent = "<strong>" + feature.properties.name + "</strong><br />";

        //feature.properties.lifts.forEach(function(item){
        //    popupContent += "Aufzug: " + item.equipment_id + "<br />";
        //});
        //
        //if (feature.properties && feature.properties.popupContent) {
        //    popupContent += feature.properties.popupContent;
        //}
        //
        //layer.bindPopup(popupContent);

        layer.on({
            click: function(pin) {
                pinId = pin.target._leaflet_id;

                if (pinId === activePin) {

                    $('.infobox').addClass('infobox-slide-out');
                    $('.infobox').removeClass('infobox-slide-in');
                    activePin = -1;
                } else {
                    $('.infobox').removeClass('infobox-slide-out');
                    $('.infobox').addClass('infobox-slide-in');
                    activePin = pinId;
                    var popupContent = '';
                    var feature = pin.target.feature.properties;


                    var htmlstring = "<h1>" + feature.name + "</h1><hr />" + "Aufzüge : <br /><ul>";
                    if (feature.lifts)
                        feature.lifts.forEach(function(item){
                            htmlstring += "<li>Aufzug: " + item.equipment_id + "</li>";
                    });
                    htmlstring += "</ul>";
                    if (!feature.tagged) {
                        htmlstring += '<button id="tagme">Tag me</button>';
                    }
                    //
                    //if (feature.popupContent) {
                    //    popupContent += feature.properties.popupContent;
                    //}
                    $('.infobox').html(htmlstring);
                    console.log(feature);
                    console.log(popupContent);
                    console.log(pin);
                }

                console.log("Active Pin: " + pin.target._leaflet_id);
            }
        });
    }


    var station_points = L.geoJson(stations, {
        onEachFeature: onEachFeature,
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }
    });
    station_points.addTo(map);

    var station_points_tagged = L.geoJson(stations_valid, {
        onEachFeature: onEachFeature,
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions_valid);
        }
    });
    station_points_tagged.addTo(map);

    var baseLayers = {};

    var overlays = {
        "Untagged": station_points,
        "Tagged": station_points_tagged
    };

    L.control.layers(baseLayers, overlays).addTo(map);

    map.on('click', function() {
        $('.infobox').addClass('infobox-slide-out');
        $('.infobox').removeClass('infobox-slide-in');
        activePin = -1;
    });
});
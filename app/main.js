$(document).ready(function () {
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
		radius: 6,
		fillColor: "#ff0000",
		color: "#000",
		weight: 1,
		opacity: 0.6        ,
		fillOpacity: 0.8
	};

	var geojsonMarkerOptions_valid = {
		radius: 4,
		fillColor: "#00ff00",
		color: "#000",
		weight: 1,
		opacity: 1,
		fillOpacity: 0.8
	};

	function onEachFeature(feature, layer) {
		layer.on({
			click: function (pin) {
				pinId = pin.target._leaflet_id;

				if (pinId === activePin) {
					activePin = -1;
				} else {
					activePin = pinId;
					var feature = pin.target.feature.properties;


					var htmlstring = "<h1>" + feature.name + "</h1><hr />" + " <h2>Aufzüge: </h2><ul>";
					if (feature.lifts)
						feature.lifts.forEach(function (item) {
							htmlstring += "<li>Aufzug: " + item.equipment_id + "</li>";
						});
					htmlstring += "</ul>";
					if (!feature.tagged) {
						htmlstring += '<div class="button_wrap"><button id="tagme">Tag me</button></div>';
					}

					$('#info').html(htmlstring);
					console.log(feature);
					$('#tagme').on('click', function (id) {
						console.log(feature);
						getPopUp(feature);
					});
				}
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

	map.on('click', function () {
		activePin = -1;
	});

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
---
feature_layers:
  - id: coal
    title: Coal
    file: map-data/coal.geojson
  - id: coldWar
    title: Cold War
    file: map-data/cold-war.geojson
  - id: miscellaneous
    title: Miscellaneous
    file: map-data/miscellaneous.geojson
  - id: shelters
    title: Shelters
    file: map-data/shelters.geojson
  - id: transport
    title: Transport
    file: map-data/transport.geojson
  - id: tunnels
    title: Tunnels
    file: map-data/tunnels.geojson
  - id: victoriaStationArea
    title: Victoria Station Area
    file: map-data/victoria-station-area.geojson
  - id: waterways
    title: Waterways
    file: map-data/waterways.geojson
---

// Provide your access token
L.mapbox.accessToken = 'pk.eyJ1IjoibWFya2Nyb3NzZmllbGQiLCJhIjoiYjJjNzliNGEwNjNiYTU1YjA4YTlkNjhkNmNmMjJlYzgifQ.2jm00t_mEEW5wEk6Ytzp2g';
// Create a map in the div #map
var map = L.mapbox.map('undergroundManchesterMap', 'markcrossfield.nae9omlm').setView([53.4728584,-2.2444749],13);
map.scrollWheelZoom.disable();

var layers = document.getElementById('menu-ui');
addLayer(L.mapbox.tileLayer('examples.bike-lanes'), 'Bike Lanes', 2);
{% for feature_layer in page.feature_layers %}
    var {{feature_layer.id}} = {% include {{feature_layer.file}} %}
    addLayer(L.mapbox.featureLayer({{feature_layer.id}}), "{{feature_layer.title}}", 2);
{% endfor %}
{% for feature in site.features %}
    var {{feature.layer}} = {{ feature.content }}
    addLayer(L.mapbox.featureLayer({{feature.layer}}), "{{feature.layer-title}}", 2);
{% endfor %}

function addLayer(layer, name, zIndex) {
    layer
        .setZIndex(zIndex)
        .addTo(map);

    // Create a simple layer switcher that
    // toggles layers on and off.
    var link = document.createElement('a');
    link.href = '#';
    link.className = 'active';
    link.innerHTML = name;

    link.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();

        if (map.hasLayer(layer)) {
            map.removeLayer(layer);
            this.className = '';
        } else {
            map.addLayer(layer);
            this.className = 'active';
        }
    };

    layers.appendChild(link);
}
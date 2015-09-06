---
feature_layers:
  - id: transport
    title: Transport
    file: map-data/transport.geojson
    layer-color: '#ff0000'
  - id: waterways
    title: Waterways
    file: map-data/waterways.geojson
    layer-color: '#3887be'
  - id: victoriaStationArea
    title: Victoria & Cathedral
    file: map-data/victoria-station-area.geojson
    layer-color: '#ff9999'
  - id: tunnels
    title: Tunnels
    file: map-data/tunnels.geojson
    layer-color: '#5c2b00'
  - id: coal
    title: Coal
    file: map-data/coal.geojson
    layer-color: '#000000'
  - id: miscellaneous
    title: Miscellaneous
    file: map-data/miscellaneous.geojson
    layer-color: '#a8a8a8'
  - id: shelters
    title: Shelters
    file: map-data/shelters.geojson
    layer-color: '#00ff00'
---

// Provide your access token
L.mapbox.accessToken = 'pk.eyJ1IjoibWFya2Nyb3NzZmllbGQiLCJhIjoiYjJjNzliNGEwNjNiYTU1YjA4YTlkNjhkNmNmMjJlYzgifQ.2jm00t_mEEW5wEk6Ytzp2g';
// Create a map in the div #map
var map = L.mapbox.map('undergroundManchesterMap', 'markcrossfield.nae9omlm', { zoomControl: false }).setView([53.4780584,-2.2414749],14);

new L.Control.Zoom({ position: 'topright' }).addTo(map);
map.scrollWheelZoom.disable();

//if (Modernizr.touch()) {
    //map.dragging.disable();
//}


var layers = document.getElementById('menu-ui');
{% for feature in site.features %}
    var {{feature.layer}} = {{ feature.content }}
    addLayer(L.mapbox.featureLayer({{feature.layer}}), "{{feature.layer-title}}", 2, "{{feature.layer-color}}");
{% endfor %}
{% for feature_layer in page.feature_layers %}
    var {{feature_layer.id}} = {% include {{feature_layer.file}} %}
    addLayer(L.mapbox.featureLayer({{feature_layer.id}}), "{{feature_layer.title}}", 2, "{{feature_layer.layer-color}}");
{% endfor %}

function addLayer(layer, name, zIndex, color) {
    layer
        .setZIndex(zIndex)
        .addTo(map);

    // Create a simple layer switcher that
    // toggles layers on and off.
    var link = document.createElement('a');
    link.href = '#';
    link.id = name
    link.className = 'active';
    link.innerHTML = name;
    link.style.cssText = 'background-color: ' + color + ';';

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
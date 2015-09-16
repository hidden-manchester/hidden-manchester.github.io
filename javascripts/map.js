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
    layer-color: '#B1835A'
  - id: coal
    title: Coal
    file: map-data/coal.geojson
    layer-color: '#7D7D7D'
  - id: miscellaneous
    title: Miscellaneous
    file: map-data/miscellaneous.geojson
    layer-color: '#FF8E02'
  - id: shelters
    title: Shelters
    file: map-data/shelters.geojson
    layer-color: '#00ff00'
---

// Provide your access token
L.mapbox.accessToken = 'pk.eyJ1IjoibWFya2Nyb3NzZmllbGQiLCJhIjoiYjJjNzliNGEwNjNiYTU1YjA4YTlkNjhkNmNmMjJlYzgifQ.2jm00t_mEEW5wEk6Ytzp2g';
// Create a map in the div #map
var map = L.mapbox.map('underground-manchester-map', 'markcrossfield.nae9omlm', { zoomControl: false }).setView([53.4780584,-2.2414749],14);

new L.Control.Zoom({ position: 'topright' }).addTo(map);
map.scrollWheelZoom.disable();

//if (Modernizr.touch) {
//    map.dragging.disable();
//    if (map.tap) map.tap.disable();
//}


var layers = document.getElementById('layer-controls');
{% for feature in site.features %}
    var {{feature.layer}} = {{ feature.content }}
    addLayer(L.mapbox.featureLayer({{feature.layer}}), "{{feature.layer-title}}", 2, "{{feature.layer-color}}");
{% endfor %}
{% for feature_layer in page.feature_layers %}
    var {{feature_layer.id}} = {% include {{feature_layer.file}} %}
    addLayer(L.mapbox.featureLayer({{feature_layer.id}}), "{{feature_layer.title}}", 2, "{{feature_layer.layer-color}}");
{% endfor %}
function featureIdInUrl() {
    return window.location.hash.substr(1);
}
map.eachLayer(function (layer) {
    if (layer.feature) {
        if (layer.feature.id === featureIdInUrl()) {
            layer.openPopup();
        }
        layer.on('click', function (e) {
            history.pushState({}, "", "#" + e.target.feature.id);
        })
    }
});

window.onpopstate = function() {
    map.eachLayer(function (layer) {
        if (layer.feature) {
            if (layer.feature.id === featureIdInUrl()) {
                layer.openPopup();
            }
        }
    });
};

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
    link.innerHTML = '<span>'+name+'</span>';
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

function showMenu() {
    document.getElementById('map-menu').style.display = 'block';
    document.getElementById('underground-manchester-map').style.display = 'none';
    document.getElementById('map-menu-control-show').style.display = 'none';
    document.getElementById('map-menu-control-close').style.display = 'inline';
}
function hideMenu() {
    document.getElementById('map-menu').style.display = 'none';
    document.getElementById('underground-manchester-map').style.display = 'block';
    document.getElementById('map-menu-control-show').style.display = 'inline';
    document.getElementById('map-menu-control-close').style.display = 'none';
}
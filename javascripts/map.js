---
---
// Provide your access token
L.mapbox.accessToken = 'pk.eyJ1IjoibWFya2Nyb3NzZmllbGQiLCJhIjoiYjJjNzliNGEwNjNiYTU1YjA4YTlkNjhkNmNmMjJlYzgifQ.2jm00t_mEEW5wEk6Ytzp2g';
var baseMap = 'markcrossfield.nae9omlm';
var map = L.mapbox.map('underground-manchester-map', baseMap, { zoomControl: false }).setView([53.4780584,-2.2414749],14);
var layers = {
    Map: L.mapbox.tileLayer(baseMap),
    Hybrid: L.mapbox.tileLayer('mapbox.streets-satellite'),
    Satellite: L.mapbox.tileLayer('mapbox.satellite')
};

L.control.layers(layers).addTo(map);
L.control.locate().addTo(map);
new L.Control.Zoom({ position: 'topright' }).addTo(map);
//map.scrollWheelZoom.disable();

var layers = document.getElementById('layer-controls');
var rootUrl = window.location.protocol + '//' + window.location.host + '/';
{% for collection in site.collections %}
    var {{ collection[0] | replace: '-','_'}} = {
        "type": "FeatureCollection",
        "features": [
    {% for feature in collection[1].docs %}
    {% capture content_words %}{{ feature.content | number_of_words }}{% endcapture %}
    {% capture description_words %}{{ feature.description | number_of_words }}{% endcapture %}
    {% assign excerpted = 'asd' %}
    {% if content_words != '0' and description_words != content_words %}{% assign excerpted = 'true' %}{% endif %}
            {
                "type": "{{ feature.type }}",
                "properties": {
                    "name": "{{ feature.title }}",
                    "title": "{{ feature.title }}",
                    "description": "{{ feature.description }}{% if excerpted == 'true' %}<p class=read-more><a href="+rootUrl+"{{ collection[0] }}/{{ feature.id }}.html>Read more…</a>{% endif %}</p>",
                    "marker-color": "{{ collection[1].color }}",
                    "marker-size": "",
                    "marker-symbol": "{{ collection[1].marker_symbol }}",
                    "stroke": "{{ collection[1].color }}",
                    "stroke-width": {% if feature.stroke_width != null %}{{ feature.stroke_width }}{% else %}3{% endif %}, // {{feature.stroke_width}}
                    "stroke-opacity": 1,
                    "fill": "{{ collection[1].color }}",
                    "fill-opacity": 0.5
                },
                {{ feature.geometry }},
                "id": "{{ feature.id }}"
            },
    {% endfor %}
        ]};
    addLayer(L.mapbox.featureLayer({{ collection[0] | replace: '-','_'}}), "{{collection[1].title}}", 2, "{{collection[1].color}}");
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
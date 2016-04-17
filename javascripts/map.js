---
---
// Provide your access token
L.mapbox.accessToken = 'pk.eyJ1IjoibWFya2Nyb3NzZmllbGQiLCJhIjoiYjJjNzliNGEwNjNiYTU1YjA4YTlkNjhkNmNmMjJlYzgifQ.2jm00t_mEEW5wEk6Ytzp2g';
var economy = {{site.economy}};
var baseMap = economy? 'mapbox.satellite' : 'markcrossfield.nae9omlm';
var map = L.mapbox.map('underground-manchester-map', baseMap, { zoomControl: false }).setView([53.4780584,-2.2414749],14);
var layers = {
    Map: L.mapbox.tileLayer(baseMap),
    Hybrid: L.mapbox.tileLayer('mapbox.streets-satellite'),
    Satellite: L.mapbox.tileLayer('mapbox.satellite')
};

if (!economy) {
    L.control.layers(layers).setPosition('bottomleft').addTo(map);
}
L.control.locate().setPosition('bottomleft').addTo(map);
new L.Control.Zoom().setPosition('bottomleft').addTo(map);

var layers = document.getElementById('layer-controls');
var rootUrl = window.location.protocol + '//' + window.location.host + '/';
{% for collection in site.collections %}
    {% if collection.docs | size > 0 %}
    var {{ collection.label | replace: '-','_'}} = {
        "type": "FeatureCollection",
        "features": [
    {% for feature in collection.docs %}
    {% capture content_words %}{{ feature.content | default: "" | number_of_words }}{% endcapture %}
    {% capture description_words %}{{ feature.description | default: "" | number_of_words }}{% endcapture %}
    {% assign excerpted = 'asd' %}
    {% if content_words != '0' and description_words != content_words %}{% assign excerpted = 'true' %}{% endif %}
            {
                "type": "{{ feature.type }}",
                "properties": {
                    "name": "{{ feature.title }}",
                    "title": "{{ feature.title }}",
                    "description": "{{ feature.description }}{% if excerpted == 'true' %}<p class=read-more><a href="+rootUrl+"{{ collection.label }}/{{ feature.id }}.html>Read more…</a>{% endif %}</p>",
                    "marker-color": "{{ collection.color }}",
                    "marker-size": "",
                    "marker-symbol": "{{ collection.marker_symbol }}",
                    "stroke": "{{ collection.color }}",
                    "stroke-width": {% if feature.stroke_width != null %}{{ feature.stroke_width }}{% else %}3{% endif %}, // {{feature.stroke_width}}
                    "stroke-opacity": 1,
                    "fill": "{{ collection.color }}",
                    "fill-opacity": 0.5
                    {% if feature.labels %},
                    "labels": [
                        {% for label in feature.labels %}
                        {
                            'text': '{{label.text}}',
                            'latitude': '{{label.latitude}}',
                            'longitude': '{{label.longitude}}'
                        },
                        {% endfor %}
                    ]
                    {% endif %}
                },
                {{ feature.geometry }},
                "id": "{{ feature.id }}"
            },
    {% endfor %}
    {% endif %}
        ]};
    addLayer(L.mapbox.featureLayer({{ collection.label | replace: '-','_'}}), "{{collection.title}}", 2, "{{collection.color}}");
{% endfor %}

function featureIdInUrl() {
    return window.location.hash.substr(1);
}
map.eachLayer(function (layer) {
    if (layer.feature) {
        if (layer.feature.properties.labels) {
            layer.feature.properties.labels.forEach(function addLabel(label) {
                L.marker([label.latitude, label.longitude], {
                    icon: L.divIcon({
                        className: 'feature-label',
                        html: '•&nbsp;&nbsp;'+label.text,
                        //iconSize: [100, 40]
                    })
                }).addTo(map);
            });
        }
        if (layer.feature.id === featureIdInUrl()) {
            layer.openPopup();
        }
        layer.on('click', function (e) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'features',
                eventAction: 'open',
                eventLabel: e.target.feature.id
            });
            history.pushState({}, "", "#" + e.target.feature.id);
        })
    }
});

map.on('click', function(e) {

    var latitude = e.latlng.lat;
    var longitude = e.latlng.lng;

    console.log('Coordinates\nlatitude: \'' + latitude + "\'\nlongitude: \'" + longitude+'\'')

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
            ga('send', {
                hitType: 'event',
                eventCategory: 'User Actions',
                eventAction: 'Hide Layer',
                eventLabel: 'Hide ' + name + ' Layer'
            });
        } else {
            map.addLayer(layer);
            this.className = 'active';
            ga('send', {
                hitType: 'event',
                eventCategory: 'User Actions',
                eventAction: 'Show Layer',
                eventLabel: 'Show ' + name + ' Layer'
            });
        }
    };

    layers.appendChild(link);
}

function showMenu() {
    document.getElementById('map-menu').style.display = 'block';
    document.getElementById('underground-manchester-map').style.display = 'none';
    document.getElementById('news-flash').style.display = 'none';
    document.getElementById('map-menu-control-close').style.display = 'inline';
    ga('send', {
        hitType: 'event',
        eventCategory: 'User Actions',
        eventAction: 'Open Map Menu'
    });
}
function hideMenu() {
    document.getElementById('map-menu').style.display = 'none';
    document.getElementById('underground-manchester-map').style.display = 'block';
    document.getElementById('map-menu-control-close').style.display = 'none';
    ga('send', {
        hitType: 'event',
        eventCategory: 'User Actions',
        eventAction: 'Close Map Menu'
    });
}

function showNewsFlash() {
    document.getElementById('news-flash').style.display = 'block';
    document.getElementById('underground-manchester-map').style.display = 'none';
    document.getElementById('map-menu').style.display = 'none';
    document.getElementById('news-flash-control-close').style.display = 'inline';
    ga('send', {
        hitType: 'event',
        eventCategory: 'User Actions',
        eventAction: 'Open News Flash'
    });
}
function hideNewsFlash() {
    document.getElementById('news-flash').style.display = 'none';
    document.getElementById('underground-manchester-map').style.display = 'block';
    document.getElementById('news-flash-control-close').style.display = 'none';
    ga('send', {
        hitType: 'event',
        eventCategory: 'User Actions',
        eventAction: 'Close News Flash'
    });
}
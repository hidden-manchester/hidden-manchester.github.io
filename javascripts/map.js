---
---
{% unless site.suspended %}
// Provide your access token
L.mapbox.accessToken = 'pk.eyJ1IjoibWFya2Nyb3NzZmllbGQiLCJhIjoiYjJjNzliNGEwNjNiYTU1YjA4YTlkNjhkNmNmMjJlYzgifQ.2jm00t_mEEW5wEk6Ytzp2g';
var economy = {{site.economy}};
var satellite = L.mapbox.styleLayer('mapbox://styles/mapbox/satellite-v9');
var baseLayer = economy ? satellite : L.mapbox.styleLayer('mapbox://styles/markcrossfield/ckhb3zmly05e319o4bym8mz0i');

var map = L.mapbox.map('underground-manchester-map')
    .setView([53.4780584,-2.2414749],14)
    .addLayer(baseLayer);
var layers = {
    Map: baseLayer,
    Hybrid: L.mapbox.styleLayer('mapbox://styles/mapbox/satellite-streets-v11'),
    Satellite: satellite
};

if (!economy) {
    L.control.layers(layers).setPosition('bottomleft').addTo(map);
}
L.control.locate().setPosition('bottomleft').addTo(map);
new L.Control.Zoom().setPosition('bottomleft').addTo(map);

var layers = document.getElementById('layer-controls');
var rootUrl = window.location.protocol + '//' + window.location.host;
{% for collection in site.collections %}
    {% if collection.docs and collection.label != 'posts' %}
    console.log("Adding layer for {{ collection.label }}")
    var collectionLayerGroup = new L.LayerGroup();
    {% for feature in collection.docs %}
        {% capture content_words %}{{ feature.content | default: "" | number_of_words }}{% endcapture %}
        {% capture excerpt_words %}{{ feature.excerpt | default: "" | number_of_words }}{% endcapture %}
        {% assign excerpted = 'asd' %}
        {% if content_words != '0' and excerpt_words != content_words %}{% assign excerpted = 'true' %}{% endif %}
            var featureGeoJSON =
            {
                "type": "FeatureCollection",
                "features": {{ feature.features }}
                    .map(
                        function(geoFeature) {
                            var featureProperties = {
                                "weight": 4,
                                "color": "{{ collection.color }}",
                                "opacity": 1,
                                "fillOpacity": 0.5
                            };
                            Object.assign(featureProperties, geoFeature.properties);
                            geoFeature.properties = featureProperties;
                            geoFeature.collectionId = "{{ feature.id }}";
                            return geoFeature;
                        }
                    ),
                "id": "{{ feature.id }}"
            }
            var geoLayer = L.geoJson(
                    featureGeoJSON,
                    {
                        pointToLayer: function (geoFeature) {
                            return L.marker(
                                [geoFeature.geometry.coordinates[1],geoFeature.geometry.coordinates[0]],
                                {
                                    icon:L.mapbox.marker.icon(
                                        {
                                            'marker-size': "",
                                            'marker-symbol': "{{ collection.marker_symbol }}",
                                            'marker-color': "{{ collection.color }}"
                                        }
                                    ),
                                    title: "{{ feature.title }}",
                                }
                            );
                        },
                        style: function (geoFeature) {
                            return geoFeature.properties;
                        }
                    }
                )
                .bindPopup(
                    L.popup().setContent(
                        "<p class='marker-title'>{{ feature.title }}</p><p>{{ feature.excerpt | strip_newlines}}{% if excerpted == 'true' %}<p class=read-more><a href="+rootUrl+"{{ feature.id }}.html>Read more…</a>{% endif %}</p></p>"
                    )
                )
                .on('click', function (e) {
                        ga('send', {
                            hitType: 'event',
                            eventCategory: 'features',
                            eventAction: 'open',
                            eventLabel: '{{ feature.id }}'
                        });
                        history.pushState({}, "", "#{{ feature.id }}");
                    }
                );
            collectionLayerGroup.addLayer(geoLayer);
            {% for label in feature.labels %}
            L.marker([{{label.latitude}}, {{label.longitude}}], {
                    icon: L.divIcon({
                            className: 'feature-label',
                            html: '•&nbsp;&nbsp;{{label.text}}',
                    })
            }).addTo(map);
            {% endfor %}
    {% endfor %}
    addLayer(collectionLayerGroup, "{{collection.title}}", 2, "{{collection.color}}");
    {% endif %}
{% endfor %}

function featureIdInUrl() {
    return window.location.hash.substr(1);
}
map.eachLayer(function (layer) {
    if (layer.feature) {
        if (layer.feature.collectionId === featureIdInUrl()) {
            layer.openPopup();
        }
    }
});

map.on('click', function(e) {

    var latitude = e.latlng.lat;
    var longitude = e.latlng.lng;

    console.log('"coordinates": ['+longitude+','+latitude+',0]')

});

window.onpopstate = function() {
    map.eachLayer(function (layer) {
        if (layer.getLayers())
        layer.getLayers().forEach(function(layer) {
            if (layer.feature && layer.feature.collectionId === featureIdInUrl()) {
                layer.openPopup();
            }
        });
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
    document.getElementById('instructions-screen').style.display = 'none';
    ga('send', {
        hitType: 'event',
        eventCategory: 'User Actions',
        eventAction: 'Open Map Menu'
    });
}
function hideMenu() {
    document.getElementById('map-menu').style.display = 'none';
    document.getElementById('underground-manchester-map').style.display = 'block';
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
    document.getElementById('instructions-screen').style.display = 'none';
    ga('send', {
        hitType: 'event',
        eventCategory: 'User Actions',
        eventAction: 'Open News Flash'
    });
}
function hideNewsFlash() {
    document.getElementById('news-flash').style.display = 'none';
    document.getElementById('underground-manchester-map').style.display = 'block';
    ga('send', {
        hitType: 'event',
        eventCategory: 'User Actions',
        eventAction: 'Close News Flash'
    });
}
function showInstructions() {
    document.getElementById('instructions-screen').style.display = 'block';
    document.getElementById('underground-manchester-map').style.display = 'none';
    document.getElementById('map-menu').style.display = 'none';
    document.getElementById('news-flash').style.display = 'none';
    ga('send', {
        hitType: 'event',
        eventCategory: 'User Actions',
        eventAction: 'Open Instructions'
    });
}
function hideInstructions() {
    document.getElementById('instructions-screen').style.display = 'none';
    document.getElementById('underground-manchester-map').style.display = 'block';
    ga('send', {
        hitType: 'event',
        eventCategory: 'User Actions',
        eventAction: 'Close Instructions'
    });
}
{% endunless %}
// initialize the map

//$(window)
//    .resize(function() { // RESIZE Map div when window size changes
//        var h = $(window)
//                .height(), // Solves the 100% height turning to 0px
//            offsetTop = 250; // Calculate the top offset      // https://github.com/twbs/bootstrap/issues/2475
//        $('#map')
//            .css('height', (h - offsetTop));
//    }).resize();

var map = new L.Map('map');

var myMap = map;

// configure the map settings
var mapUrl = 'http://{s}.tile.stamen.com/toner-lite/{z}/{x}/{y}.jpg',
    mapAttrib = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Tiles By <a href="http://stamen.com">Stamen</a>',
    mapInfo = new L.TileLayer(mapUrl, {maxZoom: 18, attribution: mapAttrib});

// set a default location for the map
var kansascity = new L.LatLng(39.0997, -94.5783); // geographical point (longitude and latitude)
map.setView(kansascity, 13).addLayer(mapInfo);
var open_cases_list = [];
var watched_cases_list = [];
var marker_orange = new L.icon({iconUrl: 'images/marker_orange.png'});
var marker_blue = new L.icon({iconUrl: 'images/marker_blue.png'});
var marker_black = new L.icon({iconUrl: 'images/marker_black.png'});

/* From http://www.nczonline.net/blog/2010/05/25/cross-domain-ajax-with-cross-origin-resource-sharing/ */
function createCORSRequest(method, url) {
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
        xhr.open(method, url, true);
    } else if (typeof XDomainRequest != "undefined") {
        xhr = new XDomainRequest();
        xhr.open(method, url);
    } else {
        xhr = null;
    }
    return xhr;
}

// create a marker

function add_yesterdays_markers(open_or_closed) {


    var d = new Date();
    var month = d.getMonth() + 1;
    var day = d.getDate() - 2;
    var output = d.getFullYear() + '-' +
        (('' + month).length < 2 ? '0' : '') + month + '-' +
        (('' + day).length < 2 ? '0' : '') + day;
    var yesterday = output + 'T00:00:00';


    var request = createCORSRequest("get", "http://data.kcmo.org/resource/7at3-sxhp.json?$where=" + open_or_closed + "='" + yesterday + "' and 1=1");
    if (request) {
        request.onload = function () {
            var data = JSON.parse(request.responseText);
            if (data.length === 0) {
                $('.legend-newly-opened p').html("N/A");
                $('.legend-newly-closed p').html("N/A");
                $('.alert').html("Sorry, but 311 was closed yesterday. No requests were opened or closed.");
            }
            else if (open_or_closed == 'creation_date') {
                $('.legend-newly-opened .value').html(data.length)
            }
            else if (open_or_closed == 'closed_date') {
                $('.legend-newly-closed .value').html(data.length)
            }

            for (i in data) {
                if ("address_with_geocode" in data[i]
                    && data[i].address_with_geocode.latitude
                    && data[i].address_with_geocode.longitude) {             // KCMO does not always return the geocoded address.
                    var latitude = data[i].address_with_geocode.latitude;
                    var longitude = data[i].address_with_geocode.longitude;

                    markerLocation = new L.LatLng(parseFloat(latitude), parseFloat(longitude));

                    var watch_html = '';

                    watch_html += displayIt('', data[i].request_type + ' - ' + data[i].status);
                    watch_html += displayIt('', data[i].street_address);
                    watch_html += displayIt('Department', data[i].department);
                    watch_html += displayIt('Work Group', data[i].work_group);

                    var d = new Date(data[i].creation_date);
                    var creation_date = parseInt(d.getMonth() + 1) + "-" + d.getDate() + "-" + parseInt(d.getFullYear());

                    watch_html += displayIt('Created', creation_date);
                    watch_html += displayIt('Case ID', data[i].case_id);
                    watch_html += WatchList.makeWatchHtml(data[i].case_id);

                    var marker_color = WatchList.getWatchColor(open_or_closed);

                    var caseId = data[i].case_id;

                    var marker = new L.Marker(markerLocation, {icon: marker_color}).bindPopup(watch_html);

                    open_cases_list.push(marker);
                }
            }
            var open_cases_layer = new L.LayerGroup(open_cases_list);
            map.addLayer(open_cases_layer);

        };
        request.send();
    }

}

function add_watched_markers() {

    var watched_case_ids = WatchList.getWatchListCasesFromCookie();

    var where = '';
    var sep = '';
    var watch_count = 0;
    for (i in watched_case_ids) {
        where += sep + " case_id = " + watched_case_ids[i];
        sep = " or ";
        watch_count++;
    }
    if (watch_count) {
        var request = createCORSRequest("get", "http://data.kcmo.org/resource/7at3-sxhp.json?$where=" + where);
        if (request) {
            request.onload = function () {
                var data = JSON.parse(request.responseText);
                for (i in data) {
                    if ("address_with_geocode" in data[i]
                        && data[i].address_with_geocode.latitude
                        && data[i].address_with_geocode.longitude
                    ) {             // KCMO does not always return the geocoded address.
                        var latitude = data[i].address_with_geocode.latitude;
                        var longitude = data[i].address_with_geocode.longitude;

                        console.log(data[i].address_with_geocode);
                        console.log(latitude + '|' + longitude);

                        markerLocation = new L.LatLng(parseFloat(latitude), parseFloat(longitude));

                        var watch_html = '';

                        watch_html += displayIt('', data[i].request_type + ' - ' + data[i].status);
                        watch_html += displayIt('', data[i].street_address);
                        watch_html += displayIt('Department', data[i].department);
                        watch_html += displayIt('Work Group', data[i].work_group);

                        var d = new Date(data[i].creation_date);
                        var creation_date = parseInt(d.getMonth() + 1) + "-" + d.getDate() + "-" + parseInt(d.getFullYear());

                        watch_html += displayIt('Created', creation_date);

                        var caseId = data[i].case_id;

                        watch_html += displayIt('Case ID', caseId);
                        watch_html += WatchList.makeWatchHtml(caseId);

                        var marker = new L.Marker(markerLocation, {icon: marker_black}).bindPopup(watch_html);

                        watched_cases_list.push(marker);
                    }
                }
                var wateched_cases_layer = new L.LayerGroup(watched_cases_list);
                map.addLayer(wateched_cases_layer);

            };
            request.send();
        }
    }
    }

    function displayIt(label, value) {
        if (label) {
            if (value) {
                return '                <span style="color: grey">' + label + '</span> ' + value + '<br/>' + "\n";
            } else {
                return '';
            }
        } else {
            if (value) {
                return '                ' + value + '<br/>' + "\n";
            } else {
                return '';
            }
        }

    }

    $(function () {

        /**
         * @classDescription - Default settings for this application
         * @class - Default
         */
        var Default = {
            // Spread Sheet key
            spread_sheet_key: '15k1-HvcYXck4SGw-icUH2cRKLJX9oWim7ehTEe883Zs'
        };


        /**
         * Load the projects data from the spread sheet using Tabletop.js https://github.com/jsoma/tabletop
         * NOTE:
         *    Spread Sheet needs to be Published from the File menu
         *    Spread Sheet is readable by anyone in Share
         *
         */
        Tabletop.init({
            key: Default.spread_sheet_key,
            simpleSheet: true,
            callback: function (data, tabletop) {

                if (data[0] && data[0]['Daily Message']) {
                    $("#daily-message").html(data[0]['Daily Message']);
                } else {
                    $("#daily-message").html("NO MESSAGE");
                }
            }
        });

        WatchList.init();

// Yesterday
        add_yesterdays_markers('creation_date');
        add_yesterdays_markers('closed_date');
        add_watched_markers();

        /**
         * Startup the the ability to save Favorite Cases
         */

        WatchList.updateUI();


    });



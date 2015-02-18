// initialize the map
var map = new L.Map('map');

// configure the map settings
var mapUrl = 'http://{s}.tile.stamen.com/toner-lite/{z}/{x}/{y}.jpg',
    mapAttrib = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Tiles By <a href="http://stamen.com">Stamen</a>',
    mapInfo = new L.TileLayer(mapUrl, {maxZoom: 18, attribution: mapAttrib});

// set a default location for the map
var kansascity = new L.LatLng(39.101, -94.583); // geographical point (longitude and latitude)
map.setView(kansascity, 11).addLayer(mapInfo);
var open_cases_list = [];
var marker_orange = new L.icon({iconUrl: 'images/marker_orange.png'});
var marker_blue = new L.icon({iconUrl: 'images/marker_blue.png'});

// create a marker

function add_yesterdays_markers(open_or_closed) {
    if (open_or_closed == 'creation_date') {
        var marker_color = marker_orange;
    }
    if (open_or_closed == 'closed_date') {
        var marker_color = marker_blue;
    }

    var d = new Date();
    var month = d.getMonth() + 1;
    var day = d.getDate() - 1;
    var output = d.getFullYear() + '-' +
        (('' + month).length < 2 ? '0' : '') + month + '-' +
        (('' + day).length < 2 ? '0' : '') + day;
    var yesterday = output + 'T00:00:00'
    var yesterdays_cases = $.getJSON("http://data.kcmo.org/resource/7at3-sxhp.json?$where=" + open_or_closed + "='" + yesterday + "'"
        , function (data) {
            console.log("data");
            console.log(data.length);
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
                if ("address_with_geocode" in data[i]) {             // KCMO does not always return the geocoded address.
                    var latitude = data[i].address_with_geocode.latitude;
                    var longitude = data[i].address_with_geocode.longitude;
                    
                    markerLocation = new L.LatLng(parseFloat(latitude), parseFloat(longitude));

                    var watch_html = WatchList.makeWatchHtml( data[i].case_id );
                    var watch_color = WatchList.getWatchColor();
                    
                    var caseId = data[i].case_id;
                    //console.dir("Matching now....");
                    //console.dir(caseId);

                    
                    //marker_color = marker_blue;
                    var marker = new L.Marker(markerLocation, {icon: watch_color}).bindPopup(data[i].request_type + ', ' + data[i].creation_date + '<br \>' + watch_html );
                    open_cases_list.push(marker);
                }
            }
            var open_cases_layer = new L.LayerGroup(open_cases_list);
            map.addLayer(open_cases_layer);

        });
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

    /**
     * Startup the the ability to save Favorite Cases
     */

    WatchList.updateUI();


});

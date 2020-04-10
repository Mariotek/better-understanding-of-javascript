/* v1.3.0 */
(function() {
    "use strict";

    var getURLParamValue = function(param) {
        var url = document.URL;
        var jumIdx = url.toString().indexOf('?');
        var params = (jumIdx != -1) ? url.substr(jumIdx + 1).split("&") : "";
        for (var i = 0; i < params.length; i++) {
            params[i] = params[i].split('=');
            if (params[i][0] == param) {
                return params[i][1];
            }
        }
        return "";
    };

    var layout;
    var continuousTimeout;
    var CONTINUOUS_THRESHOLD = 1000; // Length of time (in millis) required on page required to be considered a pageview in continuous layout
    var handlePageChange = function(data) {
        if (history.pushState) {
            if (layout === IDRViewer.LAYOUT_CONTINUOUS) {
                if (continuousTimeout) {
                    clearTimeout(continuousTimeout);
                }
                continuousTimeout = setTimeout(function() {
                    addPageToHistory(data.page);
                }, CONTINUOUS_THRESHOLD);
            } else {
                addPageToHistory(data.page);
            }
        }
    };

    var addPageToHistory = function(page) {
        try {
            history.pushState({page: page}, null, '?page=' + page);
        } catch (ignore) { } // Chrome throws error on file:// protocol
    };

    var pg = parseInt(getURLParamValue('page'));
    if (isNaN(pg)) {
        pg = 1;
    }
    IDRViewer.goToPage(pg);

    if (history.pushState) {
        IDRViewer.on('ready', function (data) {
            layout = data.layout;

            try {
                history.replaceState({page: data.page}, null, '?page=' + data.page);
            } catch (ignore) { } // Chrome throws error on file:// protocol

            window.onpopstate = function (event) {
                IDRViewer.off('pagechange', handlePageChange);
                IDRViewer.goToPage(event.state.page);
                IDRViewer.on('pagechange', handlePageChange);
            };

            IDRViewer.on('pagechange', handlePageChange);

            IDRViewer.on('layoutchange', function (data) {
                layout = data.layout;
            });
        });
    }

})();
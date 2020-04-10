/* v1.1.0 */
(function() {
    "use strict";

    var Fullscreen = {
        isFullscreenEnabled: function() {
            return document.fullscreenEnabled || document.msFullscreenEnabled || document.mozFullScreenEnabled || document.webkitFullscreenEnabled;
        },

        isFullscreen: function() {
            return !!(document.fullscreenElement || document.msFullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement);
        },

        toggleFullScreen: function () {
            if (!this.isFullscreen()) {
                var requestFullscreen = document.body.requestFullscreen || document.body.msRequestFullscreen || document.body.mozRequestFullScreen || document.body.webkitRequestFullscreen;
                requestFullscreen.call(document.body);
            } else {
                var exitFullscreen = document.exitFullscreen || document.msExitFullscreen || document.mozCancelFullScreen || document.webkitCancelFullScreen;
                exitFullscreen.call(document);
            }
        }
    };

    for (var prop in Fullscreen) {
        if (Fullscreen.hasOwnProperty(prop)) {
            IDRViewer[prop] = Fullscreen[prop];
        }
    }

    ["fullscreenchange", "MSFullscreenChange", "mozfullscreenchange", "webkitfullscreenchange"].forEach(function(type) {
        document.addEventListener(type, function() {
            IDRViewer.fire('fullscreenchange', {
                isFullscreen: Fullscreen.isFullscreen()
            });
        });
    });

})();
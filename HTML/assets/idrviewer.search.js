/* v1.1.0 */
(function() {
    "use strict";

    var textContent;

    IDRViewer.loadSearch = function(loadListener, progressListener) {
        if (!textContent) {
            var request = new XMLHttpRequest();
            request.open('GET', 'search.json', true);

            if (progressListener) {
                request.addEventListener('progress', function (event) {
                    if (event.lengthComputable) {
                        progressListener(Math.floor(event.loaded / event.total * 100));
                    }
                });
            }

            request.onload = function() {
                if (request.status >= 200 && request.status < 400) {
                    textContent = JSON.parse(request.responseText);
                }
                if (loadListener) { loadListener(!!textContent); }
            };

            request.onerror = function() {
                if (loadListener) { loadListener(false); }
            };

            request.send();
        } else { // Already loaded
            if (loadListener) {
                setTimeout(function () {
                    loadListener(true);
                }, 0);
            }
        }
    };

    var resultsLimit;

    IDRViewer.search = function(searchTerm, matchCase, limitOnePerPage) {
        if (!textContent) {
            throw new Error("Search not loaded. loadSearch() must be called first.");
        }

        var results = [];
        if (textContent && searchTerm) {
            searchTerm = matchCase ? searchTerm : searchTerm.toUpperCase();

            for (var i = 0; i < textContent.length; i++) {
                var pageContent = matchCase ? textContent[i] : textContent[i].toUpperCase();
                var index = -1;

                do {
                    index = pageContent.indexOf(searchTerm, index + 1);
                    if (index >= 0) {
                        var SNIPPET_LENGTH = 50;
                        var snippetStart = index >= SNIPPET_LENGTH ? index - SNIPPET_LENGTH : 0;
                        var snippetEnd = index + searchTerm.length < textContent[i].length - SNIPPET_LENGTH ? index + searchTerm.length + SNIPPET_LENGTH : textContent[i].length;
                        var result = {
                            page: i + 1,
                            snippet: (i + 1) + " - " + textContent[i].substr(snippetStart, snippetEnd - snippetStart)
                        };
                        results.push(result);
                    }
                } while (!limitOnePerPage && index !== -1 && (!resultsLimit || results.length < resultsLimit));
            }
        }
        return results;
    };

})();
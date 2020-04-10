/* v1.1.0 */
(function() {
    "use strict";

    var LoadManager = (function() {
        var LoadManager = {},
            preLoadedPages = [],
            annotationsPages,
            annotationsContainers = [];

        (function() {
            var request = new XMLHttpRequest();
            request.open('GET', 'annotations.json', true);

            request.onload = function() {
                if (request.status >= 200 && request.status < 400) {
                    annotationsPages = JSON.parse(request.responseText).pages;
                    initPreloadedPages();
                }
            };

            request.send();
        })();

        var initPreloadedPages = function() {
            if (preLoadedPages.length) {
                for (var i = 0; i < preLoadedPages.length; i++) {
                    initPage(preLoadedPages[i]);
                }
                preLoadedPages = [];
            }
        };

        var initPage = function(page) {
            var pageContainer = document.getElementById("page" + page);
            pageContainer.children[0].style.position = "absolute";

            var annotationsContainer = document.createElement("div");
            annotationsContainer.className = "page-inner";
            annotationsContainer.setAttribute("style", "position: absolute; visibility: hidden;");
            annotationsContainer.style.width = pageContainer.style.width;
            annotationsContainer.style.height = pageContainer.style.height;
            pageContainer.appendChild(annotationsContainer);
            annotationsContainers[page] = annotationsContainer;

            for (var i = 0; i < annotationsPages.length; i++) {
                if (annotationsPages[i].page === page) {
                    var annotations = annotationsPages[i].annotations;
                    for (var j = 0; j < annotations.length; j++) {
                        loadFunction(annotationsContainer, annotations[j]);
                    }
                }
            }
        };

        IDRViewer.on("pageload", function(data) {
            if (annotationsPages) {
                initPage(data.page);
            } else {
                preLoadedPages.push(data.page);
            }
        });

        IDRViewer.on("pageunload", function(data) {
            if (annotationsContainers[data.page]) {
                annotationsContainers[data.page].parentNode.removeChild(annotationsContainers[data.page]);
                annotationsContainers[data.page] = null;
            }
        });

        var loadFunction;
        LoadManager.setLoadFunction = function(loadFn) {
            loadFunction = loadFn;
        };

        return LoadManager;
    })();

    var ActionHandler = (function() {
        var ActionHandler = {},
            handlers = {
                'click': [],
                'mouseover': [],
                'mouseout': [],
                'touchstart': []
            };

        ActionHandler.register = function(types, events, handler) {
            for (var i = 0; i < types.length; i++) {
                for (var j = 0; j < events.length; j++) {
                    handlers[events[j]].push({
                        type: types[i],
                        handler: handler
                    });
                }
            }
        };

        ActionHandler.onclick = function(data) {
            for (var i = 0; i < handlers.click.length; i++) {
                if (data.type === handlers.click[i].type) {
                    handlers.click[i].handler.onclick.apply(this, [data]);
                }
            }
        };

        ActionHandler.onmouseover = function(data) {
            for (var i = 0; i < handlers.mouseover.length; i++) {
                if (data.type === handlers.mouseover[i].type) {
                    handlers.mouseover[i].handler.onmouseover.apply(this, [data]);
                }
            }
        };

        ActionHandler.onmouseout = function(data) {
            for (var i = 0; i < handlers.mouseout.length; i++) {
                if (data.type === handlers.mouseout[i].type) {
                    handlers.mouseout[i].handler.onmouseout.apply(this, [data]);
                }
            }
        };

        ActionHandler.ontouchstart = function(data) {
            for (var i = 0; i < handlers.touchstart.length; i++) {
                if (data.type === handlers.touchstart[i].type) {
                    handlers.touchstart[i].handler.ontouchstart.apply(this, [data]);
                }
            }
        };

        return ActionHandler;
    })();

    (function() {
        var LinkActionHandler = {},
            currentSound;

        var pageCount;
        IDRViewer.on("ready", function(data) {
            pageCount = data.pagecount;
        });

        LinkActionHandler.onmouseover = function(data) {
            if (data.action) {
                this.style.cursor = "pointer";
                if (data.action.type === "URI") {
                    this.title = data.action.uri;
                }
            }
        };

        LinkActionHandler.onclick = function(data) {
            if (data.action) {
                switch (data.action.type) {
                    case "URI":
                        window.open(data.action.uri, "_blank");
                        break;

                    case "GoTo":
                        IDRViewer.goToPage(data.action.page, data.action.zoom);
                        break;

                    case "Named":
                        switch(data.action.name) {
                            case "NextPage":
                                IDRViewer.next();
                                break;
                            case "PrevPage":
                                IDRViewer.prev();
                                break;
                            case "FirstPage":
                                IDRViewer.goToPage(1);
                                break;
                            case "LastPage":
                                if (pageCount) {
                                    IDRViewer.goToPage(pageCount);
                                }
                                break;
                        }
                        break;
                    case "Sound":
                        // HTMLAudioElement is not supported in any version of IE
                        if (currentSound) {
                            currentSound.pause();
                        }
                        currentSound = new Audio(data.action.sound);
                        currentSound.play();
                        break;
                }

            }
        };

        ActionHandler.register(["Link", "Widget"], ["click", "mouseover"], LinkActionHandler);
    })();

    (function() {
        var FileAttachmentHandler = {};

        FileAttachmentHandler.onmouseover = function() {
            this.style.cursor = "pointer";
        };

        FileAttachmentHandler.onclick = function(data) {
            window.open(data.attachment, "_blank");
        };

        ActionHandler.register(["FileAttachment"], ["click", "mouseover"], FileAttachmentHandler);
    })();

    (function() {
        var PopupHandler = {},
            currentPopup,
            isMobile;

        var createPopup = function(data) {
            if (data["contents"]) {
                var boundingRect = document.getElementById(data.objref).getBoundingClientRect();
                var midX = ((boundingRect.right - boundingRect.left) / 2) + boundingRect.left;
                var bottomY = boundingRect.bottom;

                var element = document.createElement("div");
                element.dataset.parentRef = data.objref;
                element.setAttribute("style", "position: fixed; width: 300px; min-height: 200px; left: " + (midX - 150) + "px; top: "
                    + (bottomY + 5) + "px; background-color: #FFFFEF; border-radius: 10px; border: 1px #bbb solid; padding: 10px; box-sizing: border-box; font-family: Arial;");
                var p1 = document.createElement("p");
                if (data["title"]) {
                    p1.innerText = data["title"];
                }
                p1.setAttribute("style", "font-weight: bold; margin: 0;");
                var p2 = document.createElement("p");
                if (data["contents"]) {
                    p2.innerText = data["contents"];
                }
                element.appendChild(p1);
                element.appendChild(p2);
                document.body.appendChild(element);
                return element;
            }
            return null;
        };

        PopupHandler.onmouseover = function(data) {
            if (!isMobile) { // Prevent mobile/tablet (Android) firing both mouseover and click (shows then immediately hides popup)
                if (!currentPopup) {
                    currentPopup = createPopup(data);
                } else {
                    currentPopup.parentNode.removeChild(currentPopup);
                    currentPopup = null;
                }
            }
        };

        PopupHandler.onmouseout = function() {
            if (currentPopup) {
                currentPopup.parentNode.removeChild(currentPopup);
                currentPopup = null;
            }
        };

        PopupHandler.onclick = function(data) {
            if (isMobile) {
                // For mobile/tablet (touch screens)
                if (currentPopup) {
                    var currentRef = currentPopup.dataset.parentRef;
                    currentPopup.parentNode.removeChild(currentPopup);
                    currentPopup = null;
                    if (currentRef !== data.objref) {
                        currentPopup = createPopup(data);
                    }
                } else {
                    currentPopup = createPopup(data);
                }
            }
        };

        PopupHandler.ontouchstart = function() {
            isMobile = true;
        };

        ActionHandler.register(["Text", "Line", "Square", "Circle", "Polygon", "PolyLine", "Highlight", "Underline",
            "Squiggly", "StrikeOut", "Stamp", "Caret", "Ink", "FileAttachment", "Redact", "Projection"],
            ["click", "mouseover", "mouseout", "touchstart"], PopupHandler);
    })();

    (function() {
        var RichMediaHandler = {};

        RichMediaHandler.onmouseover = function() {
            this.style.cursor = "pointer";
        };

        RichMediaHandler.onclick = function(data) {
            if (data.richmedia.length) {
                var isVideo = data.richmedia[0].type.startsWith("video");
                var newElement = document.createElement(isVideo ? "video" : "audio");
                newElement.setAttribute("style", "position: absolute; object-fit: fill; visibility: visible;");
                newElement.setAttribute("controls", "controls");
                newElement.style.left = data.bounds[0] + "px";
                newElement.style.top = data.bounds[1] + "px";
                newElement.style.width = data.bounds[2] + "px";
                newElement.style.height = data.bounds[3] + "px";
                newElement.title = data.type;
                newElement.dataset.objref = data.objref;
                newElement.id = data.objref;
                for (var i = 0; i < data.richmedia.length; i++) {
                    var src = document.createElement("source");
                    src.setAttribute("src", data.richmedia[i].src);
                    src.setAttribute("type", data.richmedia[i].type);
                    newElement.appendChild(src);
                }
                this.parentNode.replaceChild(newElement, this);
            }

        };

        ActionHandler.register(["RichMedia"], ["click", "mouseover"], RichMediaHandler);
    })();

    (function() {
        var createAnnotation = function(container, data) {
            var annotation = document.createElement("div");
            annotation.setAttribute("style", "position: absolute; visibility: visible; -webkit-user-select: none;");
            annotation.style.left = data.bounds[0] + "px";
            annotation.style.top = data.bounds[1] + "px";
            annotation.style.width = data.bounds[2] + "px";
            annotation.style.height = data.bounds[3] + "px";
            annotation.dataset.objref = data.objref;
            annotation.id = data.objref;

            if (data.appearance) {
                annotation.style.backgroundImage = "url('" + data.appearance + "')";
                annotation.style.backgroundSize = "100% 100%";
            }

            container.appendChild(annotation);
            annotation.addEventListener("click", function() {
                ActionHandler.onclick.apply(this, [data]);
            });
            annotation.addEventListener("mouseover", function() {
                ActionHandler.onmouseover.apply(this, [data]);
            });
            annotation.addEventListener("mouseout", function() {
                ActionHandler.onmouseout.apply(this, [data]);
            });
            annotation.addEventListener("touchstart", function() {
                ActionHandler.ontouchstart.apply(this, [data]);
            });
        };

        LoadManager.setLoadFunction(createAnnotation);
    })();

})();

var elementId = "d3-graph"

// dynamically set height and width to that of parent element
var parentElement = getParentElement();
var w = parentElement.offsetWidth;
var h = parentElement.offsetHeight;

// D3 variables
var rootSelection;
var svgSelection;
var gSelection;
var nodeSelection;
var linkSelection;
var circleSelection;
var textSelection;
var force;

var keyc = true,
    keys = true,
    keyt = true,
    keyr = true,
    keyx = true,
    keyd = true,
    keyl = true,
    keym = true,
    keyh = true,
    key1 = true,
    key2 = true,
    key3 = true,
    key0 = true

var focusNode = null,
    highlightNode = null;

var textCenter = false;
var outline = false;

var minScore = 0;
var maxScore = 1;

var textColor = 'rgb(255,255,255)';

var color = d3.scale.linear()
    .domain([minScore, (minScore + maxScore) / 2, maxScore])
    .range(["lime", "yellow", "red"]);

var linkHighlightColor = "rgb(195,203,226)";
var highlightTrans = 0.1;

var size = d3.scale.pow().exponent(1)
    .domain([1, 100])
    .range([8, 24]);

// Style variables
const defaultNodeColor = "#CCCCCC";
const inactiveLinkColor = "rgb(136,136,136)";

const onHoverNonConnectedFontWeight = "normal";
const onHoverConnectedFontWeight = "bold";
const onHoverConnectedFontStyle = "italic";
const onHoverNonConnectedFontStyle = "normal";


var nominalBaseNodeSize = 8;
var nominalTextSize = 10;
var maxTextSize = 24;
var nominalStroke = 1.5;
var maxStroke = 4.5;
var maxBaseNodeSize = 36;
var minZoom = 0.1;
var maxZoom = 7;
var zoom = d3.behavior.zoom().scaleExtent([minZoom, maxZoom]);

function getParentElement() {
    return document.getElementById(elementId).parentElement
}

function createRootSelection() {
    rootSelection = d3.select("#" + elementId);
}

createRootSelection()

function createSVGSelection() {
    svgSelection = rootSelection.append("svg")
}

createSVGSelection();

function styleSVG() {
    svgSelection.attr("class", "graph-svg");
}

styleSVG()

function createGSelection() {
    gSelection = svgSelection.append("g");
}

createGSelection()

function createForce() {
    force = d3.layout.force()
        .linkDistance(60)
        .charge(-300)
        .size([w, h]);
}

createForce()

function createJSON() {
    // uses API route
    d3.json("/data", function (error, graph) {
        if (error) throw error;
        graph = graph.data;
        update(graph.links, graph.nodes);
        applyGlow();
    });
}

createJSON()

function update(dataLinks, dataNodes) {
    var linkedByIndex = {};

    dataLinks.forEach(populateLinkedByIndex);

    function populateLinkedByIndex(link) {
        linkedByIndex[link.source + "," + link.target] = true;
    }

    function isConnected(node1, node2) {
        return linkedByIndex[node1.index + "," + node2.index] || linkedByIndex[node2.index + "," + node1.index] || node1.index == node2.index;
    }

    function hasConnections(node) {
        for (var property in linkedByIndex) {
            s = property.split(",");
            if ((s[0] == node.index || s[1] == node.index) && linkedByIndex[property]) return true;
        }
        return false;
    }

    function updateForceData() {
        force
            .nodes(dataNodes)
            .links(dataLinks)
            .start();
    }

    updateForceData()

    function createLinkSelection() {
        linkSelection = gSelection.selectAll(".link")
            .data(dataLinks)
            .enter().append("line")
            .attr("class", "link")
            .style("stroke-width", nominalStroke)
            .style("stroke", function (d) {
                if (isNumber(d.score) && d.score >= 0) return color(d.score);
                else return inactiveLinkColor;
            })
    }

    createLinkSelection()

    function createNodeSelection() {
        nodeSelection = gSelection.selectAll(".node")
            .data(dataNodes)
            .enter().append("g")
            .attr("class", "node")
            .call(force.drag)
    }

    createNodeSelection()

    function setNodeEvents() {
        nodeSelection
            .on("dblclick.zoom", onNodeDoubleClick)
            .on("mouseover", onNodeMouseOver)
            .on("mousedown", onNodeMouseDown)
            .on("mouseout", onNodeMouseOut);
    }

    function onNodeDoubleClick(node) {
        d3.event.stopPropagation();
        var dcx = (window.innerWidth / 2 - node.x * zoom.scale());
        var dcy = (window.innerHeight / 2 - node.y * zoom.scale());
        zoom.translate([dcx, dcy]);
        gSelection.attr("transform", "translate(" + dcx + "," + dcy + ")scale(" + zoom.scale() + ")");
    }

    function onNodeMouseOver(node) {
        setHighlight(node);
        tippy('svg g g path', {
            animation: 'scale',
            arrow: true,
            arrowType: 'round',
            delay: 100,
            duration: 500,
            size: 'small',
            sticky: true
        });
    }

    function onNodeMouseDown(node) {
        d3.event.stopPropagation();
        focusNode = node;
        setFocus(node);
        if (highlightNode === null) {
            setHighlight(node);
        }
    }

    function onNodeMouseOut(node) {
        exitHighlight();
    }

    function onNodeMouseUp() {
        if (focusNode !== null) {
            focusNode = null;
            if (highlightTrans < 1) {
                circleSelection.style("opacity", 1);
                textSelection.style("opacity", 1);
                linkSelection.style("opacity", 1);
            }
        }
        if (highlightNode === null) {
            exitHighlight();
        }
    }

    setNodeEvents();

    var tocolor = "fill";
    var towhite = "stroke";
    if (outline) {
        tocolor = "stroke";
        towhite = "fill";
    }

    function createCircle() {
        circleSelection = nodeSelection.append("path")
            .attr('title', function (d) {
                return JSON.stringify(d, null, 4)
            })
            .attr("d", d3.svg.symbol()
                .size(function (d) {
                    return Math.PI * Math.pow(size(d.size) || nominalBaseNodeSize, 2); //calculates circle area
                })
                .type(function (d) {
                    return d.type;
                }))
            .style(tocolor, function (d) {
                if (isNumber(d.score) && d.score >= 0) return color(d.score);
                else return defaultNodeColor;
            })
            .style("stroke-width", 0)
            .style(towhite, "white");

    }

    createCircle();

    function createText() {
        textSelection = gSelection.selectAll(".text")
            .data(dataNodes)
            .enter().append("text")
            .attr("dy", ".35em");
    }

    createText();

    function styleText() {
        textSelection
            .style("font-size", nominalTextSize + "px")
        // .style("font-color", textColor)
        if (textCenter)
            textSelection.text(function (d) {
                return d.id;
            })
                .style("text-anchor", "middle");
        else
            textSelection.attr("dx", function (d) {
                return (size(d.size) || nominalBaseNodeSize);
            })
                .text(function (d) {
                    return '\u2002' + d.id;
                });
    }

    styleText();

    d3.select(window).on("mouseup", onNodeMouseUp);

    function exitHighlight() {
        highlightNode = null;
        if (focusNode === null) {
            svgSelection.style("cursor", "default");
            if (linkHighlightColor != "white") {
                circleSelection.style(towhite, "white");
                textSelection.style("font-style", "normal");
                textSelection.style("font-weight", "normal");
                linkSelection.style("stroke", function (o) {
                    return (isNumber(o.score) && o.score >= 0) ? color(o.score) : inactiveLinkColor
                });
            }
        }
    }

    function setFocus(d) {
        if (highlightTrans < 1) {
            circleSelection.style("opacity", function (o) {
                return isConnected(d, o) ? 1 : highlightTrans;
            });

            textSelection.style("opacity", function (o) {
                return isConnected(d, o) ? 1 : highlightTrans;
            })
                .style("color", "rgb(255,255,255)");

            linkSelection.style("opacity", function (o) {
                return o.source.index == d.index || o.target.index == d.index ? 1 : highlightTrans;
            });
        }
    }

    function setHighlight(node) {
        svgSelection.style("cursor", "pointer");
        if (focusNode !== null) node = focusNode;
        highlightNode = node;

        if (linkHighlightColor != "white") {
            circleSelection.style(towhite, function (o) {
                return isConnected(node, o) ? linkHighlightColor : "white";
            });
            textSelection.style("font-style", function (o) {
                if (isConnected(node, o)) {
                    return onHoverConnectedFontStyle;
                } else {
                    return onHoverNonConnectedFontStyle;
                }
            });
            textSelection.style("font-weight", function (o) {
                if (isConnected(node, o)) {
                    return onHoverConnectedFontWeight;
                } else {
                    return onHoverNonConnectedFontWeight;
                }
            });
            linkSelection.style("stroke", function (o) {
                return o.source.index == node.index || o.target.index == node.index ? linkHighlightColor : ((isNumber(o.score) && o.score >= 0) ? color(o.score) : inactiveLinkColor);
            });
        }
    }

    zoom.on("zoom", zoomFunction)

    function zoomFunction() {

        var stroke = nominalStroke;
        if (nominalStroke * zoom.scale() > maxStroke) stroke = maxStroke / zoom.scale();
        linkSelection.style("stroke-width", stroke);

        var baseRadius = nominalBaseNodeSize;
        if (nominalBaseNodeSize * zoom.scale() > maxBaseNodeSize) baseRadius = maxBaseNodeSize / zoom.scale();
        circleSelection.attr("d", d3.svg.symbol()
            .size(function (d) {
                return Math.PI * Math.pow(size(d.size) * baseRadius / nominalBaseNodeSize || baseRadius, 2);
            })
            .type(function (d) {
                return d.type;
            }))

        if (!textCenter) textSelection.attr("dx", function (d) {
            return (size(d.size) * baseRadius / nominalBaseNodeSize || baseRadius);
        });

        var textSize = nominalTextSize;
        if (nominalTextSize * zoom.scale() > maxTextSize) textSize = maxTextSize / zoom.scale();
        textSelection.style("font-size", textSize + "px");

        gSelection.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }

    svgSelection.call(zoom);

    resize();

    d3.select(window).on("resize", resize).on("keydown", keydown);

    force.on("tick", tick)

    function tick(e) {
        var k = 6 * e.alpha;

        // Push sources up and targets down to form a weak tree.
        linkSelection
            .each(function (d) {
                d.source.y -= k, d.target.y += k;
            })
            .attr("x1", function (d) {
                return d.source.x;
            })
            .attr("y1", function (d) {
                return d.source.y;
            })
            .attr("x2", function (d) {
                return d.target.x;
            })
            .attr("y2", function (d) {
                return d.target.y;
            });

        nodeSelection.attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
        textSelection.attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        });

        nodeSelection.attr("cx", function (d) {
            return d.x;
        })
            .attr("cy", function (d) {
                return d.y;
            });
    }

    function resize() {
        var width = window.innerWidth,
            height = window.innerHeight;
        svgSelection.attr("width", width).attr("height", height);

        force.size([force.size()[0] + (width - w) / zoom.scale(), force.size()[1] + (height - h) / zoom.scale()]).resume();
        w = width;
        h = height;
    }

    function keydown() {
        if (d3.event.keyCode == 32) {
            force.stop();
        } else if (d3.event.keyCode >= 48 && d3.event.keyCode <= 90 && !d3.event.ctrlKey && !d3.event.altKey && !d3.event.metaKey) {
            switch (String.fromCharCode(d3.event.keyCode)) {
                case "C":
                    keyc = !keyc;
                    break;
                case "S":
                    keys = !keys;
                    break;
                case "T":
                    keyt = !keyt;
                    break;
                case "R":
                    keyr = !keyr;
                    break;
                case "X":
                    keyx = !keyx;
                    break;
                case "D":
                    keyd = !keyd;
                    break;
                case "L":
                    keyl = !keyl;
                    break;
                case "M":
                    keym = !keym;
                    break;
                case "H":
                    keyh = !keyh;
                    break;
                case "1":
                    key1 = !key1;
                    break;
                case "2":
                    key2 = !key2;
                    break;
                case "3":
                    key3 = !key3;
                    break;
                case "0":
                    key0 = !key0;
                    break;
            }

            linkSelection.style("display", function (d) {
                var flag = visByType(d.source.type) && visByType(d.target.type) && visByNodeScore(d.source.score) && visByNodeScore(d.target.score) && visByLinkScore(d.score);
                linkedByIndex[d.source.index + "," + d.target.index] = flag;
                return flag ? "inline" : "none";
            });
            nodeSelection.style("display", function (d) {
                return (key0 || hasConnections(d)) && visByType(d.type) && visByNodeScore(d.score) ? "inline" : "none";
            });
            textSelection.style("display", function (d) {
                return (key0 || hasConnections(d)) && visByType(d.type) && visByNodeScore(d.score) ? "inline" : "none";
            });

            if (highlightNode !== null) {
                if ((key0 || hasConnections(highlightNode)) && visByType(highlightNode.type) && visByNodeScore(highlightNode.score)) {
                    if (focusNode !== null) setFocus(focusNode);
                    setHighlight(highlightNode);
                } else {
                    exitHighlight();
                }
            }

        }
    }

}

function visByType(type) {
    switch (type) {
        case "circle":
            return keyc;
        case "square":
            return keys;
        case "triangle-up":
            return keyt;
        case "diamond":
            return keyr;
        case "cross":
            return keyx;
        case "triangle-down":
            return keyd;
        default:
            return true;
    }
}

function visByNodeScore(score) {
    if (isNumber(score)) {
        if (score >= 0.666) return keyh;
        else if (score >= 0.333) return keym;
        else if (score >= 0) return keyl;
    }
    return true;
}

function visByLinkScore(score) {
    if (isNumber(score)) {
        if (score >= 0.666) return key3;
        else if (score >= 0.333) return key2;
        else if (score >= 0) return key1;
    }
    return true;
}

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function applyGlow() {
    //Container for the gradients
    var defs = svgSelection.append("defs");

    const stdDeviation = .6;
    //Filter for the outside glow
    var filter = defs.append("filter")
        .attr("id", "glow");
    filter.append("feGaussianBlur")
        .attr("stdDeviation", stdDeviation)
        .attr("result", "coloredBlur");

    var feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode")
        .attr("in", "coloredBlur");
    feMerge.append("feMergeNode")
        .attr("in", "SourceGraphic");

    // Apply to element(s)
    d3.selectAll("path")
        .style("filter", "url(#glow)");
}

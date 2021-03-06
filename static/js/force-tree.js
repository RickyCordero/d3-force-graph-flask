var width = window.innerWidth
var height = window.innerHeight
var circleRadius = 6;

var fill = d3.scale.category20();
var force;
var linkSelection;
var nodeSelection;

function createForce() {
    const forceCharge = -120;
    const forceLinkDistance = 30;
    force = d3.layout.force()
        .charge(forceCharge)
        .linkDistance(forceLinkDistance)
        .size([width, height]);
}

createForce();

var svgSelection = d3.select("body").append("svg");


function styleSVG() {
    svgSelection
        .attr("width", width)
        .attr("height", height)
        .style("cursor", "crosshair");
}

styleSVG();

function createJSON() {
    // uses static file generated by server
    d3.json("/static/json/graph.json", function (error, json) {
        if (error) throw error;
        update(json.links, json.nodes)
    });
}

createJSON()

function update(graphLinks, graphNodes) {
    function createLinkSelection() {
        linkSelection = svgSelection.selectAll(".link")
            .data(graphLinks)
            .enter().append("line")
            .attr("class", "link");
    }

    createLinkSelection()

    function createNodeSelection() {
        nodeSelection = svgSelection.selectAll(".node")
            .data(graphNodes)
            .enter().append("g")
            .attr("class", "node")
            .call(force.drag);
    }

    createNodeSelection()

    var gSelection = d3.selectAll("g")

    function createNodeLabels() {
        gSelection.append("text").attr("dx", 12).attr("dy", '.35em').text(n => n.id)
    }



    function getNodeColor(node) {
        return "rgb(100,100,100)";
    }

    function styleNodes() {
        nodeSelection.append("circle")
            .attr("r", circleRadius - .75)
            .style("fill", getNodeColor)
            .style("stroke", function (d) {
                return d3.rgb(fill(d.group)).darker();
            });
    }

    styleNodes()
    createNodeLabels()

    function updateForce() {
        force
            .nodes(graphNodes)
            .links(graphLinks)
            .on("tick", tick)
            .start();
    }

    updateForce()

}

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


    nodeSelection
        .attr("cx", function (d) {
            return d.x;
        })
        .attr("cy", function (d) {
            return d.y;
        });

}

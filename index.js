/** Global constants */
var pi = Math.PI,
    tau = 2 * pi;
var projection, geoGenerator;
var nDistricts = 3
var oversizeThreshold = 1.03;
// Name of the overall objects
// in the topojson file
var mainTopology = "Chester"
var datafile = "data/Penn VTD Data/Chester/Chester.topojson"
// Names of fields in the geojson
var populationField = "POPULATION"
var democratsField = "PRES08_DEM"
var republicansField = "PRE08_REP"
// Colors for each user-assigned district
var districtColors = ["green", "orange", "rgb(200, 60, 200)"]
// Number of empty areas to
// examine for possible assignment
// each time the user clicks "Fill"
var fillRate = 30;

var minLightness = 40;
var width = 600,
    height = 600;


/** Variables determined when data are first loaded */
var maxBias = 0
var totalPopulation = 0;
// Desired population for each district
var targetPopulation = 0;

var geojson = null;
var topology = null;
var expander = null;


/** Variables that changes from user interactions */
var nAssignedDistricts = 0
var districtPopulation = [0, 0, 0]
var districtDemocrats = [0, 0, 0]
var districtRepublicans = [0, 0, 0]

// To which district are we currently assigning areas
var currentDistrictBrush = 0
// Is the mouse down
var dragging = false;



var svg = d3.select("#mapSvg")
    .attr("width", width)
    .attr("height", height);



// Main startup
loadData();

function loadData() {
    d3.json(datafile, function (error, topo) {
        topology = topo;
        geojson  = topojson.feature(topology, topology.objects[mainTopology]);
        expander = new SimpleExpander(topology);
        initializePopulation();
        initMap();
        resetDistricts();
    });
}

/** 
 * Set all area assignments
 * back to inital state. 
*/
function resetDistricts() {
    nAssignedDistricts = 0
    districtPopulation = [0, 0, 0]
    districtDemocrats = [0, 0, 0]
    districtRepublicans = [0, 0, 0]
    // To which district are we currently assigning areas
     currentDistrictBrush = 0
    // Is the mouse down
     dragging = false;  
    for (var i = 0; i < geojson.features.length; i++) {
        var feature = geojson.features[i];
        feature.properties.district = null;
        refreshMap(i);
    }        
    refreshScores();
    refreshPalette();
    initBorder();
    var div = d3.select("#summary")
    div.text("")        
    
        
}

function doExpand() {
    expander.expand(fillRate);
}

function initBorder() {
    // Find the outer border of all the areas
    // Note that this assumes to 
    var border = topojson.merge(topology, 
        topology.objects[mainTopology].geometries);
    d3.select("#mapSvg")
        .select('#border')
        .append('path')
        .datum(border)
        .style("stroke", "blue")
        .style("stroke-width", 5)
        .style("fill", "none")
        .style("opacity", "1.0")
        .attr('d', geoGenerator)
}
// Compute total population
// and therefore desired population
// per district
function initializePopulation() {
    totalPopulation = 0;
    targetPopulation = 0;

    var totalDems = 0;
    var totalReps = 0;
    for (var i = 0; i < geojson.features.length; i++) {
        var feature = geojson.features[i];
        totalPopulation += feature.properties[populationField]
        var dems = feature.properties[democratsField]
        var reps = feature.properties[republicansField]
        if ((dems != null) && (reps != null)) {
            maxBias = Math.max(maxBias, Math.abs(dems - reps))
            totalDems += dems;
            totalReps += reps;
        }
    }
    targetPopulation = totalPopulation / nDistricts;
    console.log("dems:" + totalDems + " reps:"+totalReps)
}

// Assign an area to a district
function assignToDistrict(feature, district) {
    if (district == feature.properties.district) return;
    var pop = feature.properties[populationField]
    var dems = feature.properties[democratsField]
    var reps = feature.properties[republicansField]
    if (feature.properties.district != null) {
        districtPopulation[feature.properties.district] -= pop
        if ((dems != null) && (reps != null)) {
            districtDemocrats[feature.properties.district] -= dems
            districtRepublicans[feature.properties.district] -= reps
        }
    }
    feature.properties.district = district
    districtPopulation[feature.properties.district] += pop
    if ((dems != null) && (reps != null)) {
        districtDemocrats[feature.properties.district] += dems
        districtRepublicans[feature.properties.district] += reps
    }
    nAssignedDistricts ++;
    refreshScores();
    if (nAssignedDistricts == geojson.features.length) {
        showSummary();
    }
}
function showSummary() {
    var message = "Congratulations.  You assigned all the precincts to districts."
    d3.select("#summary").text(message)        
    
}

function selectColor(feature, i) {
    var district = feature.properties.district
    if (district != null) return "";
    else {
        var dems = feature.properties[democratsField]
        var reps = feature.properties[republicansField]
        if (dems > reps) {
            var hue = 240 //blue
            var saturation = 70
            var lightness = 100 - Math.trunc(minLightness * (dems - reps) / maxBias)
        } else {
            var hue = 0 //red
            var saturation = 70
            var lightness = 100 - Math.trunc(minLightness * (reps - dems) / maxBias)
        }
        var color = "hsl(" + hue + "," + saturation + "%," + lightness + "% )"
        return color
    }
}

// Refresh D3 binding
// between features and map areas
function initMap() {
    projection = d3.geoMercator()
        .fitSize([width, height], geojson);

    geoGenerator = d3.geoPath()
        .projection(projection);

    // Build background tiles
    var tiles = d3.tile()
        .size([width, height])
        .scale(projection.scale() * tau)
        .translate(projection([0, 0]))
        ();

    d3.select("#mapSvg")
        .select("#images").selectAll("image")
        .data(tiles)
        .enter()
        .append("image")
        .attr("xlink:href", function (d) { return "http://" + "abc"[d[1] % 3] + ".tile.openstreetmap.org/" + d[2] + "/" + d[0] + "/" + d[1] + ".png"; })
        .attr("x", function (d) { return (d[0] + tiles.translate[0]) * tiles.scale; })
        .attr("y", function (d) { return (d[1] + tiles.translate[1]) * tiles.scale; })
        .attr("width", tiles.scale)
        .attr("height", tiles.scale);


    // Build vectors for each voting areas
    d3.select("#mapSvg")
        .selectAll('#areas')
        .data(geojson.features)
        .enter()
        .append('path')
        .attr("id", function (d, i) {
            // give each division an id
            return "division" + i
        })
        .attr("class", function (d, i) {
            // Get the district that has been assigned by the user
            // Should be a zero-based number
            // or missing for unassigned areas
            var district = d.properties.district
            // Use that to determine the area's style
            if (district != null) return "district" + district;
            else return "unassigned"
        })
        .style("stroke", "rgb(200, 200, 200)")
        .style("stroke-width", 0)
        .attr('d', geoGenerator)
        .style("fill", selectColor)
        .on("mousedown", function (e, i) {
            if (geojson.features[i].properties.district != null) {
                currentDistrictBrush = geojson.features[i].properties.district
                refreshPalette();
            } else {
                assignToDistrict(geojson.features[i], currentDistrictBrush)
                refreshMap(i);
            }
            dragging = true;
        })
        .on("mouseup", function (e, i) {
            dragging = false;
        })
        .on("mouseenter", function (e, i) {
            if (dragging) {
                assignToDistrict(geojson.features[i], currentDistrictBrush)
                refreshMap(i);
                refreshPalette();
            }

        }).append("svg:title")
        .text(function (d, i) {
            var feature = geojson.features[i]
            var name = feature.properties.NAME10
            pop = feature.properties.POPULATION
            var dems = feature.properties[democratsField]
            var reps = feature.properties[republicansField]
            if (reps > dems) return  name + " R+" + (reps - dems)
            else return  name + " D+" + (dems - reps)
        })


}

// Refresh D3 binding
// for one division
function refreshMap(division) {
    d3.select('#division' + division)
        .attr("class", function (d, i) {
            var district = d.properties.district
            // Use that to determine the area's style
            if (district != null) return "district" + district;
            else return "unassigned"
        })
        .style("fill", selectColor)
}

// Refresh D3 binding between
// the districts and the palette
function refreshPalette() {
    d3.select("#paletteSvg")
        .selectAll('circle')
        .data(districtColors)
        .style("stroke", function (d, i) {
            if (i == currentDistrictBrush) return "black";
            else return districtColors[i];
        })
        .enter()
        .append("circle")
        .attr("cx", function (d, i) { return 30 + i * 40 })
        .attr("cy", 30)
        .attr("r", 18)
        .style("fill", function (d, i) {
            return districtColors[i];
        })
        .style("stroke-width", 4)
        // Shouldn't have to set this here
        // but it doesn't seem to get initialized properly
        .style("stroke", function (d, i) {
            if (i == currentDistrictBrush) return "black";
            else return districtColors[i];
        })
        .on("click", function (e, i) {
            currentDistrictBrush = i;
            dragging = false;
            refreshPalette()
        })
}

// Refresh D3 binding between districts
// and their scores
function refreshScores() {
    // Colored border for each fill tank

    d3.select("#scoreSvg")
        .selectAll('.targetpop')
        .data(districtPopulation)
        .enter()
        .append('rect')
        .attr("class", "targetpop")
        .attr("x", function (d, i) { return 10 + 40 * i })
        .attr("y", "25")
        .attr("width", "36")
        .attr("height", "100")
        .style("fill", "white")
        .style("stroke-width", 3)
        .style("stroke", function (d, i) {
            return districtColors[i];
        })
        .on("click", function (e, i) {
            currentDistrictBrush = i;
            dragging = false;
            refreshPalette()
        })
    var nOversized = 0;
    for (var d=0; d< nDistricts; d++) {
        if ( (districtPopulation[d] / targetPopulation ) > oversizeThreshold ) nOversized ++;
    }
    if (nOversized == 0) {
        d3.select("#overflowWarning").style("visibility","hidden")
    } else {
        d3.select("#overflowWarning").style("visibility","")        
    }
    d3.select("#scoreSvg")
        .selectAll('.fraction')
        .data(districtPopulation)
        .attr("height", function (d, i) { return 100 * districtPopulation[i] / targetPopulation })
        .attr("y", function (d, i) { return 25 + 100 - (100 * districtPopulation[i] / targetPopulation) })
        .enter()
        .append('rect')
        .attr("class", "fraction")
        .attr("x", function (d, i) { return 10 + 40 * i })
        .attr("width", "36")
        .style("fill", function (d, i) {
            return districtColors[i];
        })

    // For each 

    var predictedWinners = d3.select("#scoreSvg")
        .selectAll('.predictedWinner')
        .data(districtDemocrats)
        .style("fill", function (d, i) {
            var dems = districtDemocrats[i];
            var reps = districtRepublicans[i];
            if (dems) {
                if (reps) {
                    if (dems > reps) return "blue"
                    else return "red"
                } else {
                    return "blue"
                }
            } else {
                return "gray"
            }
        })
        .text(percentageText)
        .enter()
        .append('text')
        .attr("class", "predictedWinner")
        .attr("height", 20)
        .attr("y", 150)
        .attr("x", function (d, i) { return 10 + 40 * i })
        .attr("width", "36")
        .style("font-family", "monospace")
        .text(percentageText)

}

function percentageText(d, i) {
    var dems = districtDemocrats[i];
    var reps = districtRepublicans[i];
    if (dems) {
        if (dems > reps) return "" + Math.round(100 * dems / (dems + reps)) + "%"
        else return "" + Math.round(100 * dems / (dems + reps)) + "%"
    } else {
        return "  --"
    }
}


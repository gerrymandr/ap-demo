

var oversizeThreshold = 1.05;  // 5% over even population





initMap();



// TODO: highlight the outer border of the region

function showSummary() {
    var message = "Congratulations.  You assigned all the precincts to districts."
    d3.select("#summary").text(message)
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
        .attr("x", function (d, i) { return 12 + 44 * i })
        .attr("y", "29")
        .attr("width", "30")
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
        .attr("y", function (d, i) { return 25+ 4+ 100 - (100 * districtPopulation[i] / targetPopulation) })
        .enter()
        .append('rect')
        .attr("class", "fraction")
        .attr("x", function (d, i) { return 12 + 44 * i })
        .attr("width", "30")
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
        .attr("y", 154)
        .attr("x", function (d, i) { return 10 + 44 * i })
        .attr("width", "44")
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

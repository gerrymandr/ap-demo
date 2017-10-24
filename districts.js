

function mapSize() {
  width = parseInt(d3.select('#mapSvg').attr('width'));
  height = parseInt(d3.select('#mapSvg').attr('height'));

  return [width, height];
}

var selectedDistrict = "district0";

function initMap(center, scale) {

    // for debugging only
    d3.json("Chester.geojson", function (error, geojson) {

          projection = d3.geo.mercator()
			 .center(center)
	                 .scale(scale);

          mapPathsIn2D = d3.geo.path().projection(projection); 

          // Build vectors for each voting areas
          d3.select("#mapSvg")
              .selectAll('path')
              .data(geojson.features)
              .enter()
              .append('path')
              .attr('d', mapPathsIn2D) // bind the path data
              .on("click", function (d, i) {
                // TODO: click on an existing district and paint the style elsewhere
                // stealing dragging example https://bl.ocks.org/mbostock/a84aeb78fea81e1ad806
                if (d3.event.defaultPrevented) return; // dragged

                // TODO: should come from the state of the widget for selecting districts

                d.properties.district = selectedDistrict;

                d3.select(this).attr("class", d.properties.district);
              })

        //    initBackgroundMapTile(projection);
    });
}

function districtPercentagesOfPop() {

}

function totalPopAndRepublicansAndDemocratPerDistrict() {
  var regions = d3.selectAll('#mapSvg path').data();

  return d3.nest()
    .key(function(d) { return d.properties.district; })
    .rollup(
      function(district) {
      return {
          republicans: d3.sum(district, function(d) { return d.properties.republicans; }),
          democrats: d3.sum(district, function(d) { return d.properties.democrats; }),
          population: d3.sum(district, function(d) { return d.properties.population; })
        } })
    .entries(regions)
}

// TODO: move this in precomputation
function computeColorForParty(d, maxPartyGapPerRegion) {

        var minLightness = 40;

        var lightness = 100 - Math.trunc(minLightness * Math.abs(d.properties.democrats - d.properties.republicans) / maxPartyGapPerRegion)

        if (dems > reps) {

            return d3.hsl(240, .70, lightness / 100.0);

        }

        return d3.hsl(0, .70, lightness / 100.0);

}

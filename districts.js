

function mapSize() {
  width = parseInt(d3.select('#mapSvg').attr('width'));
  height = parseInt(d3.select('#mapSvg').attr('height'));

  return [width, height];
}

function initMap() {
    // for debugging only
    var selectedDistrict = "district0";

    d3.json("Chester.geojson", function (error, geojson) {


          projection = d3.geoMercator()
              .fitSize(mapSize(), geojson);

          geoGenerator = d3.geoPath()
              .projection(projection);

          // Build vectors for each voting areas
          d3.select("#mapSvg")
              .selectAll('path')
              .data(geojson.features)
              .enter()
              .append('path')
              .attr('d', geoGenerator) // bind the path data
              .on("click", function (e, i) {
                // TODO: click on an existing district and paint the style elsewhere
                // stealing dragging example https://bl.ocks.org/mbostock/a84aeb78fea81e1ad806
                if (d3.event.defaultPrevented) return; // dragged

                // TODO: should come from the state of the widget for selecting districts
                d3.select(this).attr("class", "district0");
              })

            initBackgroundMapTile(projection);
    });
}

function computeColorForParty(d, maxPartyGapPerRegion) {

        var minLightness = 40;

        var lightness = 100 - Math.trunc(minLightness * Math.abs(d.properties.democrats - d.properties.republicans) / maxPartyGapPerRegion)

        if (dems > reps) {

            return d3.hsl(240, .70, lightness / 100.0);

        }

        return d3.hsl(0, .70, lightness / 100.0);

}

function initBackgroundMapTile(mapOverlayProjection) {
    // TODO: somehow I'm not understanding this bit. What are the units for these?
    // Good reference code: http://bl.ocks.org/mbostock/eb0c48375fcdcdc00c54a92724733d0d
    // Build background tiles
    var tiles = d3.tile()
        .size(mapSize())
        .scale(mapOverlayProjection.scale() * 2 * Math.Pi)
        .translate(mapOverlayProjection([0,0]))
        ();

    d3.select("#images")
        .selectAll('image')
        .data(tiles)
        .enter()
        .append("image")
        .attr("xlink:href", function (d) { return "http://" + "abc"[d[1] % 3] + ".tile.openstreetmap.org/" + d[2] + "/" + d[0] + "/" + d[1] + ".png"; })
        .attr("x", function (d) { return (d[0] + tiles.translate[0]) * tiles.scale; })
        .attr("y", function (d) { return (d[1] + tiles.translate[1]) * tiles.scale; })
        .attr("width", tiles.scale)
        .attr("height", tiles.scale);



        // .append("svg:title")
        // .text(function (d, i) {
        //     var feature = geojson.features[i]
        //     var name = feature.properties.NAME10
        //     pop = feature.properties.POPULATION
        //     var dems = feature.properties[democratsField]
        //     var reps = feature.properties[republicansField]
        //     if (reps > dems) return  name + " R+" + Math.round(reps - dems)
        //     else return  name + " D+" + Math.round(dems - reps)
        // })


}

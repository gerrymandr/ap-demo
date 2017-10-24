/**
*
* Extends d3.chart.pie so that the user can select one of the labels 
* above them.
* TODO: we should actually be extending the Legend chart, not the PieChart
* Some questions for d3 Charts in general:
* 1. Why is there a conceptual difference between layers and the component itself. 
* 2. A component should just be made up stitching together different components as layers.
*/
d3.chart("Pie").extend("ClickablePie", {

  initialize: function(options) {

    options = typeof options === 'object' ? options : {};
    
    this.scaleFactor = options.scaleFactor || 1.70;
    this._selectedLabel    = options.selectedLabel;

    var chart = this;

    // assign a css class name to the chart highest container
    // so that we can also style it
    chart.base.classed("ClickablePie", true);

    this.legend.layer("markers").on('enter', function() {

	  this.on('click', function(d) {

		  chart._selectedLabel = d;

		  chart.legend.base.selectAll('circle')
		       .transition()
		       .attr('r', chart.legend.markerRadius());


		     d3.select(this)
		       .transition()	
		       .attr('r', chart.legend.markerRadius() *  chart.scaleFactor);

		     chart.trigger("change:selectedLabel", d)

	   });
    });
   },

  selectedLabel: function() {
    
    return this._selectedLabel;
  }
});

var data = [
      { label: 'District 1', value: 2 },
      { label: 'District 2', value: 2 },
      { label: 'District 3', value: 1.5 },
      { label: 'Unassigned', value: 5 }
    ],
    pie = d3.select('#pie')
      .append('svg')
        .attr('width', 450)
        .attr('height', 300)
        .chart('ClickablePie', {
          width: 450,
          height: 300,
          radius: 100,
	  scaleFactor: 1.50,
          donutHole: {
            radius: 20,
            color: 'white'
          },
          labelTemplate: '{label}: {value}',
          legend: {
            title: 'Districts'
          }
        });

pie.draw(data);


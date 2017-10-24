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


(function (d3) {
  var markersLayer,
    labelsLayer;

  d3.chart('Legend', {
    initialize: function (options) {
      var group,
        legendGroup,
        markersGroup,
        labelsGroup,
        title;

      options = typeof options === 'object' ? options : {};
      this.markerRadius(options.markerRadius || 5);
      this.colors(options.colors || d3.scale.category20());
      this.x = options.x || 0;
      this.y = options.y || 0;

      group = this.base.append('g')
        .attr('class', 'legend')
        .attr('transform', translate(this.x, this.y));

      if (options.title) {
        title = group.append('text')
          .attr('class', 'legend-title')
          .attr('dx', 5)
          .text(options.title);
      }

      legendGroup = group.append('g')
        .attr('class', 'legend-group')
        .attr('transform', function () {
          return options.title ? translate(0, 10) : translate(0);
        });

      // Groups
      markersGroup = legendGroup.append('g')
        .attr('class', 'markers-group');
      labelsGroup = legendGroup.append('g')
        .attr('class', 'labels-group');

      // Layers init
      this.layer('markers', markersGroup, markersLayer);
      this.layer('labels', labelsGroup, labelsLayer);
    },

    transform: function (data) {
      var results = [],
        value,
        item;

      for (item in data) {
        if (data.hasOwnProperty(item)) {
          item = data[item];

          if (item) {
            if (typeof item === 'string') {
              results.push(item);
            }
            else if (item.label) {
              results.push(item.label);
            }
          }
        }
      }

      return results;
    },

    markerRadius: function (radius) {
      if (arguments.length === 0) {
        return this.markerR;
      }

      this.markerR = radius;
      return this;
    },

    colors: function (colors) {
      if (arguments.length === 0) {
        return this.color;
      }

      if (typeof colors === 'function') {
        this.color = colors;
      }
      else if (Array.isArray(colors)) {
        this.color = function (i) {
          return colors[i] || '#333333';
        };
      }

      return this;
    }
  });

  markersLayer = {
    dataBind: function (data) {
      return this.selectAll('circle')
        .data(data);
    },

    insert: function () {
      return this.insert('svg:circle');
    },

    events: {
      enter: function () {
        var chart = this.chart();

        return this.attr('class', 'marker')
          .attr('fill', function (d, i) {
            return chart.color(i);
          })
          .attr('cx', 10)
          .attr('cy', function (d, i) {
            return (i * 20) + 10;
          })
          .attr('r', chart.markerR);
      },

      merge: function () {
        var chart = this.chart();

        return this.attr('class', 'marker')
          .attr('fill', function (d, i) {
            return chart.color(i);
          })
          .attr('cx', 10)
          .attr('cy', function (d, i) {
            return (i * 20) + 10;
          })
          .attr('r', chart.markerR);
      },

      exit: function () {
        return this.remove();
      }
    }
  };

  labelsLayer = {
    dataBind: function (data) {
      return this.selectAll('text')
        .data(data);
    },

    insert: function () {
      return this.insert('svg:text');
    },

    events: {
      enter: function () {
        var chart = this.chart();

        return this.attr('x', 20)
          .attr('y', function (d, i) {
            return (i * 20) + 9 + chart.markerR;
          })
          .text(function (d) {
            return d;
          });
      },

      merge: function () {
        var chart = this.chart();

        return this.attr('x', 20)
          .attr('y', function (d, i) {
            return (i * 20) + 9 + chart.markerR;
          })
          .text(function (d) {
            return d;
          });
      },

      exit: function () {
        return this.remove();
      }
    }
  };

  function translate (x, y) {
    if (arguments && arguments.length === 1) {
      y = x;
    }

    return 'translate(' + x + ',' + y + ')';
  }
}(d3));

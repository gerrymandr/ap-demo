

class SimpleExpander {
    constructor(topology) {
        this.topology = topology;
        this.neighbors = topojson.neighbors(topology.objects[mainTopology].geometries)
        this.features = topojson.feature(topology, topology.objects[mainTopology]).features	
    }
    // Assign more areas to districts
    expand() {
        for (var i = 0; i< this.features.length; i++) {

            // Some function that provides a
            // way for smaller disticts to be more eager to "eat"
            // more precincts
            var hunger = new Array(nDistricts)
            for (var d = 0; d < nDistricts; d++) {
                var districtPopulation = districtDemocrats[d] + districtRepublicans[d];              
                hunger[d] = Math.exp((targetPopulation - districtPopulation)/targetPopulation);
            }
    
            var feature = this.features[i];
            if (feature.properties.district == null) {
                // Not yet assigned to a district
                var neighborhood = this.neighbors[i];
                var neighbor = this.selectNeighbor(hunger, neighborhood)
                if (neighbor != null) {
                    assignToDistrict(feature, neighbor.properties.district);
                    refreshMap(i);
                }
            }

        }

    }

    selectNeighbor(hunger, neighborhood) {
        var cummWeights = new Array(neighborhood.length)
        var totalWeights = 0.0;
        for (var n=0;n<neighborhood.length; n++) {
            var neighbor = this.features[neighborhood[n]];
            var weight;
            if (neighbor.properties.district != null) {
                weight = hunger[neighbor.properties.district];
            } else {
                weight = 1;
            }
            cummWeights[n] = weight + totalWeights;
            totalWeights += weight;
        }                
        var x = Math.random() * totalWeights;
        for (var n=0;n<neighborhood.length; n++) {
            if (x<cummWeights[n]) {
                var neighbor = this.features[neighborhood[n]];
                if (neighbor.properties.district != null) {
                    return neighbor;
                } else {
                    return null
                }
            }

        }

    }
}
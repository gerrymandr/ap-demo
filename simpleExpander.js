

class SimpleExpander {
    constructor(topology) {
        this.topology = topology;
        this.neighbors = topojson.neighbors(topology.objects[mainTopology].geometries)
        this.features = topojson.feature(topology, topology.objects[mainTopology]).features	
        // Fiddle with these to get a good user experience
    
        // The larger this is, the more the system
        // avoids over-filling districts.
        // Can be any positive number, but probably
        // should be in the range from 1 to 10
        this.overfillPenalty = 5;
        // The larger this is, the more willing the system
        // is to expand into areas with few assigned districts.
        // Should be a number from 0 to 1
        var convexityReward = 0.5
        this.neutralExpansionRate = this.expansionRate(convexityReward);
    
    }
    // Assign more areas to districts
    expand(maxNewAssignments) {
        var queue = new Array();
        for (var i = 0; i< this.features.length; i++) {
            // Look for unassigned areas   
            var feature = this.features[i];
            var neighborhood = this.neighbors[i];  
            var count = this.countAssignedNeighbors(neighborhood);          
            if ((feature.properties.district == null) && (count>0) ) {
                queue.push(i);
            }
            if (queue.length>= maxNewAssignments) break;
        }

        while (queue.length>0) {
            var i = queue.pop();
            var feature = this.features[i];
            // Some function that provides a
            // way for smaller disticts to be more eager to "eat"
            // more precincts
            var expansionRates = new Array(nDistricts)
            for (var d = 0; d < nDistricts; d++) {
                var fullness = districtPopulation[d]/targetPopulation              
                expansionRates[d] = this.expansionRate(fullness);
            }

            //assert(feature.properties.district == null) 
            var neighborhood = this.neighbors[i];
            var neighbor = this.selectNeighbor(expansionRates, neighborhood)
            if (neighbor != null) {
                assignToDistrict(feature, neighbor.properties.district);
                refreshMap(i);
            }          

        }
    }
    countAssignedNeighbors(neighborhood) {
        var count = 0;
        for (var n=0;n<neighborhood.length; n++) {
            var neighbor = this.features[neighborhood[n]];
            if (neighbor.properties.district != null) count++
        }
        return count; 
    }
    // Given a general rate for each disrict to acquire more
    // areas and a list of neighbors, randomly select one of the neighbors
    // that has its district already assigned, or select null
    selectNeighbor(expansionRates, neighborhood) {
        var cummWeights = new Array(neighborhood.length)
        var weights = new Array(neighborhood.length)
        var totalWeights = 0.0;
        for (var n=0;n<neighborhood.length; n++) {
            var neighbor = this.features[neighborhood[n]];
            var weight;
            if (neighbor.properties.district != null) {
                weight = expansionRates[neighbor.properties.district];
            } else {
                weight = this.neutralExpansionRate;
            }
            weights[n] = weight; 
            cummWeights[n] = weight + totalWeights;
            totalWeights += weight;
        }                
        var x = Math.random() * totalWeights;
        for (var n=0;n<neighborhood.length; n++) {
            if (x<cummWeights[n]) {
                // Select neightbor n, though
                // we only get the neighbor's district if the 
                //neighbor is assigned to a district
                var neighbor = this.features[neighborhood[n]];
                if (neighbor.properties.district != null) {
                    return neighbor;
                } else {
                    return null
                }
            }
        }
    }
    /** 
     * Given the fullness of a district, between 0 and nDistricts
     * return a non-negative number indicated the propensity of
     * the district to grow into an adjacent area.
    */
    expansionRate(fullness) {
        return Math.exp(-this.overfillPenalty * fullness)
    }

}
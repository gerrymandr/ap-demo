// Work in progress for a greedy algorithm to
// assign areas to districts.

// Return a list for each feature that 
// indicates the distance from the feature to 
// each of the districts.
// Distance should be very large or null
// if the feature cannot reach the district.

function enlargeDistricts() {
    var features = geojson.features

    initializeDistrictDistances()

    for (var d = 0; d < nDistricts; d++) {
        computeDistanceToDistrict(d);
    }
    assignMargins()
    initMap()
}

// For each feature, associate a list that will
// track the min number of steps it takes to get from 
// somewhere in the district to the given feature.
// This will be null for any district that cannot reach
// the feature.
// This is the initialization before the breadth-first search
function initializeDistrictDistances() {
    var features = geojson.features
    for (var i = 0; i < features.length; i++) {
        var feature = features[i];
        var district = feature.properties.district;
        var distances = new Array(nDistricts);
        for (var d = 0; d < nDistricts; d++) distances[d] = null;
        if (district != null) {
            distances[district] = 0;
        }
        feature.properties.districtDistances = distances;
    }
}


// Use breadth-first search
// to compute distance from district d
function computeDistanceToDistrict(d) {
    var features = geojson.features
    // queue of features that have just had
    // their distance computed and therefore should be queued
    // to visit their neighbors
    var queue = new Array(0);

    // Prime the queue with all features
    // that have already been assigned to  district and
    // are therefore distance 0
    for (var i = 0; i < features.length; i++) {
        var feature = features[i];
        var district = feature.properties.district;
        if (district == d) {
            queue.push(feature)
        }
    }

    while (queue.length > 0) {
        var feature = queue.pop();
        var neighbors = feature.properties.adjacent_features;
        for (var i = 0; i < neighbors.length; i++) {
            var neighbor = features[i];
            if (neighbor.properties.districtDistances[d] == null) {
                // Neighbor is a node that is one step away from
                // feature but we didn't yet know how far it was from the district
                neighbor.properties.districtDistances[d] = 1 + feature.properties.districtDistances[d];
                queue.push(feature);
            }
        }

    }


}

// For each area that is on a margin, i.e. unassigned
// but distance 1 from one or more districts, consider
// assigning the are to one of those districts.
function assignMargins() {
    var features = geojson.features
    var hunger = new Array(nDistricts)
    for (var d = 0; d < nDistricts; d++) {
        var districtPopulation = districtDemocrats[d] + districtRepublicans[i];
        hunger[d] = Math.exp(targetPopulation - districtPopulation);
    }

    for (var i = 0; i < features.length; i++) {
        var feature = features[i];
        if (feature.district == null) {
            // Not yet assigned to a district  
            var districtProbability = new Array(nDistricts);
            // Total weight of districts that are accessible to
            // the current area, including some that are several
            // steps away.
            var total = 0.0;
            for (var d = 0; d < nDistricts; d++) {
                var distance = feature.properties.districtDistances[d];
                if (distance != null) {
                    // distance must be > 0 since distrct == null
                    var weight = hunger[d] / distance;
                    total += weight;
                    if (distance == 1) {
                        districtProbability[d]
                    }
                }
            }
            // Normalize by total
            for (var d = 0; d < nDistricts; d++) {
                if (districtProbability[d] != null) {
                    districtProbability[d] = districtProbability[d] / total
                }
            }
            // Among the zero or more districts are that one
            // step away, perhaps assign to one of them.
            // There is also a probability that we don't assign
            // the feature to any district yet.
            var x = Math.random()
            var cumProbability = 0;
            for (var d = 0; d < nDistricts; d++) {
                if (districtProbability[d] != null) {
                    cumProbability += districtProbability[d]
                    if (x < cumProbability) {
                        feature.district = d;
                        break
                    }
                }
            }
        }
    }
}

#! /bin/python

import json, csv, sys

geography = json.load(sys.stdin);

adjacency_list = {}

def add_edge(adj_list, src, dst):

    if src in adj_list:
        adj_list[src].append(dst)
    else:
        adj_list[src] = [dst]

    return adj_list

def featureIndexForGeoID(geoid):
    idx = 0
    found = False
    for feature in geography['features']:

        if feature['properties']['GEOID10'] == geoid:
            found = True
            break

        idx += 1

    return idx if found else -1 
    
with open('../mdcs/PA-MDCS-graph.csv', 'r') as csvfile:

    csvreader = csv.reader(csvfile, delimiter=',')

    next(csvreader)

    for row in csvreader:

        if row[0] and row[1]:

            adjacency_list = add_edge(adjacency_list, row[0], row[1])
            adjacency_list = add_edge(adjacency_list, row[1], row[0])


for feature in geography['features']:

    key = feature['properties']['GEOID10']

    if key in adjacency_list:
        print('%s connects to %s' % (key, adjacency_list[key]))

#        feature['properties']['adjacent_features'] = list(
        feature['properties']['adjacent_features'] = list(filter(lambda x: x >= 0, map(featureIndexForGeoID, adjacency_list[key])))
        
        print('%d connects to %s' % (featureIndexForGeoID(key), feature['properties']['adjacent_features']))
        
# json.dump(geography, sys.stdout)


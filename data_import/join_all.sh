#! /bin/zsh

fname=../data/Penn\ MCDS\ Data/Chester/Chester.geojson

cat $fname | ./join_adjacency_data.py | ./join_voting_data.py > Chester.geojson

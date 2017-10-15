Simple demo of gerrymandering for AP

We use D3


Starting with U.S. congressional districts in Lancaster, Delaware, Chester, Montgomery, and Berks counties, PA.
  Really starting with Chester county. 
  
  2010 Census
  2016 Election
  
```County code data:
  Chester    --- 15
  Delaware   --- 23
  Lancaster  --- 36
  Montgomery --- 46
    (source: https://github.com/openelections/openelections-data-pa)
```

County FP10 Codes
```
Chester 29
Delaware 45
Lancaster 71
Montgomery 91
Berks  11
```

# Data and Sources

### Shapefile of entire area of interest.
County shapefiles are in
https://github.com/aaron-strauss/precinct-shapefiles/blob/master/pa/2011_pa_precincts.zip


### Shapefile and demographics for each MCDS
https://github.com/aaron-strauss/precinct-shapefiles/blob/master/pa/2011_pa_precincts.zip

### Election returns by MCDS


### Adjacency matrix for MCDS
Computed in PostGIS from MCDS shape files
```
create table "PA_MCDS_graph" as
SELECT a."GEOID10" AS "GEOID101", b."GEOID10" AS "GEOID102",
    ST_GeometryType(ST_Intersection(a.geom, b.geom)),
    ST_MakeLine(ST_PointOnSurface(a.geom), ST_PointOnSurface(b.geom)) AS geom
FROM "PA_MCDS" AS a LEFT OUTER JOIN "PA_MCDS" AS b
ON a."GEOID10" < b."GEOID10"
AND a.geom && b.geom AND ST_Touches(a.geom, b.geom)
AND ST_GeometryType(ST_Intersection(a.geom, b.geom)) not in ('ST_Point', 'ST_MultiPoint')
```


To start server:
python < 3:
python -m SimpleHTTPServer

Python >= 3
python -m http.server

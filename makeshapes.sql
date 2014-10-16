-- create new tables in GTFS database for use in map tiler

-- make table of route shapes by aggregating its trip shapes
select t.route_id, st_linemerge(st_collect(s.the_geom)) as geom 
into route_shapes 
from gtfs_shape_geoms s inner join gtfs_trips t on (t.shape_id=s.shape_id) 
group by t.route_id;

-- build table of all route info, with its geometry from above
select r.*, s.geom
into route_info
from gtfs_routes r inner join route_shapes s on (r.route_id=s.route_id);

-- get distinct combinations of routes and their stops
select distinct route_id, stop_id 
into routes_served 
from gtfs_stop_times inner join gtfs_trips on gtfs_trips.trip_id=gtfs_stop_times.trip_id;

-- create table to hold string with list of routes served for each stop
select distinct s.stop_id, t.the_geom as geom 
into routes_served_geom 
from routes_served s inner join gtfs_stops t on t.stop_id=s.stop_id;

-- set string description of routes served for each stop
alter table routes_served_geom add column routes varchar(255);

update routes_served_geom s 
set routes = (select string_agg(route_id, ', ') as routes 
from routes_served r 
where r.stop_id = s.stop_id 
group by stop_id);

-- create table of all stop info, with routes served from above
select s.*, r.routes
into stop_info
from gtfs_stops s inner join routes_served_geom r on (s.stop_id=r.stop_id);

alter table stop_info rename the_geom to geom;

-- description of all route types in use in this database
select distinct r.route_type, t.description
into route_types_used
from gtfs_routes r inner join gtfs_route_types t on t.route_type=r.route_type;

-- index all the things
alter table route_info add constraint route_info_pk primary key (route_id);

alter table stop_info add constraint stop_info_pk primary key (stop_id);

create index routes_served_route_idx on routes_served (route_id);

create index routes_served_stop_idx on routes_served (stop_id);

alter table route_types_used add constraint route_types_used_pk primary key (route_type);

create index route_info_gix on route_info using gist (geom);

create index stop_info_gix on stop_info using gist (geom);

-- analyze for indexing
vacuum;

vacuum analyze;
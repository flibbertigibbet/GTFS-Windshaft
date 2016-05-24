GTFS-Windshaft
==============

Map PostGIS databases of GTFS data using Windshaft and Leaflet

:bus: :trolleybus: :mountain_cableway: :railway_car: :bus: :aerial_tramway:

Install
=======

Install the Windshaft dependency with `npm install`. Note this will require using node < 0.11, and that Windshaft requires redis.


Setup Database
==============

Create a PostgreSQL database with the PostGIS extensions installed.

Unzip the GTFS files into their own directory. To serve multiple GTFS, each goes into its own database.

Use the scripts in the [GTFS SQL importer](https://github.com/flibbertigibbet/gtfs_SQL_importer) project to build and populate the tables:

  1. Run the script against the extracted GTFS text files to generate the import SQL.
  ```bash
  gtfs_SQL_importer/src/import_gtfs_to_sql.py /GTFS_PROJECT/TXT_FILE_DIRECTORY/ nocopy > /GTFS_PROJECT/gtfs.sql
  ```

  2. Before running the import SQL, run the project SQL for table creation:
  ```bash
  psql -d DB_NAME -f gtfs_SQL_importer/src/gtfs_tables.sql
  ```

  3. Now the import SQL generated can be run. This step may take awhile, depending on the feed size.
  ```bash
  psql -d DB_NAME -f /GTFS_PROJECT/gtfs.sql
  ```

  4. Next run the scripts to add spatial fields and indices:
  ```bash
  psql -d DB_NAME -f gtfs_SQL_importer/src/gtfs_tables_makespatial.sql
  psql -d DB_NAME -f gtfs_SQL_importer/src/gtfs_tables_makeindexes.sql
  ```

  5. Run a final script to add interactivity data and rename fields for Windshaft:
  ```bash
  psql -d DB_NAME -f gtfs_SQL_importer/src/tiler_tables.sql
  ```

Serving
=======

- Set the `DB_USER` and `DB_PASSWORD` environment variables, whcih are read in the head of `server.js`.
  If serving outside of localhost, set up a database user with read-only permissions on just the GTFS database(s).

- Start the tiler with `node server.js`.

- To use the web page in the project, edit the [TileJSON](https://github.com/mapbox/tilejson-spec/tree/master/2.1.0) in `js/tile.json` to reference your feed. Note that the URLs for the tiler are of the form:
 ```
 http://localhost:4000/tiles/DATABASE_NAME/.../{z}/{x}/{y}.png
 ```
 And should be renamed to match your database(s). The project example is for two feeds/databases.
 If the JSON variables are renamed, `index.html` will need to be updated where the layers are defined.

 - The index page is fully static and may be loaded in the browser without a server process to host it.

:bus: :trolleybus: :mountain_cableway: :railway_car: :bus: :aerial_tramway:

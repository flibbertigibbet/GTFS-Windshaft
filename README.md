GTFS-Windshaft
==============

Map PostGIS databases of GTFS data using Windshaft and Leaflet

Install
=======

Install Windshaft with `npm install`. Note this will require using node < 0.11.


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

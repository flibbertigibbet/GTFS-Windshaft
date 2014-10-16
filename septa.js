// Windshaft tile server configuration

var Windshaft = require('./lib/windshaft');
var _         = require('underscore');
var config = {
    base_url: '/tiles/:dbname/:table/:route_type/:route_ids',
    base_url_notable: '/tiles',
    grainstore: {
                 datasource: {
                     user:'DB_USERNAME',
                     password:'DB_USER_PASSWORD',
                     host: '127.0.0.1',
                     port: 5432,
                     geometry_field: 'geom',
                     srid: 4326
                 }
    }, //see grainstore npm for other options
    redis: {host: '127.0.0.1', port: 6379},
    //enable_cors: true,
    req2params: function(req, callback) {

        // specify the column you'd like to interact with
        if (req.params.table === 'route_info') {
          req.params.interactivity = 'route_short_name';
    	} else if (req.params.table === 'stop_info') {
    		req.params.interactivity = 'routes';
    	}
        
        var style = '#route_info { ' +
            'line-color: #698ea2; ' +
            'line-width: 2; ' +
            'line-opacity: 0.6; ' +
            // street level rail
            '[ route_type = 0 ] { line-color: #256baf; } ' +
            // underground rail
            '[ route_type = 1 ] { line-color: #dfdeb6; } ' +
            // intercity rail
            '[ route_type = 2 ] { line-color: #16ac69; } ' +
            // bus
            '[ route_type = 3 ] { line-color: #ccd93e; } ' +
            '} ' +
            '#stop_info { ' +
            'marker-fill: #99cccc; ' +
            'marker-width: 5; ' +
            'marker-opacity: 0.7; ' +
            'marker-allow-overlap: true; ' +
            '} ';

        if (req.params.route_type !== 'all') {
        	if (req.params.table === 'route_info') {
        		req.params.sql = "(select * from route_info where route_type=" + 
        			req.params.route_type + "))) as route_info";
        	} else if (req.params.table === 'stop_info') {
        		req.params.sql = "(select * from stop_info where stop_id in (" +
        			"select stop_id from routes_served where route_id in " +
        			"(select route_id from route_info where route_type=" + req.params.route_type + 
        			"))) as stop_info";
        	}
        } else if (req.params.route_ids !== 'all') {
        	// TODO:
        	if (req.params.table === 'route_info') {
        		//req.params.sql = "route_info";
        	} else if (req.params.table === 'stop_info') {
        		//req.params.sql = "stop_info";
        	}
        }

        req.params = _.extend({}, req.params, {style: style});
        _.extend(req.params, req.query);

        // send the finished req object on
        callback(null, req);
    }
};

// Initialize tile server on port 4000
var ws = new Windshaft.Server(config);
ws.listen(4000);

console.log("map tiles are now being served out of: http://localhost:4000" + config.base_url + '/:z/:x/:y');

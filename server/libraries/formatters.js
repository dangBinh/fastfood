var pkg         = require('../../package.json'),
		ErrorHelper = require('./error_helper'),
		config      = require('../config/environment'),
		_           = require('underscore'),
		obj         = require('../libraries/objects');

var ignoredKeys = ['__v', '_id._bsontype', '_id.id', 'accessToken'];

var Formatters  = {};

/**
 *	Formats our data into a nice neat csv
 *	@param {Object} req
 *	@param {Object} res
 *	@param {*} body
 */
Formatters.plain = function (req, res, body) {
	var str = "", keys;
	res.setHeader('Content-Type', 'text/plain');
	return str;
};

/**
 *	Returns our friendly xml message
 *	@param {Object} req
 *	@param {Object} res
 *	@param {*} body
 */
Formatters.xml = function(req, res, body) {
	response = '<?xml version="1.0" encoding="UTF-8"?><message><body>' +
						 'You dirty dirty man...</body></message>';

	// We need to get the content length of the data and set it
	// into the header so our responses don't hang or loose data
	res.setHeader('Content-Length', Buffer.byteLength(response));
	return response;
};

/**
 *	Creates default responses for the API when JSON is requested,
 *	JSON is also the default format of the API.
 *	@param {Object} req
 *	@param {Object} res
 *	@param {*} body
 */
Formatters.json = function (req, res, body) {
	// Override the JSON response only for pusher authentication
	if (req.route && /^\/pusher\/auth/.test(req.route.path)) {
		return JSON.stringify(body);
	}

	var response = {
		status: 'success',
		meta: {
			code: res.statusCode || 200,
			version: req.headers['accept-version'] || pkg.version
		}
	};

	// If passed an error we need to convert them and modify
	// the response
	if (body instanceof Error) {
		response.status = 'error';
		response.meta.error = body.message;

		// If we have a validation error we need to pass them through
		// the error helper so we get nicer messages.
		if (body.name === 'ValidationError') {
			response.meta.messages = new ErrorHelper(body);
		}
	}

	else {
		// Set up the response object
		response.status = 'success';

		// We also want to modify the pagination object if one is
		// pesent
		if (typeof body.pagination !== 'undefined') {
			response.meta.pagination = body.pagination;

			// Remove the pagination object from the docs before
			// adding them to the response.
			delete body.pagination;
			response.data = (body.docs || body);
		}
		else {
			response.data = body;
		}
	}
  var data;
	// This needs to be extended so that the mongoose virtual
	// fields are added to the response
	data = JSON.stringify(response);

	// We need to get the content length of the data and set it
	// into the header so our responses don't hang or loose data
	res.setHeader('Content-Length', Buffer.byteLength(data, 'utf8'));
	return data;
};

// Create the main module to export
module.exports = Formatters;

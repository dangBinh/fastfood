var mongoose  = require('mongoose'),
    moment    = require('moment'),
    _         = require('lodash'),
    config    = require('../config'),
    ObjectId  = mongoose.Types.ObjectId,
    Logger    = require('../libraries/logger'),
    Helpers   = require('../libraries/helpers');

/**
 *  Parse the blacklist
 *  @param   {String} blacklist
 *  @returns {Array}  blacklist
 */
function _parseBlacklist (blacklist) {
  var newArray = [];
  if (typeof blacklist === 'string' && blacklist.indexOf(',') !== -1){
    return blacklist.split(',');
  } else if (typeof blacklist === 'string') {
    newArray.push(blacklist);
    return newArray;
  } else {
    return newArray;
  }
}

/**
 * Parse Sort
 * @param  {String} sort
 * @return {Object}
 */
function _parseSort (sort) {
  // Logger.info('QMid - Parsing Sort...');
  var sortOptions = {},
      sortField = 'createdOn',
      sortType = -1;

  if (sort && typeof sort === "string") {
    sortField = ((sort.substr(0, 1) === '-') ? sort.substr(1) : sort);
    sortType = ((sort.substr(0, 1) === '-') ? -1 : 1);
  } else if (sort) {
    sortField = sort.field;
    sortType = sort.type;
  }

  // Build object and return
  sortOptions[sortField] = sortType;
  return sortOptions;
}

/**
 * Parse Filter
 * @param  {String/Array} filters
 * @return {String}
 */
function _parseFilters (filters) {
  var filter, name;
  // A list of banned filters we do not ever want to allow users to be able
  // to get a password returned in the API response. we need to include space
  // and plus for each one we want to remove, as + should be encoded to %2b as
  // + is considered a space
  var banned = ['password', '+password', ' password'];

  // Logger.info('QMid - Parsing Filters...');
  // If no filters have been passed, return null.
  if (!filters) { return null; }

  var whiteListCount = 0, blackListCount = 0;

  // Convert string to an array
  if ("string" === typeof filters) { filters = filters.split(','); }

  var i = filters.length;
  while (i--) {
    filter = filters[i];
    type   = filter.substr(0, 1);

    // Remove banned filters
    if (banned.indexOf(filter) !== -1) { filters.splice(i, 1); }
    else {
      // Increment the counters
      if (type === '-') blackListCount++;
      else whiteListCount++;
    }

    // Return if there are mixed filters
    if (whiteListCount > 0 && blackListCount > 0) { return ""; }
  }
  return filters.join(" ");
}

/**
 * Parse Page
 * @param  {String} page
 * @return {*}
 */
function _parsePage (page) {
  // Logger.info('QMid - Parsing Page...');
  var defaultPage = 0;
  if (typeof page === "undefined") return defaultPage;

  // Convert to string or indexOf will fail...
  page = String(page);

  var index = page.indexOf('-');
  if (index !== -1) page = page.replace('-', '');

  page = parseInt(page);
  return isNaN(page) ? defaultPage : page;
}

/**
 * Parse Path
 * @param  {String} url
 * @param  {Object} query
 * @return {String}
 */
function _parsePath (url, query) {
  // Logger.info('QMid - Parsing Path...');
  var parts = [];
  for (var key in query) {
    if (query.hasOwnProperty(key) && key !== 'deleted') {
      var k = encodeURIComponent(key);
      // This enables the next/prev links to contain objects for the query we
      // had for this request.
      if (typeof query[key] === 'object') {
        var val = JSON.stringify(query[key]).replace(/"/g, '%22');
        parts.push(k + "=" + val);
      }
      else {
        parts.push(k + '=' + query[key]);
      }
    }
  }
  return url + ((parts.length) ? "?" + parts.join("&") : "");
}

/**
 * Parse Per Page
 * @param  {String} per_page
 * @return {*}
 */
function _parsePerPage (per_page) {
  // Logger.info('QMid - Parsing Per Page...');
  var defaultPerPage = 20;
  if (typeof per_page === "undefined") return defaultPerPage;

  // Convert to string or indexOf will fail...
  per_page = '' + per_page;

  // We need to remove the - from the page_count so we end up with a positive number
  var index = per_page.indexOf('-');
  if (index !== -1) per_page = per_page.replace('-', '');

  per_page = parseInt(per_page);
  return isNaN(per_page) ? defaultPerPage : per_page;
}

/**
 *  Parse populate
 *  @param {Object} populate
 *  @returns {*}
 */
function _parsePopulate (populate) {
  // Logger.info('QMid - Parsing Populate...');
  return (typeof populate !== "undefined") ? populate : '';
}

/**
 * Parse Includes
 * Allows a query to include certain ids.
 * @param  {Object} includes
 * @return {Object}
 */
function _parseIncludes (includes) {
  if (!includes) return includes;
  var includesObj = { $in: [] };

  // Check to see if it's a single value
  if (includes.indexOf(',') === -1) {
    includesObj.$in.push(includes);
    return includesObj;
  }

  // Otherwise parse comma separated values into an array
  includesObj.$in = includes.split(',');
  return includesObj;
}

/**
 * Parse Excludes
 * Allows a query to exclude certain ids.
 * @param  {Object} excludes
 * @return {Object}
 */
function _parseExcludes (excludes) {
  if (!excludes) return excludes;
  var excludesObj = { $nin: [] };

  // Check to see if it's a single value
  if (excludes.indexOf(',') === -1) {
    excludesObj.$nin.push(excludes);
    return excludesObj;
  }

  // Otherwise parse comma separated values into an array
  excludesObj.$nin = excludes.split(',');
  return excludesObj;
}

/**
 * Parse Deleted
 * @param {Boolean} deleted
 * @returns {Object}
 */
function _parseDeleted (deleted) {
  // Logger.info('QMid - Parsing Delete...');
  var defaultDeleted = { '$ne': true };

  if (typeof deleted === "undefined") return defaultDeleted;

  if (Object.prototype.toString.call(deleted) === "[object Object]") {
    defaultDeleted = deleted;
  }

  else if (typeof deleted === "string") {
    if (deleted === "true") {
      defaultDeleted.$ne = false;
    }
  }

  return defaultDeleted;
}

// TODO: Need to test this
/**
 * Parse Query
 * Converts dotted notation properties to objects.
 * @param {Object} query
 * @return {Object}
 */
function _parseQuery (query, key) {
  if (key) query = query[key];
  for (var k in query) {
    if (query.hasOwnProperty(k) && k.indexOf('.') !== -1) {
      _createNestedObject(query, k.split("."), query[k]);
      delete query[k];
    }
  }
  return query;
}

// TODO: Need to test this
/**
 * Create Nested Object
 * @param  {Object} query
 * @param  {Array} keys
 * @param  {*} value
 */
function _createNestedObject (query, keys, value) {
  if (!keys.length) return;
  var key = keys.shift();
  // console.log('key: ', key, 'keys: ', keys, 'value: ', value);
  if (typeof query[key] === "undefined") {
    query[key] = (keys.length) ? {} : value;
  }
  _createNestedObject(query[key], keys, value);
}

/**
 *  TODO: Test this
 *  Converts the query to use regex to search on the
 *  selected fields
 *  @param   {Object} query
 *  @returns {Object} query
 */
function _createRegex (query, blacklist) {
  // We need to ignore some query params...
  var ignored = [
    'deleted',
    'organisation',
    'account',
    'agency',
    'archived',
    'overrideAccess',
    'createdOn',
    'deletedOn',
    'orSearch',
    'campaign',
    'assignee._id',
    'status',
    'appId',
    'expires',
    'contactDetails.address.country'
  ];

  _.merge(ignored, blacklist);

  if (query.regex) delete query.regex;
  if (query.orSearch === 'true') {
    query.$or = [];
  }

  for (var key in query) {
    if (query.hasOwnProperty(key)) {
      if (Helpers.isObject(query[key]) && ignored.indexOf(key) === -1) {
        query[key] = _createRegex(query[key]);
      }

      // Only if the query param is a string do we want to create a RegExp
      // object to search on
      else if (typeof query[key] === 'string' && ignored.indexOf(key) === -1) {
        // Escape special characters
        var value = escapeSpecial(query[key]);

        // Convert strings to $ne booleans
        if (key !== '$ne') {
          if (value === 'false') value = { $ne: true };
          else if (value === 'true') value = { $ne: false };
        }

        var regexValue = (typeof value === 'string') ? new RegExp(value, 'i') : value;

        // Ensure value is still a string before apply regex
        if (query.orSearch === 'true') {
          var searchValue = {};
          searchValue[key] = regexValue;
          query.$or.push(searchValue);
          delete query[key];
        } else {
          query[key] = regexValue;
        }
      }
    }

  }
  // remove the orsearch property
  delete query.orSearch;
  return query;
}

/**
 *  TODO: Test this
 *  Replaces some special characters in a string
 *  @param   {String} str
 *  @returns {String} str
 */
function escapeSpecial (str) {
  return str
    .replace(/\+/g, '\\+') // Changed to \\ from \\\ because of jslint issue
    .replace(/\-/g, '\\-')
    .replace(/\./g, '\\.');
}

/**
 * Clean Query
 * Strips out properties which shouldn't be in the conditions.
 * @param  {Object} query
 */
function _cleanQuery (query) {
  delete query.blacklist;
  delete query.cacheBuster;
  delete query.access_token;
  delete query.filters;
  delete query.sort;
  delete query.populate;
  delete query.page;
  delete query.per_page;
}

/**
 * Add Regex
 * Converts query to add support regex.
 * @param {Object} query
 */
function _addRegex (query) {
  if (typeof query.conditions.regex !== 'undefined') {
    query.parsedConditions = _createRegex(query.parsedConditions, query.blacklist);
    delete query.parsedConditions.regex;
    query.conditions = _createRegex(query.conditions, query.blacklist);
    delete query.conditions.regex;
  }
}

/**
 *  Converts any objects contained within the query string back
 *  into objects (as they come through as strings).
 *  @param {Object} query
 */
function _parseObjects (query) {
  for (var key in query) {
    // Need to check if the value contains a { otherwise we don't want it to
    // try to parse the value
    if (query.hasOwnProperty(key) && typeof query[key] === 'string' &&
      query[key].indexOf('{') !== -1) {
        try {
          query[key] = JSON.parse(query[key]);
        } catch (e) {}
    }
  }
}

/**
 *  Enables the API to deal with $and/$or/$nor queries
 *  @param {Object} req
 *  @param {Object} res
 *  @param {Function} next
 */
function _andOrNor (query) {
  var type = ['$or', '$and', '$nor'];
  for (var i = 0; i < type.length; i++) {
    var key = type[i];
    var check = typeof query[key];
    if (query.hasOwnProperty(key)) {
      try {
        var res = (check === 'string' ? JSON.parse(query[key]) : query[key]);
        query[key] = res.value;
      } catch (e) {}
    }
  }
  return query;
}

/**
 * Middleware
 * @param  {Object}   req
 * @param  {Object}   res
 * @param  {Function} next
 * @return {*}
 */
// Re-named this function so it's more readable in dtrace
function queryMiddleware (req, res, next) {
  // We only want this to run if we're
  // not querying for a single item
  if (!req.query || (req.method.toLowerCase === 'get' && req.params && req.params.id)) {
    return next();
  }

  // Create query object on result
  res.query            = res.query || {};
  res.query.options    = res.query.options || {};
  res.query.pagination = res.query.pagination || {};
  res.query.populate   = res.query.populate || {};
  res.query.conditions = res.query.conditions || {};

  // Parse the query
  res.query.blacklist           = _parseBlacklist(req.query.blacklist);
  res.query.options.sort        = _parseSort(req.query.sort);
  res.query.pagination.page     = _parsePage(req.query.page);
  res.query.pagination.per_page = _parsePerPage(req.query.per_page);
  res.query.filters             = _parseFilters(req.query.filters);
  res.query.populate            = _parsePopulate(req.query.populate);

  // Remove uneeded properties from query
  _cleanQuery(req.query);

  // This will convert query values into objects so we can run better mongodb queries
  _parseObjects(req.query);

  // Copy query into conditions
  res.query.conditions = _andOrNor(Helpers.noRef(req.query));
  delete req.query.deleted;
  res.query.conditions.deleted = _parseDeleted(res.query.conditions.deleted);

  // Only add includes/excludes if we haven't passed an _id
  if (!req.query._id && !req.params.id) {
    // Add includes
    if (req.query.includes && !req.query.excludes) {
      res.query.conditions._id = _parseIncludes(req.query.includes);
    }

    // Add excludes
    if (req.query.excludes && !req.query.includes) {
      res.query.conditions._id = _parseExcludes(req.query.excludes);
    }

    // Remove unneeded properties from query
    delete req.query.includes;
    delete res.query.conditions.includes;
    delete req.query.excludes;
    delete res.query.conditions.excludes;
  }

  // If we have the ID param in the url we are requesting a single object
  if (req.params.id) {
    res.query.conditions._id = req.params.id;
  }

  // Add the path
  res.query.pagination.path = _parsePath((req.path ? req.path() : req.url), req.query);

  // Includes query containing dot notation
  res.query.parsedConditions = _parseQuery(Helpers.noRef(res.query.conditions));

  // Convert values to regex if we've requested to
  _addRegex(res.query);

  // Continue
  return next();
}

/**
 * Query
 * @param  {String} model
 * @return {Function}
 */
function _query (model) {
  // Convert model to lowercase
  model = model.toLowerCase();
  // Return middleware
  return queryMiddleware;
}

/**
 * USAGE
 * -----
 * var query = require('../middleware/query').query;
 * app.get('/users', query('user'), function (req, res) {
 *
 * });
 */
module.exports = {
  _parsePath:       _parsePath,
  _parsePopulate:   _parsePopulate,
  _parseDeleted:    _parseDeleted,
  _parseSort:       _parseSort,
  _parsePage:       _parsePage,
  _parsePerPage:    _parsePerPage,
  _parseFilters:    _parseFilters,
  _middleware:      queryMiddleware,
  query:            _query
};
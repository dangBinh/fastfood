/**
 *  Gets the nested keys
 *  @param {Object} obj
 *  @param {String} key
 *  @param {Array} ignore
 *  @returns {Array}
 */
function get_internal(obj, k, ignore) {
  var keys = Object.keys(obj);
  var k_l = keys.length;
  var value, key;
  for (var i = 0; i < k_l; i++) {
    key = (typeof k !== 'undefined' ? k + '.' + keys[i] : keys[i]);
    if (ignore.indexOf(key) === -1) {
      value = obj[key];
      if (value instanceof Object) {
        get_internal(value, key, ignore);
      } else {
        all_keys[key] = 1;
      }
    }
  }
}

/**
 *  Retrives the list of all keys in an
 *  object
 *  @param {Object} obj
 *  @param {Array} ignore
 *  @returns {Array}
 */
function getKeys(obj, ignore) {
  var ig   = ignore || [];
  all_keys = {};
  get_internal(obj, undefined, ig);
  return Object.keys(all_keys);
}

/**
 *  Returns a nsted value based on the given
 *  string
 *  @param {Object} obj
 *  @param {String} string
 *  @returns {*}
 */
function ref(obj, str) {
  str = str.split(".");
  for (var i = 0; i < str.length; i++) {
    obj = obj[str[i]];
  }
  return obj;
}

/**
 * For use on the getValue function
 * @param  {Object} obj Object to look on
 * @param  {Index} i   [description]
 * @return {[type]}     [description]
 */
function index(obj,i) {
  return obj[i];
}

/**
 * Get the property on a given object.
 * Ie passing 'route.path' as a string will return the contents of the property
 * route.path on the given object. This also works with deep nested items!
 *
 * @param  {String} str Property to find
 * @param  {Object} obj Object to look on
 * @return {Object}     Found property/object or undefined
 */
function getValue (str, obj) {
  var found = str.split('.').reduce(index, obj);
  return found;
}

module.exports = {
  getAllKeys: getKeys,
  getNestedValue: getValue,
  ref: ref
};

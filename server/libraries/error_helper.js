var util = require('util');

/**
 *	Formats errors into more readable things...
 *	@param {Object} err
 */
var ErrorHelper = module.exports = function (err) {

	// If we don't have a mongoose validation error then just return it.
	if (err.name !== 'ValidationError') {
		if (err.message) return err.message;
		else return JSON.stringify(err);
	}

	// More readable messages
	var messages = {
		'required': '%s is required',
		'min': '%s is too short',
		'max': '%s is too long',
		'enum': '%s is not an allowed value',
		'user defined': '%s has already been used'
	};

	// A validation error can contain more than one error
	var errors = [];

	// Loop over the errors object of the validation error
	Object.keys(err.errors).forEach(function (field) {
		var e = err.errors[field];

		// if we don't have message for 'type' just contine
		if (!messages.hasOwnProperty(e.type)) {
			errors.push(e.type);
		}

		// Otherwise use util to format the message
		else {
			errors.push({
				field: e.path,
				message: util.format(messages[e.type], e.path)
			});
		}
	});

	return errors;
};
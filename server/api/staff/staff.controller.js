'use strict';

var models = require('../../models'),
  utils = require('../../components/utils'),
  _ = require('lodash');


/*
  Update staff location
  @param {Integer} staff id
  @param {Float} Latitude
  @param {Float} Longtitude
*/
exports.updateLocation = function(req, res) {
  if (!req.body.id || !req.body.lat || !req.body.lon) {
    return res.json(400, {
      success: false,
      msg: 'Please pass in right data'
    });
  };

  try {
    models.Staffs
      .findOne({
        where: {
          staff_id: req.body.id
        }
      })
      .then(function(staff) {
        if (!staff) {
          return res.json(404, {
            success: false,
            msg: 'Can\'t find the staff '
          });
        }

        models.Staffs.update({
          staff_location: JSON.stringify({
            lat: req.body.lat,
            lon: req.body.lon
          }),
        }, {
          where: {
            staff_id: req.body.id
          }
        }).then(function(result) {
          if (result[0] == 1)
            return res.json(200, {
              sucess: true
            });
          else
            return res.json(422, {
              success: false,
              msg: 'Please double check the input lat lon. '
            });
        });

      });
  } catch (exception) {
    return res.json(500, {
      success: false,
      data: exception
    });
  }

};


/*
  Update staff location
  @param {Integer} staff id
  @param {Interge} Status
*/
var STAFF_STATUS = {
  ACTIVE: 1,
  DELIVERING: 2,
  INACTIVE: 3
};

exports.changeStatus = function(req, res) {
  if (!req.body.id || !req.body.status) {
    return res.json(400, {
      success: false,
      msg: 'Please pass in right data'
    });
  };

  try {
    models.Staffs
      .findOne({
        where: {
          staff_id: req.body.id
        }
      })
      .then(function(staff) {
        if (!staff) {
          return res.json(404, {
            success: false,
            msg: 'Can\'t find the staff '
          });
        }

        models.Staffs.update({
          staff_status: req.body.status,
        }, {
          where: {
            staff_id: req.body.id
          }
        }).then(function(result) {
          if (result[0] == 1)
            return res.json(200, {
              sucess: true
            });
          else
            return res.json(422, {
              success: false,
              msg: 'Please double check the input lat lon. '
            });
        });

      });
  } catch (exception) {
    return res.json(500, {
      success: false,
      data: exception
    });
  }

};


/*
  Get nearest active staff depend on input postcode(EN)
  @param {Float} postcode Easting
  @param {Float} postcode Northing
  @param {Object} nearest driver
*/

exports.getNearest = function(req, res) {
  if (!req.query.E || !req.query.N) {
    return res.json(400, {
      success: false,
      msg: 'Please pass in right data'
    });
  };

  try {

    var easting = parseFloat(req.query.E),
        northing = parseFloat(req.query.N),
        nearestDriver = null,
        nearestDistance = 999999,
        latLon = utils.ENToLatLon(easting, northing);

    // get nearest driver base on order location
    models.Staffs.findAll({
      where: {
        staff_status: STAFF_STATUS.ACTIVE.toString()
      }
    }).then(function(staffs) {
      _.each(staffs, function(staff) {
        var maximumDistance = parseFloat(staff.staff_max_distance);

        // can't find the real staff location
        // we will use staff_postcode to find
        if (!staff.staff_location) {
          loData = utils.extractLocationData(staff.staff_postcode);
          var postcodeEasting = loData['E'],
            postcodeNorthing = loData['N'];
        } else {
          /*
            If we can found latest staff location, need convert it
          */
          staff.staff_location = JSON.parse(staff.staff_location);
          var loData = utils.LLtoNE(staff.staff_location.lat, staff.staff_location.lon)
          var postcodeEasting = loData['E'],
            postcodeNorthing = loData['N'];
          staff.latLon = loData;
        }

        var distance = utils.calcDistanceByNE(northing, postcodeNorthing, easting, postcodeEasting);
        if (distance <= maximumDistance && distance < nearestDistance) {
          nearestDriver = staff;
          nearestDriver.latLon = staff.latLon || utils.ENToLatLon(postcodeEasting, postcodeNorthing);
          nearestDistance = distance;
        }
      });
      
      if (nearestDriver){
        var result = _.pick(nearestDriver, ['staff_id', 'staff_name', 'staff_email', 'staff_postcode', 'staff_phoneno', 'latLon']);
        result.distance = nearestDistance;

        return res.json(200, { success: true, data: result });  
      }else{
        return res.json(404, { success: false, msg: 'Not found any driver near by' });  
      }


    });

  } catch (exception) {
    return res.json(500, {success: false, data: exception});
  }

};
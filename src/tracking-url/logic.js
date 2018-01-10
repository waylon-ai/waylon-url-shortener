'use strict';

var _ = require('lodash'),
    NspError = require('../nsp-error.js'),
    Promise = require('bluebird');

function checkExistence (entity, uuid) {
    if (_.isNull(entity)) {
        throw new NspError(NspError.codes.IDENTITY_NOT_FOUND, 'Identity "' + uuid + '" not found');
    }
}

function checkReadOnlyAttributes (oldEntity, newEntity, attributes) {
    var errors = [];
    attributes.forEach(function (attribute) {
        if (!_.isEqual(oldEntity[attribute], newEntity[attribute])) {
            errors.push('Cannot change read-only property: ' + attribute);
        }
    });
    if (errors.length > 0) {
        throw new NspError(NspError.codes.IDENTITY_UNPROCESSABLE, 'Cannot change read-only properties', errors);
    }
}

function checkUpdate (oldEntity, newEntity) {
    checkReadOnlyAttributes(oldEntity, newEntity, ['uuid', 'organizationId', 'created', 'lastModified']);
}

function Logic (logger, repositoryAdapter) {
    this.ME = 'me';

    this.createTrackingUrl = function (principal, trackingObj) {
        logger.verbose('Logic/createTrackingUrl', { principal, trackingObj });
        return Promise.try(function () {
            var now = new Date();
            trackingObj.created = now;
            trackingObj.lastModified = now;
            trackingObj.trackers = trackingObj.trackers.map(tracker => {
                const trackerId = Math.random()
                    .toString(36)
                    .substring(2, 15);
                return Object.assign({}, tracker, { trackerId });
            });
            return repositoryAdapter.createTrackingUrl(trackingObj);
        }).then(function () {
            console.log(trackingObj)
            return trackingObj;
        });
    };
}

Logic.$inject = ['logger', 'identity.repository-adapter'];

module.exports = Logic;

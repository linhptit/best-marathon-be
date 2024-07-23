'use strict';

/**
 * athlete service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::athlete.athlete');

'use strict';

/**
 * activity-effort controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::activity-effort.activity-effort', ({ strapi }) => ({
  async findByDistance(ctx) {
    // log
    console.log('findByDistance', ctx.query);

    const { distance } = ctx.query;

    if (!distance) {
      return ctx.badRequest('Missing required query parameter: distance');
    }

    const efforts = await strapi.db.query('api::activity-effort.activity-effort').findMany({
      where: { distance },
      populate: {
        activity: {
          populate: {
            athlete: true,
          }
        }
      }
    });

    const formattedEfforts = efforts.map(effort => ({
      time: effort.time,
      activity_strava_id: effort.activity.strava_id,
      activity_title: effort.activity.title,
      athlete_strava_id: effort.activity.athlete.strava_id,
      athlete_name: effort.activity.athlete.name,
      athlete_avatar_url: effort.activity.athlete.avatar_url,
    }));

    ctx.send(formattedEfforts);
  }
}));

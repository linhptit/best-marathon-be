'use strict';

/**
 * athlete controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::athlete.athlete', ({ strapi }) => ({
  async createOrUpdate(ctx) {
    const { strava_id, name, avatar_url, strava_club_id, records } = ctx.request.body;

    // log
    console.log('createOrUpdate', records);

    if (!strava_id || !name || !avatar_url || !strava_club_id ) {
      return ctx.badRequest('Missing required fields: strava_id, name, avatar_url');
    }

    let athlete = await strapi.db.query('api::athlete.athlete').findOne({
      where: { strava_id },
    });

    // Find
    let club = await strapi.db.query('api::club.club').findOne({
      where: { strava_id: strava_club_id },
    });

    if (athlete) {
      // Update existing athlete
      athlete = await strapi.entityService.update('api::athlete.athlete', athlete.id, {
        data: {
          name,
          avatar_url,
          clubs: [club.id], // Keep existing clubs and add the new one
        },
      });
    } else {
      // Create new athlete
      athlete = await strapi.entityService.create('api::athlete.athlete', {
        data: {
          name,
          avatar_url,
          strava_id,
          clubs: [club.id], // Assign the club to the new athlete
        },
      });
    }

    // Process records
    for (const record of records) {
      const { activity_strava_id, distance, time } = record;

      // Check if the activity exists
      let activity = await strapi.db.query('api::activity.activity').findOne({
        where: { strava_id: activity_strava_id },
      });

      if (!activity) {
        // Create a new activity if it doesn't exist
        activity = await strapi.entityService.create('api::activity.activity', {
          data: {
            strava_id: activity_strava_id,
            athlete: athlete.id, // Link the activity to the athlete
            title: 'Strava Activity ' + athlete.name + ' ' + activity_strava_id,
          },
        });
      }

      // Check for unique combination of activity and distance
      const existingEffort = await strapi.db.query('api::activity-effort.activity-effort').findOne({
        where: {
          activity: activity.id,
          distance: distance,
        },
      });

      if (!existingEffort) {
        // Create activity effort if the unique combination doesn't exist
        await strapi.entityService.create('api::activity-effort.activity-effort', {
          data: {
            distance,
            time,
            activity: activity.id, // Link the effort to the activity
            athlete: athlete.id, // Link the effort to the athlete
          },
        });
      }
    }

    ctx.send({ athlete });
  },
  async findAllWithBestTimes(ctx) {
    const { sortDistance } = ctx.query;
    const [sortDistanceKey, sortOrder] = sortDistance ? sortDistance.split(':') : [null, null];

    const athletes = await strapi.db.query('api::athlete.athlete').findMany({
      populate: {
        activity_efforts: {
          populate: {
            activity: true
          }
        }
      }
    });

    const distances = [
      'FOUR_HUNDRED_M',
      'ONE_HALF_MILE',
      'ONE_K',
      'ONE_MILE',
      'TWO_MILE',
      'FIVE_K',
      'TEN_K',
      'FIFTEEN_K',
      'TEN_MILE',
      'TWENTY_K',
      'HALF_MARATHON',
      'MARATHON'
    ];

    const formattedAthletes = athletes.map(athlete => {
      const bestTimes = {};

      distances.forEach(distance => {
        const bestEffort = athlete.activity_efforts
          .filter(effort => effort.distance === distance)
          .sort((a, b) => a.time - b.time)[0];

        if (bestEffort) {
          bestTimes[distance] = bestEffort.time;
        }
      });

      return {
        id: athlete.id,
        name: athlete.name,
        avatar_url: athlete.avatar_url,
        best_times: bestTimes
      };
    });

    // Sort athletes based on the specified distance and order
    if (sortDistanceKey && distances.includes(sortDistanceKey.toUpperCase())) {
      formattedAthletes.sort((a, b) => {
        const timeA = a.best_times[sortDistanceKey.toUpperCase()];
        const timeB = b.best_times[sortDistanceKey.toUpperCase()];

        if (timeA === undefined) return 1;
        if (timeB === undefined) return -1;

        if (sortOrder === 'desc') {
          return timeB - timeA;
        }
        return timeA - timeB;
      });
    }

    ctx.send(formattedAthletes);
  }
}));

'use strict';

module.exports = {
  async afterUpdate(event) {
    const { result } = event;

    // Get the updated activity's isValid value
    const isValid = result.isValid;

    // fetch all related activity-effort entries
    const efforts = await strapi.db.query('api::activity-effort.activity-effort').findMany({
      where: {activity: result.id}
    })

    // Update the related activity-effort entries with the same isValid value
    for (const effort of efforts) {
      await strapi.entityService.update('api::activity-effort.activity-effort', effort.id, {
        data: {
          isValid
        }
      })
    }
  }
};

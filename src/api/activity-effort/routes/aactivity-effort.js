module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/activity-efforts/by-distance',
      handler: 'activity-effort.findByDistance',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};

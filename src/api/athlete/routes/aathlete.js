module.exports = {
  routes: [
    {
      "method": "GET",
      "path": "/athletes/best-times",
      "handler": "athlete.findAllWithBestTimes",
      "config": {
        "policies": []
      }
    },
    {
      method: 'POST',
      path: '/athletes/create-or-update',
      handler: 'athlete.createOrUpdate',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};

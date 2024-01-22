module.exports.permission = {
  project: {
    all: {
      GET: true,
    },
    id: {
      GET: true,
      POST: true,
      PUT: true,
      DELETE: true,
    },
    task: {
      all: {
        GET: true,
      },
      id: {
        GET: true,
        POST: true,
        PUT: true,
        DELETE: true,
      },
    },
    member: {
      all: {
        GET: true,
      },
      id: {
        GET: true,
        POST: true,
        PUT: true,
        DELETE: true,
      },
    },
    label: {
      all: { GET: true },
      id: {
        GET: true,
        POST: true,
        PUT: true,
        DELETE: true,
      },
    },
    status: {
      all: { GET: true },
      id: {
        GET: true,
        POST: true,
        PUT: true,
        DELETE: true,
      },
    },
  },
};

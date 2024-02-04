const indexServices = require("../services/index.services");
const io = require("./socket");

module.exports.socketHelper = {
  pushNotification: async ({
    type = "General",
    content,
    broadcastIds,
    projectId,
    author,
  }) => {
    await indexServices.createNotification({
      type,
      content,
      broadcastIds,
      projectId,
      author,
    });

    io.to(broadcastIds).emit("push-notifications", 1);
  },
};

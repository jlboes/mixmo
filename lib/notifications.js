

Notifications.allow({
  //update: ownsDocument
});

createInfoNotification = function(roomId, player, message) {
    Notifications.insert({
        roomId: roomId,
        userId: player.id,
        message: message,
        users: []
    });

};

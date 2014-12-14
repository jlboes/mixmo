

Notifications.allow({
  //update: ownsDocument
});

createInfoNotification = function(roomId, player, message) {
    console.log("createInfoNotification | room "+roomId+", player : "+player.id+", message : "+message);
    Notifications.insert({
        roomId: roomId,
        userId: player.id,
        message: message,
        users: []
    });

};

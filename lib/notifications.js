

Notifications.allow({
  //update: ownsDocument
});

createInfoNotification = function(roomId, player, message) {
    console.log("-> notification insert "+player.id+", "+message);
    Notifications.insert({
        roomId: roomId,
        userId: player.id,
        message: message,
        read: false
    });
    
};


Notifications.allow({
  //update: ownsDocument
});

createInfoNotification = function(userId, message) {
    console.log("-> notification insert "+userId+", "+message);
    Notifications.insert({
      userId: userId,
      message: message,
      read: false
    });
    
};
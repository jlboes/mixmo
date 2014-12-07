Template.notifications.helpers({
  notifications: function() {
      var room = Rooms.findOne({ "players.id" : Meteor.userId()});
      if(room){
        return Notifications.find({ "roomId": room._id, "userId" : { $not: Meteor.userId()}, "read": false});
      }
      else {
          return null;
      }
  }
});

/*
|------------------------------------------------------------------------------
|   TEMPLATE.EVENTS
|------------------------------------------------------------------------------
*/

Template.notifications.events({
    "click .closebtn":function(event){
        Meteor.call("readNotifications", this._id);
    }
});
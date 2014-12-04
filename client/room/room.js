/*
|------------------------------------------------------------------------------
|   TEMPLATE.HELPERS
|------------------------------------------------------------------------------
*/

Template.entryfield.helpers({
    canShowInput : function(){
        return Meteor.userId() == null;
    },
    rooms : function(){
        return Rooms.find({});
    },
    canDelete : function(){
        return this.host == Meteor.userId();
    },
    inRoom : function(){
        return Rooms.find({ "players.id" : Meteor.userId()}).count();
    },
    room : function(){
        var room = Rooms.findOne({ "players.id" : Meteor.userId()});
        return room;
    },
    canLeave : function (){
        return Rooms.find({ "players" : { $elemMatch: {id: this.id, status : STATUS_WAITING}}}).count();
    },
    ready : function(){
        return Rooms.find({ "players" : { $elemMatch: {id: this.id, status : STATUS_READY}}}).count();
    },
    me : function(){
        return this.id == Meteor.userId();
    },
    canStart: function(){
        // Display "Start Game" btn if all players in room are ready AND current user is host
        var room = Rooms.findOne({ "players.id" : Meteor.userId()});
        return (room.host == Meteor.userId()) && (_.where(room.players, { status: "ready"}).length == room.players.length) && room.players.length>1;
    },
    roomOpen: function(){
        return this.status == ROOM_OPEN;
    }
});



/*
|------------------------------------------------------------------------------
|   TEMPLATE.EVENTS
|------------------------------------------------------------------------------
*/

Template.entryfield.events({
    "click #createRoom":function(event){

        bootbox.prompt("What is the name of the room?", function(result) {
          if (result === null || result.trim().length <1) {
          } else {
            Meteor.call('createRoom', result, function(err, response){


            });
          }
        });
    },
    "click .removeRoomBtn": function(event){
        Rooms.remove(this._id);
    },
    "click .joinBtn":function(event){
        Meteor.call('joinRoom', this._id);
    },
    "click .leaveRoom":function(event){
        var room = Rooms.findOne({ "players.id" : this.id});
        Meteor.call("leaveRoom", room._id);
    },
    "click #startGame": function(event){
        var room = Rooms.findOne({ "players.id" : Meteor.userId()});
        Meteor.call("areYouReady", room._id)
    },
    "click .readyBtn": function(event){
        console.log(this.id);
        var room = Rooms.findOne({ "players.id" : Meteor.userId()});
        Meteor.call("playerReady", room._id);
    }
});
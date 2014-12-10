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
        // Display "Start Game" btn if the following are met :
        // - game is not started yet (status !== ROOM_CLOSED)
        // - current user is host
        // - there are enough players (count == Config.gamePlayerCount)
        // - all players are "ready"
        var room = Rooms.findOne({ "players.id" : Meteor.userId()});
        return room.host == Meteor.userId()
            && (_.where(room.players, { status: "ready"}).length == room.players.length)
            && room.players.length == Config.gamePlayerCount
            && room.status !== ROOM_CLOSED;
    },
    canMixmo: function(){
        // Display "Mixmo !" btn if the following are met :
        // - game is started (--> status "closed" ?)
        // - at least one player has used all currentletters
        var room = Room.getCurrent();
        //return room.letters.length > 0; // Use Only for testing
        if(room && room.currentletters) {
          var myletters = room.currentletters[Meteor.userId()] || [];
          return room.status == ROOM_CLOSED && myletters.length == 0;
        }
        return false;
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
    "click .action-create-room":function(event){

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
    "click .action-start-game": function(event){
        var room = Rooms.findOne({ "players.id" : Meteor.userId()});
        Meteor.call("startGame", room._id)
    },
    "click .action-do-mixmo": function(event){
        var room = Rooms.findOne({ "players.id" : Meteor.userId()});
        Meteor.call("sayMixmo", room._id, Meteor.userId())
    },
    "click .readyBtn": function(event){
        console.log(this.id);
        var room = Rooms.findOne({ "players.id" : Meteor.userId()});
        Meteor.call("playerReady", room._id);
    }
});

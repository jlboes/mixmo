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
        return Rooms.find({ "players" : { $elemMatch: {id: Meteor.userId(), status : STATUS_WAITING}}}).count();
    },
    ready : function(){
        return Rooms.find({ "players" : { $elemMatch: {id: this.id, status : STATUS_READY}}}).count();
    },
    /*me : function(){
        return this.id == Meteor.userId();
    },*/
    canStart: function(){
        // Display "Start Game" btn if the following are met :
        // - game is not started yet (status == ROOM_OPEN)
        // - current user is host
        // - there are enough players (Config.gameMinPlayerCount <=count <= Config.gameMaxPlayerCount)
        // - all players are "ready"
        var room = Rooms.findOne({ "players.id" : Meteor.userId()});
        var nbplayers = room.players.length;
        return room.host == Meteor.userId()
            && (_.where(room.players, { status: "ready"}).length == room.players.length)
            && Config.gameMinPlayerCount <= nbplayers
            && nbplayers <= Config.gameMaxPlayerCount
            && room.status == ROOM_OPEN;
    },
    canMixmo: function(){

        // Display "Mixmo !" btn if the following are met :
        // - game is started (--> status "in_game" ?)
        // - the player has used all currentletters
        // - player grid is valid (no holes)
        // - player words are (Dictionnary checked)
        // - there is no winner yet
        var room = Room.getCurrent();
        var okCurrentletters = false;
        var okGridletters = true;
        var gameIsPending = room && room.status && room.status == ROOM_IN_GAME;
        var noWinnerYet = room && !room.winner;

        if(!gameIsPending) {
          return false
        };

        if(!noWinnerYet) {
          return false;
        }

        if(room && room.currentletters) {
          var myletters = room.currentletters[Meteor.userId()] || [];
          okCurrentletters = myletters.length == 0;
        }
        if(okCurrentletters && room && room.gridletters) {
          var mygridletters = room.gridletters[Meteor.userId()] || [];
          okGridletters = !!Mixmo.isGridValid(mygridletters);
        }
        return gameIsPending && okCurrentletters && okGridletters && noWinnerYet;
    },
    roomOpen: function(){
        return this.status == ROOM_OPEN;
    },
});


Template.game_winner.helpers({
  winnerName : function(){
    if(this._id && this._id == Meteor.userId()){
      return "You";
    } else {
      return this.username;
    }
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
            Meteor.call('createRoom', result, function(err, response){});
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
        var room = Rooms.findOne({ "players.id" : Meteor.userId()});
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
        var room = Rooms.findOne({ "players.id" : Meteor.userId()});
        Meteor.call("playerReady", room._id);
    }
});

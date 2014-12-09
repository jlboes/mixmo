

STATUS_READY = "ready";
STATUS_WAITING = "waiting";

ROOM_OPEN = "open";
ROOM_CLOSED = "closed";

/**
 * Classe Room
 */

Room = function(room){

    this.room = room;

};
/**
 * Méthodes statiques
 */

/**
 * Create a new room pour for a given player
 *
 * @param {int} idPlayer
 * @param {String} name de la salle
 * @returns {Object}|null Room that the player has created
 */
Room.createNewRoom = function(idPlayer, name)
{
    var player = Meteor.users.findOne(idPlayer);

    var doc = Rooms.insert({
        name: name,
        players: [{id: player._id, name: player.username, status: STATUS_WAITING}],
        host: idPlayer,
        status : ROOM_OPEN
    });
    return doc;
};

/**
 * Add player to room
 *
 * @param {int} idPlayer
 * @param {int} idRoom
 */
Room.joinRoom = function(idPlayer, idRoom)
{
  var room = Rooms.findOne(idRoom);
  var player = Meteor.users.findOne(idPlayer);
  if (room && player) {
    Rooms.update(
      room._id,
      {
        $push: {
          players: {id: player._id, name: player.username, status: STATUS_WAITING}
        }
      }
    );
  }
};


Room.leaveRoom = function(idPlayer, idRoom)
{
  var room = Rooms.findOne(idRoom);
  var player = Meteor.users.findOne(idPlayer);
  if (room && player) {
    Rooms.update(
      room._id,
      {
        $pull: {
          players: {id: player._id, name: player.username}
        }
      }
    );
  }
};


Room.playerReady = function(idRoom, idPlayer)
{
    var room = Rooms.findOne({ "players.id" : idPlayer});
    var player = _.findWhere(room.players, {id: idPlayer});
    if (player) {

        player.status = STATUS_READY;
        Rooms.update(
           { _id: idRoom, "players.id": idPlayer },
           { $set: { "players.$.status" : STATUS_READY } }
        );
    }
};

Room.getCurrent = function(){
    console.log("Room.getCurrent() | userId : " + Meteor.userId());
    var result = Rooms.findOne({
      "players.id" : Meteor.userId(),
      "status" : ROOM_CLOSED });
    if(!!result) {
      for(i=0,len=result.players.length; i<len;i++){
        var p = result.players[i];
        if(p.id == Meteor.userId()){
          result.me = p;
          break;
        }
      }
    }
    return result;
}

Room.dispatchLetters = function(idRoom, nb_letters){
    // Some check should be done to allow dispatch
    var mRoom = Rooms.findOne(idRoom);
    var mPlayers = mRoom.players;
    var newPlayers = [];
    var playerLetters = [];
    var roomletters = mRoom.letters || Mixmo.initGameLetters();
    var currentletters = mRoom.currentletters || {};
    for(var i=0,len=mPlayers.length; i<len; i++){
      var j = nb_letters;
      var p = mPlayers[i];
      var pl = currentletters[p.id] || [];
      while(j>0)
      {
        var l = roomletters.pop();
        var e = {value : l};
        pl.push(e);
        j--;
      }
      currentletters[p.id] = pl.slice();
      console.log(" Player " + p.id+" --> " + p.name);
      console.log(currentletters[p.id]);
    }

    Rooms.update(idRoom, {
      $set: {
        "letters" : roomletters,
        "currentletters": currentletters
      }
    });

}

Room.handleMixmo = function(idRoom, idUser){
  console.log("handleMixmo | room " + idRoom);
  // Dispatch 2 letters to each player if it is still possible
  var mRoom = Rooms.findOne(idRoom);
  var mPlayers = mRoom.players;
  var mixmoPlayer = _.findWhere(mPlayers, {id: idUser});
  if(mRoom.letters.length == 0){
    // This is the end of the game
    // So act accordingly
    console.log("handleMixmo | room " + idRoom+" --> end of game !");
  } else if(mRoom.letters.length < 2 * mPlayers.length){
    // Not enough letters to dispatch
    console.log("handleMixmo | room " + idRoom+", error : Not enough letters to dispatch");
    throw new Meteor.Error("invalid-game-state");
  } else {
    console.log("handleMixmo | room " + idRoom+" --> will dispatch.");
    Room.dispatchLetters(idRoom, 2);
    createInfoNotification(idRoom, mixmoPlayer, mixmoPlayer.name+" a fait Mixmo !!");
  }
};

Room.addCurrentLetter = function(idRoom, letter){
  var mRoom = Rooms.findOne(idRoom);
  var newletters = mRoom.currentletters[Meteor.userId()];
  newletters.push({value :letter});

  var newcurrentletters = mRoom.currentletters;
  newcurrentletters[Meteor.userId()] = newletters;

  Rooms.update(idRoom, {
    $set: {
      "currentletters": newcurrentletters
    }
  });
};

Room.removeCurrentLetter = function(idRoom, letter){
  var mRoom = Rooms.findOne(idRoom);
  var newletters = Mixmo.removeLetterValue(mRoom.currentletters[Meteor.userId()], letter);

  var newcurrentletters = mRoom.currentletters;
  newcurrentletters[Meteor.userId()] = newletters;

  Rooms.update(idRoom, {
    $set: {
      "currentletters": newcurrentletters
    }
  });
};

Room.start = function(idRoom){
    Rooms.update(
           { _id: idRoom },
           { $set: { "status" : ROOM_CLOSED } }
        );
    Room.dispatchLetters(idRoom, 6);
}



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
    var result = Rooms.findOne({
      "players.id" : Meteor.userId(),
      "status" : ROOM_CLOSED });
    if(!!result) {
      for(i=0,len=result.players.length; i<len;i++){
        var p = result.players[i];
        if(p.id = Meteor.userId()){
          result.me = p;
          break;
        }
      }
    }
    return result;
}

Room.start = function(idRoom){
    Rooms.update(
           { _id: idRoom },
           { $set: { "status" : ROOM_CLOSED } }
        );
}

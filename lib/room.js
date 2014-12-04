

STATUS_READY = "ready";
STATUS_WAITING = "waiting";

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
        players: [{id: player._id, name: player.username}],
        host: idPlayer,
        gameStart: false
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

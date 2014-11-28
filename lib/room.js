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
        host: idPlayer
    });
    return doc;
};

/**
 * Add player to room
 *
 * @param {int} idPlayer
 * @param {int} idSalle
 */
Room.joinRoom = function(idPlayer, idSalle)
{
  var room = Rooms.findOne(idSalle);
  var player = Meteor.users.findOne(idPlayer);
  if (room && player) {
    Rooms.update(
      room._id,
      {
        $push: {
          players: {id: player._id, name: player.username, host: null}
        }
      }
    );
  }
};

/*
|------------------------------------------------------------------------------
|   USEFUL CONSTANTS/VARS
|------------------------------------------------------------------------------
*/
STATUS_READY    = "ready";
STATUS_WAITING  = "waiting";

ROOM_OPEN       = "open";
ROOM_IN_GAME    = "in_game";
ROOM_CLOSED     = "closed";

GLOBAL_ROOM     = "global_room";

/**
 * Class Room
 */
Room = function(room){
    this.room = room;
};

/*
|------------------------------------------------------------------------------
|   STATIC ROOM METHODS
|------------------------------------------------------------------------------
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
        status : ROOM_OPEN,
        giveup : 0
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

/**
 * Remove player from room
 *
 * @param {int} idPlayer
 * @param {int} idRoom
 */
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

/**
 * Set player as ready in room
 *
 * @param {int} idRoom
 * @param {int} idPlayer
 */
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

/**
 * Return the room where the current player is in
 */
Room.getCurrent = function()
{
    // Current room is always the room where the user is in
    // Otherwise, the user is always pulled out of the room
    return Rooms.findOne({
      "players.id" : Meteor.userId()
    });
}

Room.getCurrentForUser = function(userId)
{
    var roomId = GLOBAL_ROOM;
    var room = Rooms.findOne({
        "players.id" : userId
    });
    if(room != undefined){
        roomId = room._id
    }
    return roomId;
}

Room.getCurrentRoomId = function()
{
    var roomId;
    var room = Room.getCurrent();
    if(room != undefined){
        roomId = room._id
    }
    else{
        roomId = GLOBAL_ROOM;
    }
    return roomId;
}

/**
 * Update each user's gridletters with {nb_letters} new letters taken from 
 * from the available letters of this room/game
 *
 * @param {int} idRoom
 * @param {int} nb_letters
 */
Room.dispatchLetters = function(idRoom, nb_letters)
{
    // Some check should be done to allow dispatch
    var mRoom = Rooms.findOne(idRoom);
    var mPlayers = mRoom.players;
    var newPlayers = [];
    var playerLetters = [];
    var roomletters = mRoom.letters || Mixmo.initGameLetters();
    var currentletters = mRoom.currentletters || {};
    var gridletters = mRoom.gridletters || {};

    for(var i=0,len=mPlayers.length; i<len; i++){
        var j = nb_letters;
        var p = mPlayers[i];
        var pl = currentletters[p.id] || [];
        while(j>0){
            var l = roomletters.pop();
            var e = {value : l};
            pl.push(e);
            j--;
        }
        currentletters[p.id] = pl.slice();
    }

    Rooms.update(idRoom, {
        $set: {
            "letters" : roomletters,
            "currentletters": currentletters,
            "gridletters" : gridletters
        }
    });

}

/**
 * Do what needs to be done when a player hits "Mixmo !"  
 *
 * @param {int} idRoom
 * @param {int} idUser
 */
Room.handleMixmo = function(idRoom, idUser)
{
  // Dispatch 2 letters to each player if it is still possible
  var mRoom = Rooms.findOne(idRoom);
  var mPlayers = mRoom.players;
  var mixmoPlayer;
    if(idUser != null){
        mixmoPlayer = _.findWhere(mPlayers, {id: idUser});
    }
    else{
        mixmoPlayer = {name: "Game Admin"};
    }
  if(mRoom.letters.length < 2 * mPlayers.length){
    // Not enough letters to dispatch --> current user is winner !
    // This is the end of the game
    // So act accordingly
    Rooms.update(idRoom, {
      $set: {
        "winner": Meteor.user(), // find a better way for this since it is redundant with data stored in room.players
        "status" : ROOM_CLOSED
      }
    });
    // Clear unread notifications for this room
    Notifications.remove({ "roomId": idRoom });
  } else {
    Room.dispatchLetters(idRoom, 2);
    createInfoNotification(idRoom, mixmoPlayer, mixmoPlayer.name+" a fait Mixmo !!");
  }
};

/**
 * Moves a current user's  letter from gridletters to currentletters
 *
 * @param {int} idRoom
 * @param {object} letter 
 */
Room.addCurrentLetter = function(idRoom, letter)
{
  var mRoom = Rooms.findOne(idRoom);

  // Update user's currentletters
  var mycurrentletters = mRoom.currentletters[Meteor.userId()] || [];
  mycurrentletters.push({value :letter.value});

  // Update user's gridletters
  var mygridletters = Mixmo.removeLetter(mRoom.gridletters[Meteor.userId()], letter);

  // Finally update room's [current|grid]letters
  var newcurrentletters = mRoom.currentletters;
  newcurrentletters[Meteor.userId()] = mycurrentletters;
  var newgridletters = mRoom.currentletters;
  newgridletters[Meteor.userId()] = mygridletters;
  Rooms.update(idRoom, {
    $set: {
        "currentletters": newcurrentletters,
        "gridletters" : newgridletters
    }
  });
};

/**
 * Moves a current user's  letter from currentletters to gridletters
 * This happens when a user moves a letter on the grid
 *
 * @param {int} idRoom
 * @param {object} letter 
 */
Room.removeCurrentLetter = function(idRoom, letter)
{
  var mRoom = Rooms.findOne(idRoom);

  // Update user's currentletters
  var mycurrentletters = Mixmo.removeLetterValue(mRoom.currentletters[Meteor.userId()], letter.value);

  // Update user's gridletters
  var mygridletters = mRoom.gridletters[Meteor.userId()] || [];
  mygridletters.push(letter);

  // Finally update room's [current|grid]letters
  var newcurrentletters = mRoom.currentletters;
  newcurrentletters[Meteor.userId()] = mycurrentletters;
  var newgridletters = mRoom.gridletters;
  newgridletters[Meteor.userId()] = mygridletters;
  Rooms.update(idRoom, {
    $set: {
      "currentletters": newcurrentletters,
      "gridletters" : newgridletters
    }
  });
};

/**
 * Moves a letter from a corrdinate to another within the grid
 *
 * @param {int} idRoom
 * @param {object} letter 
 * @param {object} newcoords  
 */
Room.moveGridletter =  function(idRoom, letter, newcoords) 
{
  var mRoom = Rooms.findOne(idRoom);

  // Update user's gridletters
  var mygridletters = mRoom.gridletters[Meteor.userId()] || [];
  for(var i=0,len=mygridletters.length;i<len;i++) {
    var item = mygridletters[i];
    if(item.value == letter.value && item.coords.x == letter.coords.x
      && item.coords.y == letter.coords.y) {
        item.coords = newcoords;
        mygridletters[i] = item;
        break;
      }
  }

  // Finally update room's gridletters
  var newgridletters = mRoom.gridletters;
  newgridletters[Meteor.userId()] = mygridletters;
  Rooms.update(idRoom, {
    $set: {
      "gridletters" : newgridletters
    }
  });

};

/**
 * Do what needs to be done when a player/host hits "Start !"
 *
 * @param {int} idRoom
 */
Room.start = function(idRoom)
{
    Rooms.update(
           { _id: idRoom },
           { $set: { "status" : ROOM_IN_GAME } }
        );
    Room.dispatchLetters(idRoom, 6);
}

/**
 * Do what needs to be done when a player/host hits "Reset !"
 *
 * @param {int} idRoom
 */
Room.reset = function(idRoom)
{
  var mRoom = Rooms.findOne(idRoom);
  var userId = Meteor.userId();

  if(mRoom) {

    var updatePlayerStatus = function(value, key, list){
        var res = value;
        res.status = 'waiting';
        return res;
    };
    var updated_players = _.map(mRoom.players, updatePlayerStatus);
    Rooms.update(
    {
        _id: idRoom,
        host : userId,
    },
    {
        $set: {
            "status" : ROOM_OPEN,
            "players" : updated_players,
            "winner" : null,
            "currentletters" : null,
            "gridletters" : null,
            "letters" : null,
            "giveup" : 0
        }
    }
    );
  }
}

Room.giveupIncr = function(idPlayer, idRoom){
    var room = Rooms.findOne(idRoom);
    var giveupCount = room.giveup;
    giveupCount++;
    if(giveupCount == room.players.length){
        giveupCount = 0;
    }
    if (room) {
        Rooms.update(
            {
                _id: idRoom,
            },
            {
                $set: {
                    "giveup" : giveupCount
                }
            }
        );
    }
}

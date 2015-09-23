Meteor.startup(function () {

/**
    var GAME_ROUND_TIME = 300;
    var CLOCK = GAME_ROUND_TIME;

    var timeClock = function() {
        if (CLOCK > 0) {
            CLOCK--;
        }
    };

    Meteor.setInterval(timeClock, 1000)
*/

    /*
    |------------------------------------------------------------------------------
    |   COLLECTIONS AVAILABILITY
    |------------------------------------------------------------------------------
    */
    var Dictionnary = new Meteor.Collection('dictionary');
    var wordService = new WordService(Dictionnary)

    /*
    |------------------------------------------------------------------------------
    |   INDEXES CONFIGURATIONS FOR MIXMO
    |------------------------------------------------------------------------------
    */
    if(Notifications && _.isFunction(Notifications._ensureIndex)) {
        try {
            Notifications._ensureIndex({ "roomId": 1, "userId" : 1});
        } catch (e) {
            console.log("Notifications._ensureIndex() | Error : " + e.message);
        }
    }

    if(Dictionnary && _.isFunction(Dictionnary._ensureIndex)) {
        try {
            Dictionnary._ensureIndex({ "word" : 1}, { "unique" : true });
        } catch (e) {
            console.log("Dictionnary._ensureIndex() | Error : " + e.message);
        }
    }

    /*
    |------------------------------------------------------------------------------
    |   COLLECTIONS PUBLICATIONS
    |------------------------------------------------------------------------------
    */
    Meteor.publish("players", function() {
        return Players.find();
    })
    Meteor.publish("rooms", function() {
        return Rooms.find();
    })

    Meteor.publish('notifications', function() {
        return Notifications.find();
    });

    /*
    |------------------------------------------------------------------------------
    |   MIXMO METEOR METHODS
    |------------------------------------------------------------------------------
    */
    return Meteor.methods({
        /*
        getServerTime: function(){
          return CLOCK;
        },
        */
        giveup: function(){
            var room = Room.getCurrent();
            var giveupCount = room.giveup;
            Room.giveupIncr(Meteor.userId(), room._id);
            giveupCount++;
            if(giveupCount == room.players.length){
                Meteor.call("sayMixmo", room._id,null)
                giveupCount = 0;
            }
            return giveupCount;
        },
        validateWords: function(items){
            return wordService.validateWords(items);
        },
        createRoom: function(name){
            Room.createNewRoom(Meteor.userId(), name);
        },
        joinRoom: function(idRoom){
            Room.joinRoom(Meteor.userId(), idRoom);
        },
        leaveRoom: function(idRoom){
            Room.leaveRoom(Meteor.userId(), idRoom);
        },
        startGame: function(idRoom){
            // CLOCK = GAME_ROUND_TIME
            // Update room status to ROOM_IN_GAME
            // Init game letters in room
            // Give each player 6 letters
            Room.start(idRoom);
        },
        resetGame: function(idRoom){
          // Update room status to ROOM_OPEN
          // Update players' statuses to STATUS_WAITING
          Room.reset(idRoom);
        },
        sayMixmo: function(idRoom, idUser){
            //CLOCK = GAME_ROUND_TIME
            // Check that game is started in room
            // Check that user has used all letters
            // Check that all letters are valid
            Room.handleMixmo(idRoom,idUser);
        },
        addCurrentLetter: function(letter){
            var room = Room.getCurrent();
            var idRoom = room._id;
            // Add letter to user's currentletters in game
            Room.addCurrentLetter(idRoom, letter);
        },
        removeCurrentLetter: function(letter){
            var room = Room.getCurrent();
            var idRoom = room._id;
            // Remove letter from user's currentletters in game
            Room.removeCurrentLetter(idRoom, letter);
        },
        moveGridletter: function(letter, newcoords) {
          var room = Room.getCurrent();
          var idRoom = room._id;
          // Remove letter from user's currentletters in game
          Room.moveGridletter(idRoom, letter, newcoords);
        },
        playerReady: function(idRoom){
            Room.playerReady(idRoom, Meteor.userId());
        },
        /** NOTIFICATIONS **/
        readNotifications: function(idNotif, idPlayer){
            var users =  Notifications.findOne(idNotif).users || [];
            users.push(idPlayer);
            Notifications.update(idNotif, {$set: {users: users}});
        },
        moveGrid: function(idRoom, direction){
            var mRoom = Rooms.findOne(idRoom);
            if(!mRoom || !mRoom.gridletters) {
              return;
            }

            // Generate the right mapping function
            var mapperfunc = function(item, key){ return item; };
            switch(direction){
              case 'left':
                // Decrement coords.x
                mapperfunc = function(item, key){ var nitem = item; nitem.coords.x--; return nitem; };
                break;
              case 'up' :
                // Decrement coords.y
                mapperfunc = function(item, key){ var nitem = item; nitem.coords.y--; return nitem; };
                break;
              case 'right':
                // Increment coords.x
                mapperfunc = function(item, key){ var nitem = item; nitem.coords.x++; return nitem; };
                break;
              case 'down':
                // Increment coords.y
                mapperfunc = function(item, key){ var nitem = item; nitem.coords.y++; return nitem; };
                break;
              default :
                // We will use the default mapper that does nothing
                // .. or better just bailout.
                return;
            }

            // Update user's gridletters
            var myoldgridletters = mRoom.gridletters[Meteor.userId()] || [];
            var mygridletters = _.map(myoldgridletters, mapperfunc);

            // Finally update room's gridletters
            var newgridletters = mRoom.gridletters;
            newgridletters[Meteor.userId()] = mygridletters;
            Rooms.update(idRoom, {
              $set: {
                "gridletters" : newgridletters
              }
            });
        }
    });

});

Meteor.startup(function () {

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
        validateWords: function(items){
            console.log('In validateWords() | params : ["' + items.join('", "') + '"]');
            var testlist = _.filter(items, function(val){ return !!val && val.length > 1; });
            if(testlist) {
                var isNotInDictionary = function(value) {
                    return wordService.validate(value);
                }
                return _.some(testlist, isNotInDictionary);
            }
            return true;
        },
        createRoom: function(name){
            console.info("leaveRoom | name : "+name+", user : " + Meteor.userId());
            Room.createNewRoom(Meteor.userId(), name);
        },
        joinRoom: function(idRoom){
            console.info("joinRoom | room "+idRoom+", user : " + Meteor.userId());
            Room.joinRoom(Meteor.userId(), idRoom);
        },
        leaveRoom: function(idRoom){
            console.info("leaveRoom | room "+idRoom+", user : " + Meteor.userId());
            Room.leaveRoom(Meteor.userId(), idRoom);
        },
        startGame: function(idRoom){
            console.info("startGame | room "+idRoom);
            // Update room status to ROOM_IN_GAME
            // Init game letters in room
            // Give each player 6 letters
            Room.start(idRoom);
        },
        resetGame: function(idRoom){
          console.info("resetGame | room "+idRoom);
          // Update room status to ROOM_OPEN
          // Update players' statuses to STATUS_WAITING
          Room.reset(idRoom);
        },
        sayMixmo: function(idRoom, idUser){
            console.info("sayMixmo | room "+idRoom);
            // Check that game is started in room
            // Check that user has used all letters
            // Check that all letters are valid
            Room.handleMixmo(idRoom,idUser);
        },
        addCurrentLetter: function(letter){
            var room = Room.getCurrent();
            var idRoom = room._id;
            console.info("addCurrentLetter | room "+ idRoom+', letter : ' + letter.value);
            // Add letter to user's currentletters in game
            Room.addCurrentLetter(idRoom, letter);
        },
        removeCurrentLetter: function(letter){
            var room = Room.getCurrent();
            var idRoom = room._id;
            console.info("removeCurrentLetter | room " + idRoom+', letter : ' + letter.value);
            // Remove letter from user's currentletters in game
            Room.removeCurrentLetter(idRoom, letter);
        },
        moveGridletter: function(letter, newcoords) {
          var room = Room.getCurrent();
          var idRoom = room._id;
          console.info("moveGridletter | room " + idRoom+', letter : ' + letter.value);
          // Remove letter from user's currentletters in game
          Room.moveGridletter(idRoom, letter, newcoords);
        },
        playerReady: function(idRoom){
            Room.playerReady(idRoom, Meteor.userId());
        },
        /** NOTIFICATIONS **/
        readNotifications: function(idNotif, idPlayer){
            console.log("readNotifications | idNotif : " +idNotif+", idPlayer : "+idPlayer);
            var users =  Notifications.findOne(idNotif).users || [];
            users.push(idPlayer);
            Notifications.update(idNotif, {$set: {users: users}});
        },
        moveGrid: function(idRoom, direction){
            console.log("moveGrid() | idRoom : "+idRoom+", direction : " + direction);
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

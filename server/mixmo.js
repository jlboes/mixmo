Meteor.startup(function () {
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


    /*
    |------------------------------------------------------------------------------
    |   COLLECTIONS AVAILABILITY
    |------------------------------------------------------------------------------
    */
    var Dictionnary = new Meteor.Collection('dictionary');

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
            for(var i = 0, len = items.length; i < len; i++) {
              console.log('items['+i+'] : ' + items[i]);
              var myword = items[i];
              if(myword.length > 1){
                var dicword = Dictionnary.findOne({ word: myword.toLowerCase()});
                if(!dicword){
                    console.log("Invalid word : " + myword);
                    return false;
                }
              }
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
        }
    });

});

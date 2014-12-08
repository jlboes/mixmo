Meteor.startup(function () {
// code to run on server at startup

    var Dictionnary = new Meteor.Collection('dictionary');

    var alphabet = Mixmo.initGameLetters();

    Meteor.publish("players", function() {
        return Players.find();
    })
    Meteor.publish("rooms", function() {
        return Rooms.find();
    })

    return Meteor.methods({
        getTwoLetters: function(playerName){
            // check if pool is not empty
            // if empty game over else
            Players.find().forEach(function (player) {
                // get random letter && remove letter from pool

                if( alphabet.length>1){
                    //CurrentWord.insert({player: player.login, letter: alphabet.pop(), time: Date.now()});
                    //CurrentWord.insert({player: player.login, letter: alphabet.pop(), time: Date.now()});
                }
            });
            //else game over
            return null;
        },
        validateWords: function(wordTotTest1, wordTotTest2){

            for(var i = 0, len = items.length; i < len; i++) {
              var word = Dictionnary.findOne({ word:items[i]});
              if(!word){
                  return false;
              }
            }

            return true;
        },
        restart : function() {
            alphabet = createGameLetters();
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
            // Close room --> status "closed"
            // Init game letters in room
            // Give each player 6 letters
            Room.start(idRoom);
        },
        playerReady: function(idRoom){
            console.info("playerReady | room "+idRoom+", user : " + Meteor.userId());
            Room.playerReady(idRoom, Meteor.userId());
        }
    });

});

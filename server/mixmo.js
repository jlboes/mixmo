function createGameLetters(){
    /**** Constitution du tableau de lettres ****/
    // Préparation des lettres
    var alphabet = "aaaaaaaaaa"
      +"bbcccdddd"+
      "eeeeeeeeeeeeeeeee"+
      "ffggghhhiiiiiiiii"+
      "jjkllllllmmmnnnnnnn"+
      "oooooooopppqqrrrrrr"+
      "ssssssstttttttuuuuuuvvv"+
      "wxyz**$";
    // Conversion en tableau
    alphabet = alphabet.split("");
    // Mélange les lettres
    shuffle(alphabet);
    return alphabet;
}


function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}


Meteor.startup(function () {
// code to run on server at startup

    var Dictionnary = new Meteor.Collection('dictionary');

    var alphabet = createGameLetters();

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
            var chars_per_player = 6; // Number of letters for this time
            var mRoom = Rooms.findOne(idRoom);
            var mPlayers = mRoom.players;
            var newPlayers = [];
            var roomLetters = createGameLetters();
            for(var i=0,len=mPlayers.length; i<len; i++){
              console.log(" For loop i --> " +i);              
              var playerLetters = [];
              for(var j=0;i<chars_per_player;j++){
                playerLetters.push({value : roomLetters.pop()});
              }
              console.log(playerLetters);
              var player = mPlayers[i];
              console.log(player);
              player.myletters = playerLetters;
              newPlayers.push(player);
            }
            Rooms.update(idRoom, {
              $set: {
                "status"  : ROOM_CLOSED,
                "letters" : roomLetters,
                "players" : newPlayers
              }
            });
        },
        playerReady: function(idRoom){
            console.info("playerReady | room "+idRoom);
            Room.playerReady(idRoom, Meteor.userId());
        }
    });

});

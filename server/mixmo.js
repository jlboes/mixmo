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
    CurrentWord.remove({});

    var Dictionnary = new Meteor.Collection('dictionary');

    var alphabet = createGameLetters();


    Meteor.publish("letters", function(playerName) {
        return CurrentWord.find({player: playerName});
    })

    Meteor.publish("players", function() {
        return Players.find();
    })
    Meteor.publish("rooms", function() {
        return Rooms.find();
    })


    return Meteor.methods({
        clearCurrentWord: function () {
    	    return CurrentWord.remove({});
    	},
        getTwoLetters: function(playerName){
            // check if pool is not empty
            // if empty game over else
            Players.find().forEach(function (player) {
                // get random letter && remove letter from pool
           
                if( alphabet.length>1){
                    CurrentWord.insert({player: player.login, letter: alphabet.pop(), time: Date.now()});
                    CurrentWord.insert({player: player.login, letter: alphabet.pop(), time: Date.now()});
                }
            });
            //else game over
            return null;
        },
        isWordValid: function(wordTotTest1, wordTotTest2){

            var status = false;
            if(wordTotTest1.length>1)
            {

                var doc = Dictionnary.findOne({word:wordTotTest1});
                if(doc!= undefined)
                {
                    status = true;
                }
            } else{
                status = true;
            }

            var status2 = false;
            if(wordTotTest2.length>1)
            {

                var doc = Dictionnary.findOne({word:wordTotTest2});
                if(doc!= undefined)
                {
                    status2 = true;
                }
            } else{
                status2 = true;
            }

            return status && status2;
        },
        addPlayer : function(name) {
            Players.update({
                login: name
            }, {
                $set: {
                    time: Date.now()
                }
            }, {
                multi: false,
                upsert: true
            });
        },
        restart : function() {
            alphabet = createGameLetters();
        },
        createRoom: function(name){
            Room.createNewRoom(Meteor.userId(), name);
        },
        joinRoom: function(idRoom){
            Room.joinRoom(Meteor.userId(), idRoom);
        },
        leaveRoom: function(idRoom){
            Room.leaveRoom(Meteor.userId(), idRoom);
        }
    });

});


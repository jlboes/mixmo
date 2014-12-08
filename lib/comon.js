/*
|------------------------------------------------------------------------------
|   REACTIVE VARS
|------------------------------------------------------------------------------
*/
Players = new Meteor.Collection('players');

// Define if currently in game
inGame = new Blaze.ReactiveVar(false);

//Room Collection
Rooms = new Meteor.Collection('rooms');
Notifications = new Meteor.Collection('notifications');

/*
|------------------------------------------------------------------------------
|   UTILS
|------------------------------------------------------------------------------
*/

Mixmo = function(){
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
          array[i] = uc(array[j]);
          array[j] = uc(temp);
      }
      return array;
  }

  function uc(word){
    return word.toUpperCase() || word;
  }

  return {
    initGameLetters : createGameLetters,
    shuffle : shuffle
  };
}();

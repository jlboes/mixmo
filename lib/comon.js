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
  function createGameLetters()
  {
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


  function shuffle(array)
  {
      for (var i = array.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var temp = array[i];
          array[i] = uc(array[j]);
          array[j] = uc(temp);
      }
      return array;
  }

  function uc(word)
  {
    return word.toUpperCase() || word;
  }

  function removeLetterValue(myarray, letter)
  {
    for(var i=0, len = myarray.length;i<len; i++){
      var item = myarray[i];
      if(item.value.toUpperCase == letter.toUpperCase){
        myarray.splice(i, 1);
        break;
      }
    }
    return myarray;
  }

  return {
    initGameLetters : createGameLetters,
    shuffle : shuffle,
    removeLetterValue : removeLetterValue
  };
}();

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
|   CONFIGURATION
|------------------------------------------------------------------------------
*/
// This should be on settings
// But let's keep it here for now
Config = {
  playgroundColumnCount : 40,
  playgroundLineCount : 40,
  gamePlayerCount : 2
};

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
      if(item.value.toUpperCase() == letter.toUpperCase()){
        myarray.splice(i, 1);
        break;
      }
    }
    return myarray;
  }

  function removeLetter(myarray, letter)
  {
    if(letter.value && letter.coords) {
      for(var i=0, len = myarray.length;i<len; i++){
        var item = myarray[i];
        if(item.coords){
          if((item.value.toUpperCase() == letter.toUpperCase())
              && item.coords.x ==  letter.coords.x
              && item.coords.y ==  letter.coords.y
              ) {
            myarray.splice(i, 1);
            break;
          }
        }
      }
    }
    return myarray;
  }

  function getSurroundingCoords(letter) {
    var neighboors = [];
    console.log(letter.coords);
    // 1) Special cases are edge cases ;) !
    // top cell
    var new_y = parseInt(letter.coords.y) - 1;
    if(new_y >= 1) {
      neighboors.push({x:letter.coords.x, y:new_y});
    }

    // bottom cell
    var new_y = parseInt(letter.coords.y) + 1;
    if(new_y <= Config.playgroundLineCount) {
      neighboors.push({x:letter.coords.x, y:new_y});
    }

    // left cell
    var new_x = parseInt(letter.coords.x) - 1;
    if(new_x >= 1) {
      neighboors.push({x:new_x, y:letter.coords.y});
    }

    // right cell
    var new_x = parseInt(letter.coords.x) + 1;
    if(new_x <= Config.playgroundColumnCount) {
      neighboors.push({x:new_x, y:letter.coords.y});
    }
    console.log(neighboors);

    return neighboors;
  }

  return {
    initGameLetters : createGameLetters,
    shuffle : shuffle,
    removeLetter : removeLetter,
    removeLetterValue : removeLetterValue,
    getSurroundingCoords : getSurroundingCoords
  };
}();

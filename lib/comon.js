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
  gameMinPlayerCount : 2,
  gameMaxPlayerCount : 6
};

Meteor.log.setDebugLevel('warn');

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

  function check_grid(grid, letter) // { value : 'X', coords : {x : 2, y : 3})}
  {
    // Rechercher voisins
    var myfilter = function(item){
      return (item.coords.x == letter.coords.x && item.coords.y == parseInt(letter.coords.y) + 1)
        || (item.coords.x == letter.coords.x && item.coords.y == parseInt(letter.coords.y)-1)
        || (item.coords.x == parseInt(letter.coords.x)+1 && item.coords.y == letter.coords.y)
        || (item.coords.x == parseInt(letter.coords.x)-1 && item.coords.y == letter.coords.y);
    };

    var voisins = _.filter(grid, myfilter);
    //Meteor.log.debug("--> Voisins list ===");
    //Meteor.log.debug(voisins);

    // Retirer letter de gridletters
    var newgrid = _.reject(grid, function(item){
        return item.coords.x == letter.coords.x && item.coords.y == letter.coords.y;
      });

    //Meteor.log.debug("--> newgrid (after reject)===");
    //Meteor.log.debug(newgrid);

    for(var i = 0,len=voisins.length;i<len;i++) {
      newgrid = check_grid(newgrid, voisins[i]);
    }

    return newgrid;

  }

  function isGridValid(grid)
  {
    Meteor.log.debug("In isGridValid()");
    if(grid.length) {
      var newgrid = check_grid(grid, grid[0]);
      return newgrid.length == 0;
    }
    return false;
  }

  return {
    initGameLetters : createGameLetters,
    shuffle : shuffle,
    removeLetter : removeLetter,
    removeLetterValue : removeLetterValue,
    isGridValid : isGridValid
  };
}();

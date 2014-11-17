Players = new Meteor.Collection('players');
Rows = new Meteor.Collection('rows');
Words = new Meteor.Collection('cols');
//define letter avaible
CurrentWord = new Meteor.Collection('word');

Alignment = "H";

if (Meteor.isClient) {

    function isGridValid(event, ui){
        var item = $(ui.item);
        var sender = $(ui.sender);

        var vWord = getVword(item);
        var hWord = getHword(item);

    }

    function getVword(item){
        var vWord = "";
        var cellIndex = item.index();

        var prevTr = item.parent().prev('tr');
        var letter = prevTr.find('td').eq(cellIndex).html();

        var safety = true;
        var safetyInc = 60;
        while((letter!= "" && letter!= undefined) && safety){
            //console.log('html : '+letter);
            vWord = letter + vWord;
            
            prevTr = prevTr.prev('tr');
            letter = prevTr.find('td').eq(cellIndex).html();
            safetyInc--;
            if(safetyInc < 0){
                console.error("safety break 1");
                safety = false;
            }
        }
        
        vWord = vWord + item.html();

        var nextTr = item.parent().next('tr');
        letter = nextTr.find('td').eq(cellIndex).html();

        safety = true;
        safetyInc = 60;
        while((letter!= "" && letter!= undefined) && safety){
            vWord = vWord+letter;

            nextTr = nextTr.next('tr');
            letter = nextTr.find('td').eq(cellIndex).html();

            safetyInc--;
            if(safetyInc < 0){
                console.error("safety break 2");
                safety = false;
            }
        }

        console.log("vWord : "+vWord);
        return vWord;
    }

    function getHword(item){
        var hWord = "";
        var prevTd = item.prev('td');
        while(prevTd.html()!=""){
             hWord = prevTd.html() + hWord;
            prevTd = prevTd.prev('td');
        }
        hWord = hWord + item.html();
        var nextTd = item.next('td');
        while(nextTd.html()!=""){ 
            hWord = hWord + nextTd.html();
            nextTd = nextTd.next('td');
        }
        console.log('h word : '+hWord);
        return hWord;
    }

  // counter starts at 0
  Session.setDefault("counter", 0);

    Template.players.players = function(){
        return Players.find({}, { sort: { time: -1 }});
    }

    Template.playground.rows = function(){
        return Words.find({}, { sort: { time: -1 }});
    }


    Template.currentWordTable.currentWord = function(){
        return CurrentWord.find({player: Session.get("playerName")}) ;
    }

    Template.currentWordTable.rendered = function(){ 
    }

    Template.playground.rendered = function(){
        /*** RENDER MAX GRID ***/
        var tbody = jQuery('tbody');
        
        for(var i=0; i<60; i++){
            var tds = jQuery('<tr>').addClass('gridTableTr connectedSortable')
            for(var j=0; j<60; j++){
                tds.append('<td>');
            }

            tbody.append(tds);
        }
        /*** END RENDER MAX GRID ***/

        // Make the grid sortable
        jQuery( "#gridTable .connectedSortable" ).sortable({
                items: "td", 
                connectWith: ".connectedSortable", 
                placeholder: "active",   
                stop: function(event, ui) {
                        isGridValid(event, ui);
                }
            }).disableSelection();

    }

	// EVENTS

    Template.entryfield.events = {
	    "keydown #name": function(event){
		    if(event.which == 13){
                var name = document.getElementById('name');
			    // Submit the form
			    if(name.value != ''){
				    Players.insert({
					    login: name.value,
					    time: Date.now()
				    });
                    Session.set("playerName", name.value);
                    console.log('New player');
                    /*Meteor.call('getTwoLetters',Session.get("playerName"), function(err, response) {
        			    console.log('got new letters');
                        jQuery( "#currentWordTable" ).sortable({items: "td", connectWith: ".connectedSortable"});
                    });*/
			        name.value = '';
				}
			}
		}
	}

    Template.wordInput.events = {
	    "click #mixmo":function(event){
            Meteor.call('getTwoLetters',Session.get("playerName"), function(err, response) {
                console.log('got new letters');
                jQuery( "#currentWordTable" ).sortable({
                    items: "td",
                    connectWith: ".connectedSortable",
                    stop: function(event, ui) {
                        isGridValid(event, ui);
                    }
                }).disableSelection();
            });
        }
	}

    Template.players.events = ({
        "click .playerList": function(event){
            console.log("remove "+this._id);
            Players.remove(this._id);
        }
    });

    Template.currentWordTable.events({
        'mousedown table': function(){
           
        },
        'mousepress':function(){
        }

    });
    

    Template.playground.events({
        
    });

    Template.body.events({
        'mouseup': function(){ 
            console.log('mouse up'); 
        }
    });
 
    Meteor.autorun(function() {
        Meteor.subscribe("letters", Session.get("playerName"));
        Meteor.subscribe("players");
    });
    

}

if (Meteor.isServer) {
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
    Rows.remove({});
    Words.remove({});
    CurrentWord.remove({});

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


    Meteor.publish("letters", function(playerName) {
        return CurrentWord.find({player: playerName});
    })

    Meteor.publish("players", function() {
        return Players.find();
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
        } 
    });
  });
}


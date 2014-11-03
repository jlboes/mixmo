Players = new Meteor.Collection('players');
Rows = new Meteor.Collection('rows');
Words = new Meteor.Collection('cols');
//define letter avaible
CurrentWord = new Meteor.Collection('word');

Alignment = "H";

if (Meteor.isClient) {
    
    function updateGrid(maxHword, currentWordSize){
        jQuery("#gridTable .currentwordTds").each(function(){
            jQuery(this).parent('tr').removeClass('tmp');
        });
        jQuery('.tmp').remove();
            
        var size = CurrentWord.find().count()/2;
        for(var i=0; i<=size; i++){
            // Create row at the bottom 
            var rowBottom = jQuery('#gridTable').find('tbody')
                .append(jQuery('<tr>').addClass('gridTableTr connectedSortable tmp')
                        .append(jQuery("<td>").addClass('tmp')));

            // Create row et the top
            var rowTop = jQuery('#gridTable').find('tr').first()
                .before(jQuery('<tr>').addClass('gridTableTr connectedSortable tmp')
                        .append(jQuery("<td>").addClass('tmp')));
        }

        
        // Add potential max width to all rows
        var nbCellsToAdd = currentWordSize;
        var trs = jQuery('#gridTable tr');
        trs.each(function(){
            var tmpLength = jQuery(this).find('td').length;
            if(nbCellsToAdd<tmpLength){
                nbCellsToAdd = tmpLength;
            }
        });

       
        // For each line add cells
        trs.each(function(){
            console.log('tmpCells '+nbCellsToAdd+' length '+jQuery(this).find('td').length);
            var cells = (nbCellsToAdd - jQuery(this).find('td').length/2)/2;
            console.log('cells : '+cells);
            for($i =0; $i<cells; $i++){
                jQuery(this).find('td:last').after(jQuery("<td>").addClass('tmp'));
                //jQuery(this).find('td:first').before(jQuery("<td>").addClass('tmp'));
                jQuery(this).find('td').first().before(jQuery("<td>").addClass('tmp'));
            }
        });
        

        jQuery( "#gridTable .connectedSortable" ).sortable({
                items: "td", 
                connectWith: ".connectedSortable", 
                placeholder: "active",   
            }).disableSelection();
        
    }

    function isGridValid(){
        var trs = jQuery('#gridTable tr');
        var tmpWords = array();
        // pour chaque ligne
        trs.each(function(){
            var tmpWords = array();
            jQuery(this).find('td').each(function(){
                //get inline Word
                if(jQuery(this).hasClass('currentwordTds')){
                    console.log(jQuery(this).id());
                }

            });
            // if tmp is valid add valid 
        });

        // pour chaque col

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
            // if grid is valid
            
            

            Meteor.call('getTwoLetters',Session.get("playerName"), function(err, response) {
                console.log('got new letters');
                updateGrid(1,1);
                jQuery( "#currentWordTable" ).sortable({items: "td", connectWith: ".connectedSortable"}).disableSelection();
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
        'mouseover td': function (event) { 
            var wordToMove = document.getElementsByClassName('currentwordTds');
            //this == object letter under cursor 
            // disable color
            var table = document.getElementById('gridTable');
            var cells = jQuery("#gridTable td");
            //cells.removeClass('active');
            // add classe to selected td
            var hoverTd = event.currentTarget;
            //hoverTd.className = "active";
            console.log('clicked');
            

        },
        'mousedown table': function(){
            
        },
    });

    Template.body.events({
        'mouseup': function(){ 
            console.log('mouse up'); 
        }
    });
 
    Meteor.autorun(function() {
        Meteor.subscribe("letters", Session.get("playerName"));
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


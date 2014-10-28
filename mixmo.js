Players = new Meteor.Collection('players');
Rows = new Meteor.Collection('rows');
Words = new Meteor.Collection('cols');
//define letter avaible
CurrentWord = new Meteor.Collection('word');

Alignment = "H";

if (Meteor.isClient) {
    
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
        jQuery( "#currentwordTR td" ).sortable();
    }

    Template.playground.rendered = function(){
        jQuery( ".gridTableTr" ).droppable({
                drop: function( event, ui ) {
                    console.log('dropped');
                }
        });
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
                    Meteor.call('getTwoLetters',Session.get("playerName"), function(err, response) {
        			    console.log('got new letters');
                        jQuery( "#currentWordTable" ).sortable({items: "td", connectWith: ".connectedSortable"});
                    });
			        name.value = '';
				}
			}
		}
	}

    Template.wordInput.events = {
	    "keydown #wordIn": function(event){
            var input = document.getElementById('wordIn');
		    if(event.which == 13){
                // Submit the form
			    if(input.value != ''){
				    var tab = CurrentWord.find().fetch();
                    Words.insert({
					    word: tab,
                        alignment: "H",
					    time: Date.now()
				    });
                    console.log('Current word set');
			        input.value = '';
                    Meteor.call('clearCurrentWord', function(err, response) {
            			console.log('CurrentWord cleared');
            		});
				}
			}
            else if(event.which == 8){
                // remove last letter
                var letter = CurrentWord.findOne({}, { sort: { index: -1 }});
                if(letter != undefined){
                    CurrentWord.remove(letter._id);
                }
            }
            else{
                var letter = String.fromCharCode(event.which);
                CurrentWord.insert({
                        letter: letter,
                        time: Date.now()
                 });
                jQuery( "#currentWordTable" ).sortable({items: "td", connectWith: ".connectedSortable"});
                jQuery( "#gridTable" ).sortable({items: "td", connectWith: ".connectedSortable"});
               
            }
        },
        "click #wordInAlignment":function(event){
            if(Alignment == "H"){
                Alignment = "V";
            } else {
                Alignment = "H";
            }
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
            
            // get potential grid size
            // CurrentWord size
            var currentWordSize = CurrentWord.find().count();
            // biggest H word
            var maxHword = 0;
            // biggest V word
            var maxVword = 0;
            Words.find().forEach(function(wordObj){
                if(wordObj.word.length>maxHword){
                    maxHword = wordObj.word.length;
                }
            });
            
            // potential height
            //            //
            // max H size = CurrentWord size + max H size
            //
            // if word is H add two rows of max size top/bottom
            //              complete others rows with missing tds

            var table = document.getElementById('gridTable');

            //Creating two rows (botton/top) with the same size as the current grid
            var rowTop = table.insertRow(0);
            rowTop.className="tmp";
            var rowBottom = table.insertRow(-1);
            rowBottom.className="tmp";

            for (var i = 0; i < maxHword; i++) {
                var cell = rowTop.insertCell(0);
                cell.className="tmp";
                var cell = rowBottom.insertCell(0);
                cell.className="tmp";
            }

            // Add potential max width to all rows
            var nbCellsToAdd = currentWordSize;
            var trs = jQuery('#gridTable tr');
            trs.each(function(){
                for($i =0; $i<currentWordSize; $i++){
                    jQuery(this).append(jQuery("<td>").addClass('tmp'));
                    jQuery(this).prepend(jQuery("<td>").addClass('tmp'));
                }
            });
            jQuery( ".gridTableTr" ).sortable({items: "td", connectWith: ".connectedSortable"});

            console.log('-END-');
        },
        'mousepress':function(){
            console.log('*-*-*-*-*-*-*');
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
            

        }
    });

    Template.body.events({
        'mouseup': function(){ 
            jQuery(".tmp").remove();
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

   
    var alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
    shuffle(alphabet);
    console.log(alphabet);
    

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
            // get random letter && remove letter from pool
           
            if( alphabet.length>1){
                CurrentWord.insert({player: playerName, letter: alphabet.pop(), time: Date.now()});
                CurrentWord.insert({player: playerName, letter: alphabet.pop(), time: Date.now()});
            }
            //else game over
            return null;
        } 
    });
  });
}


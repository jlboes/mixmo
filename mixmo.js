Players = new Meteor.Collection('players');
Rows = new Meteor.Collection('rows');
Words = new Meteor.Collection('cols');
CurrentWord = new Meteor.Collection('word');
Alignment = "H";

if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault("counter", 0);

    Template.players.players = function(){
        return Players.find({}, { sort: { time: -1 }});
    }

    Template.playground.rows = function(){
       /* var cols =  Words.find({}, { sort: { index: -1 }});
        console.log('count : '+cols.count());
        var count = 0
        cols.forEach(function (col) {
            console.log("Title of post " + count + ": " + col.mot);
            count += 1;
        });
        return cols;*/
        return Words.find({}, { sort: { time: -1 }});
        // return Rows.find({}, { sort: { time: -1 }});

    }


    Template.currentWordTable.currentWord = function(){
                return CurrentWord.find() ;
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
                    console.log('New player');
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
                 })
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
            var trs = table.getElementsByTagName('tr');
            for(tr in trs){
                for($i =0; $i<currentWordSize; $i++){
                    var cell = trs[tr].insertCell(0);
                    cell.className="tmp";
                }
                for($i =0; $i<currentWordSize; $i++){
                    var cell = trs[tr].insertCell(-1);
                    cell.className="tmp";
                }

            }
            console.log('-END-');
            // jQuery( "#currentwordTR td" ).draggable();
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
            var cells = table.getElementsByTagName("td"); 
            for (var i = 0; i < cells.length; i++) { 
                cells[i].className = ""; 
            }
            // add classe to selected td
            var hoverTd = event.currentTarget;
            hoverTd.className = "active";
            console.log('clicked');
            

        }
    });

    Template.body.events({
        'mouseup': function(){
            var table = document.getElementById('gridTable');
            var tmps = document.getElementsByClassName('tmp');
            var len = tmps.length;
            while(tmps[0]) {
                tmps[0].parentNode.removeChild(tmps[0]);
            }
        }
    });
 


}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    Rows.remove({});
    Words.remove({});
    CurrentWord.remove({});

    return Meteor.methods({
        clearCurrentWord: function () {
		    return CurrentWord.remove({});
	  }
    });
  });
}

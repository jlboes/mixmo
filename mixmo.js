Players = new Meteor.Collection('players');
Rows = new Meteor.Collection('rows');
Cols = new Meteor.Collection('cols');

if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault("counter", 0);

    Template.players.players = function(){
        return Players.find({}, { sort: { time: -1 }});
    }

    Template.playground.rows = function(){
        var cols =  Cols.find({}, { sort: { index: -1 }});
        console.log('count : '+cols.count());
        var count = 0
        cols.forEach(function (col) {
            console.log("Title of post " + count + ": " + col.mot);
            count += 1;
        });
        return cols;
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

			        name.value = '';
				}
			}
		}
	}

    Template.players.events = ({
        "click .playerList": function(event){
            console.log("remove "+this._id);
            Players.remove(this._id);
        }
    });

    Template.playground.events({
        'click td': function (event) { 
            console.log('clicked');
        }

    });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}

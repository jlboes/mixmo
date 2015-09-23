Meteor.autorun(function() {
    Meteor.subscribe("players");
    Meteor.subscribe("rooms");
    Meteor.subscribe('notifications');
});

var gridService = new GridService();

var chatCollection = new Meteor.Collection(null); // local only collection for chat messagess
Session.set("hasGiveup", false);

/*
|------------------------------------------------------------------------------
|   UTILS
|------------------------------------------------------------------------------
*/
function validateGrid(jqel, prev){
    var item = jqel;

    var vWordTds = gridService.getVwordTds(item);
    var hWordTds = gridService.getHwordTds(item);

    var vWord = gridService.getWord(vWordTds);
    var hWord = gridService.getWord(hWordTds);

    console.log("vWord : "+vWord);
    console.log("hWord : "+hWord);

    var valid = true;

    Meteor.call('validateWords', [hWord, vWord], function(err, valid) {
        if(valid == "true" || valid == true){
            gridService.markValidWord(vWordTds);
            gridService.markValidWord(hWordTds);
        } else {
            gridService.markNotValidWord(vWordTds);
            gridService.markNotValidWord(hWordTds);
        }

        // remove class from previous slot (where the has been moved from)
        if(prev){
          prev.removeClass('valid').removeClass('notValid');
        }
    });

}


function checkGridActions() {
    var canMove = false;

    var map = {
      'left' : 'td.letter[data-letter][data-x="1"]',
      'up' : 'td.letter[data-letter][data-y="1"]',
      'right' : 'td.letter[data-letter][data-x="'+Config.playgroundColumnCount+'"]',
      'down' : 'td.letter[data-letter][data-y="'+Config.playgroundLineCount+'"]'
    };
    
    var checker = function(selector, move) {
        var canMove = jQuery(selector).length === 0;
        var triggers = jQuery('.action-grid-move[data-direction="'+move+'"]');
        if(triggers.length) {
          if(canMove)  {
            triggers.removeAttr('disabled');
          } else {
            triggers.attr('disabled', 'disabled');
          }
        }
    }
    _.each(map, checker); 
}

/*
|------------------------------------------------------------------------------
|   TEMPLATE.HELPERS
|------------------------------------------------------------------------------
*/

Template.playground.helpers({
    turns : function(){
        var result = 0;
        var currentRoom = Room.getCurrent();
        if(currentRoom && currentRoom.gridletters) {
          result =  Math.floor(currentRoom.letters.length / 2 / currentRoom.players.length); // round down if not enough letter to dispatch
        }
        return result;
    },
    totalPlayers : function(){
        var currentRoom = Room.getCurrent();
        if(currentRoom){
            return currentRoom.players.length;
        }
        return 0;
    },
    currentGiveup : function () {
        var result = 0;
        var currentRoom = Room.getCurrent();
        if(currentRoom) {
            result =  currentRoom.giveup;
        }
        if(result == 0){
            Session.set("hasGiveup", false);
        }
        return result;
    },
    hasNotGiveUp : function(){
        return !Session.get("hasGiveup");
    },
    playerletters : function(){
      var result = [];
      var currentRoom = Room.getCurrent();
      if(currentRoom && currentRoom.currentletters){
        result = currentRoom.currentletters[Meteor.userId()] || [];
      }
      return result;
    },
    validationStatusClass : function(){
      var result = "valid";
      var currentRoom = Room.getCurrent();
      if(currentRoom && currentRoom.gridletters){
        var mygridletters = currentRoom.gridletters[Meteor.userId()] || [];
        if(!Mixmo.isGridValid(mygridletters)){
          result = "invalid";
        }
      }
      return result;
    }
});

Template.playground.rendered = function(){

    var tbody = jQuery('tbody');
    var maxLineCount = Config.playgroundColumnCount;
    var maxColumnCount = Config.playgroundLineCount;

    // 1) Generate grid
    for(var i=1; i <= maxLineCount; i++){
        var tds = jQuery('<tr>');
        for(var j=1; j <= maxColumnCount; j++){
            var td = jQuery('<td>')
                      .addClass('letter')
                      .attr('data-x', j)
                      .attr('data-y', i)
                      .attr('title', '('+j+','+i+')');
            tds.append(td) ;
        }
        tbody.append(tds);
    };
    
    this.autorun(function(){
        // 2) Restore letters in grid
        console.log("In Template.playground.rendered autorun | userId : " + Meteor.userId());
        var mRoom = Room.getCurrent();
        if(mRoom && mRoom.gridletters) {
            var playerletters = mRoom.gridletters[Meteor.userId()] || [];
            // 1) Clear grid first
            //jQuery('table#playergrid td.letter[data-letter]')
            //    .removeAttr('data-letter')
            //    .removeClass('selected')
            //    .removeClass('valid')
            //    .removeClass('notValid')
            //    .empty();

            // 2) Then fill with values
            for(var i=0, len=playerletters.length; i <= len; i++){
              var item = playerletters[i];
              if(!!item){
                var td = jQuery('td.letter[data-x="'+item.coords.x+'"][data-y="'+item.coords.y+'"]');
                td.attr('data-letter', item.value.toUpperCase())
                  .attr('title', '('+item.coords.x+','+item.coords.y+')')
                  .text(item.value.toUpperCase());
                }
            }
            // Toggle action buttons enabled/disabled state
            checkGridActions();
        }
    });
}

/*
|------------------------------------------------------------------------------
|   TEMPLATE.EVENTS
|------------------------------------------------------------------------------
*/

Template.playground.events({
  'click .action-grid-move[data-direction]' : function(event){
    var currentRoom = Room.getCurrent();
    if(currentRoom) {
      var direction = event.target.getAttribute('data-direction');
        gridService.clear(jQuery('table#playergrid td.letter[data-letter]'));
      Meteor.call("moveGrid", currentRoom._id, direction);
    }
  },
    'click #give-up' : function(event){
        Session.set("hasGiveup", true);
        Meteor.call("giveup");
    },
    'click td': function (event) {
        //current item
        var el = jQuery(event.target);
        var lvalue = el.attr('data-letter');

        // Get the previously selected letter
        var prev = jQuery('td.letter.selected');

        if (lvalue) {
            gridService.selectTd(el, prev);
        } else {
            // == User has selected a drop target ==
            var letter = prev.text();
            gridService.dropSelectedTd(el, prev);

            if (letter) {
                var to_x = parseInt(el.attr('data-x')) || '?';
                var to_y = parseInt(el.attr('data-y')) || '?';
                var from_x = parseInt(prev.attr('data-x')) || '?';
                var from_y = parseInt(prev.attr('data-y')) || '?';

                // Letter is removed from user's currentletters
                // "currentletters" --> "gridletters"
                if (from_x == '?' && from_y == '?' && to_x != '?' && to_y != '?') {
                    Meteor.call("removeCurrentLetter", {value: letter, coords: {x: to_x, y: to_y}});
                }

                // Letter is added to user's currentletters
                // "gridletters" --> "currentletters"
                // But wait...this should not happen anymore !
                // Whatever let's keep it here for the moment
                if (from_x != '?' && from_y != '?' && to_x == '?' && to_y == '?') {
                    Meteor.call("addCurrentLetter", {value: letter, coords: {x: from_x, y: from_y}});
                }

                // Letter is moved within the playground
                // "gridletters" --> "gridletters"
                if (from_x != '?' && from_y != '?' && to_x != '?' && to_y != '?') {
                    Meteor.call("moveGridletter", {value: letter, coords: {x: from_x, y: from_y}}, {x: to_x, y: to_y});
                }

                // 1) Validate words nearby the dropped el
                validateGrid(el, prev);
            }
        }
  }
});

/*
 |------------------------------------------------------------------------------
 |   CHAT
 |------------------------------------------------------------------------------
 */
// assign collection to the `messages` helper in `chatBox` template
Template.chatBox.helpers({
    "messages": function() {
        return chatCollection.find();
    }
});

// generate a value for the `user` helper in `chatMessage` template
Template.chatMessage.helpers({
    "user": function() {
        if(this.userId == 'me') {
            return this.userId;
        } else if(this.userId) {
            getUsername(this.userId);
            return Session.get('user-' + this.userId);
        } else {
            return 'anonymous-' + this.subscriptionId;
        }
    }
});

Template.chatBox.events({
    "keyup #chat-message" : function(event){
        if(event.keyCode == 13){
             $('#send').trigger("click");
        }
    },
    "click #send": function() {
        var message = $('#chat-message').val();
        var roomId = Room.getCurrentRoomId();
        chatCollection.insert({
            userId: 'me',
            message: message
        });
        $('#chat-message').val('');

        //add the message to the stream
        chatStream.emit('chat', message, roomId);
    }
});

chatStream.on('chat', function(message, toRoom) {
    if(toRoom == Room.getCurrentRoomId()){
        chatCollection.insert({
            userId: this.userId, //this is the userId of the sender
            subscriptionId: this.subscriptionId, //this is the subscriptionId of the sender
            message: message
        });
    }
});

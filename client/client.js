Meteor.autorun(function() {
    Meteor.subscribe("players");
    Meteor.subscribe("rooms");
    Meteor.subscribe('notifications');
});

var gridService = new GridService();

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
      Meteor.call("moveGrid", currentRoom._id, direction);
    }
  },  
  'click td' : function(event){
    var el = jQuery(event.target);
    var lvalue = el.attr('data-letter');
    if(lvalue){
      // == User has selected a letter ==
      // Remove class 'selected' from all
      // Add class "selected" to element
      jQuery('td.letter.selected').removeClass('selected');
      el.addClass('selected');
      console.log('Selected ' + lvalue);
    } else {
      // == User has selected a drop target ==
      // Get the previously selected letter
      // Transfer data to current target
      // "unselect" other selected cells
      var prev = jQuery('td.letter.selected');
      var to_x = parseInt(el.attr('data-x')) || '?';
      var to_y = parseInt(el.attr('data-y')) || '?';
      var from_x = parseInt(prev.attr('data-x')) || '?';
      var from_y = parseInt(prev.attr('data-y')) || '?';
      if(prev && prev.text()){
        var letter = prev.text();
        el.attr('data-letter', letter).text(letter);
        prev.text('');

        // Letter is removed from user's currentletters
        // "currentletters" --> "gridletters"
        if(from_x == '?' && from_y == '?' && to_x != '?' && to_y != '?') {
          Meteor.call("removeCurrentLetter", {value : letter, coords : { x : to_x, y : to_y}});
        }

        // Letter is added to user's currentletters
        // "gridletters" --> "currentletters"
        // But wait...this should not happen anymore !
        // Whatever let's keep it here for the moment
        if(from_x != '?' && from_y != '?' && to_x == '?' && to_y == '?') {
          Meteor.call("addCurrentLetter", {value : letter, coords : { x : from_x, y : from_y}});
        }

        // Letter is moved within the playground
        // "gridletters" --> "gridletters"
        if(from_x != '?' && from_y != '?' && to_x != '?' && to_y != '?') {
          Meteor.call("moveGridletter", {value : letter, coords : { x : from_x, y : from_y}}, {x:to_x, y:to_y});
        }

        console.log('Moved ' + letter + ' : (' +from_x+','+from_y+') --> (' +to_x+','+to_y+')');

        // 1) Validate words nearby the dropped el
        validateGrid(el, prev);
      }

      jQuery('td.letter.selected')
        .removeClass('selected')
        .removeAttr('data-letter');

    }
  }
});

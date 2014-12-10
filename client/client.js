Meteor.autorun(function() {
    Meteor.subscribe("players");
    Meteor.subscribe("rooms");
    Meteor.subscribe('notifications');
});

/*
|------------------------------------------------------------------------------
|   UTILS
|------------------------------------------------------------------------------
*/

function validateGrid(event, ui){
    var item = $(ui.item);
    var sender = $(ui.sender);

    var vWordTds = getVwordTds(item);
    var hWordTds = getHwordTds(item);

    var vWord = "";
    var hWord = "";

    jQuery.each(vWordTds, function(index, value){
        vWord = vWord + value.html();
    });
    jQuery.each(hWordTds, function(index, value){
        hWord = hWord + value.html();
    });
    console.log("vWord : "+vWord);

    var valid = true;

    Meteor.call('validateWords', [hWord, vWord], function(err, response) {
        console.log('is word valid');
        console.debug(response);
        valid = response;

        console.log("valid : "+valid);
        if(valid == "true" || valid == true){
            item.removeClass('notValid');
            jQuery.each(vWordTds, function(index, value){
                value.addClass('valid');
                value.removeClass('notValid');
            });
            jQuery.each(hWordTds, function(index, value){
                value.addClass('valid');
                value.removeClass('notValid');
            });
        }else{
            item.addClass('notValid');
            item.removeClass('valid');
        }
    });

}

function getVwordTds(item){
    var vWord = new Array();
    var cellIndex = item.index();

    var prevTr = item.parent().prev('tr');
    var letterTd = prevTr.find('td').eq(cellIndex);
    var letter = letterTd.html();

    var safety = true;
    var safetyInc = 60;
    while((letter!= "" && letter!= undefined) && safety){
        //console.log('html : '+letter);
        vWord.unshift(letterTd);

        prevTr = prevTr.prev('tr');
        letterTd = prevTr.find('td').eq(cellIndex);
        letter = letterTd.html();
        safetyInc--;
        if(safetyInc < 0){
            console.error("safety break 1");
            safety = false;
        }
    }

    vWord.push(item);

    var nextTr = item.parent().next('tr');
    letterTd = nextTr.find('td').eq(cellIndex);
    letter = letterTd.html();

    safety = true;
    safetyInc = 60;
    while((letter!= "" && letter!= undefined) && safety){
        vWord.push(letterTd);

        nextTr = nextTr.next('tr');
        letterTd = nextTr.find('td').eq(cellIndex);
        letter = letterTd.html();

        safetyInc--;
        if(safetyInc < 0){
            console.error("safety break 2");
            safety = false;
        }
    }

    return vWord;
}

function getHwordTds(item){
    var hWord = new Array();
    var prevTd = item.prev('td');
    while(prevTd.html()!=""){
         hWord.unshift(prevTd);
        prevTd = prevTd.prev('td');
    }
    hWord.push(item);
    var nextTd = item.next('td');
    while(nextTd.html()!=""){
        hWord.push(nextTd);
        nextTd = nextTd.next('td');
    }

    return hWord;
}


/*
|------------------------------------------------------------------------------
|   TEMPLATE.HELPERS
|------------------------------------------------------------------------------
*/

Template.playground.helpers({
    playerletters : function(){
      var result = [];
      var currentRoom = Room.getCurrent();
      if(currentRoom && currentRoom.currentletters){
        result = currentRoom.currentletters[Meteor.userId()] || [];
      }
      return result;
    }
});

Template.playground.rendered = function(){
    if(Meteor.userId()) {  // Kind of access control
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
      }

      // 2) Restore letters in grid
      this.autorun(function(){
        console.log("In Template.playground.rendered autorun | userId : " + Meteor.userId());
        var mRoom = Room.getCurrent();
        if(mRoom && mRoom.gridletters) {
            var playerletters = mRoom.gridletters[Meteor.userId()] || [];
            for(var i=0, len=playerletters.length; i <= len; i++){
                var item = playerletters[i];
                if(!!item) {
                  var td = jQuery('td.letter[data-x="'+item.coords.x+'"][data-y="'+item.coords.y+'"]');
                  td.attr('data-letter', item.value.toUpperCase())
                    .attr('title', '('+item.coords.x+','+item.coords.y+')')
                    .text(item.value.toUpperCase());
                }
            }
        }
      });

    }
}

/*
|------------------------------------------------------------------------------
|   TEMPLATE.EVENTS
|------------------------------------------------------------------------------
*/

Template.playground.events({
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
      var to_x = el.attr('data-x') || '?';
      var to_y = el.attr('data-y') || '?';
      var from_x = prev.attr('data-x') || '?';
      var from_y = prev.attr('data-y') || '?';
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
          // Maybe try something like the following to validate neighborhood
          // --> Meteor.call("ensureEmptySurroundings", { ... }) ?
          // But it seems weird though...
          Meteor.call("addCurrentLetter", {value : letter, coords : { x : from_x, y : from_y}});
        }

        // Letter is moved within the playground
        // "gridletters" --> "gridletters"
        if(from_x != '?' && from_y != '?' && to_x != '?' && to_y != '?') {
          // Check surroundings of { x : to_x, y : to_y}
        }

        console.log('Moved ' + letter + ' : (' +from_x+','+from_y+') --> (' +to_x+','+to_y+')');
      }

      jQuery('td.letter.selected')
        .removeClass('selected')
        .removeAttr('data-letter');

      // Validation must happen here after the DOM has been updated
      // The following is still buggy probably due to weird race conditions
      /* Start method ensureFilledSurroundings
      if(to_x != '?' && to_y != '?'){
        var checklist = Mixmo.getSurroundingCoords({value : letter, coords : { x : to_x, y : to_y}});
        var selectorlist = [];
        for(var i=0,len=checklist.length;i<len;i++) {
          var item = checklist[i];
          selectorlist.push('td.letter[data-letter][data-x="'+item.x+'"][data-y="'+item.y+'"]');
        }

        var mRoom = Room.getCurrent();
        var result = jQuery(selectorlist.join(','));
        var isValid = result.length > 0;
        // Validate/Invalidate currentRoom
        if(mRoom) {
          Rooms.update(
            { _id: mRoom._id },
            { $set: { "isvalid" : !!isValid } }
          );
        }
      }
      // End method ensureFilledSurroundings
      //*/
    }
  }
});

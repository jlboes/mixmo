
Session.setDefault("playerName", "");

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

function getLetters(){
    Meteor.call('getTwoLetters',Session.get("playerName"), function(err, response) {
        console.log('got new letters');
        jQuery( "#currentWordTable" ).sortable({
            items: "td",
            connectWith: ".connectedSortable",
            stop: function(event, ui) {
                validateGrid(event, ui);
            }
        }).disableSelection();
    });
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
    },
    sampleletters : function(){
      var sample = ['P', 'A', 'P', 'A', 'Y', 'E'];
      var result = [];
      //shuffle(sample);
      for(var i = 0, len = sample.length; i<len; i++) {
        result.push({"value" : sample[i]});
      }
      return result;
    }
});


Template.wordInput.helpers({
    inGame : function(){
        return inGame.get();
    }
});

Template.playground.rendered = function(){

    if(Meteor.userId()){  // Kind of access control
      var tbody = jQuery('tbody');
      var tableSize = 40; // Number of cells in each axis
      for(var i=1; i <= tableSize; i++){
          var tds = jQuery('<tr>');
          for(var j=1; j <= tableSize; j++){
              var td = jQuery('<td>')
                        .addClass('letter')
                        .attr('data-x', j)
                        .attr('data-y', i)
                        .attr('title', '('+j+','+i+')');
              tds.append(td) ;
          }

          tbody.append(tds);
      }
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
        console.log('Moved ' + letter + ' : (' +from_x+','+from_y+') --> (' +to_x+','+to_y+')');
      }
      jQuery('td.letter.selected')
        .removeClass('selected')
        .removeAttr('data-letter');
    }
  }
});

Template.wordInput.events = {
    "click #mixmo":function(event){
        getLetters();
    },
    "click #startGame":function(event){
        if( Players.find({}).count()>=2
            && !(Session.get("playerName") == 'undefined' || Session.get("playerName") == '')){

            inGame.set(true);
            for (var i = 0; i < 3; i++) {
                getLetters();
            };
        }
    },
    "click #restartGame":function(event){
        inGame.set(false);
        Meteor.call('restart', function(err, response) {
            console.log('game restarted');
            jQuery(".currentwordTds").remove();
        });
    }
}

Meteor.autorun(function() {
    Meteor.subscribe("letters", Session.get("playerName"));
    Meteor.subscribe("players");
    Meteor.subscribe("rooms");
});

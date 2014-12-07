
Session.setDefault("playerName", "");

/*
|------------------------------------------------------------------------------
|   UTILS
|------------------------------------------------------------------------------
*/

function isGridValid(event, ui){
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
    Meteor.call('isWordValid',hWord, vWord, function(err, response) {
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

function getLetters(roomId, player){
    Meteor.call('getTwoLetters',roomId, player, function(err, response) {
        console.log('got new letters');
        /*
        jQuery( "#currentWordTable" ).sortable({
            items: "td",
            connectWith: ".connectedSortable",
            stop: function(event, ui) {
                isGridValid(event, ui);
            }
        }).disableSelection();
        */
    });
}

/*
|------------------------------------------------------------------------------
|   TEMPLATE.HELPERS
|------------------------------------------------------------------------------
*/

Template.currentWordTable.helpers({
    currentWord : function(){
        return CurrentWord.find({player: Session.get("playerName")}) ;
    }
});


Template.wordInput.helpers({
    inGame : function(){
        return inGame.get();
    }
});

Template.playground.rendered = function(){
    /*** RENDER MAX GRID ***/
    var tbody = jQuery('tbody');
    var tableSize = 40; // Number of cells in each axis
    for(var i=1; i <= tableSize; i++){
        var tds = jQuery('<tr>').addClass('gridTableTr connectedSortable');
        for(var j=1; j <= tableSize; j++){
            var td = jQuery('<td>')
                      .attr('data-x', j)
                      .attr('data-y', i)
                      .attr('title', '('+j+','+i+')')
                      .addClass('ui-state-disabled');
            tds.append(td) ;
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
            },
            cancel: ".ui-state-disabled"
        }).disableSelection();

}

/*
|------------------------------------------------------------------------------
|   TEMPLATE.EVENTS
|------------------------------------------------------------------------------
*/


Template.wordInput.events = {
    "click #mixmo":function(event){
        console.log("get letters");
        var room = Rooms.findOne({ "players.id" : Meteor.userId()});
        var player = _.findWhere(room.players, {id: Meteor.userId()});
        getLetters(room._id, player);
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
    Meteor.subscribe('notifications');
});

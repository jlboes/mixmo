
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

function getLetters(){
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

/*
|------------------------------------------------------------------------------
|   TEMPLATE.HELPERS 
|------------------------------------------------------------------------------
*/

Template.entryfield.helpers({
    canShowInput : function(){
        return Session.get("playerName") == 'undefined'
            || Session.get("playerName") == '';
    }
});

Template.players.helpers({
    players : function(){
        return Players.find({}, { sort: { time: -1 }});
    },
    canDelete : function(){
        return this.login == Session.get("playerName");
    }
});


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
    
    for(var i=0; i<60; i++){
        var tds = jQuery('<tr>').addClass('gridTableTr connectedSortable')
        for(var j=0; j<60; j++){
            tds.append('<td>').addClass('ui-state-disabled');
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

Template.entryfield.events = {
    "keydown #name": function(event){
        if(event.which == 13){
            var name = document.getElementById('name');
            // Submit the form
            if(name.value != ''){
                Session.set("playerName", name.value);
                Meteor.call('addPlayer', name.value, function(err, response) {
                    console.log('New player : ' + name.value);
                    if(err) {
                        Session.set("playerName", "");
                    } 
                });
                name.value = '';
            }
        }
    }
}

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

Template.players.events = ({
    "click .playerList": function(event){
        if (this.login === Session.get("playerName")) {
            console.log("remove "+this._id);
            Players.remove(this._id);
            Session.set("playerName", "");
        }
    }
});

Meteor.autorun(function() {
    Meteor.subscribe("letters", Session.get("playerName"));
    Meteor.subscribe("players");
});


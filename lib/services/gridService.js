
var VALID = "valid";
var NOT_VALID = "notValid";

var SELECTED = "selected";
var DATA_LETTER = "data-letter"

GridService = function () {
}

GridService.prototype = {
    /**
     * Return list of DOM td element
     * @param item
     * @returns {Array}
     */
    getHwordTds: function(item){
        var hWord = new Array();
        if(item != null || item != undefined) {
            var prevTd = item.prev('td');
            while (item != null && item != undefined && prevTd.html() !== '' && prevTd.html() !== undefined && prevTd.html() !== null) {
                hWord.unshift(prevTd);
                prevTd = prevTd.prev('td');
            }
            hWord.push(item);
            var nextTd = item.next('td');
            while ( nextTd != null && nextTd != undefined && nextTd.html() !== '' && nextTd.html() !== undefined && nextTd.html() !== null) {
                hWord.push(nextTd);
                nextTd = nextTd.next('td');
                console.log("2");
            }
        }
        return hWord;
    },
    /**
     * Return list of DOM td element
     * @param item
     * @returns {Array}
     */
    getVwordTds: function(item){
        var vWord = new Array();        // array to return
        var cellIndex = item.index();

        // find previous tr to find previous td
        var prevTr = item.parent().prev('tr');
        var letterTd = prevTr.find('td').eq(cellIndex);
        var letter = letterTd.html();

        // iterate over previous rows
        var safety = true;
        var safetyInc = Config.playgroundColumnCount;
        while((letter !== '' && letter !== undefined) && safety){
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

        vWord.push(item);   // push current letter in array to return

        // find next tr and corresponding td
        var nextTr = item.parent().next('tr');
        letterTd = nextTr.find('td').eq(cellIndex);
        letter = letterTd.html();

        // iterate over next td
        safety = true;
        safetyInc = Config.playgroundColumnCount;
        while((letter !== '' && letter !== undefined) && safety){
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
    },
    /**
     * Get word from list of DOM td elements
     * @param tds
     * @returns {string}
     */
    getWord: function(tds){
        var word = "";
        jQuery.each(tds, function(index, value){
            word = word + value.html();
        });
        return word;
    },
    /**
     * Add class valid to each td passed
     * @param wordTds Array of td DOM element
     */
    markValidWord: function(wordTds){
        jQuery.each(wordTds, function(index, value){
            value.addClass(VALID).removeClass(NOT_VALID);
        });
    },
    /**
     * Add class not valid to each td passed
     * @param wordTds Array of td DOM element
     */
    markNotValidWord: function(wordTds){
        jQuery.each(wordTds, function(index, value){
            value.addClass(NOT_VALID).removeClass(VALID);
        });
    },

    /**
     *
     * @param td DOM Element
     */
    selectTd: function(td, prev) {
        // == User has selected a letter ==
        // Remove class 'selected' previous selected slot
        // Add class "selected" to element
        prev.removeClass(SELECTED);
        td.addClass(SELECTED);
    },
    dropSelectedTd: function(td, prev){
        prev.removeClass(SELECTED).removeAttr(DATA_LETTER);

        // if prev td had a letter
        if (prev && prev.text()) {
            var letter = prev.text();
            td.attr(DATA_LETTER, letter).text(letter);  // Add letter to current slot
            prev.text('');                              // clear previous slot
        }
    },
    clear: function(tds){
        tds
            .removeAttr(DATA_LETTER)
            .removeClass(SELECTED)
            .removeClass(VALID)
            .removeClass(NOT_VALID)
            .empty();

    },




    getValidClass: function(){
        return VALID;
    },
    getNotValidClass: function(){
        return NOT_VALID;
    },
    getSelectedClass: function(){
        return SELECTED;
    }
}
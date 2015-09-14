/**
 * Created by jl on 04/09/15.
 */

var WILDCARD= "*";
var GANGSTER= "$";

WordService = function (dictionary) {
    this.dictionary = dictionary;   // dictionary collection
}


WordService.prototype = {
    find: function(word){
        return this.dictionary.find({word: word});
    },
    findRegexWord: function(rword){
        return this.dictionary.find({word: { $regex: rword }});
    },
    validate: function (word) {
        if(null == word || undefined == word){
            return false;
        }
        word = word.toLowerCase();
        var result;
        if(word.indexOf(WILDCARD) > -1){
            var rword = "^"+word.replace(WILDCARD, ".*")+"$";
            result = this.findRegexWord(rword);
        }
        else if(word.indexOf(GANGSTER) > -1){
            var rword = "^"+word.replace(GANGSTER, "[kzyw]")+"$";
            result = this.findRegexWord(rword);
        }
        else {
            result = this.find(word);
        }
        return result.count() > 0;
    }
}
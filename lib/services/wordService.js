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
    },

    validateWords: function(words){
        // check that words is array
        if(!_.isArray(words)){
            return false;
        }
        // check that elements in words are not empty and the array size is a least two
        var testlist = _.filter(words, function(val){ return !!val && val.length > 1; });   // Return all the elements that pass a truth test.

        var self = this;
        if(testlist) {
            var isNotInDictionary = function(value) { return self.validate(value); }        // truth test that validate a word is in the dictionary
            return _.every(testlist, isNotInDictionary); // Determine if at least one element in the object matches a truth test.
        }
        return true;
    }
}
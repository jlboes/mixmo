Players = new Meteor.Collection('players');
//define letter avaible
CurrentWord = new Meteor.Collection('word');

// Define if currently in game
inGame = new Blaze.ReactiveVar(false);

Players = new Meteor.Collection('players');

// Define if currently in game
inGame = new Blaze.ReactiveVar(false);

//Room Collection
Rooms = new Meteor.Collection('rooms');

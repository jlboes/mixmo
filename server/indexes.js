/*
|------------------------------------------------------------------------------
|   INDEXES CONFIGURATIONS FOR MIXMO
|------------------------------------------------------------------------------
*/

Meteor.startup(function () {    
    if(Notifications && Notifications._ensureIndex) {
        Notifications._ensureIndex({ "roomId": 1, "userId" : 1});
    }
});
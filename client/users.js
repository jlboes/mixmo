/**
 * Created by jl on 18/09/15.
 */


getUsername = function(id) {
    Meteor.subscribe('user-info', id);
    Deps.autorun(function() {
        var user = Meteor.users.findOne(id);
        if(user) {
            Session.set('user-' + id, user.username);
        }
    });
}
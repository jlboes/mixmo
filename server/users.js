/**
 * Created by jl on 18/09/15.
 */

Meteor.publish("user-info", function(id) {
    return Meteor.users.find({_id: id}, {fields: {username: 1}});
});
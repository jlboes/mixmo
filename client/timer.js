/**
 * Created by jl on 18/09/15.
 */
Meteor.startup(function () {
    setInterval(function () {
        Meteor.call("getServerTime", function (error, result) {
            Session.set("time", result);
        });
    }, 1000);
});

Template.timer.helpers({
    timer: function () {
        return Session.get("time");
    }
});
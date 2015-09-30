/**
 * Created by jl on 18/09/15.
 */

MYSELF = 'me';

var chatCollection = new Meteor.Collection(null); // local only collection for chat messagess
ChatService = function () {
}

ChatService.prototype = {
    sendMessage: function(message, roomId, from){
        console.log(from);
        from = from || MYSELF;
        console.log(from);
        chatCollection.insert({
            userId: from,
            message: message
        });
        $('#chat-message').val('');

        //add the message to the stream
        var sender = from == MYSELF ? Meteor.userId() : from;
        console.log(sender);
        chatStream.emit('chat', message, roomId, sender);
    },
    getMessages: function(){
        return chatCollection.find();
    }
}

chatStream.on('chat', function(message, toRoom, sender) {
    if(toRoom == Room.getCurrentRoomId()){
        chatCollection.insert({
            userId: sender, //this is the userId of the sender
            subscriptionId: this.subscriptionId, //this is the subscriptionId of the sender
            message: message
        });
    }
});
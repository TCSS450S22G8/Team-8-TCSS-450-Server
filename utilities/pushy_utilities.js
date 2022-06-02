const Pushy = require("pushy");

// Plug in your Secret API Key
const pushyAPI = new Pushy(process.env.PUSHY_API_KEY);

//MESSAGING
//use to send message to a specific client by the token
function sendMessageToIndividual(token, message) {
    //build the message for Pushy to send
    var data = {
        type: "msg",
        message: message,
        chatid: message.chatid,
    };
    console.log(data.chatid);

    // Send push notification via the Send Notifications API
    // https://pushy.me/docs/api/send-notifications
    pushyAPI.sendPushNotification(data, token, {}, function (err, id) {
        // Log errors to console
        if (err) {
            return console.log("Fatal Error", err);
        }

        // Log success
        console.log("Push sent successfully! (ID: " + id + ")");
    });
}

//CONTACTS
//use to send friend request notification
function sendFriendRequest(token, requestee) {
    var data = {
        type: "friendRequest",
        message: requestee + " sent you a friend request.",
    };

    pushyAPI.sendPushNotification(data, token, {}, function (err, id) {
        // Log errors to console
        if (err) {
            return console.log("Fatal Error", err);
        }

        // Log Success
        console.log("Push sent successfully! (ID: " + id + ")");
    });
}

//use to send accept request notification
function acceptFriendRequest(token, responder) {
    var data = {
        type: "acceptFriendRequest",
        message: responder + " accepted your friend request.",
    };

    pushyAPI.sendPushNotification(data, token, {}, function (err, id) {
        // Log errors to console
        if (err) {
            return console.log("Fatal Error", err);
        }

        // Log Success
        console.log("Push sent successfully! (ID: " + id + ")");
    });
}

//use to delete friend
function deleteFriend(token, deleter) {
    var data = {
        type: "deleteFriend",
        message: deleter + " deleted you from their contacts.",
    };

    pushyAPI.sendPushNotification(data, token, {}, function (err, id) {
        // Log errors to console
        if (err) {
            return console.log("Fatal Error", err);
        }

        // Log Success
        console.log("Push sent successfully! (ID: " + id + ")");
    });
}

//CHATROOMS
//added to a chat
function addUserToChat(token, adder) {
    var data = {
        type: "addedUserToChat",
        message: adder.username + " added you to " + adder.chatname,
        chatid: adder.params.chatId,
    };

    pushyAPI.sendPushNotification(data, token, {}, function (err, id) {
        // Log errors to console
        if (err) {
            return console.log("Fatal Error", err);
        }

        // Log Success
        console.log("Push sent successfully! (ID: " + id + ")");
    });
}

//deleted from a chat
function deleteUserFromChat(token, deleter) {
    var data = {
        type: "deleteUserFromChat",
        message:
            deleter.deleterUsername + " deleted you from " + deleter.chatname,
        chatid: deleter.params.chatId,
    };

    pushyAPI.sendPushNotification(data, token, {}, function (err, id) {
        // Log errors to console
        if (err) {
            return console.log("Fatal Error", err);
        }

        // Log Success
        console.log("Push sent successfully! (ID: " + id + ")");
    });
}

module.exports = {
    sendMessageToIndividual,
    sendFriendRequest,
    acceptFriendRequest,
    deleteFriend,
    addUserToChat,
    deleteUserFromChat,
};

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

//use to delete friend
function deleteFriend(token, deleter) {
    var data = {
        type: "deleteFriend",
        email: deleter.email,
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

//added to a chat
function addUserToChat(token, adder) {
    var data = {
        type: "addedUserToChat",
        // message: adder.username + " added you to " adder.chat
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
    deleteFriend,
};

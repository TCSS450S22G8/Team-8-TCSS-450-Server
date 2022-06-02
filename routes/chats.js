/**
 * Endpoints are used for creating and getting chat rooms.
 * Code adapted from original author Charles Bryan
 *
 * @author Charles Bryan
 * @author Sean Logan
 * @author Shilnara Dam
 * @version 05/14/2022
 */

//express is the framework we're going to use to handle requests
const express = require("express");

//Access the connection to Heroku Database
const pool = require("../utilities/exports").pool;

const router = express.Router();

const middleware = require("../middleware");

const chat_funtions = require("../utilities/exports").messaging;

const jwt = require("jsonwebtoken");
const { response } = require("express");
const validation = require("../utilities").validation;
let isStringProvided = validation.isStringProvided;

/**
 * @apiDefine JSONError
 * @apiError (400: JSON Error) {String} message "malformed JSON in parameters"
 */

/**
 * @api {post} /chats Request to add a chat
 * @apiName PostChats
 * @apiGroup Chats
 *
 * @apiHeader {String} authorization Valid JSON Web Token JWT
 * @apiParam {String} name the name for the chat
 *
 * @apiSuccess (Success 201) {boolean} success true when the name is inserted
 * @apiSuccess (Success 201) {Number} chatId the generated chatId
 *
 * @apiError (400: Unknown user) {String} message "unknown email address"
 *
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 *
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 *
 * @apiError (400: Unknown Chat ID) {String} message "invalid chat id"
 *
 * @apiUse JSONError
 */
router.post(
    "/",
    middleware.checkToken,
    (request, response, next) => {
        if (!isStringProvided(request.body.name)) {
            response.status(400).send({
                message: "Missing required information",
            });
        } else {
            next();
        }
    },
    (request, response, next) => {
        let insert = `INSERT INTO Chats(Name, Owner)
                  VALUES ($1,$2)
                  RETURNING ChatId`;
        let values = [request.body.name, request.decoded.memberid];
        pool.query(insert, values)
            .then((result) => {
                request.chatid = result.rows[0].chatid;
                next();
            })
            .catch((err) => {
                response.status(400).send({
                    message: "SQL Error",
                    error: err,
                });
            });
    },
    (request, response, next) => {
        let query = "SELECT * FROM MEMBERS WHERE EMAIL = $1";
        let values = ["group8tcss450@gmail.com"];
        pool.query(query, values)
            .then((result) => {
                if (result.rowCount == 0) {
                    response.status(400).send({
                        message: "SlapChat does not exist",
                    });
                } else {
                    request.slapchatid = result.rows[0].memberid;
                    next();
                }
            })
            .catch((err) => {
                response.status(400).send({
                    message: "SQL Error 22",
                    error: err,
                });
            });
    },
    (request, response) => {
        console.log(request.slapchatid);
        console.log(request.chatID);
        console.log(request.chatId);
        console.log(request.chatid);
        let query =
            "INSERT INTO MESSAGES (CHATID, MESSAGE, MEMBERID) VALUES ($1,'Welcome to the chat!',$2) RETURNING *";
        let values = [request.chatid, request.slapchatid];
        pool.query(query, values)
            .then((result) => {
                response.send({
                    success: true,
                    chatID: result.rows[0].chatid,
                });
            })
            .catch((err) => {
                response.status(400).send({
                    message: "SQL Error 11",
                    error: err,
                });
            });
    }
);

/**
 * @api {put} /chats/addSelf/:chatId? Request add yourself to a chat
 * @apiName PutChatsSelf
 * @apiGroup Chats
 *
 * @apiDescription Adds the user associated with the required JWT.
 *
 * @apiHeader {String} authorization Valid JSON Web Token JWT
 *
 * @apiParam {Number} chatId the chat to add the user to
 *
 * @apiSuccess {boolean} success true when the name is inserted
 *
 * @apiError (404: Chat Not Found) {String} message "chatID not found"
 * @apiError (404: Email Not Found) {String} message "email not found"
 * @apiError (400: Invalid Parameter) {String} message "Malformed parameter. chatId must be a number"
 * @apiError (400: Duplicate Email) {String} message "user already joined"
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 *
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 *
 * @apiUse JSONError
 */
router.put(
    "/addSelf/:chatId/",
    middleware.checkToken,
    (request, response, next) => {
        //validate on empty parameters
        if (!request.params.chatId) {
            response.status(400).send({
                message: "Missing required information",
            });
        } else if (isNaN(request.params.chatId)) {
            response.status(400).send({
                message: "Malformed parameter. chatId must be a number PUT",
            });
        } else {
            next();
        }
    },
    (request, response, next) => {
        //validate chat id exists
        let query = "SELECT * FROM CHATS WHERE ChatId=$1";
        let values = [request.params.chatId];

        pool.query(query, values)
            .then((result) => {
                if (result.rowCount == 0) {
                    response.status(404).send({
                        message: "Chat ID not found",
                    });
                } else {
                    next();
                }
            })
            .catch((error) => {
                response.status(400).send({
                    message: "SQL Error 1",
                    error: error,
                });
            });
        //code here based on the results of the query
    },
    (request, response, next) => {
        //validate email exists
        let query = "SELECT * FROM Members WHERE MemberId=$1";
        let values = [request.decoded.memberid];

        pool.query(query, values)
            .then((result) => {
                if (result.rowCount == 0) {
                    response.status(404).send({
                        message: "email not found",
                    });
                } else {
                    //user found
                    next();
                }
            })
            .catch((error) => {
                response.status(400).send({
                    message: "SQL Error 2",
                    error: error,
                });
            });
    },
    (request, response, next) => {
        //validate email does not already exist in the chat
        let query = "SELECT * FROM ChatMembers WHERE ChatId=$1 AND MemberId=$2";
        let values = [request.params.chatId, request.decoded.memberid];

        pool.query(query, values)
            .then((result) => {
                if (result.rowCount > 0) {
                    response.status(400).send({
                        message: "user already joined",
                    });
                } else {
                    next();
                }
            })
            .catch((error) => {
                response.status(400).send({
                    message: "SQL Error 3",
                    error: error,
                });
            });
    },
    (request, response, next) => {
        //Insert the memberId into the chat
        let insert = `INSERT INTO ChatMembers(ChatId, MemberId)
                  VALUES ($1, $2)
                  RETURNING *`;
        let values = [request.params.chatId, request.decoded.memberid];
        pool.query(insert, values)
            .then((result) => {
                response.status(200).send({
                    message: "we good.",
                });
            })
            .catch((err) => {
                response.status(400).send({
                    message: "SQL Error 4",
                    error: err,
                });
            });
    }
);

/**
 * @api {put} /chats/addOther/:chatId? Request add a user to a chat
 * @apiName PutChatsOthers
 * @apiGroup Chats
 *
 * @apiDescription Adds a user associated with the required email
 *
 * @apiHeader {String} authorization Valid JSON Web Token JWT
 *
 * @apiParam {Number} chatId the chat to add the user to
 *
 * @apiBodyExample {json} Request-Body-Example:
 *  {
 *      "email":"testEmail@fake.email",
 *  }
 *
 * @apiSuccess {boolean} success true when the name is inserted
 *
 * @apiError (404: Chat Not Found) {String} message "chatID not found"
 * @apiError (404: Email Not Found) {String} message "email not found"
 * @apiError (400: Invalid Parameter) {String} message "Malformed parameter. chatId must be a number"
 * @apiError (400: Duplicate Email) {String} message "user already joined"
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 *
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 *
 * @apiUse JSONError
 */
router.put(
    "/addOther/:chatId/",
    middleware.checkToken,
    (request, response, next) => {
        //validate on empty parameters
        if (!request.params.chatId) {
            response.status(400).send({
                message: "Missing required information",
            });
        } else if (isNaN(request.params.chatId)) {
            response.status(400).send({
                message: "Malformed parameter. chatId must be a number PUT",
            });
        } else {
            next();
        }
    },
    (request, response, next) => {
        //validate chat id exists
        let query = "SELECT * FROM CHATS WHERE ChatId=$1";
        let values = [request.params.chatId];

        pool.query(query, values)
            .then((result) => {
                if (result.rowCount == 0) {
                    response.status(404).send({
                        message: "Chat ID not found",
                    });
                } else {
                    request.chatname = result.rows[0].name;
                    next();
                }
            })
            .catch((error) => {
                response.status(400).send({
                    message: "SQL Error 1",
                    error: error,
                });
            });
        //code here based on the results of the query
    },
    (request, response, next) => {
        //validate email exists for the person attempting to add someone
        let query = "SELECT * FROM Members WHERE MemberId=$1";
        let values = [request.decoded.memberid];

        pool.query(query, values)
            .then((result) => {
                if (result.rowCount == 0) {
                    response.status(404).send({
                        message: "email not found",
                    });
                } else {
                    //user found
                    request.username = result.rows[0].username;
                    next();
                }
            })
            .catch((error) => {
                response.status(400).send({
                    message: "SQL Error 2",
                    error: error,
                });
            });
    },
    (request, response, next) => {
        //validate email of person adding someone does not already exist in the chat
        let query = "SELECT * FROM ChatMembers WHERE ChatId=$1 AND MemberId=$2";
        let values = [request.params.chatId, request.decoded.memberid];

        pool.query(query, values)
            .then((result) => {
                if (result.rowCount > 0) {
                    // the user attempting to add someone is in the chatroom, continue
                    next();
                } else {
                    // the user is not in the chat
                    response.status(400).send({
                        message: "user does not have access to this chat",
                    });
                }
            })
            .catch((error) => {
                response.status(400).send({
                    message: "SQL Error 3",
                    error: error,
                });
            });
    },
    // get member id of person being added
    (request, response, next) => {
        let query = "SELECT MEMBERID FROM MEMBERS WHERE MEMBERS.EMAIL=$1";
        let values = [request.body.email];
        pool.query(query, values)
            .then((response) => {
                if (response.rowCount > 0) {
                    request.addedMemberId = response.rows[0].memberid;
                    next();
                } else {
                    response.status(400).send({
                        message: "Email of friend does not exist.",
                    });
                }
            })
            .catch((error) => {
                response.status(400).send({
                    message: "SQL Error 4",
                    error: error,
                });
            });
    },
    (request, response, next) => {
        let query =
            "SELECT * FROM CHATMEMBERS WHERE CHATID = $1 AND MEMBERID = $2";
        let values = [request.params.chatId, request.addedMemberId];
        pool.query(query, values)
            .then((result) => {
                if (result.rowCount == 0) {
                    next();
                } else {
                    response.status(400).send({
                        message: "User already exists in chatroom.",
                    });
                }
            })
            .catch((err) => {
                response.status(400).send({
                    message: "SQL Error 5",
                    error: err,
                });
            });
    },
    (request, response, next) => {
        //Insert the memberId into the chat
        let insert = `INSERT INTO ChatMembers(ChatId, MemberId)
                  VALUES ($1, $2)
                  RETURNING *`;
        let values = [request.params.chatId, request.addedMemberId];
        pool.query(insert, values)
            .then((result) => {
                if (result.rowCount > 0) {
                    next();
                } else {
                    response.status(400).send({
                        message: "User already exists in chatroom.",
                    });
                }
            })
            .catch((err) => {
                response.status(400).send({
                    message: "SQL Error 4",
                    error: err,
                });
            });
    },
    (request, response) => {
        let query = "SELECT TOKEN FROM PUSH_TOKEN WHERE MEMBERID = $1";
        let values = [request.addedMemberId];
        pool.query(query, values)
            .then((results) => {
                results.rows.forEach((entry) => {
                    chat_funtions.addUserToChat(entry.token, request);
                });
                response.status(200).send({
                    message: "Successfully added your friend to the chat!",
                });
            })
            .catch((err) => {
                response.status(400).send({
                    message: "SQL Error 4",
                    error: err,
                });
            });
    }
);

/**
 * @api {delete} /chats/:chatId?/:email? Request delete a user from a chat
 * @apiName DeleteUserFromChat
 * @apiGroup Chats
 *
 * @apiDescription Does not delete the user associated with the required JWT but
 * instead deletes the user based on the email parameter.
 *
 * @apiParam {Number} chatId the chat to delete the user from
 * @apiParam {String} email the email of the user to delete
 *
 * @apiSuccess {boolean} success true when the name is deleted
 *
 * @apiError (404: Chat Not Found) {String} message "chatID not found"
 * @apiError (404: Email Not Found) {String} message "email not found"
 * @apiError (400: Invalid Parameter) {String} message "Malformed parameter. chatId must be a number"
 * @apiError (400: Duplicate Email) {String} message "user not in chat"
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 *
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 *
 * @apiUse JSONError
 */
router.delete(
    "/delete/user/:chatId/:email",
    middleware.checkToken,
    (request, response, next) => {
        //validate on empty parameters
        if (!request.params.chatId || !request.params.email) {
            response.status(400).send({
                message: "Missing required information",
            });
        } else if (isNaN(request.params.chatId)) {
            response.status(400).send({
                message: "Malformed parameter. chatId must be a number DELETE",
            });
        } else {
            next();
        }
    },
    (request, response, next) => {
        //validate chat id exists
        let query = "SELECT * FROM CHATS WHERE ChatId=$1";
        let values = [request.params.chatId];

        pool.query(query, values)
            .then((result) => {
                if (result.rowCount == 0) {
                    response.status(404).send({
                        message: "Chat ID not found",
                    });
                } else {
                    request.chatname = result.rows[0].name;
                    next();
                }
            })
            .catch((error) => {
                response.status(400).send({
                    message: "SQL Error",
                    error: error,
                });
            });
    },
    (request, response, next) => {
        // Check if deleter exists
        let query = "SELECT * FROM MEMBERS WHERE MEMBERID = $1";
        let values = [request.decoded.memberid];
        pool.query(query, values)
            .then((result) => {
                if (result.rowCount == 1) {
                    request.deleterUsername = result.rows[0].username;
                    next();
                } else {
                    response.status(400).send({
                        message:
                            "User attempting to delete person from chat does not exist",
                    });
                }
            })
            .catch((error) => {
                response.status(500).send({
                    message: "Database Error",
                    error: error,
                });
            });
    },
    (request, response, next) => {
        // checks if deleter is in the chatroom
        let query =
            "SELECT * FROM CHATMEMBERS WHERE MEMBERID=$1 AND CHATID = $2";
        let values = [request.decoded.memberid, request.params.chatId];
        pool.query(query, values)
            .then((result) => {
                if (result.rowCount > 0) {
                    next();
                } else {
                    response.status(400).send({
                        message: "You cannot delete from this chatroom",
                    });
                }
            })
            .catch((error) => {
                response.status(400).send({
                    message: "SQL Error",
                    error: error,
                });
            });
    },
    (request, response, next) => {
        //validate email of person being deleted exists
        let query = "SELECT MemberID FROM Members WHERE Email=$1";
        let values = [request.params.email];
        pool.query(query, values)
            .then((result) => {
                if (result.rowCount == 0) {
                    response.status(404).send({
                        message: "email not found",
                    });
                } else {
                    request.params.memberid = result.rows[0].memberid;
                    next();
                }
            })
            .catch((error) => {
                response.status(400).send({
                    message: "SQL Error",
                    error: error,
                });
            });
    },
    (request, response, next) => {
        //validate email exists in the chat
        let query = "SELECT * FROM ChatMembers WHERE ChatId=$1 AND MemberId=$2";
        let values = [request.params.chatId, request.params.memberid];
        pool.query(query, values)
            .then((result) => {
                if (result.rowCount > 0) {
                    next();
                } else {
                    response.status(400).send({
                        message: "user not in chat",
                    });
                }
            })
            .catch((error) => {
                response.status(400).send({
                    message: "SQL Error",
                    error: error,
                });
            });
    },
    (request, response, next) => {
        //Delete the memberId from the chat
        let insert = `DELETE FROM ChatMembers
                  WHERE ChatId=$1
                  AND MemberId=$2
                  RETURNING *`;
        let values = [request.params.chatId, request.params.memberid];
        pool.query(insert, values)
            .then(() => {
                next();
            })
            .catch((err) => {
                response.status(400).send({
                    message: "SQL Error",
                    error: err,
                });
            });
    },
    (request, response) => {
        // send push notification to user affected by being deleted from the chat
        let query = "SELECT TOKEN FROM PUSH_TOKEN WHERE MEMBERID = $1";
        let values = [request.params.memberid];
        pool.query(query, values)
            .then((results) => {
                results.rows.forEach((entry) => {
                    chat_funtions.deleteUserFromChat(entry.token, request);
                });
                response.status(200).send({
                    message: "Successfully deleted your friend from the chat!",
                });
            })
            .catch((err) => {
                response.status(400).send({
                    message: "SQL Error",
                    error: err,
                });
            });
    }
);

/**
 * @api {delete} /chats/delete/chatroom/group/:chatId/:memberid Request delete a chat room
 * @apiName DeleteChatRoom
 * @apiGroup Chats
 *
 * @apiDescription Deletes the chat room if the user owns it and it is a group chat. ACTUALLY DOES NOT CHECK FOR OWNER
 *
 * @apiParam {Number} chatId the chat to delete the user from
 *
 * @apiParam {JWT} JWT the jwt of the user who wants to delete the chat
 *
 * @apiSuccess {String} success Successfully deleted chatroom
 *
 * @apiError (400: Missing Required Information) {String} message "Missing required information"
 *
 * @apiError (400: Missing Required Information) {String} message "Malformed parameter. chatId and memberId must be a number"
 *
 * @apiError (404: Chat ID Not Found) {String} message "Chat ID not found"
 *
 * @apiError (400: Not Owner) {String} message "You do not own this chat."
 *
 * @apiError (400: SQL Error) {String} message "SQL Error"
 *
 *
 * @apiUse JSONError
 */
router.delete(
    "/delete/chatroom/group/:chatId/",
    middleware.checkToken,
    (request, response, next) => {
        console.log(request.decoded.memberid);
        //validate on empty parameters
        if (!request.params.chatId || !request.decoded.memberid) {
            response.status(400).send({
                message: "Missing required information",
            });
        } else if (
            isNaN(request.params.chatId) &&
            isNaN(request.decoded.memberid)
        ) {
            response.status(400).send({
                message:
                    "Malformed parameter. chatId and memberId must be a number DELETE",
            });
        } else {
            next();
        }
    },
    (request, response, next) => {
        //validate chat id exists and the user is the owner of the chat
        let query = "SELECT * FROM CHATS WHERE ChatId=$1";
        let values = [request.params.chatId];

        pool.query(query, values)
            .then((result) => {
                console.log(result.rows[0].owner);
                if (result.rowCount == 0) {
                    response.status(404).send({
                        message: "Chat ID not found",
                    });
                } else if (request.decoded.memberid != result.rows[0].owner) {
                    response.status(400).send({
                        message: "You do not own this chat.",
                    });
                } else {
                    next();
                }
            })
            .catch((error) => {
                response.status(400).send({
                    message: "SQL Error",
                    error: error,
                });
            });
    },
    (request, response, next) => {
        //delete the chat from the database
        let query = "DELETE FROM CHATS WHERE CHATID = $1";
        let values = [request.params.chatId];

        pool.query(query, values)
            .then((result) => {
                console.log(result);
                if (result.rowCount == 0) {
                    response.status(404).send({
                        message: "Chat was not able to be deleted", //Should never hit this
                    });
                } else {
                    response.status(200).send({
                        message: "Successfully deleted chatroom",
                    });
                }
            })
            .catch((error) => {
                response.status(400).send({
                    message: "SQL Error",
                    error: error,
                });
            });
    }
);

/**
 * @api {get} /chats Request to get all chats the user is in and the email of the owner
 * @apiName GetChats
 * @apiGroup Chats
 *
 * @apiHeader {String} memberid memberid of the user
 *
 * @apiSuccess (Success 200) {JSONObject[]} success true when retrieving all chats for user
 *
 * @apiError (400: Unknown user) {String} message "unknown email address"
 *
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 *
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 *
 * @apiError (400: Unknown Chat ID) {String} message "invalid chat id"
 *
 * @apiUse JSONError
 */
router.get(
    "/get-chats",
    middleware.checkToken,
    (request, response, next) => {
        console.log(request.decoded.memberid);
        if (isNaN(request.decoded.memberid)) {
            response.status(400).send({
                message: "Missing memberid",
            });
        } else {
            next();
        }
    },
    (request, response) => {
        let query =
            "SELECT CHATS.NAME, CHATS.CHATID, MEMBERS.EMAIL AS OWNER FROM CHATMEMBERS INNER JOIN CHATS ON CHATMEMBERS.CHATID = CHATS.CHATID INNER JOIN MEMBERS ON MEMBERS.MEMBERID = CHATS.OWNER WHERE CHATMEMBERS.MEMBERID = $1";
        let values = [request.decoded.memberid];
        pool.query(query, values)
            .then((result) => {
                response.send(result.rows);
            })
            .catch((err) => {
                response.status(400).send({
                    message: "SQL Error",
                    error: err,
                });
            });
    }
);

/**
 * @api {get} /chats/private Request to get the private chat's chatid between user and a friend
 * @apiName GetPrivateChatID
 * @apiGroup Chats
 *
 * @apiHeader {String} jwt jwt of user
 *
 * @apiBody {String} email email of friend
 *
 * @apiBodyExample
 *      {
 *          "email":"test@email.com"
 *      }
 *
 * @apiSuccess (Success 200) {string} chatId of private chat
 *
 * @apiError (401: Missing Header) {String} message "Auth token is not supplied"
 *
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 *
 * @apiError (400: Unknown user) {String} message "User does not exist"
 *
 * @apiError (500: SQL Error) {String} message the reported SQL error details
 *
 * @apiError (400: Unknown Friend) {String} message "Friend/email does not exist"
 *
 * @apiError (400: SlapChat Error) {String} message "SlapChat does not exist"
 *
 * @apiError (400: SlapChat Message Error) {String} message "SQL Error on inserting slapchat message"
 *
 * @apiUse JSONError
 */
router.get(
    "/private/:email",
    middleware.checkToken,
    (request, response, next) => {
        //checking if info exist
        if (
            request.params.email === undefined ||
            !isStringProvided(request.params.email)
        ) {
            response.status(400).send({
                message: "Missing required information",
            });
        } else {
            next();
        }
    },
    (request, response, next) => {
        //check if the user trying to message friend exist
        let query = "SELECT * FROM MEMBERS WHERE MEMBERID = $1";
        let values = [request.decoded.memberid];
        pool.query(query, values)
            .then((result) => {
                if (result.rowCount > 0) {
                    request.username = result.rows[0].username;
                    next();
                } else {
                    response.status(400).send({
                        message: "User does not exist",
                    });
                }
            })
            .catch((error) => {
                response.status(500).send({
                    message: "SQL Error on user memberid check",
                    error: error,
                });
            });
    },
    (request, response, next) => {
        //check if friend exist
        let query = "SELECT MEMBERID FROM MEMBERS WHERE EMAIL = $1";
        let values = [request.params.email];
        pool.query(query, values)
            .then((result) => {
                if (result.rowCount > 0) {
                    request.friendMemberid = result.rows[0].memberid;
                    next();
                } else {
                    response.status(400).send({
                        message: "Friend/email does not exist",
                    });
                }
            })
            .catch((error) => {
                response.status(500).send({
                    message: "SQL Error on friend email check",
                    error: error,
                });
            });
    },
    (request, response, next) => {
        //check if private chat already exist. if it does exist then send then chatId else continue
        let query =
            "select * from chats join (select chatid from chatmembers where memberid = $1 intersect select chatid from chatmembers where memberid = $2) as I on chats.chatid = I.chatid where groupchat = 0";
        let values = [request.decoded.memberid, request.friendMemberid];
        pool.query(query, values)
            .then((result) => {
                if (result.rowCount == 0) {
                    next();
                } else {
                    response.status(200).send({
                        message: "Private chat did exist",
                        chatID: result.rows[0].chatid,
                    });
                }
            })
            .catch((error) => {
                response.status(500).send({
                    message: "SQL Error on getting private chatid",
                    error: error,
                });
            });
    },
    (request, response, next) => {
        //creates a new private chatroom with both members in it and then send the chatId
        //creates the new chatroom
        let query =
            "INSERT INTO CHATS (GROUPCHAT, NAME) VALUES (0, 'PRIVATE') RETURNING *";
        pool.query(query)
            .then((result) => {
                if (result.rowCount == 1) {
                    request.chatId = result.rows[0].chatid;
                    next();
                } else {
                    //should prob never reach here. checked just in case
                    response.status(500).send({
                        message:
                            "SQL Error on creating new private chat room. multiple private chat rooms created or none",
                        error: error,
                    });
                }
            })
            .catch((error) => {
                response.status(500).send({
                    message: "SQL Error on creating new private chat room",
                    error: error,
                });
            });
    },
    (request, response, next) => {
        //adding user and friend into that chatroom
        let query =
            "INSERT INTO CHATMEMBERS (CHATID, MEMBERID) VALUES ($1, $2), ($1, $3) RETURNING *";
        let values = [
            request.chatId,
            request.decoded.memberid,
            request.friendMemberid,
        ];
        pool.query(query, values)
            .then((result) => {
                if (result.rowCount == 2) {
                    next();
                } else {
                    //should prob never reach here. checked just in case
                    response.status(500).send({
                        message:
                            "SQL Error on adding users to the private chat. adding more than 2 users or none",
                        error: error,
                    });
                }
            })
            .catch((error) => {
                response.status(500).send({
                    message: "SQL Error on adding users to private chat room",
                    error: error,
                });
            });
    },
    (request, response, next) => {
        //gets slapchat's memberid to add new message to chatroom
        let query = "SELECT * FROM MEMBERS WHERE EMAIL = $1";
        let values = ["group8tcss450@gmail.com"];
        pool.query(query, values)
            .then((result) => {
                if (result.rowCount == 1) {
                    request.slapchatid = result.rows[0].memberid;
                    next();
                } else {
                    response.status(400).send({
                        message: "SlapChat does not exist",
                    });
                }
            })
            .catch((err) => {
                response.status(400).send({
                    message: "SQL Error on getting memberid of slapchat",
                    error: err,
                });
            });
    },
    (request, response, next) => {
        //insert welcome message into private chat
        let query =
            "INSERT INTO MESSAGES (CHATID, MESSAGE, MEMBERID) VALUES ($1,'Welcome to the private chat!',$2) RETURNING *";
        let values = [request.chatId, request.slapchatid];
        pool.query(query, values)
            .then((result) => {
                next();
            })
            .catch((err) => {
                response.status(400).send({
                    message: "SQL Error on inserting slapchat message",
                    error: err,
                });
            });
    },
    (request, response) => {
        //send push notification to friend that new private chat was created
        let query = "SELECT TOKEN FROM PUSH_TOKEN WHERE MEMBERID = $1";
        let values = [request.friendMemberid];
        pool.query(query, values)
            .then((results) => {
                request.chatname = "a private chat!";
                results.rows.forEach((entry) => {
                    chat_funtions.addUserToChat(entry.token, request);
                });
                response.status(200).send({
                    message:
                        "Private chat did not exist, a new one was created",
                    chatID: request.chatId,
                });
            })
            .catch((err) => {
                response.status(500).send({
                    message: "SQL Error getting friend push token",
                    error: err,
                });
            });
    }
);

/**
 * @api {get} /chats/:chatId? Request to get the emails and username of users in a chat
 * @apiName GetEmailOfUsersInChat
 * @apiGroup Chats
 *
 * @apiHeader {String} authorization Valid JSON Web Token JWT
 *
 * @apiParam {Number} chatId the chat to look up.
 *
 * @apiSuccess {Number} rowCount the number of messages returned
 * @apiSuccess {Object[]} members List of members in the chat
 * @apiSuccess {String} messages.email The email for the member in the chat
 * @apiSuccess {String} messages.username The username for the members in the chat
 *
 * @apiError (404: ChatId Not Found) {String} message "Chat ID Not Found"
 * @apiError (400: Invalid Parameter) {String} message "Malformed parameter. chatId must be a number"
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 *
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 *
 * @apiUse JSONError
 */
router.get(
    "/:chatId",
    (request, response, next) => {
        //validate on missing or invalid (type) parameters
        if (!request.params.chatId) {
            response.status(400).send({
                message: "Missing required information",
            });
        } else if (isNaN(request.params.chatId)) {
            response.status(400).send({
                message:
                    "Malformed parameter. chatId must be a number GETTING EMAILS",
            });
        } else {
            next();
        }
    },
    (request, response, next) => {
        //validate chat id exists
        let query = "SELECT * FROM CHATS WHERE ChatId=$1";
        let values = [request.params.chatId];

        pool.query(query, values)
            .then((result) => {
                if (result.rowCount == 0) {
                    response.status(404).send({
                        message: "Chat ID not found",
                    });
                } else {
                    next();
                }
            })
            .catch((error) => {
                response.status(400).send({
                    message: "SQL Error",
                    error: error,
                });
            });
    },
    (request, response) => {
        //Retrieve the members
        let query = `SELECT Members.Email, Members.Username 
                    FROM ChatMembers
                    INNER JOIN Members ON ChatMembers.MemberId=Members.MemberId
                    WHERE ChatId=$1`;
        let values = [request.params.chatId];
        pool.query(query, values)
            .then((result) => {
                response.send({
                    rowCount: result.rowCount,
                    rows: result.rows,
                });
            })
            .catch((err) => {
                response.status(400).send({
                    message: "SQL Error",
                    error: err,
                });
            });
    }
);

module.exports = router;

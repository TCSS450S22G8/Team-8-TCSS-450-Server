/**
 * Endpoints are used for adding, getting, and verifying contacts.
 *
 * @author Sean Logan
 * @author Shilnara Dam
 * @version 05/13/2022
 */

//express is the framework we're going to use to handle requests
const express = require("express");

//Access the connection to Heroku Database
const pool = require("../utilities").pool;

const validation = require("../utilities").validation;

const middleware = require("../middleware");

const contact_functions = require("../utilities/exports").messaging;

const router = express.Router();

/**
 * @api {post} /contacts/add Allows user to add a friend
 * @apiName postAddFriend
 * @apiGroup Contacts
 *
 * @apiParam {String} memberid
 * @apiParam {String} email
 *
 * @apiParamExample {json} Request-Example:
 *           {
 *            "memberid": "1",
 *            "email": "test@test.com"
 *           }
 *
 *
 * @apiSuccess {String} Sent Contact Request
 *
 *  * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *         "message": "Sent Contact Request"
 *     }
 *
 * @apiError (400: Invalid Email) {String} message "Invalid email"
 *
 * @apiError (500: Existing Request) {String} message "Already a pending friend request."
 *
 * @apiError (500: Database Failure) {String} message "Database Query Failed"
 *
 */
router.post("/add", middleware.checkToken, (request, response) => {
    const sender = request.decoded.memberid;
    const receiverEmail = request.body.email;
    let queryEmail =
        "SELECT MEMBERS.MEMBERID FROM MEMBERS WHERE UPPER(MEMBERS.EMAIL) = UPPER($1)";

    let values = [receiverEmail];

    pool.query(queryEmail, values)
        .then((result) => {
            if (result.rowCount == 0) {
                response.status(400).send({
                    message: "Invalid email",
                });
                return;
            }
            let query =
                "INSERT INTO CONTACTS(MEMBERID_A, MEMBERID_B) VALUES($1, $2)";
            values = [sender, result.rows[0].memberid];
            memberid = result.rows[0].memberid;
            pool.query(query, values)
                .then((result) => {
                    let query =
                        "SELECT USERNAME, EMAIL FROM MEMBERS WHERE MEMBERID = $1";
                    let values = [sender];
                    pool.query(query, values)
                        .then((result) => {
                            let username = result.rows[0].username;
                            // send a notification of this message to ALL members with registered tokens
                            let query = `SELECT token FROM Push_Token
                                        WHERE memberid=$1`;
                            let values = [memberid];
                            pool.query(query, values)
                                .then((result) => {
                                    result.rows.forEach((entry) =>
                                        contact_functions.sendFriendRequest(
                                            entry.token,
                                            username
                                        )
                                    );
                                    response.status(200).send({
                                        message:
                                            "Friend Request Sent Successfully!",
                                    });
                                })
                                .catch((err) => {
                                    response.status(400).send({
                                        message:
                                            "SQL Error on select from push token",
                                        error: err,
                                    });
                                });
                        })
                        .catch((err) => {
                            response.status(500).send({
                                message: "Database Query Failed",
                            });
                        });
                })
                .catch((error) => {
                    response.status(500).send({
                        message: "Already a pending friend request.",
                    });
                });
        })
        .catch((error) => {
            response.status(500).send({
                message: "Database Query Failed",
            });
        });
});

/**
 * @api {post} /contacts/accept Allows user to accept a friend
 * @apiName postAcceptFriendRequest
 * @apiGroup Contacts
 *
 * @apiParam {String} memberid
 * @apiParam {String} email
 *
 * @apiParamExample {json} Request-Example:
 *           {
 *            "memberid": "1",
 *            "email": "test@test.com"
 *           }
 *
 *
 * @apiSuccess {String} Friend request accepted!
 *
 *  * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *         "message": "Friend request accepted!"
 *     }
 *
 * @apiError (400: Invalid Email) {String} message "Invalid email"
 *
 * @apiError (500: Database Error) {String} message "Error"
 *
 */
router.post(
    "/accept",
    middleware.checkToken,
    (request, response, next) => {
        let query =
            "SELECT MEMBERS.USERNAME FROM MEMBERS WHERE MEMBERS.MEMBERID = $1";
        let values = [request.decoded.memberid];
        pool.query(query, values)
            .then((result) => {
                if (result.rowCount == 1) {
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
                    message: error + "\nError",
                });
            });
    },
    (request, response, next) => {
        let query =
            "SELECT MEMBERS.MEMBERID FROM MEMBERS WHERE UPPER(MEMBERS.EMAIL) = UPPER($1)";
        let values = [request.body.email];
        pool.query(query, values)
            .then((result) => {
                if (result.rowCount == 1) {
                    request.friendMemberid = result.rows[0].memberid;
                    next();
                } else {
                    response.status(400).send({
                        message: "Invalid email",
                    });
                }
            })
            .catch((error) => {
                response.status(500).send({
                    message: error + "\nError",
                });
            });
    },
    (request, response, next) => {
        let query =
            "INSERT INTO CONTACTS(MEMBERID_A, MEMBERID_B) VALUES($1, $2)";
        let values = [request.decoded.memberid, request.friendMemberid];
        pool.query(query, values)
            .then((result) => {
                if (result.rowCount == 1) {
                    next();
                } else {
                    response.status(400).send({
                        message: "Insert failed",
                    });
                }
            })
            .catch((error) => {
                response.status(500).send({
                    message: error + "\nError",
                });
            });
    },
    (request, response, next) => {
        let query =
            "UPDATE CONTACTS SET verified = 1 WHERE (MEMBERID_A = $1 AND MEMBERID_B = $2) OR (MEMBERID_A = $2 AND MEMBERID_B = $1) RETURNING *";
        let values = [request.decoded.memberid, request.friendMemberid];
        pool.query(query, values)
            .then((result) => {
                if (result.rowCount == 2) {
                    next();
                } else {
                    response.status(400).send({
                        message: "Cannot verify friend request.",
                    });
                }
            })
            .catch((error) => {
                response.status(500).send({
                    message: error + " Error",
                });
            });
    },
    (request, response) => {
        let query = `SELECT token FROM Push_Token
                    WHERE memberid=$1`;
        let values = [request.friendMemberid];
        pool.query(query, values)
            .then((result) => {
                result.rows.forEach((entry) =>
                    contact_functions.acceptFriendRequest(
                        entry.token,
                        request.username
                    )
                );
                response.status(200).send({
                    message: "Friend Request Accepted Successfully!",
                });
            })
            .catch((err) => {
                response.status(400).send({
                    message: "SQL Error on select from push token",
                    error: err,
                });
            });
    }
);

/**
 * @api {get} /contacts/retrieve/:memberid Request for all friends user has
 * @apiName GetFriends
 * @apiGroup Contacts
 *
 * @apiParam {Number} memberid of user
 *
 * @apiSuccess (Success 200) {json} Success Array of json objects of users friends
 *
 * @apiSuccessExample {json} Success-Response:
 *      [
 *          {
 *              "email": "test@test.com"
 *              "username": "test username"
 *          }
 *          ...
 *      ]
 *
 *
 * @apiError (400: Invalid memberid) {String} message "Invalid Member ID"
 *
 */
router.get("/retrieve/", middleware.checkToken, (request, response) => {
    const memberid = request.decoded.memberid;

    let query =
        "SELECT MEMBERS.EMAIL, MEMBERS.USERNAME FROM (SELECT MEMBERID_B FROM " +
        "CONTACTS WHERE MEMBERID_A = $1 AND VERIFIED = 1) AS B JOIN MEMBERS ON " +
        "B.MEMBERID_B = MEMBERS.MEMBERID";
    let values = [memberid];

    pool.query(query, values)
        .then((result) => {
            response.status(200).send(result.rows);
        })
        .catch((error) => {
            response.status(400).send({
                message: "Invalid Member ID",
            });
        });
});

/**
 * @api {post} /contacts/delete Allows user to delete a friend or pending friend
 * @apiName postDeleteFriend
 * @apiGroup Contacts
 *
 * @apiParam {String} JWT passed as header
 * @apiParam {String} email
 *
 * @apiParamExample {json} Request-Example:
 *           {
 *            "email": "test@test.com"
 *           }
 *
 *
 * @apiSuccess {String} Friend was successfully deleted from contacts!
 *
 *  * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *         "message": "Friend was successfully deleted from contacts!"
 *     }
 *
 * @apiError (400: Invalid Email) {String} message "Invalid email"
 *
 * @apiError (500: Database Error) {String} message "Error"
 *
 */
router.post("/delete", middleware.checkToken, (request, response) => {
    const userDeleting = request.decoded.memberid;
    const beingDeletedEmail = request.body.email;
    let query =
        "SELECT MEMBERS.MEMBERID FROM MEMBERS WHERE UPPER(MEMBERS.EMAIL) = UPPER($1)";
    let values = [beingDeletedEmail];

    pool.query(query, values)
        .then((result) => {
            if (result.rowCount == 0) {
                response.status(400).send({
                    message: "Invalid email",
                });
                return;
            }
            personDeleted = result.rows[0].memberid;
            query =
                "DELETE FROM CONTACTS WHERE (MEMBERID_A = $1 AND MEMBERID_B = $2) OR (MEMBERID_A = $2 AND MEMBERID_B = $1)";
            values = [userDeleting, personDeleted];

            pool.query(query, values)
                .then((result) => {
                    let query =
                        "SELECT USERNAME FROM MEMBERS WHERE MEMBERID = $1";
                    let values = [userDeleting];
                    pool.query(query, values)
                        .then((result) => {
                            username = result.rows[0].username;
                            let query =
                                "SELECT TOKEN FROM PUSH_TOKEN WHERE MEMBERID = $1";
                            let values = [personDeleted];
                            pool.query(query, values)
                                .then((result) => {
                                    result.rows.forEach((entry) => {
                                        contact_functions.deleteFriend(
                                            entry.token,
                                            username
                                        );
                                    });
                                    response.status(200).send({
                                        message:
                                            "Friend was successfully deleted from contacts!",
                                    });
                                })
                                .catch((err) => {
                                    response.status(500).send({
                                        message: error + "\nError",
                                    });
                                });
                        })
                        .catch((err) => {
                            response.status(500).send({
                                message: error + "\nError",
                            });
                        });
                })
                .catch((error) => {
                    response.status(500).send({
                        message: error + "\nError",
                    });
                });
        })
        .catch((error) => {
            response.status(500).send({
                message: error + "\nError",
            });
        });
});

/**
 * @api {get} /contacts/retrieve/outgoing Request to get all pending friend requests sent
 * @apiName GetOutgoingFriends
 * @apiGroup Contacts
 *
 * @apiHeader {String} String jwt of the user
 *
 * @apiSuccess (Success 200) {json} Success Array of json objects of outgoing users friend requests
 *
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      message: "successfully retrieved outgoing friend requests."
 *      outgoing:
 *              [
 *                  {
 *                      "email": "test@test.com"
 *                      "username": "test username"
 *                  }
 *                  ...
 *              ]
 *  }
 *
 *
 * @apiError (400: Invalid memberid) {String} message "Invalid Member ID"
 *
 */
router.get(
    "/retrieve/outgoing",
    middleware.checkToken,
    (request, response, next) => {
        let query = "SELECT * FROM MEMBERS WHERE MEMBERID = $1";
        let values = [request.decoded.memberid];
        pool.query(query, values)
            .then((result) => {
                if (result.rowCount == 1) {
                    next();
                } else {
                    response.status(400).send({
                        message: "User does not exist",
                    });
                }
            })
            .catch((err) => {
                response.status(500).send({
                    message: "SQL Error" + "\n" + err,
                });
            });
    },
    (request, response) => {
        let query =
            "SELECT MEMBERS.USERNAME, MEMBERS.EMAIL FROM CONTACTS INNER JOIN MEMBERS ON CONTACTS.MEMBERID_B = MEMBERS.MEMBERID WHERE MEMBERID_A = $1 AND VERIFIED = 0";
        let values = [request.decoded.memberid];
        pool.query(query, values)
            .then((result) => {
                response.status(200).send({
                    message: "Successfully retrieved outgoing friend requests.",
                    outgoing: result,
                });
            })
            .catch((err) => {
                response.status(500).send({
                    message: "SQL Error" + "\n" + err,
                });
            });
    }
);

/**
 * @api {get} /contacts/retrieve/incoming Request to get all pending friend requests received
 * @apiName GetIncomingFriends
 * @apiGroup Contacts
 *
 * @apiHeader {String} String jwt of the user
 *
 * @apiSuccess (Success 200) {json} Success Array of json objects of incoming users friend requests
 *
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      message: "successfully retrieved incoming friend requests."
 *      incoming:
 *              [
 *                  {
 *                      "email": "test@test.com"
 *                      "username": "test username"
 *                  }
 *                  ...
 *              ]
 *  }
 *
 * @apiError (400: Invalid memberid) {String} message "Invalid Member ID"
 *
 */
router.get(
    "/retrieve/incoming",
    middleware.checkToken,
    (request, response, next) => {
        let query = "SELECT * FROM MEMBERS WHERE MEMBERID = $1";
        let values = [request.decoded.memberid];
        pool.query(query, values)
            .then((result) => {
                if (result.rowCount == 1) {
                    next();
                } else {
                    response.status(400).send({
                        message: "User does not exist",
                    });
                }
            })
            .catch((err) => {
                response.status(500).send({
                    message: "SQL Error" + "\n" + err,
                });
            });
    },
    (request, response) => {
        let query =
            "SELECT MEMBERS.USERNAME, MEMBERS.EMAIL FROM CONTACTS INNER JOIN MEMBERS ON CONTACTS.MEMBERID_A = MEMBERS.MEMBERID WHERE MEMBERID_B = $1 AND VERIFIED = 0";
        let values = [request.decoded.memberid];
        pool.query(query, values)
            .then((result) => {
                response.status(200).send({
                    message: "Successfully retrieved incoming friend requests.",
                    incoming: result,
                });
            })
            .catch((err) => {
                response.status(500).send({
                    message: "SQL Error" + "\n" + err,
                });
            });
    }
);

/**
 * @api {get} /contacts/retrieve/nonfriends Request to get all members you are not friends with so you can add friends
 * @apiName GetAllNonFriendMembers
 * @apiGroup Contacts
 *
 * @apiHeader {String} String jwt of the user
 *
 * @apiSuccess (Success 200) {json} Success Array of json objects of all members you are not friends with
 *
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      message: "successfully retrieved all members you are not friends with."
 *      members:
 *              [
 *                  {
 *                      "username": "test username"
 *                      "email": "test@test.com"
 *                  }
 *                  ...
 *              ]
 *  }
 *
 * @apiError (400: Invalid memberid) {String} message "Invalid Member ID"
 *
 * @apiError (500: SQL Error) {String} message "SQL Error"
 *
 */
router.get(
    "/retrieve/nonfriends",
    middleware.checkToken,
    (request, response, next) => {
        let query = "SELECT * FROM MEMBERS WHERE MEMBERID = $1";
        let values = [request.decoded.memberid];
        pool.query(query, values)
            .then((result) => {
                // confirm user exists
                if (result.rowCount == 1) {
                    next();
                } else {
                    response.status(400).send({
                        message: "User does not exist",
                    });
                }
            })
            .catch((err) => {
                response.status(500).send({
                    message: "SQL Error" + "\n" + err,
                });
            });
    },
    (request, response) => {
        let query =
            "SELECT MEMBERS.USERNAME, MEMBERS.EMAIL FROM MEMBERS WHERE MEMBERID NOT IN (SELECT MEMBERID_B FROM CONTACTS WHERE MEMBERID_A = $1 AND VERIFIED = 1) AND MEMBERID != $1";
        let values = [request.decoded.memberid];
        pool.query(query, values)
            .then((result) => {
                response.status(200).send({
                    message:
                        "Successfully retrieved all members you are not friends with.",
                    members: result.rows,
                });
            })
            .catch((err) => {
                response.status(500).send({
                    message: "SQL Error" + "\n" + err,
                });
            });
    }
);

module.exports = router;

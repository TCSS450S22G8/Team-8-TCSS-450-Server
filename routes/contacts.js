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
router.post("/add", (request, response) => {
    const sender = request.body.memberid;
    const receiverEmail = request.body.email;
    console.log(sender);
    console.log(receiverEmail);
    let queryEmail =
        "SELECT MEMBERS.MEMBERID FROM MEMBERS WHERE UPPER(MEMBERS.EMAIL) = UPPER($1)";

    let values = [receiverEmail];

    pool.query(queryEmail, values)
        .then((result) => {
            console.log(result.rowCount);
            if (result.rowCount == 0) {
                response.status(400).send({
                    message: "Invalid email",
                });
                return;
            }

            let query =
                "INSERT INTO CONTACTS(MEMBERID_A, MEMBERID_B) VALUES($1, $2)";
            values = [sender, result.rows[0].memberid];

            pool.query(query, values)
                .then((result) => {
                    response.status(200).send({
                        message: "Sent Contact Request",
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
router.post("/accept", (request, response) => {
    const receiver = request.body.memberid;
    const senderEmail = request.body.email;

    let query =
        "SELECT MEMBERS.MEMBERID FROM MEMBERS WHERE UPPER(MEMBERS.EMAIL) = UPPER($1)";
    let values = [senderEmail];

    pool.query(query, values)
        .then((result) => {
            if (result.rowCount == 0) {
                response.status(400).send({
                    message: "Invalid email",
                });
                return;
            }
            query =
                "INSERT INTO CONTACTS(MEMBERID_A, MEMBERID_B) VALUES($1, $2)";
            values = [receiver, result.rows[0].memberid];

            pool.query(query, values)
                .then((result) => {
                    query =
                        "UPDATE CONTACTS SET verified = 1 WHERE (MEMBERID_A = $1 AND MEMBERID_B = $2) OR (MEMBERID_A = $2 AND MEMBERID_B = $1)";
                    pool.query(query, values)
                        .then((result) => {
                            response.status(200).send({
                                message: "Friend request accepted!",
                            });
                        })
                        .catch((error) => {
                            response.status(500).send({
                                message: error + " Error",
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
router.get("/retrieve/:memberid", (request, response) => {
    const { memberid } = request.params;

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
router.post("/delete", (request, response) => {
    const userDeleting = request.body.memberid;
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
            query =
                "DELETE FROM CONTACTS WHERE (MEMBERID_A = $1 AND MEMBERID_B = $2) OR (MEMBERID_A = $2 AND MEMBERID_B = $1)";
            values = [userDeleting, result.rows[0].memberid];

            pool.query(query, values)
                .then((result) => {
                    response.status(200).send({
                        message:
                            "Friend was successfully deleted from contacts!",
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

module.exports = router;

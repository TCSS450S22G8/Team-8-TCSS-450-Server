/**
 * Endpoint for deleting users account.
 *
 * @author Sean Logan
 * @author Shilnara Dam
 * @version 6/3/2022
 */

//express is the framework we're going to use to handle requests
const { response } = require("express");
const express = require("express");

//Access the connection to Heroku Database
const pool = require("../utilities").pool;

const validation = require("../utilities").validation;

const middleware = require("../middleware");

const router = express.Router();

/**
 * @api {delete} /delete Allows user to delete account
 * @apiName DeleteAccount
 * @apiGroup DeleteAccount
 *
 * @apiParam {String} JWT passed as header
 *
 *
 * @apiSuccess {String} message Successfully deleted your account
 *
 *  * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *         "message": "Successfully deleted account"
 *     }
 *
 * @apiError (400: User does not exist) {String} message "User does not exist"
 *
 * @apiError (500: Database Error) {String} message "Database Query Failed"
 *
 */
router.delete(
    "/",
    middleware.checkToken,
    (request, response, next) => {
        // confirm user exists
        let query = "SELECT * FROM MEMBERS WHERE MEMBERID = $1";
        let values = [request.decoded.memberid];
        pool.query(query, values)
            .then((result) => {
                next();
            })
            .catch((err) => {
                response.status(500).send({
                    message: "Database Query Failed",
                });
            });
    },
    (request, response, next) => {
        // delete user push token
        let query = "DELETE FROM PUSH_TOKEN WHERE MEMBERID = $1";
        let values = [request.decoded.memberid];
        pool.query(query, values)
            .then((result) => {
                next();
            })
            .catch((err) => {
                response.status(500).send({
                    message: "Database Query Failed",
                });
            });
    },
    (request, response, next) => {
        // delete user locations
        let query = "DELETE FROM LOCATIONS WHERE MEMBERID = $1";
        let values = [request.decoded.memberid];
        pool.query(query, values)
            .then((result) => {
                next();
            })
            .catch((err) => {
                response.status(500).send({
                    message: "Database Query Failed",
                });
            });
    },
    (request, response, next) => {
        // delete user messages
        let query = "DELETE FROM MESSAGES WHERE MEMBERID = $1";
        let values = [request.decoded.memberid];
        pool.query(query, values)
            .then((result) => {
                next();
            })
            .catch((err) => {
                response.status(500).send({
                    message: "Database Query Failed",
                });
            });
    },
    (request, response, next) => {
        // delete user from chat members
        let query = "DELETE FROM CHATMEMBERS WHERE MEMBERID = $1";
        let values = [request.decoded.memberid];
        pool.query(query, values)
            .then((result) => {
                next();
            })
            .catch((err) => {
                response.status(500).send({
                    message: "Database Query Failed",
                });
            });
    },
    (request, response, next) => {
        // delete chatrooms the user owns
        let query = "DELETE FROM CHATS WHERE OWNER = $1";
        let values = [request.decoded.memberid];
        pool.query(query, values)
            .then((result) => {
                next();
            })
            .catch((err) => {
                response.status(500).send({
                    message: "Database Query Failed",
                });
            });
    },
    (request, response, next) => {
        // delete user from contacts
        let query =
            "DELETE FROM CONTACTS WHERE MEMBERID_A = $1 OR MEMBERID_B = $1";
        let values = [request.decoded.memberid];
        pool.query(query, values)
            .then((result) => {
                next();
            })
            .catch((err) => {
                response.status(500).send({
                    message: "Database Query Failed",
                });
            });
    },
    (request, response, next) => {
        // delete user from credentials
        let query = "DELETE FROM CREDENTIALS WHERE MEMBERID = $1";
        let values = [request.decoded.memberid];
        pool.query(query, values)
            .then((result) => {
                next();
            })
            .catch((err) => {
                response.status(500).send({
                    message: "Database Query Failed",
                });
            });
    },
    (request, response) => {
        // delete user from members
        let query = "DELETE FROM MEMBERS WHERE MEMBERID = $1";
        let values = [request.decoded.memberid];
        pool.query(query, values)
            .then((result) => {
                response.status(200).send({
                    message: "Quitters get no where in life!",
                });
            })
            .catch((err) => {
                response.status(500).send({
                    message: "Database Query Failed",
                });
            });
    }
);

module.exports = router;

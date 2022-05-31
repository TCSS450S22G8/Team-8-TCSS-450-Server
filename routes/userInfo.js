/**
 * Endpoint is used for getting user info.
 *
 * @author Sean Logan
 * @author Shilnara Dam
 * @version 05/31/2022
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
const { request } = require("express");
const validation = require("../utilities").validation;

/**
 * @api {get} /user-info Request to get information about the user
 * @apiName GetUserInfo
 * @apiGroup UserInfo
 *
 * @apiHeader {Jwt} jwt of the user
 *
 * @apiSuccess (Success 200) {JSONObject} success true when retrieving the users info
 *
 * @apiSuccessExample {JSONObject} success response:
 *      {
 *          "username": username
 *          "firstname": first name
 *          "lastname": last name
 *      }
 *
 * @apiError (400: User Does Not Exist) {String} message "User does not exist"
 *
 * @apiError (500: SQL Error) {String} message the reported SQL error details
 *
 * @apiUse JSONError
 */
router.get("/", middleware.checkToken, (request, response, next) => {
    let query =
        "SELECT FIRSTNAME, LASTNAME, USERNAME FROM MEMBERS WHERE MEMBERID = $1";
    let values = [request.decoded.memberid];
    pool.query(query, values)
        .then((result) => {
            if (result.rowCount == 1) {
                response.status(200).send({
                    username: result.rows[0].username,
                    firstname: result.rows[0].firstname,
                    lastname: result.rows[0].lastname,
                });
            } else {
                response.status(400).send({
                    message: "User does not exist.",
                });
            }
        })
        .catch((err) => {
            response.status(500).send({
                message: "SQL Error",
            });
        });
});

module.exports = router;

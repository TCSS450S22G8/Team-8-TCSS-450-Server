/**
 * Endpoint is used for changing a users password.
 *
 * @author Sean Logan
 * @author Shilnara Dam
 * @version 1.0
 */

//express is the framework we're going to use to handle requests
const express = require("express");

const jwt = require("jsonwebtoken");

const router = express.Router();

// Utility functions for password generation/validation
const { generateHash, generateSalt } = require("../utilities");
const { isValidPassword } = require("../utilities/validationUtils");

//Access the connection to Heroku Database
const pool = require("../utilities").pool;

/**
 * @api {post} /change-password Request to update users password
 * @apiName postChangePassword
 * @apiGroup Change Password
 *
 * @apiParam {Number} memberid
 * @apiParam {String} oldPassword
 * @apiParam {String} newPassword
 *
 * @apiParamExample {json} Request-Example:
 *           {
 *            "jwt": "2i234y34h3khjh3k4h3",
 *            "oldPassword": "1234Test",
 *            "newPassword": "1234Test!!"
 *           }
 *
 *
 * @apiSuccess {String} Password updated
 *
 *  * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *         "message": "Password updated"
 *     }
 *
 * @apiError (400: Invalid New Password) {String} message "Password does not meet requirements"
 *
 * @apiError (404: User Not Found) {String} message "User not found"
 *
 * @apiError (400: Error Occured) {String} message "You should never reach this"
 *
 * @apiError (500: Internal Sever Error) {String} message "Database query failed"
 *
 * @apiError (400: Invalid Old Password) {String} message "Invalid old password"
 *
 */
router.post("/", (request, response, next) => {
    const jwtBody = request.body.jwt;
    const jwtDecoded = jwt.decode(jwtBody);
    const memberid = jwtDecoded.memberid;
    const oldPassword = request.body.oldPassword;
    const newPassword = request.body.newPassword;

    //Verify that the user supplied a valid new password
    if (!isValidPassword(newPassword)) {
        response.status(400).send({
            message: "Password does not meet requirements",
        });
        return;
    }

    // Gets users salted hash, salt, and memberid
    let getSaltQuery =
        "SELECT CREDENTIALS.SALTEDHASH, CREDENTIALS.SALT FROM CREDENTIALS WHERE CREDENTIALS.MEMBERID = $1";

    const values = [memberid];
    pool.query(getSaltQuery, values)
        .then((result) => {
            // If user email doesnt exist, return error
            if (result.rowCount == 0) {
                response.status(404).send({
                    message: "User not found",
                });
                return;
            }

            // If the user does exist, get salt and salted hash to
            // compare with old password that was sent
            if (result.rowCount == 1) {
                const salt = result.rows[0].salt;
                const salted_hash = generateHash(oldPassword, salt);

                // If the old password is correct, then the password can
                // be updated in the database with the new password
                if (salted_hash == result.rows[0].saltedhash) {
                    const newSalt = generateSalt(32);
                    const newSaltedHash = generateHash(newPassword, newSalt);
                    let insertNewPassQuery =
                        "UPDATE CREDENTIALS SET SALT = $1, SALTEDHASH = $2 WHERE CREDENTIALS.MEMBERID = $3";
                    const newValues = [newSalt, newSaltedHash, memberid];
                    pool.query(insertNewPassQuery, newValues)
                        .then((result) => {
                            // Succesfullu updated password
                            if (result.rowCount == 1) {
                                response.status(200).send({
                                    message: "Password updated",
                                });
                                return;
                            }
                            // We should never reach this
                            // If multiple accounts got their password updated
                            // or none at all
                            else {
                                response.status(400).send({
                                    message: "Error has occured",
                                });
                                return;
                            }
                        })
                        // If the query somehow fails
                        .catch((error) => {
                            response.status(500).send({
                                message: "Database query failed #1",
                            });
                            return;
                        });
                }
                // Invalid old password input by user
                else {
                    response.status(400).send({
                        message: "Invalid old password",
                    });
                    return;
                }
            }
        })
        // Failed to ger users salted hash
        .catch((error) => {
            response.status(500).send({
                message: "Database query failed #2",
            });
            return;
        });
});

module.exports = router;

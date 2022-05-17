/**
 * @author Sean Logan
 * @author Shilnara Dam
 * @version 1.0
 * Enpoint is used for forget password includes verification of email.
 * Sends user an email to the email associated with their account
 * for confirmation that they are the owner of the email account.
 * Therefore, they can create a new password.
 */

const { request } = require("express");
const { response } = require("express");
const express = require("express");
const jwt = require("jsonwebtoken");
const { noExceptions } = require("npm/lib/utils/parse-json");
const {
    isValidEmail,
    isValidPassword,
} = require("../utilities/validationUtils");
const router = express.Router();
const nodemailer = require("nodemailer");
const { generateSalt, generateHash } = require("../utilities");

//Access the connection to Heroku Database
const pool = require("../utilities").pool;

require("dotenv").config();

// Verifies email exists and sends user a verification email to confirm ownership
router.post("/:email", (request, response) => {
    const email = request.params.email;
    console.log(email);
    if (!isValidEmail(email)) {
        response.status(400).send({
            message: "Invalid email",
        });
        return;
    }
    let query = "SELECT * FROM MEMBERS WHERE MEMBERS.EMAIL = $1";
    let values = [email];

    pool.query(query, values).then((result) => {
        if (result.rowCount == 1) {
            // Creating email to send to user for forgot password verification
            const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 587,
                protocol: "tls",
                service: "gmail",
                secure: false,
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.PASSWORD,
                },
                debug: false,
                logger: true,
            });

            const token = jwt.sign(
                {
                    memberid: result.rows[0].memberid,
                },
                process.env.JSON_WEB_TOKEN,
                { expiresIn: "10m" }
            );
            const mailConfigurations = {
                // It should be a string of sender/server email
                from: process.env.EMAIL,

                to: email,

                // Subject of Email
                subject: "Email Password Verification",

                // This would be the text of email body
                text: `Hi! To reset your password please follow the link https://tcss-450-sp22-group-8.herokuapp.com/forgot-password/${token}`,
            };
            transporter.sendMail(mailConfigurations, function (error, info) {
                if (error) {
                    console.log(error);
                    response.status(401).send({
                        message:
                            "Error sending email, possible incorrect email" +
                            error,
                    });
                    console.log(error);
                } else {
                    //We successfully added the user!
                    response.status(201).send({
                        success: true,
                        email: email,
                    });
                    console.log("Email Sent Successfully");
                    console.log(info);
                }
            });
            return;
        } else {
            response.status(400).send({
                message: "Email does not exist",
            });
        }
    });
});

// User clicks the link, sets the flag to 1 for forgotPasswordVerification
router.get("/:token", (req, res) => {
    const { token } = req.params;

    // Verifing the JWT token
    jwt.verify(token, process.env.JSON_WEB_TOKEN, function (err, decoded) {
        if (err) {
            console.log(err);
            res.send(
                "Email verification failed, possibly the link is invalid or expired"
            );
        } else {
            // decode the token created with const {token} = req.params; above
            const decoded = jwt.decode(token);
            console.log(decoded);
            console.log(decoded.memberid);
            let query =
                "UPDATE MEMBERS SET forgotPassVerification = 1 WHERE memberid = $1";
            const values = [decoded.memberid];
            pool.query(query, values).catch((error) => {
                response.status(400).send({
                    message: "verification failed to update",
                    detail: error.detail,
                });
                //console.log(error)
            });
            res.send("Email verifified successfully");
        }
    });
});

// Checks if the user clicked the link (front end button check)
router.get("/check-flag/:email", (request, response) => {
    const email = request.params.email;
    let query = "SELECT * FROM MEMBERS WHERE EMAIL = $1";
    let values = [email];

    pool.query(query, values)
        .then((result) => {
            if (
                result.rowCount == 1 &&
                result.rows[0].forgotPassVerification == 1
            ) {
                response.status(200).send({
                    message: "Successfully verified for password reset",
                });
            } else {
                response.status(400).send({
                    message:
                        "User has not successfully verified for password reset",
                });
            }
        })
        .catch((error) => {
            response.status(500).send({
                message: "Database Query Failed",
            });
        });
});

// Updates the users password in the database
router.put("/new-password", (request, response) => {
    const email = request.body.email;
    const password = request.body.password;
    if (!isValidPassword(password)) {
        response.status(400).send({
            message: "Password does not meet the requirements",
        });
        return;
    } else if (!isValidEmail(email)) {
        response.status(400).send({
            message: "Email does not meet the requirements",
        });
        return;
    }

    let query = "SELECT * FROM MEMBERS WHERE EMAIL = $1";
    let values = [email];

    pool.query(query, values)
        .then((result) => {
            if (
                result.rowCount == 1 &&
                result.rows[0].forgotPassVerification == 1
            ) {
                let salt = generateSalt(32);
                let salted_hash = generateHash(request.body.password, salt);
                query =
                    "UPDATE CREDENTIALS SET Salt = $1, SaltedHash = $2 WHERE memberid = $3";
                values = [salt, salted_hash, result.rows[0].memberid];

                pool.query(query, values)
                    .then((result) => {
                        if (result.rowCount == 1) {
                            query =
                                "UPDATE forgotPassVerification = 0 WHERE EMAIL = $1";
                            values = [email];

                            pool.query(query, values)
                                .then((result) => {
                                    if (result.rowCount == 1) {
                                        response.status(200).send({
                                            message:
                                                "User has successfully reset password",
                                        });
                                    } else {
                                        response.status(400).send({
                                            message: "Flag not reverted",
                                        });
                                    }
                                })
                                .catch((error) => {
                                    response.status(500).send({
                                        message: "Database Query Failed",
                                    });
                                });
                        } else {
                            response.status(400).send({
                                message: "Update Failed",
                            });
                        }
                    })
                    .catch((error) => {
                        response.status(500).send({
                            message: "Database Query Failed",
                        });
                    });
            } else {
                response.status(400).send({
                    message:
                        "Invalid user email or user has not verified email",
                });
            }
        })
        .catch((error) => {
            response.status(500).send({
                message: "Database Query Failed",
            });
        });
});

module.exports = router;

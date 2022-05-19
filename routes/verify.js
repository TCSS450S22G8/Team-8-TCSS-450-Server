/**
 * @author Sean Logan
 * @author Shilnara Dam
 * @version 1.0
 * Enpoint is used for verification.
 * Sends user an email to the email provided during
 * the registration process for confirmation that they
 * are the owner of the email account.
 */

const { request } = require("express");
const { response } = require("express");
const express = require("express");
const jwt = require("jsonwebtoken");
const { noExceptions } = require("npm/lib/utils/parse-json");
const router = express.Router();

//Access the connection to Heroku Database
const pool = require("../utilities").pool;

require("dotenv").config();

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
                "UPDATE MEMBERS SET verification = 1 WHERE memberid = $1";
            const values = [decoded.memberid];
            pool.query(query, values).catch((error) => {
                res.status(400).send({
                    message: "verification failed to update",
                    detail: error.detail,
                });
            });
            res.set('Content-Type', 'text/html');
            res.setHeader('Content-Type', 'text/html');
            res.send("<html lang=\"en\">  <head>   <meta charset=\"utf-8\" />   <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge,chrome=1\" />   <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">   <title></title>   <link href='https://fonts.googleapis.com/css?family=Lato:300,400|Montserrat:700' rel='stylesheet' type='text/css'>   <style>     @import url(//cdnjs.cloudflare.com/ajax/libs/normalize/3.0.1/normalize.min.css);     @import url(//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css);   </style>   <link rel=\"stylesheet\" href=\"https://2-22-4-dot-lead-pages.appspot.com/static/lp918/min/default_thank_you.css\">   <script src=\"https://2-22-4-dot-lead-pages.appspot.com/static/lp918/min/jquery-1.9.1.min.js\"></script>   <script src=\"https://2-22-4-dot-lead-pages.appspot.com/static/lp918/min/html5shiv.js\"></script> </head>  <body>   <header class=\"site-header\" id=\"header\">     <h1 class=\"site-header__title\" data-lead-id=\"site-header-title\">THANK YOU!</h1>   </header>    <div class=\"main-content\">     <i class=\"fa fa-check main-content__checkmark\" id=\"checkmark\"></i>     <p class=\"main-content__body\" data-lead-id=\"main-content-body\">Thanks you for verifying, you can now log in!</p>   </div>    <footer class=\"site-footer\" id=\"footer\">     <p class=\"site-footer__fineprint\" id=\"fineprint\">SlapChat</p>   </footer> </body>  </html>");
        }
    });
});

module.exports = router;

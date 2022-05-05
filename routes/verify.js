/**
 * @author Sean Logan
 * @author Shilnara Dam
 * @version 1.0
 * Enpoint is used for verification.
 * Sends user an email to the email provided during
 * the registration process for confirmation that they
 * are the owner of the email account.
 */


const { request } = require('express');
const { response } = require('express');
const express = require('express');
const jwt = require('jsonwebtoken');
const { noExceptions } = require('npm/lib/utils/parse-json');
const router = express.Router()

//Access the connection to Heroku Database
const pool = require('../utilities').pool

require('dotenv').config()


router.get('/:token', (req, res)=>{
    const {token} = req.params;
  
    // Verifing the JWT token 
    jwt.verify(token, process.env.JSON_WEB_TOKEN, function(err, decoded) {
        if (err) {
            console.log(err);
            res.send("Email verification failed, possibly the link is invalid or expired");
        }
        else {

            // decode the token created with const {token} = req.params; above
            const decoded = jwt.decode(token);            
            console.log(decoded);
            console.log(decoded.memberid)
            let query =  "UPDATE MEMBERS SET verification = 1 WHERE memberid = $1"
            const values = [decoded.memberid]
            pool.query(query, values)
                .catch((error) => {
                        response.status(400).send({
                            message: 'verification failed to update',
                            detail: error.detail
                        })
                        //console.log(error)
                })
                res.send("Email verifified successfully");
        }
    });
});

module.exports = router
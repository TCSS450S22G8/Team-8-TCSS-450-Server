const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router()

  
router.get('/:token', (req, res)=>{
    const {token} = req.params;
  
    // Verifing the JWT token 
    jwt.verify(token, 'ourSecretKey', function(err, decoded) {
        if (err) {
            console.log(err);
            res.send("Email verification failed, possibly the link is invalid or expired");
        }
        else {
            res.send("Email verifified successfully");
        }
    });
});
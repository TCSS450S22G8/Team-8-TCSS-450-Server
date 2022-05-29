/**
 * Enpoint for location adding and deleting.
 *
 * @author Shilnara Dam
 * @version 5/28/22
 */

//express is the framework we're going to use to handle requests
const express = require("express");

//request module is needed to make a request to a web service
const request = require("request");
const pool = require("../utilities/sql_conn");

//required to do jwt checks
const middleware = require("../middleware");


//required to get API key
require("dotenv").config();
const API_KEY = process.env.OPEN_WEATHER_API_KEY;

var router = express.Router();

/**
 * @api {post} /location/add/:lat/:lon Request to add a location
 * @apiName Addlocation
 * @apiGroup Location
 *
 * @apiHeader {String} jwt jwt of the user
 * @apiHeader {String} lat the latitude of the location
 * @apiHeader {String} lon the longitude of the location
 *
 * @apiSuccess (Success 200) {json} Success Location successfully added.
 *
 * @apiSuccessExample {json} Success-Response: 
 *      {
 *          message: Location successfully added."
 *      }
 *
 * @apiError (400: Invalid memberid) {String} message "User does not exist"
 * 
 * @apiError (400: Invalid lat/Lon) {String} message "Invalid latitude or longitude"
 * 
 * @apiError (400: Dupicate location) {String} message "Dupicate location."
 * 
 * @apiError (400: Location not added) {String} message "No locations were added."
 * 
 * @apiError (500: SQL ERROR) {json} message "SQL ERROR"
 *
 */
router.post("/add/:lat/:lon", middleware.checkToken, 
    (req, res, next) => {
        const { lat } = req.params;
        const { lon } = req.params;
        req.lat = lat
        req.lon = lon
        //check if user exist
        let query = "SELECT * FROM MEMBERS WHERE MEMBERID = $1"
        let values = [req.decoded.memberid]
        pool.query(query, values)
            .then(result => {
                if (result.rowCount == 1) {
                    next()
                } else {
                    res.status(400).send({
                        message: "User does not exist",
                    });
                }
            })
            .catch(err => {
                res.status(500).send({
                    message: "SQL Error" + "\n" + err,
                });
            });
    },
    (req, res, next) => {
        //check if duplicate location exist
        let query = "SELECT * FROM LOCATIONS WHERE MEMBERID = $1 AND LAT = $2 AND LONG = $3";
        let values = [req.decoded.memberid, req.lat, req.lon];
        pool.query(query, values)
            .then(result => {
                if (result.rowCount == 0) {
                    next();
                } else {
                    res.status(400).send({
                        message: "Dupicate location",
                    });
                }
            })
            .catch(err => {
                res.status(500).send({
                    message: "SQL Error" + "\n" + err,
                });
            });

    },
    (req, res, next) => {
        //checking if location is valid
        let cityUrl = `http://api.openweathermap.org/geo/1.0/reverse?lat=${req.lat}&lon=${req.lon}&limit=1&appid=${API_KEY}`;
        request(cityUrl, function (error, response, body) {
            if (error) {
                res.status(400).send({
                    message: "Invalid latitude or longitude",
                });
            } else {
                var result = JSON.parse(body);
                if (result.length >= 1) {
                    req.city = result[0].name + ", " + result[0].country;    
                    next();                
                } else {
                    res.status(400).send({
                        message: "Invalid latitude or longitude",
                    });
                }
            }
        });
    },
    (req, res) => {
        //adding location
        let query = "INSERT INTO LOCATIONS (MEMBERID, NICKNAME, LAT, LONG) VALUES ($1, $2, $3, $4)";
        let values = [req.decoded.memberid, req.city, req.lat, req.lon]
        pool.query(query, values)
            .then(result => {
                if (result.rowCount > 0) {
                    res.status(200).send({
                        message: "Location saved successfully.",
                    });
                } else {
                    res.status(400).send({
                        message: "Location was not saved successfully.",
                    });
                }
            })
            .catch(err => {
                res.status(500).send({
                    message: "SQL Error" + "\n" + err,
                });
            });
    }
)

/**
 * @api {delete} /location/delete/:lat/lon Request to delete a location
 * @apiName DeleteLocation
 * @apiGroup Location
 *
 * @apiHeader {String} jwt jwt of the user
 * @apiHeader {String} lat the latitude of the location
 * @apiHeader {String} lon the longitude of the location
 *
 * @apiSuccess (Success 200) {json} Success Location successfully deleted.
 *
 * @apiSuccessExample {json} Success-Response: 
 *      {
 *          message: Location successfully deleted."
 *      }
 *
 * @apiError (400: Invalid memberid) {String} message "User does not exist"
 * 
 * @apiError (400: Location not delete) {String} message "No locations were deleted."
 * 
 * @apiError (500: SQL ERROR) {json} message "SQL ERROR"
 *
 */
router.delete("/delete/:lat/:lon", middleware.checkToken, 
    (req, res, next) => {
        const { lat } = req.params;
        const { lon } = req.params;
        req.lat = lat
        req.lon = lon
        //check if user exist
        let query = "SELECT * FROM MEMBERS WHERE MEMBERID = $1"
        let values = [req.decoded.memberid]
        pool.query(query, values)
            .then(result => {
                if (result.rowCount == 1) {
                    next()
                } else {
                    res.status(400).send({
                        message: "User does not exist",
                    });
                }
            })
            .catch(err => {
                res.status(500).send({
                    message: "SQL Error" + "\n" + err,
                });
            });
    },
    (req, res) => {
        //deleting location
        let query = "DELETE FROM LOCATIONS WHERE MEMBERID = $1 AND LAT = $2 AND LONG = $3"
        let values = [req.decoded.memberid, req.lat, req.lon]
        pool.query(query, values)
        .then(result => {
            if (result.rowCount > 0) {
                res.status(200).send({
                    message: "Location successfully deleted.",
                });
            } else {
                res.status(400).send({
                    message: "No locations were deleted.",
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "SQL Error" + "\n" + err,
            });
        });
    }
)

/**
 * @api {get} /location/ Request to get all user saved locations
 * @apiName GetLocation
 * @apiGroup Location
 *
 * @apiHeader {String} jwt jwt of the user
 *
 * @apiSuccess (Success 200) {json} locations array of json objects
 *
 * @apiSuccessExample {json} Success-Response: 
 *      {
 *          "locations" : [
 *              {
 *                  "nickname": "Tacoma, US",
 *                  "lat": "47.2113"
 *                  "lon": "-122.439874"
 *              },
 *              .
 *              .
 *              .
 *          ]
 *      }
 *
 * @apiError (400: Invalid memberid) {String} message "User does not exist"
 * 
 * @apiError (500: SQL ERROR) {json} message "SQL ERROR"
 */
router.get("/", middleware.checkToken, 
    (req, res, next) => {
        //check if user exist
        let query = "SELECT * FROM MEMBERS WHERE MEMBERID = $1"
        let values = [req.decoded.memberid]
        pool.query(query, values)
            .then(result => {
                if (result.rowCount == 1) {
                    next()
                } else {
                    res.status(400).send({
                        message: "User does not exist",
                    });
                }
            })
            .catch(err => {
                res.status(500).send({
                    message: "SQL Error" + "\n" + err,
                });
            });
    },
    (req, res, next) => {
        let query = "SELECT NICKNAME, LAT, LONG FROM LOCATIONS WHERE MEMBERID = $1"
        let values = [req.decoded.memberid]
        pool.query(query, values)
            .then(result => {
                res.status(200).send({
                    locations: result.rows
                });
            })
            .catch(err => {
                res.status(500).send({
                    message: "SQL Error" + "\n" + err,
                });
            });
    }

);

module.exports = router;

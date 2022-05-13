/**
 * Enpoint for getting current, hourly, and daily weather based on zipcode or lat/long.
 * 
 * @author Shilnara Dam
 * @version 5/13/22
 */


//express is the framework we're going to use to handle requests
const express = require('express')

//request module is needed to make a request to a web service
const request = require('request')

//required to get API key
require('dotenv').config()
const API_KEY = process.env.OPEN_WEATHER_API_KEY;


var router = express.Router()

/* 
NOTES ON HOW TO PARSE JSON RESPONSE

console.log(result.lat); // double
console.log(result.lon); // double
console.log(result.current); // json format. weather contains an array with json format
console.log(result.hourly[0].weather[0]); //an array of json format. weather contains another array with json format. 48 hours.
console.log(result.daily[0].temp.day); //an array of json format with more json format. 8 days so including today
console.log(result.city); // string
*/

/**
 * @api {get} /zipcode/:zipcode Request for current, hourly, and daily weather information in imperial units. (Zipcode)
 * @apiName GetWeatherZipcode
 * @apiGroup Get Weather
 * 
 * @apiparam {Number} zipcode Zipcode of desired location.
 * 
 * @apiSuccess (Success 200) {json} Success json object of weather information
 *
 * @apiSuccessExample {json} Success-Response: 
 *      {
 *        "lat": 33.44,
 *        "lon": -94.04,
 *        "timezone": "America/Chicago",
 *        "timezone_offset": -21600,
 *        "current": {
 *            "dt": 1618317040,
 *            "sunrise": 1618282134,
 *            "sunset": 1618333901,
 *            "temp": 284.07,
 *            "feels_like": 282.84,
 *            "pressure": 1019,
 *            "humidity": 62,
 *            "dew_point": 277.08,
 *            "uvi": 0.89,
 *            "clouds": 0,
 *            "visibility": 10000,
 *            "wind_speed": 6,
 *            "wind_deg": 300,
 *            "weather": [
 *              {
 *                "id": 500,
 *                "main": "Rain",
 *                "description": "light rain",
 *                "icon": "10d"
 *              }
 *            ],
 *            "rain": {
 *              "1h": 0.21
 *            }
 *          },
 *          "hourly": [
 *            {
 *              "dt": 1618315200,
 *              "temp": 282.58,
 *              "feels_like": 280.4,
 *              "pressure": 1019,
 *              "humidity": 68,
 *              "dew_point": 276.98,
 *              "uvi": 1.4,
 *              "clouds": 19,
 *              "visibility": 306,
 *              "wind_speed": 4.12,
 *              "wind_deg": 296,
 *              "wind_gust": 7.33,
 *              "weather": [
 *                {
 *                  "id": 801,
 *                  "main": "Clouds",
 *                  "description": "few clouds",
 *                  "icon": "02d"
 *                }
 *            ],
 *            "pop": 0
 *            },
 *            ...
 *        }
 *            "daily": [
 *            {
 *              "dt": 1618308000,
 *              "sunrise": 1618282134,
 *              "sunset": 1618333901,
 *              "moonrise": 1618284960,
 *              "moonset": 1618339740,
 *              "moon_phase": 0.04,
 *              "temp": {
 *                "day": 279.79,
 *                "min": 275.09,
 *                "max": 284.07,
 *                "night": 275.09,
 *                "eve": 279.21,
 *                "morn": 278.49
 *              },
 *              "feels_like": {
 *                "day": 277.59,
 *                "night": 276.27,
 *                "eve": 276.49,
 *                "morn": 276.27
 *              },
 *              "pressure": 1020,
 *              "humidity": 81,
 *              "dew_point": 276.77,
 *              "wind_speed": 3.06,
 *              "wind_deg": 294,
 *              "weather": [
 *                {
 *                "id": 500,
 *                "main": "Rain",
 *                "description": "light rain",
 *                "icon": "10d"
 *                }
 *            ],
 *            "clouds": 56,
 *            "pop": 0.2,
 *            "rain": 0.62,
 *            "uvi": 1.93
 *            },
 *        ],
 *        "city": "Tacoma, US"
 *      }
 * 
 * @apiError (400: Invalid Zipcode) {String} message "Invalid Zipcode"
 *
 */
router.get("/zipcode/:zipcode", (req, res) => {
    //getting user input zipcode
    const {zipcode} = req.params;
    let zipCodeUrl = `http://api.openweathermap.org/geo/1.0/zip?zip=${zipcode}&appid=${API_KEY}`
    //make a request to get the latitude and longitude, city, and country of desired zipcode
    request(zipCodeUrl, function (error, response, body) {
        if (error) {
            res.status(400).send({
                message: "Invalid Zipcode 1 " + zipcode
            })
            return;
        } else {
            //parsing json response to get lat, lon, and city, and country.
            var result = JSON.parse(body);
            //check if user has inputted a valid zipcode. .cod since thats what the api has it called.
            if (result.cod == 404) {
                res.status(400).send({
                    message: "Invalid Zipcode 2 " + zipcode
                })
                return; 
            }
            let lat = result.lat;
            let lon = result.lon;
            let city = result.name + ", " + result.country;
            let weatherUrl = `https://api.openweathermap.org/data/2.5/onecall?exclude=minutely,alerts&units=imperial&lat=${lat}&lon=${lon}&appid=${API_KEY}`;
            // if it is a valid zipcode, get the current, hourly, and daily weather
            request(weatherUrl, function(error, response, body) {
                if (error) {
                    res.status(400).send({
                        message: "Invalid Zipcode 3 " + zipcode
                    })
                    return;
                } else {
                    // sending weather information along with city and country
                    var result = JSON.parse(body);
                    result["city"] = city;
                    res.status(200).send(result);
                }
            })
        }
    })
});

/**
 * @api {get} /lat-lon/:lat/:lon Request for current, hourly, and daily weather information in imperial units. (Lat/Lon)
 * @apiName GetWeatherLatLon
 * @apiGroup Get Weather
 *
 * @apiParam {Number} lat Latitude of desired location.
 * @apiParam {Number} lon Longitude of desired location.
 *
 *
 * @apiSuccess (Success 200) {json} Success json object of weather information
 *
 * @apiSuccessExample {json} Success-Response: 
 *      {
 *        "lat": 33.44,
 *        "lon": -94.04,
 *        "timezone": "America/Chicago",
 *        "timezone_offset": -21600,
 *        "current": {
 *            "dt": 1618317040,
 *            "sunrise": 1618282134,
 *            "sunset": 1618333901,
 *            "temp": 284.07,
 *            "feels_like": 282.84,
 *            "pressure": 1019,
 *            "humidity": 62,
 *            "dew_point": 277.08,
 *            "uvi": 0.89,
 *            "clouds": 0,
 *            "visibility": 10000,
 *            "wind_speed": 6,
 *            "wind_deg": 300,
 *            "weather": [
 *              {
 *                "id": 500,
 *                "main": "Rain",
 *                "description": "light rain",
 *                "icon": "10d"
 *              }
 *            ],
 *            "rain": {
 *              "1h": 0.21
 *            }
 *          },
 *          "hourly": [
 *            {
 *              "dt": 1618315200,
 *              "temp": 282.58,
 *              "feels_like": 280.4,
 *              "pressure": 1019,
 *              "humidity": 68,
 *              "dew_point": 276.98,
 *              "uvi": 1.4,
 *              "clouds": 19,
 *              "visibility": 306,
 *              "wind_speed": 4.12,
 *              "wind_deg": 296,
 *              "wind_gust": 7.33,
 *              "weather": [
 *                {
 *                  "id": 801,
 *                  "main": "Clouds",
 *                  "description": "few clouds",
 *                  "icon": "02d"
 *                }
 *            ],
 *            "pop": 0
 *            },
 *            ...
 *        }
 *            "daily": [
 *            {
 *              "dt": 1618308000,
 *              "sunrise": 1618282134,
 *              "sunset": 1618333901,
 *              "moonrise": 1618284960,
 *              "moonset": 1618339740,
 *              "moon_phase": 0.04,
 *              "temp": {
 *                "day": 279.79,
 *                "min": 275.09,
 *                "max": 284.07,
 *                "night": 275.09,
 *                "eve": 279.21,
 *                "morn": 278.49
 *              },
 *              "feels_like": {
 *                "day": 277.59,
 *                "night": 276.27,
 *                "eve": 276.49,
 *                "morn": 276.27
 *              },
 *              "pressure": 1020,
 *              "humidity": 81,
 *              "dew_point": 276.77,
 *              "wind_speed": 3.06,
 *              "wind_deg": 294,
 *              "weather": [
 *                {
 *                "id": 500,
 *                "main": "Rain",
 *                "description": "light rain",
 *                "icon": "10d"
 *                }
 *            ],
 *            "clouds": 56,
 *            "pop": 0.2,
 *            "rain": 0.62,
 *            "uvi": 1.93
 *            },
 *        ],
 *        "city": "Tacoma, US"
 *      }
 *
 * @apiError (400: Invalid Latitude and/or Longitude) {String} message "Invalid Latitude and/or Longitude"
 *
 */
router.get("/lat-lon/:lat/:lon", (req, res) => {
    //getting user input lat and long
    const {lat} = req.params;
    const {lon} = req.params;
    let cityUrl = `http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`
    //sends request to get the city and country of the latitude and longitude
    request(cityUrl, function (error, response, body) {
        if (error) {
            res.status(400).send({
                message: "Invalid latitude or longitude"
            })
        } else {
            var result = JSON.parse(body);
            if (result.length >= 1) {
                let city = result[0].name + ", " + result[0].country;
                let weatherUrl = `https://api.openweathermap.org/data/2.5/onecall?exclude=minutely,alerts&units=imperial&lat=${lat}&lon=${lon}&appid=${API_KEY}`;
                //If it is a valid lat and lon, get the current, hourly, and daily weather
                request(weatherUrl, function(error, response, body) {
                    if (error) {
                        res.status(400).send({
                            message: "Invalid latitude or longitude"
                        })
                    } else {
                        // sending weather information along with city and country
                        var result = JSON.parse(body);
                        result["city"] = city;
                        res.status(200).send(result);
                    }
                })
            } else {
                res.status(400).send({
                    message: "Invalid latitude or longitude"
                })
            }
        }
    });
});

module.exports = router

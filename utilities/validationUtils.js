/**
 * class of functions for validating first names, last names, nicknames, emails, and passwords
 * @author Shilnara Dam
 * @author Sean Logan
 * @author Levi McCoy
 * @version 1.0
*/

/**
* Checks the parameter to see if it is a valid nickname.
* 
* @param {string} param the value to check
* @returns true if the parameter is valid. false otherwise

*/
let isValidNickname = (param) => {
  return (isStringProvided(param) &&  
  checkStringLength(param, 1))}

/**
 * Checks the parameter to see if it is a valid email.
 * 
 * @param {string} param the value to check
 * @returns true if the parameter is valid. false otherwise
 */
let isValidEmail = (param) => {
  return (isStringProvided(param) &&
  checkStringLength(param, 2) && 
  !checkStringContains(param, " ") && // contains no white space
  checkStringContains(param, "@")) // contains @
}

/**
* Checks the parameter to see if it is a vali password
* 
* @param {string} param the value to check
* @returns true if the parameter is valid. false otherwise
*/
let isValidPassword = (param) => {
  return (isStringProvided(param) &&
  checkStringLength(param, 7) &&
  checkStringContains(param, "[0-9]") && // contains number
  !checkStringContains(param, " ") && // doesnt contains space
  checkStringContains(param, "[a-z]|[A-Z]") && // contains lowercase or uppercase
  checkStringContains(param, "[@#$%&*!?]")) // contain these symbols @#$%&*!?
}

/**
 * Checks the parameter to see if it is a a String with a length greater than 0.
 * 
 * @param {string} param the value to check
 * @returns true if the parameter is a String with a length greater than 0, false otherwise
 */
let isStringProvided = (param) => 
  param !== undefined && param.length > 0

/**
 * helper function to check string length
 * @param {string} param the string to check 
 * @param {int} length  length the string needs to be equal or greater than
 * @returns true if param lngth is greater or equal to length
 */
let checkStringLength = (param, length) => {
  return param.length >= length
}


/**
 * helper function to test whether string contains a character
 * @param {string} param the string to check
 * @param {regexp} regexp regular expression to test the string to
 * @returns true if param contains the pattern in regexp
 */ 
let checkStringContains = (param, regexp) => {
  reg = new RegExp(regexp);
  return reg.test(param)
}

// don't forget to export any 
module.exports = { 
  isStringProvided,
  isValidNickname,
  isValidEmail,
  isValidPassword
}
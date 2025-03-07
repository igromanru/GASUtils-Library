/**
 * Author: Igromanru
 * Source: https://github.com/igromanru/GASUtils-Library
 */

/**
 * Function that checks if the object is a valid Date object without instanceof
 * Attention: "instanceof" doesn't work, if the Date is passed from script to a library function!
 * @param dateTime 
 * @returns 
 */
function isDate(dateTime) {
    return dateTime && (dateTime instanceof Date || !isNaN(Date.parse(dateTime)));
}
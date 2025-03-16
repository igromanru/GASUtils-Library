/**
 * Author: Igromanru
 * Source: https://github.com/igromanru/GASUtils-Library
 */

/**
 * Function that checks if the object is a valid Date object without instanceof
 * Attention: "instanceof" doesn't work, if the Date is passed from script to a library function!
 * @param {Object} dateTime 
 * @returns {boolean}
 */
function isDate(dateTime) {
    return dateTime && (dateTime instanceof Date || !isNaN(Date.parse(dateTime)));
}

/**
 * @param {Date} dateTime 
 * @returns {Date|undefined}
 */
function subtractTimeZoneFromDate(dateTime) {
    if (isDate(dateTime)) {
        const timezoneOffsetAsMs = dateTime.getTimezoneOffset() * (60 * 1000);
        return new Date(dateTime.getTime() + timezoneOffsetAsMs);
    }
    return undefined;
}

/**
 * Converts a JS Date object to Google Sheet's date time format
 * @see: https://stackoverflow.com/a/41655800
 * @param {Date} dateTime
 * @returns {number|undefined}
 */
function dateToSpreadsheetDate(dateTime) {
    if (isDate(dateTime)) {
        const googleZeroDate = new Date(Date.UTC(1899, 11, 30, 0, 0, 0, 0));
        return ((dateTime.getTime() - googleZeroDate.getTime()) / 60000 - dateTime.getTimezoneOffset()) / 1440;
    }
    return undefined;
}

/**
 * @param {Date} dateTime 
 * @returns  {number|undefined}
 */
function dateToSpreadsheetDateAsUtc(dateTime) {
    return dateToSpreadsheetDate(subtractTimeZoneFromDate(dateTime));
}

/**
 * Converts a Google Sheet's date time format to JS Date object
 * @param {number} cellValue
 * @returns {Date|undefined}
 */
function spreadsheetDateToDate(cellValue) {
    if (cellValue) {
        return new Date(cellValue);
    }
    return undefined;
}
/**
 * Author: Igromanru
 * Source: https://github.com/igromanru/GASUtils-Library
 */

/**
 * Converts a JS Date object to Google Sheet's date time format
 * 
 * See: https://stackoverflow.com/a/41655800
 */
function dateToSpreadsheetDate(dateTime) {
    if (isDate(dateTime)) {
        const googleZeroDate = new Date(Date.UTC(1899, 11, 30, 0, 0, 0, 0));
        return ((dateTime.getTime() - googleZeroDate.getTime()) / 60000 - dateTime.getTimezoneOffset()) / 1440;
    }
    return undefined;
}

function dateToSpreadsheetDateAsUtc(dateTime) {
    return dateToSpreadsheetDate(subtractTimeZoneFromDate(dateTime));
}

function spreadsheetDateToDate(cellValue) {
    if (cellValue) {
        return new Date(cellValue);
    }
    return undefined;
}

function getSpreadsheetTimeDifferenceToNow(cellValue) {
    if (cellValue) {
        const dateTime = new Date(cellValue);
        if (isDate(dateTime)) {
            const now = new Date();
            const timeDifference = Math.abs(now - dateTime);
            return {
                days: Math.floor(timeDifference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60)),
            };
        } else {
            console.error(`getSpreadsheetTimeDifferenceToNow: Passed invalid date time parameter:`, cellValue, '\ntype:', typeof cellValue);
        }
    }
    return undefined;
}

function getSpreadsheetTimeDifferenceToNowAsString(cellValue) {
    const timeDifference = getSpreadsheetTimeDifferenceToNow(cellValue);
    if (timeDifference) {
        return timeDifference.days + ' days ' + String(timeDifference.hours).padStart(2, '0') + ':' + String(timeDifference.minutes).padStart(2, '0');
    }
    return "";
}

/**
 * Resets filter for each column to reapply filters
 */
function resetSheetFilter(sheet) {
    if (sheet) {
        const filter = sheet.getFilter();
        if (filter) {
            const range = filter.getRange();
            for (let i = range.getColumn(), maxCol = range.getLastColumn(); i <= maxCol; i++) {
                const filterCriteria = filter.getColumnFilterCriteria(i);
                if (filterCriteria) {
                    filter.setColumnFilterCriteria(i, filterCriteria);
                }
            }
        }
    }
}

/**
 * Runs through all sheets in the spreadsheet and resets filter for each column to reapply filters
 */
function resetAllSpreadsheetFilters(spreadsheet) {
    for (const sheet of spreadsheet.getSheets()) {
        resetSheetFilter(sheet);
    }
}
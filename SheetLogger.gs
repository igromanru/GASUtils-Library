/**
 * Author: Igromanru
 * Source: https://github.com/igromanru/GASUtils-Library
 */

const NativeLogger = Logger;

const LogLevel = Object.freeze({
    Trace: 0,
    Debug: 1,
    Info: 2,
    Warn: 3,
    Error: 4,
    Critical: 5,
    None: 6
});

/**
 * Class that writes logs into a google sheet
 * @class
 * @public
 * @constructor
 */
class SheetLogger {
    /** 
     * @param {Spreadsheet} spreadsheet
     * @param {Sheet} sheet
     */
    constructor(spreadsheet, sheet) {
        if (typeof (spreadsheet) !== "object") {
            throw new Error("spreadsheet parameter has to be a Spreadsheet object!");
        }
        if (typeof (sheetName) != "string") {
            throw new Error("sheet parameter has to be a Sheet object!");
        }

        /**
         * @type {Spreadsheet}
         * @private
         */
        this._spreadsheet = spreadsheet;
        /**
         * @type {Sheet}
         * @private
         */
        this._sheet = sheet;
        /**
         * @type {string[]}
         * @private
         */
        this._header = ["Timestamp", "Level", "Message"];
        /**
         * Maximum number of rows before rotating from beginning.
         * Default: 50000
         * @type {number}
         * @private
         */
        this._maxRows = 50000;
    }

    /**
     * @param {LogLevel} level 
     */
    setLevel(level) {
        if (!level || typeof level !== 'number' || level < LogLevel.Trace || level > LogLevel.None) {
            throw new Error("Logger: level parameter must be a valid LogLevel");
        }

        level_ = level;
        return this;
    }

    setMaxRows(maxRows) {
        if (!maxRows || typeof maxRows !== 'number' || maxRows <= 1) {
            throw new Error("Logger: maxRows parameter must be bigger than 1");
        }

        this._maxRows = maxRows;
        return this;
    }

    debug(message, ...params) {
        this.log_(LogLevel.Debug, message, ...params);
    }

    log(message, ...params) {
        this.info(message, ...params);
    }

    info(message, ...params) {
        this.log_(LogLevel.Info, message, ...params);
    }

    warn(message, ...params) {
        this.log_(LogLevel.Warn, message, ...params);
    }

    error(message, ...params) {
        this.log_(LogLevel.Error, message, ...params);
    }

    critical(message, ...params) {
        this.log_(LogLevel.Critical, message, ...params);
    }

    /**
     * Appends a log entry to the sheet.\n
     * Creates header row if the sheet is empty.
     * @param {LogLevel} level 
     * @param {string} message 
     * @param {...*} params 
     * @returns 
     */
    log_(level, message, ...params) {
        if (level < level_) {
            return;
        }
        const lastRow = this._sheet.getLastRow();
        if (lastRow == 0) {
            this._sheet.appendRow(this._header);
        }

        const rowValues = [dateToSpreadsheetDate(new Date()), Object.keys(LogLevel).find(key => LogLevel[key] === level), formatString(message, ...params)];
        this._sheet.appendRow(rowValues);
    }
}

/**
 * 
 * @param {string} sheetName 
 * @param {?string=} spreadsheetId 
 */
function newSheetLogger(sheetName, spreadsheetId = null) {
    if (!sheetName || typeof sheetName !== 'string') {
        throw new Error("Logger: sheetName parameter must be specified");
    }

    if (typeof spreadsheetId !== 'string' || (typeof spreadsheetId === 'string' && spreadsheetId.trim() === '')) {
        throw new Error("Logger: spreadsheetId parameter must be a valid ID");
    }

    let spreadsheet = null;
    if (spreadsheetId) {
        spreadsheet = SpreadsheetApp.openById(spreadsheetId);
        if (!spreadsheet) {
            throw new Error(`Logger: Couldn't find Spreadsheet with ID: ${spreadsheetId}`);
        }
    } else {
        spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    }
    if (!spreadsheet) {
        throw new Error("Logger: Couldn't find active Spreadsheet");
    }

    const sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
        throw new Error(`Logger: Couldn't find Sheet with name: ${sheetName}`);
    }

    return new SheetLogger(spreadsheet, sheet);
}

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
        if (typeof (sheet) !== "object") {
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

        /**
         * Current log level.  
         * Default: LogLevel.Info
         * @type {LogLevel}
         * @private
         */
        this._level = LogLevel.Info;
    }

    /**
     * @returns {LogLevel}
     */
    getLogLevels() {
        return LogLevel;
    }

    /**
     * @param {LogLevel} level 
     */
    setLevel(level) {
        if (typeof level !== 'number' || level < LogLevel.Trace || level > LogLevel.None) {
            throw new Error(`Logger: level parameter must be a valid LogLevel. Got: ${JSON.stringify(level)}`);
        }

        this._level = level;
        return this;
    }

    setMaxRows(maxRows) {
        if (!maxRows || typeof maxRows !== 'number' || maxRows <= 1) {
            throw new Error("Logger: maxRows parameter must be bigger than 1");
        }

        this._maxRows = maxRows;
        return this;
    }

    /**
     * Logs a trace message.
     * @param {string} message 
     * @param {...*} params 
     * @returns {SheetLogger} this
     */
    trace(message, ...params) {
        return this.log_(LogLevel.Trace, message, ...params);
    }

    /**
     * Logs a debug message.
     * @param {string} message 
     * @param {...*} params 
     * @returns {SheetLogger} this
     */
    debug(message, ...params) {
        return this.log_(LogLevel.Debug, message, ...params);
    }

    /**
     * Logs a info message.
     * @param {string} message 
     * @param {...*} params 
     * @returns {SheetLogger} this
     */
    log(message, ...params) {
        return this.info(message, ...params);
    }

    /**
     * Logs a info message.
     * @param {string} message 
     * @param {...*} params 
     * @returns {SheetLogger} this
     */
    info(message, ...params) {
        return this.log_(LogLevel.Info, message, ...params);
    }

    /**
     * Logs a warning message.
     * @param {string} message 
     * @param {...*} params 
     * @returns {SheetLogger} this
     */
    warn(message, ...params) {
        return this.log_(LogLevel.Warn, message, ...params);
    }

    /**
     * Logs a error message.
     * @param {string} message 
     * @param {...*} params 
     * @returns {SheetLogger} this
     */
    error(message, ...params) {
        return this.log_(LogLevel.Error, message, ...params);
    }

    /**
     * Logs a critical message.
     * @param {string} message 
     * @param {...*} params 
     * @returns {SheetLogger} this
     */
    critical(message, ...params) {
        return this.log_(LogLevel.Critical, message, ...params);
    }

    /**
     * Appends a log entry to the sheet.  
     * Creates header row if the sheet is empty.  
     * Rotates the log if max rows exceeded.
     * @param {LogLevel} level 
     * @param {string} message 
     * @param {...*} params
     * @returns {SheetLogger} this
     */
    log_(level, message, ...params) {
        if (level < this._level) {
            return;
        }
        const lastRow = this._sheet.getLastRow();
        if (lastRow == 0) {
            this._sheet.appendRow(this._header);
        }
        if (lastRow >= this._maxRows) {
            this._sheet.deleteRows(2, lastRow - 1);
        }

        const now = new Date();
        const levelAsString = Object.keys(LogLevel).find(key => LogLevel[key] === level);
        const formattedMessage = formatString(message, ...params);
        NativeLogger.log("%s | %s | %s", now.toISOString(), levelAsString, formattedMessage);

        const rowValues = [dateToSpreadsheetDate(now), levelAsString, formattedMessage];
        this._sheet.appendRow(rowValues);

        return this;
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

    if (spreadsheetId && (typeof spreadsheetId !== 'string' || spreadsheetId.trim() === '')) {
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

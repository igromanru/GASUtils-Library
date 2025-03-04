/**
 * Author: Igromanru
 * Source: https://github.com/igromanru/GASUtils-Library
 */

/**
 * Class to use Sheet as Database
 * @class
 * @public
 * @constructor
 */
class SheetDatabase {
    /** 
     * @param {string} spreadsheetId
     * @param {string} sheetName
     * @param {string[]} columns
     * @param {(string[]|string)} primaryKeyColumns Columns that combined should be unique
     */
    constructor(spreadsheetId, sheetName, columns, primaryKeyColumns) {
        /**
         * @type {Spreadsheet}
         * @private
         */
        this._spreadsheet = SpreadsheetApp.openById(spreadsheetId);
        /**
         * @type {Sheet}
         * @private
         */
        this._sheet = this._spreadsheet.getSheetByName(sheetName);
        /**
         * @type {string[]}
         * @private
         */
        this._columns = columns;
        /**
         * @type {int[]}
         * @private
         */
        this._primaryKeyColumns = Array.isArray(primaryKeyColumns) ? primaryKeyColumns : [primaryKeyColumns]
    }

    /**
     * Add new entry at the end of the table
     * @param object Object which properties match names in columns array which was passed in cstor
     */
    addEntry(object) {

    }

    deleteEntry(id) {

    }
}

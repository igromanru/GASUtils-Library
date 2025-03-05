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
     * @type {Spreadsheet}
     * @private
     */
    #spreadsheet;
    /**
     * @type {Sheet}
     * @private
     */
    #sheet;
    /**
     * @type {string[]}
     * @private
     */
    #columns;
    /**
     * @type {int[]}
     * @private
     */
    #primaryKeyColumns;

    /** 
     * @param {string} spreadsheetId
     * @param {string} sheetName
     * @param {string[]} columns
     * @param {(string[]|string)} primaryKeyColumns Columns that combined should be unique
     */
    constructor(spreadsheetId, sheetName, columns, primaryKeyColumns) {
        if (typeof(spreadsheetId) != "string") {
            throw new Error("spreadsheetId parameter has to be a string!");
        }
        if (typeof(sheetName) != "string") {
            throw new Error("sheetName parameter has to be a string!");
        }
        if (!Array.isArray(columns)) {
            throw new Error("columns parameter has to be a string array!");
        }
        if (typeof(primaryKeyColumns) != "string" && !Array.isArray(primaryKeyColumns)) {
            throw new Error("primaryKeyColumns parameter has to be a string or a string array!");
        }
        this.#spreadsheet = SpreadsheetApp.openById(spreadsheetId);
        if (!this.#spreadsheet) {
            throw new Error(`Couldn't find Spreadsheet with id: ${spreadsheetId}`);
        }
        this.#sheet = this.#spreadsheet.getSheetByName(sheetName);
        if (!this.#sheet) {
            throw new Error(`Couldn't find Sheet with name: ${sheetName}`);
        }
        this.#columns = columns;
        this.#primaryKeyColumns = Array.isArray(primaryKeyColumns) ? primaryKeyColumns : [primaryKeyColumns]
    }

    #mapObjectToRow(object, row) {
        this.#columns.forEach(column => {
            
        });
    }

    /**
     * Add new entry at the end of the table
     * @param object Object which properties match names in columns array which was passed to constructor
     */
    addEntry(object) {

    }

    deleteEntry(id) {

    }
}

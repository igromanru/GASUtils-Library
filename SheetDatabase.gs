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
    #spreadsheet = null;
    /**
     * @type {Sheet}
     * @private
     */
    #sheet = null;
    /**
     * @type {string[]}
     * @private
     */
    #properties = [];
    /**
     * @type {Object<string, int>}
     * @private
     */
    #primaryKeyProperties = {};

    /** 
     * @param {string} spreadsheetId
     * @param {string} sheetName
     * @param {string[]} properties
     * @param {(string[]|string)} primaryKeyProperties Columns that combined should be unique
     */
    constructor(spreadsheetId, sheetName, properties, primaryKeyProperties) {
        if (typeof(spreadsheetId) != "string") {
            throw new Error("spreadsheetId parameter has to be a string!");
        }
        if (typeof(sheetName) != "string") {
            throw new Error("sheetName parameter has to be a string!");
        }
        if (!Array.isArray(columns)) {
            throw new Error("columns parameter has to be a string array!");
        }
        if (typeof(primaryKeyProperties) != "string" && !Array.isArray(primaryKeyProperties)) {
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
        this.#properties = properties;
        primaryKeyProperties = Array.isArray(primaryKeyProperties) ? primaryKeyProperties : [primaryKeyProperties]
        primaryKeyProperties.forEach((element) => {
            for (let i = 0; i < properties.length; i++) {
                if (element === properties[i]) {
                    this.#primaryKeyProperties[element] = i;
                }
            }
        });
    }

    /**
     * 
     * @returns {?Range}
     */
    #getDataRange() {
        if (!this.#sheet) return null;

        const lastRow = this.#sheet.getLastRow(); 
        const numRows = lastRow - 1;

        return this.#sheet.getRange(2, 1, numRows, this.#sheet.getLastColumn());
    }

    /**
     * Return Range to last empty row in the Sheet
     * @see https://developers.google.com/apps-script/reference/spreadsheet/range#getlastrow
     * @returns {?{ rowIndex: number, range: Range }}
     */
    #getLastEmptyRowRange() {
        if (!this.#sheet) return null;

        const lastRow = this.#sheet.getLastRow();
        const nextRow = lastRow + 1;

        return {
            rowIndex: nextRow,
            range: this.#sheet.getRange(nextRow, 1, 1, this.#sheet.getLastColumn())
        };
    }

    /**
     * Return reference to last empty row (values array) in the Sheet
     * @see https://developers.google.com/apps-script/reference/spreadsheet/range#getvalues
     * @returns {?{ rowIndex: number, values: Object[] }}
     */
    #getLastEmptyRowValuesRef() {
        const indexAndRange = this.#getLastEmptyRowRange();
        if (!indexAndRange) return null;
        
        let values = indexAndRange.range.getValues()
        if (!Array.isArray(values) || values.length < 1) return null;

        return {
            rowIndex: indexAndRange.rowIndex,
            values: values[0]
        };
    }

    /**
     * 
     * @param {Object} object 
     * @param {Object[]} rowValues 
     * @returns {boolean} Success
     */
    #mapObjectToRow(object, rowValues) {
        if (!object || !rowValues) return false;

        for (let i = 0; i < this.#properties.length; i++) {
            rowValues[i] = object[this.#properties[i]]
        }
        return true;
    }

    /**
     * 
     * @param {Object} object 
     * @returns {?number}
     */
    #findRowByPrimaryKeys(object) {
        const dataRange = this.#getDataRange();
        if (!dataRange) return null;

        const values = dataRange.getValues();
        const rowIndex = values.findIndex(row => {
            for (const [propertyName, columnIndex] of Object.entries(this.#primaryKeyProperties)) {
                if (row[columnIndex] !== object[propertyName]) {
                    return false;
                }
            }
            return true;
        });
    
        // Return 1-based row number or null if not found
        return rowIndex >= 0 ? rowIndex + 1 : null;
    }

    /**
     * Add new entry at the end of the table
     * @param object Object which properties match names in columns array which was passed to constructor
     * @returns {number} Row number of the new row or -1 if the object already exists
     */
    addEntry(object) {
        if (this.#findRowByPrimaryKeys(object)) return -1;

        let indexAndValues = this.#getLastEmptyRowValuesRef();
        if (!indexAndValues) return -1;

        if (this.#mapObjectToRow(object, indexAndValues.values)) {
            return indexAndValues.rowIndex;
        }
        return -1;
    }

    deleteEntry(id) {

    }
}

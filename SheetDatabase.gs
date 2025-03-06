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
        /**
         * @type {Spreadsheet}
         * @private
         */
        this.spreadsheet = SpreadsheetApp.openById(spreadsheetId);
        if (!this.spreadsheet) {
            throw new Error(`Couldn't find Spreadsheet with id: ${spreadsheetId}`);
        }
        /**
         * @type {Sheet}
         * @private
         */
        this.sheet = this.spreadsheet.getSheetByName(sheetName);
        if (!this.sheet) {
            throw new Error(`Couldn't find Sheet with name: ${sheetName}`);
        }
        /**
         * @type {string[]}
         * @private
         */
        this.properties = properties;
        /**
         * @type {Object<string, int>}
         * @private
         */
        this.primaryKeyProperties = {}
        primaryKeyProperties = Array.isArray(primaryKeyProperties) ? primaryKeyProperties : [primaryKeyProperties]
        primaryKeyProperties.forEach((element) => {
            for (let i = 0; i < properties.length; i++) {
                if (element === properties[i]) {
                    this.primaryKeyProperties[element] = i;
                }
            }
        });
    }

    /**
     * Converts `Values` index to row number, which is 0 at row number 2, when using `getDataRange`.
     * @param {number} index 
     * @returns {number}
     */
    indexToRowNumber(index) {
        return index + 2
    }

    /**
     * 
     * @returns {?Range}
     */
    getDataRange() {
        if (!this.sheet) return null;

        const lastRow = this.sheet.getLastRow();
        const lastColumn = this.sheet.getLastColumn();
        return this.sheet.getRange(2, 1, lastRow, lastColumn);
    }

    /**
     * Return Range to last empty row in the Sheet
     * @see https://developers.google.com/apps-script/reference/spreadsheet/range#getlastrow
     * @returns {?{ row: number, range: Range }}
     */
    getLastEmptyRowRange() {
        if (!this.sheet) return null;

        const lastRow = this.sheet.getLastRow();
        const lastColumn = this.sheet.getLastColumn();

        return {
            row: lastRow,
            range: this.sheet.getRange(lastRow, 1, 1, lastColumn)
        };
    }

    /**
     * Return reference to last empty row (values array) in the Sheet
     * @see https://developers.google.com/apps-script/reference/spreadsheet/range#getvalues
     * @returns {?{ row: number, values: Object[] }}
     */
    getLastEmptyRowValuesRef() {
        const rowAndRange = this.getLastEmptyRowRange();
        if (!rowAndRange) return null;
        
        let values = rowAndRange.range.getValues()
        if (!Array.isArray(values) || values.length < 1) return null;

        return {
            row: rowAndRange.row,
            values: values[0]
        };
    }

    /**
     * 
     * @param {Object} object 
     * @param {Object[]} rowValues 
     * @returns {boolean} Success
     */
    mapObjectToRow(object, rowValues) {
        if (!object || !rowValues) return false;

        for (let i = 0; i < this.properties.length; i++) {
            rowValues[i] = object[this.properties[i]]
        }
        return true;
    }

    /**
     * 
     * @param {Object[]} rowValues 
     * @param {Object} object 
     * @returns {boolean} Success
     */
    mapRowToObject(rowValues, object) {
        if (!rowValues || !object) return false;

        for (let i = 0; i < this.properties.length; i++) {
            object[this.properties[i]] = rowValues[i]
        }
        return true;
    }

    /**
     * 
     * @param {Object} object 
     * @returns {?number}
     */
    findRowByPrimaryKeys(object) {
        const dataRange = this.getDataRange();
        if (!dataRange) return null;

        const values = dataRange.getValues();
        const index = values.findIndex(row => {
            for (const [propertyName, columnIndex] of Object.entries(this.primaryKeyProperties)) {
                if (row[columnIndex] !== object[propertyName]) {
                    return false;
                }
            }
            return true;
        });
    
        // Return 1-based row number or null if not found
        return index > -1 ? this.indexToRowNumber(index) : null;
    }

    /**
     * 
     * @param {Object} primaryKeysObject 
     * @returns {Object}
     */
    getEntry(primaryKeysObject) {

    }

    /**
     * Add new entry at the end of the table
     * @param object Object which properties match names in columns array which was passed to constructor
     * @returns {number} Row number of the new row or -1 if the object already exists
     */
    addEntry(object) {
        if (this.findRowByPrimaryKeys(object)) return -1;

        let rowAndValues = this.getLastEmptyRowValuesRef();
        if (!rowAndValues) return -1;

        if (this.mapObjectToRow(object, rowAndValues.values)) {
            return rowAndValues.row;
        }
        return -1;
    }

    /**
     * 
     * @param {Object} primaryKeysObject Object that contains properties that were given as "primaryKeyProperties" in cstor
     * @returns {boolean} Deleted successfully
     */
    deleteEntry(primaryKeysObject) {
        const row = this.findRowByPrimaryKeys(primaryKeysObject);
        if (!row || row < 2) return false;

        this.sheet.deleteRow(row)
    }
}

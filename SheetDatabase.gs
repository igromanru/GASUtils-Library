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
        if (!Array.isArray(properties)) {
            throw new Error("columns parameter has to be a string array!");
        }
        if (typeof(primaryKeyProperties) != "string" && !Array.isArray(primaryKeyProperties)) {
            throw new Error("primaryKeyColumns parameter has to be a string or a string array!");
        }
        /**
         * @type {Spreadsheet}
         * @private
         */
        this._spreadsheet = SpreadsheetApp.openById(spreadsheetId);
        if (!this._spreadsheet) {
            throw new Error(`Couldn't find Spreadsheet with id: ${spreadsheetId}`);
        }
        /**
         * @type {Sheet}
         * @private
         */
        this._sheet = this._spreadsheet.getSheetByName(sheetName);
        if (!this._sheet) {
            throw new Error(`Couldn't find Sheet with name: ${sheetName}`);
        }
        /**
         * @type {string[]}
         * @private
         */
        this._properties = properties;
        /**
         * @type {Object<string, int>}
         * @private
         */
        this._primaryKeyProperties = {}
        primaryKeyProperties = Array.isArray(primaryKeyProperties) ? primaryKeyProperties : [primaryKeyProperties]
        primaryKeyProperties.forEach((element) => {
            for (let i = 0; i < properties.length; i++) {
                if (element === properties[i]) {
                    this._primaryKeyProperties[element] = i;
                }
            }
        });
    }

    /**
     * Converts `Values` index to row number, which is 0 at row number 2, when using `getDataRange`.
     * @param {number} index 
     * @returns {number}
     */
    _indexToRowNumber(index) {
        return index + 2
    }

    /**
     * @returns {number} Row number
     */
    _getNewRow() {
        if (!this._sheet) return null;
        return this._sheet.getLastRow() + 1;
    }

    /**
     * 
     * @returns {?Range}
     */
    _getDataRange() {
        if (!this._sheet) return null;

        const rowNums = this._sheet.getLastRow() - 1;
        if (rowNums <= 0) return null;

        const lastColumn = this._sheet.getLastColumn();
        return this._sheet.getRange(2, 1, rowNums, lastColumn);
    }

    /**
     * 
     * @param {number} row Row number
     * @returns {?Range}
     */
    _getRowRange(row) {
        if (!this._sheet || typeof(row) !== "number" || row < 2) return null;

        return this._sheet.getRange(row, 1, 1, this._sheet.getLastColumn());
    }

    /**
     * Return Range to last empty row in the Sheet
     * @see https://developers.google.com/apps-script/reference/spreadsheet/range#getlastrow
     * @returns {?{ row: number, range: Range }}
     */
    _getNewRowRange() {
        if (!this._sheet) return null;

        const newRow = this._getNewRow();
        return {
            row: newRow,
            range: this._getRowRange(newRow)
        };
    }

    /**
     * 
     * @param {Object} object 
     * @returns {?Object[]} rowValues
     */
    _objectToRowValues(object) {
        if (!object) return null;

        let rowValues = [];
        for (let i = 0; i < this._properties.length; i++) {
            const propertyName = this._properties[i];
            const value = object[propertyName];
            if (typeof(value) === "object") {
                if (isDate(value)) {
                    rowValues[i] = dateToSpreadsheetDate(value);
                } else {
                    rowValues[i] = JSON.stringify(value);
                }
            } else {
                rowValues[i] = value;
            }
        }
        return rowValues;
    }

    /**
     * 
     * @param {Object[]} rowValues 
     * @returns {?Object}
     */
    _rowValuesToObject(rowValues) {
        if (!rowValues) return null;

        let object = {}
        for (let i = 0; i < this._properties.length; i++) {
            const propertyName = this._properties[i];
            const value = rowValues[i];
            try {
                object[propertyName] = JSON.parse(value);
            } catch (error) {
                object[propertyName] = value;
            }
        }
        return object;
    }

    /**
     * 
     * @param {number} row Row number
     * @returns {?Object}
     */
    _rowToObject(row) {
        if (!row || row < 1) return null;

        const range = this._getRowRange(row);
        if (!range) return null;

        const values = range.getValues();
        if (values.length == 0) return null;

        return this._rowValuesToObject(values[0]);
    }

    /**
     * 
     * @param {Object} object 
     * @returns {?number}
     */
    findRowByPrimaryKeys(object) {
        if (!object) return null;

        const dataRange = this._getDataRange();
        if (!dataRange) return null;

        const values = dataRange.getValues();
        const index = values.findIndex(row => {
            for (const [propertyName, columnIndex] of Object.entries(this._primaryKeyProperties)) {
                if (row[columnIndex] !== object[propertyName]) {
                    return false;
                }
            }
            return true;
        });
    
        // Return 1-based row number or null if not found
        return index > -1 ? this._indexToRowNumber(index) : null;
    }

    /**
     * 
     * @returns {Object[]}
     */
    getAllEntry() {
        let entries = new Array();
        const range = this._getDataRange()
        if (!range) return [];

        const values = range.getValues();
        for (let i = 0; i < values.length; i++) {
            const rowValues = values[i];
            const object = this._rowValuesToObject(rowValues);
            if (object) {
                entries.push(object)
            }
        }
        return entries;
    }

    /**
     * 
     * @param {Object} primaryKeysObject 
     * @returns {?Object}
     */
    getEntry(primaryKeysObject) {
        const row = this.findRowByPrimaryKeys(primaryKeysObject);
        if (!row || row < 2) return null;

        return this._rowToObject(row)
    }

    /**
     * @returns {?Object}
     */
    getLastEntry() {
        if (!this._sheet) return null;

        let row = this._sheet.getLastRow()
        if (!row || row < 2) return null;

        return this._rowToObject(row)
    }

    /**
     * Add new entry at the end of the table
     * @param object Object which properties match names in columns array which was passed to constructor
     * @returns {number} Row number of the new row or -1 if the object already exists
     */
    addEntry(object) {
        const foundRow = this.findRowByPrimaryKeys(object);
        if (typeof(foundRow) === "number" && foundRow > 1) return -1;

        const rowAndRange = this._getNewRowRange();
        if (!rowAndRange || rowAndRange.row < 2) return null;

        const newValues = this._objectToRowValues(object)
        if (!Array.isArray(newValues)) return -1;

        rowAndRange.range.setValues([newValues]);
        return rowAndRange.row;
    }

    /**
     * 
     * @param {Object} object 
     * @returns {boolean} Success
     */
    updateEntry(object) {
        const foundRow = this.findRowByPrimaryKeys(object);
        if (typeof(foundRow) !== "number" || foundRow < 2) return false;

        const range = this._getRowRange(foundRow);
        if (!range) return false;

        const rowValues = this._objectToRowValues(object);
        if (!Array.isArray(rowValues)) return false;

        range.setValues([rowValues]);
        return true;
    }

    /**
     * 
     * @param {Object} primaryKeysObject Object that contains properties that were given as "primaryKeyProperties" in cstor
     * @returns {boolean} Deleted successfully
     */
    deleteEntry(primaryKeysObject) {
        const row = this.findRowByPrimaryKeys(primaryKeysObject);
        if (!row || row < 2) return false;

        return this._sheet.deleteRow(row) !== null;
    }
}

/** 
 * @param {string} spreadsheetId
 * @param {string} sheetName
 * @param {string[]} properties
 * @param {(string[]|string)} primaryKeyProperties Columns that combined should be unique
 */
function newSheetDatabase(spreadsheetId, sheetName, properties, primaryKeyProperties) {
    return new SheetDatabase(spreadsheetId, sheetName, properties, primaryKeyProperties);
}

const TradeSignalSpreadsheetId = Symbol('TradeSignalSpreadsheetId');
Object.defineProperty(this, TradeSignalSpreadsheetId, {
  value: "1S7S9d3JoNMb00KBVxLw9nUxGBCd8_P166jHKEjBLw6M",
  writable: false, // read-only
  enumerable: false, // Hide from library users
  configurable: false // Prevent further changes to this property
});

const TradeSignalDatabaseSheet = Symbol('TradeSignalDatabaseSheet');
Object.defineProperty(this, TradeSignalDatabaseSheet, {
  value: "Database",
  writable: false, // read-only
  enumerable: false, // Hide from library users
  configurable: false // Prevent further changes to this property
});

function test_addEntry_deleteEntry() {
    const tradeSignal = {
        Id: Utilities.getUuid(),
        Pair: "XAUUSD",
        Entry: 2990,
        Short: false,
        StopLoss: 2880,
        TakeProfits: [2995, 3000],
        Author: "1661508107",
        CreatedAt: new Date()
    };
    const database = newSheetDatabase(this[TradeSignalSpreadsheetId], this[TradeSignalDatabaseSheet], ["Id", "Pair", "Entry", "Short", "StopLoss", "TakeProfits", "Author", "CreatedAt"], "Id");
    console.log(`addEntry: ${database.addEntry(tradeSignal)}`);
    
    console.log(`deleteEntry: ${database.deleteEntry(tradeSignal)}`);
}

function test_getLastEntry_updateEntry() {
    const database = newSheetDatabase(this[TradeSignalSpreadsheetId], this[TradeSignalDatabaseSheet], ["Id", "Pair", "Entry", "Short", "StopLoss", "TakeProfits", "Author", "CreatedAt"], "Id");
    const entry = database.getLastEntry();
    console.log(JSON.stringify(entry));

    entry.Pair = "EURUSD";
    entry.Entry = 2000;
    entry.Short = true;
    entry.StopLoss = 2100;
    entry.TakeProfits = [1950, 1900];
    entry.Author = "igromanru";
    console.log("Update:", database.updateEntry(entry));
}
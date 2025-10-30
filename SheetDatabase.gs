/**
 * Author: Igromanru
 * Source: https://github.com/igromanru/GASUtils-Library
 */

/**
 * Class to use Sheet as View for a Database (read only access)
 * @class
 * @public
 * @constructor
 */
class SheetView {
    /** 
     * @param {string} spreadsheetId
     * @param {string} sheetName
     * @param {string[]} properties
     * @param {(string[]|string)} primaryKeyProperties Columns that combined should be unique
     */
    constructor(spreadsheetId, sheetName, properties, primaryKeyProperties) {
        if (typeof (spreadsheetId) != "string") {
            throw new Error("spreadsheetId parameter has to be a string!");
        }
        if (typeof (sheetName) != "string") {
            throw new Error("sheetName parameter has to be a string!");
        }
        if (!Array.isArray(properties)) {
            throw new Error("columns parameter has to be a string array!");
        }
        if (typeof (primaryKeyProperties) != "string" && !Array.isArray(primaryKeyProperties)) {
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
     * 
     * @returns {?Range}
     */
    _getDataRange() {
        if (!this._sheet) return null;

        const rowCount = this._sheet.getLastRow() - 1;
        if (rowCount <= 0) return null;

        const lastColumn = this._sheet.getLastColumn();
        return this._sheet.getRange(2, 1, rowCount, lastColumn);
    }

    /**
     * 
     * @param {number} row Row number
     * @returns {?Range}
     */
    _getRowRange(row) {
        if (!this._sheet || typeof (row) !== "number" || row < 2) return null;

        return this._sheet.getRange(row, 1, 1, this._sheet.getLastColumn());
    }

    /**
     * 
     * @param {Object[]} rowValues
     * @param {number=} rowNumber if set, will add `_rowNumber` property to the return object
     * @returns {?Object}
     */
    _rowValuesToObject(rowValues, rowNumber = null) {
        if (!rowValues || !Array.isArray(rowValues)) return null;

        const obj = {}
        const props = this._properties;

        if (Number.isInteger(rowNumber) && rowNumber > 0) {
            obj["_rowNumber"] = rowNumber;
        }

        for (let i = 0; i < props.length; i++) {
            const propName = props[i];
            let cellValue = i < rowValues.length ? rowValues[i] : undefined;

            if (cellValue === '' || cellValue === null || cellValue === undefined) {
                obj[propName] = undefined;
                continue;
            }

            // if (isDate(cellValue)) {
            //     obj[propName] = cell;
            //     continue;
            // }

            const numberOrString = toNumberOrString(cellValue);
            if (numberOrString) {
                obj[propName] = numberOrString;
                continue;
            }

            let parsed = null;
            try {
                parsed = JSON.parse(cellValue);
            } catch (_) {
                // Nothing to do here
            }

            if (typeof parsed === 'object' && parsed !== null) {
                obj[propName] = parsed;
                continue;
            }

            obj[propName] = cellValue;
        }

        return obj;
    }

    /**
     * The function reads a row from the sheet and converts it to an object.\n
     * @param {number} row Row number
     * @returns {?Object}
     */
    _rowToObject(row) {
        if (!Number.isInteger(row) || row < 1) return null;

        const range = this._getRowRange(row);
        if (!range) return null;

        const values = range.getValues();
        if (values.length == 0) return null;

        return this._rowValuesToObject(values[0], row);
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
            const object = this._rowValuesToObject(rowValues, i);
            if (object) {
                entries.push(object)
            }
        }
        return entries;
    }

    /**
     * @returns {?Object}
     */
    getLastEntry() {
        if (!this._sheet) return null;

        let row = this._sheet.getLastRow()
        if (!row || row <= 1) return null;

        return this._rowToObject(row)
    }

    /**
     * 
     * @param {Object} primaryKeysObject 
     * @returns {?Object}
     */
    getEntry(primaryKeysObject) {
        const row = this.findRowByPrimaryKeys(primaryKeysObject);
        if (!row || row <= 1) return null;

        return this._rowToObject(row)
    }
}

/**
 * Class to use Sheet as Database
 * @class
 * @public
 * @constructor
 */
class SheetDatabase extends SheetView {
    /** 
     * @param {string} spreadsheetId
     * @param {string} sheetName
     * @param {string[]} properties
     * @param {(string[]|string)} primaryKeyProperties Columns that combined should be unique
     * @param {Date=?} createdAtProperty Column name for CreatedAt timestamp
     * @param {Date=?} modifiedAtProperty Column name for ModifiedAt timestamp
     */
    constructor(spreadsheetId, sheetName, properties, primaryKeyProperties, createdAtProperty, modifiedAtProperty) {
        super(spreadsheetId, sheetName, properties, primaryKeyProperties);

        /**
         * @type {Date=?}
         * @private
         */
        this._createdAtProperty = createdAtProperty;

        /**
         * @type {Date=?}
         * @private
         */
        this._modifiedAtProperty = modifiedAtProperty;
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
            if (typeof (value) === "object") {
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
     * @param {Object} object 
     * @returns {boolean} Was set
     */
    _autoSetCreatedAt(object) {
        if (!object) return false;

        if (this._createdAtProperty && !object[this._createdAtProperty]) {
            object[this._createdAtProperty] = new Date();
            return true;
        }
        return false;
    }

    /**
     * 
     * @param {Object} object 
     * @returns {boolean} Was set
     */
    _autoSetModifiedAt(object) {
        if (!object) return false;

        if (this._modifiedAtProperty) {
            object[this._modifiedAtProperty] = new Date();
            return true;
        }
        return false;
    }

    /**
     * Add new entry at the end of the table
     * @param {Object} object Object which properties match names in columns array which was passed to constructor
     * @returns {number} Row number of the new row or -1 if the object already exists
     */
    addEntry(object) {
        const foundRow = this.findRowByPrimaryKeys(object);
        if (typeof (foundRow) === "number" && foundRow > 1) return -1;

        this._autoSetCreatedAt(object);
        this._autoSetModifiedAt(object);

        const newValues = this._objectToRowValues(object)
        if (!Array.isArray(newValues)) return -1;

        if (this._sheet.appendRow(newValues)) {
            return this._sheet.getLastRow();
        }
        return -1;
    }

    /**
     * 
     * @param {Object} object 
     * @returns {number} Row number of the updated row or -1 if the update failed
     */
    updateEntry(object) {
        const foundRow = this.findRowByPrimaryKeys(object);
        if (typeof (foundRow) !== "number" || foundRow < 2) return -1;

        const range = this._getRowRange(foundRow);
        if (!range) return -1;

        this._autoSetModifiedAt(object);

        const rowValues = this._objectToRowValues(object);
        if (!Array.isArray(rowValues)) return -1;

        range.setValues([rowValues]);
        return foundRow;
    }

    /**
     * 
     * @param {Object} object 
     * @returns {number} Row number of added or updated row or -1 if the operation failed
     */
    addOrUpdateEntry(object) {
        const foundRow = this.findRowByPrimaryKeys(object);

        if (foundRow && foundRow > 0) {
            this._autoSetModifiedAt(object);
        } else {
            this._autoSetCreatedAt(object);
        }

        const rowValues = this._objectToRowValues(object);
        if (!Array.isArray(rowValues)) return -1;

        const range = this._getRowRange(foundRow);
        if (range) {
            range.setValues([rowValues]);
            return range.getRowIndex();
        } else if (this._sheet.appendRow(rowValues)) {
            return this._sheet.getLastRow();
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

        return this._sheet.deleteRow(row) !== null;
    }
}

/** 
 * @param {string} spreadsheetId
 * @param {string} sheetName
 * @param {string[]} properties
 * @param {(string[]|string)} primaryKeyProperties Columns that combined should be unique
 */
function newSheetView(spreadsheetId, sheetName, properties, primaryKeyProperties) {
    return new SheetView(spreadsheetId, sheetName, properties, primaryKeyProperties);
}

/** 
 * @param {string} spreadsheetId
 * @param {string} sheetName
 * @param {string[]} properties
 * @param {(string[]|string)} primaryKeyProperties Columns that combined should be unique
 * @param {Date=?} createdAtProperty Column name for CreatedAt timestamp
 * @param {Date=?} modifiedAtProperty Column name for ModifiedAt timestamp
 */
function newSheetDatabase(spreadsheetId, sheetName, properties, primaryKeyProperties, createdAtProperty, modifiedAtProperty) {
    return new SheetDatabase(spreadsheetId, sheetName, properties, primaryKeyProperties, createdAtProperty, modifiedAtProperty);
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
    Utilities.sleep(1000)
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

function test_addOrUpdateEntry_deleteEntry() {
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
    console.log(`addOrUpdateEntry 1: ${database.addOrUpdateEntry(tradeSignal)}`);
    Utilities.sleep(1000)
    tradeSignal.Pair = "EURUSD";
    tradeSignal.Entry = 1337;
    console.log(`addOrUpdateEntry 2: ${database.addOrUpdateEntry(tradeSignal)}`);
    Utilities.sleep(2000)
    console.log(`deleteEntry: ${database.deleteEntry(tradeSignal)}`);
}
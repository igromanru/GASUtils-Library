/**
 * Author: Igromanru
 * Source: https://github.com/igromanru/GASUtils-Library
 */

/**
 * Tries to convert a value to a number
 * @param {Object} value Any value
 * @returns {number|undefined} The number representation or undefined if conversion failed
 */
function toNumber(value) {
    let number = Number(value);

    if (Number.isFinite(number)) {
        return number;
    }

    return undefined;
}

/**
 * Tries to convert a value to BigInt
 * @param {Object} value Any value
 * @returns {BigInt|undefined} The BigInt representation or undefined if conversion failed
 */
function toBigInt(value) {
    if (!value) return undefined;
    if (typeof value == 'bigint') return value;

    try {
        return BigInt(value);
    } catch (e) {
        // Nothing to do here
    }
    return undefined;
}

/**
 * Checks if a value can be safely represented as a number
 * @param {number} number Any number 
 * @returns {boolean}
 */
function isSafeNumber(number) {
    if (typeof number !== 'number' || !Number.isFinite(number)) return false;

    return number >= Number.MIN_SAFE_INTEGER && number <= Number.MAX_SAFE_INTEGER;
}

/**
 * Converts value to number, if it's too big, return it as string
 * @param {Object} value An object that can be parsed as a number
 * @returns {number|string|undefined} Returns undefined, if `value` is not a number, string or BigInt
 */
function toNumberOrString(value) {
    let number = toNumber(value);
    if (isSafeNumber(number)) return number;

    if (typeof value === 'string' || typeof value === 'bigint') {
        return value.toString();
    }

    return undefined;
}

function _testToNumber() {
    var result = toNumber("lol");
    console.log('type of: ' + typeof result)
    console.log(result)

    result = toNumber(123);
    console.log('type of: ' + typeof result)
    console.log(result.toString())

    result = toNumber(" 123");
    console.log('type of: ' + typeof result)
    console.log(result.toString())
}

function _testToBigInt() {
    var result = toBigInt("lol");
    console.log('type of: ' + typeof result)
    console.log(result)

    result = toBigInt(BigInt(123));
    console.log('type of: ' + typeof result)
    console.log(result.toString())

    result = toBigInt(145);
    console.log('type of: ' + typeof result)
    console.log(result.toString())

    result = toBigInt(" 123");
    console.log('type of: ' + typeof result)
    console.log(result.toString())
}
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
 * @param {Object} value 
 * @returns {boolean}
 */
function isNumberSafe(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) return false;

  return number >= Number.MIN_SAFE_INTEGER && number <= Number.MAX_SAFE_INTEGER;
}

/**
 *  Converts value to number, if it's too big, try to convert to BigInt and returns it as string
 * @param {Object} value Any object, but preferably string or number
 * @returns {number|string|undefined}
 */
function toNumberOrBigIntString(value) {
  // if (typeof value == 'bigint') return value.toString();
  let number = toNumber(value);
  if (isNumberSafe(number)) return number;

  let bigInt = toBigInt(value);
  if (bigInt) return bigInt.toString();

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
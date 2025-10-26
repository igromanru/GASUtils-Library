/**
 * Author: Igromanru
 * Source: https://github.com/igromanru/GASUtils-Library
 */

/**
 * Decodes a Base64 string into a uint64 (as BigInt)
 * @param {string} base64 - The Base64-encoded string
 * @return {BigInt}
 */
function base64ToUInt64(base64) {
    const binaryString = Utilities.base64Decode(base64);
    const bytes = new Uint8Array(binaryString);

    if (bytes.length !== 8) {
        console.error(`base64ToUInt64: Expected 8 bytes for uint64, got :`, bytes.length);
        return undefined;
    }

    // Interpret as BigInt (big-endian)
    let value = BigInt(0);
    for (let i = 0; i < 8; i++) {
        value = (value << BigInt(8)) + BigInt(bytes[i]);
    }

    return value;
}

/**
 * Encode a uint64 (BigInt or decimal string) to a Base64 string (8 bytes, big-endian).
 * @param {BigInt|string|number} value  The 64-bit unsigned integer.
 *                                      - BigInt (preferred)
 *                                      - or a decimal string like "18446744073709551615"
 *                                      - or a Number (only safe up to 2^53-1)
 * @return {string} Base64 representation (12 characters + padding)
 */
function uint64ToBase64(value) {
    // ------------------------------------------------------------
    // 1. Normalise the input to a BigInt (runtime, no `n` literal)
    // ------------------------------------------------------------
    let n;
    if (typeof value === 'bigint') {
        n = value;
    } else if (typeof value === 'string') {
        // string → BigInt (works for any length)
        n = BigInt(0);
        for (let i = 0; i < value.length; i++) {
            n = n * BigInt(10) + BigInt(value.charCodeAt(i) - 48); // '0' = 48
        }
    } else {
        // Number – only safe for values ≤ 2^53-1
        n = BigInt(value);
    }

    // ------------------------------------------------------------
    // 2. Sanity check – must be 0 … 2^64-1
    // ------------------------------------------------------------
    const MAX_UINT64 = (BigInt(1) << BigInt(64)) - BigInt(1);
    if (n < BigInt(0) || n > MAX_UINT64) {
        console.error(`uint64ToBase64: Value is not a valid uint64`);
        return undefined;
    }

    // ------------------------------------------------------------
    // 3. Extract 8 bytes (big-endian)
    // ------------------------------------------------------------
    const bytes = new Uint8Array(8);
    for (let i = 7; i >= 0; i--) {               // start from LSB
        bytes[i] = Number(n & BigInt(0xFF));        // low 8 bits
        n = n >> BigInt(8);                        // shift right 8 bits
    }

    // ------------------------------------------------------------
    // 4. Encode to Base64
    // ------------------------------------------------------------
    return Utilities.base64Encode(bytes);
}

function _testUint64() {
    // 2^64-1  →  all-255 bytes  →  Base64 = "//////////8="
    const b64 = 'EQAAEBz6ZQ==';
    const num = base64ToUInt64(b64);

    // Convert to string for logging (Logger can't print BigInt directly)
    Logger.log('uint64 = ' + num.toString());   // 18446744073709551615
}

function _testUint64RoundTrip() {
    const original = BigInt('76561197990651472');   // 2^64-1
    const b64 = uint64ToBase64(original);
    Logger.log('Base64: ' + b64);                     // /////////8=

    const back = base64ToUInt64(b64);
    Logger.log('Round-trip: ' + back.toString());     // 18446744073709551615
}
/**
 * Author: Igromanru
 * Source: https://github.com/igromanru/GASUtils-Library
 */

function formatString(message, ...args) {
    try {
        return Utilities.formatString(message, ...args);
    } catch (e) {
        return template;
    }
}
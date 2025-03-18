/**
 * Author: Igromanru
 * Source: https://github.com/igromanru/GASUtils-Library
 */

/**
 * Converts JS Date to Discord timestamp
 * @see: https://discord.com/developers/docs/reference#message-formatting
 * @param {Date} dateTime 
 * @param {string} style 
 * @returns {string}
 */
function dateToDiscordTimestamp(dateTime, style = 'f') {
    const unix = dateToUnixTimestamp(dateTime);
    return unix ? `<t:${unix}:${style}>` : '';
}
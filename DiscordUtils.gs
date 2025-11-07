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

/**
 * Send a message to #games-updates channel.
 * @param {string} webHookUrl 
 * @param {string} embedTitle 
 * @param {string} embedDescription 
 * @param {string} [messageContent='']
 * @param {string} [sourceUrl='']
 */
function sendDiscordWebHook(webHookUrl, embedTitle = '', embedDescription = '', messageContent = '', sourceUrl = '') {
    let embedJson = undefined;
    if (embedTitle || embedDescription) {
        embedJson = {
            title: embedTitle,
            type: 'rich',
            description: embedDescription,
            url: sourceUrl
        };
    }

    const jsobObject = {
        content: messageContent
    };

    if (embedJson) {
        jsobObject.embeds = [embedJson];
    }

    const payload = JSON.stringify(jsobObject);
    console.log('sendDiscordWebHook Payload: ' + payload);

    const response = UrlFetchApp.fetch(
        webHookUrl,
        {
            method: 'POST',
            contentType: 'application/json',
            payload: payload,
            muteHttpExceptions: true
        }
    );
    console.log('sendDiscordWebHook response code: ' + response.getResponseCode());
    const content = response.getContentText();
    if (content) {
        console.log('sendDiscordWebHook response content: ' + content);
    }
}
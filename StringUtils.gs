/**
 * Author: Igromanru
 * Source: https://github.com/igromanru/GASUtils-Library
 */

function formatString(message, ...args) {
    if (!message) return '';

    // Split template into static parts and % placeholders
    const parts = message.split(/(%[sdj%])/);
    let result = '';
    let argIndex = 0;

    for (const part of parts) {
        if (part === '%s') {
            result += args[argIndex++] ?? '%s';
        } else if (part === '%d') {
            const num = Number(args[argIndex++]);
            result += isNaN(num) ? '%d' : num;
        } else if (part === '%j') {
            try {
                result += JSON.stringify(args[argIndex++]);
            } catch {
                result += '%j';
            }
        } else if (part === '%%') {
            result += '%';
        } else {
            result += part;
        }
    }

    // Append any leftover args
    if (argIndex < args.length) {
        result += ' ' + args.slice(argIndex).map(String).join(' ');
    }

    return result;
}
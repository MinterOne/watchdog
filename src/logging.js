import Telegram from './adapters/TelegramBotApi';
import {
    WATCHDOG_MONIKER,
    WATCHDOG_MAX_MISSED,
    WATCHDOG_DONT_NOTIFY_MISSED,
    MINTER_EXPLORER_URL
} from './config';

const shutdownMessage = '\ud83d\uded1 *Валидатор выключен*\n\n{{link}}\n\n*{{moniker}}*';
const errorMessage = '\u203c\ufe0f Пропущен блок *{{missedBlock}}*\n*{{moniker}}*';
const statusMessage = 
    'Блок *{{lastBlock}}:*\n' +
    '{{missedBlockCount}} пропущено из {{maxErrorRate}}\n' +
    '`{{artwork}}`\n\n' +
    '*{{moniker}}* \ud83d\udd51 {{date}}';


let telegramMessageId = null;

const updateLastMessageId = (id) => {
    if (id > telegramMessageId || 0) {
        telegramMessageId = id;
    }
};

const resetLastMessageId = (id) => {
    if (id > telegramMessageId || 0) {
        telegramMessageId = null;
    }
};


const stackArtwork = function drawMissedAndPresentBlocks(stack) {
    const map = [];
    for (let item in stack) {
        map.push(stack[item].present ? '.' : '#');
    }

    return map.join('');
};

const filterMarkdown = function removeClutterFromMarkdown(string) {
    return string
        .replace(/\n/g, ' ')
        .replace(/\*/g, '')
        .replace(/`/g, '');
};

const formatDate = function convertIso8601ToReadableDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ru', {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
};

const handleError = function handleTelegramError(error) {
    // Axios-handled HTTP error:
    if (typeof error === 'object' && 'response' in error && error.response) {
        const message = 'data' in error.response
            ? error.response.data.description 
            : error.response.statusText;

        return console.error('Telegram error: %s', message);
    }

    // JS exception:
    return Promise.reject(error);
};

export default {
    /**
     * @param  {Array}   options.stack
     * @param  {Number}  options.missedBlockCount
     * @param  {Object}  options.lastKnownBlock
     * @return {Promise}
     */
    updateStatus({ stack, missedBlockCount, lastKnownBlock }) {
        const text = statusMessage
            .replace('{{moniker}}', WATCHDOG_MONIKER)
            .replace('{{lastBlock}}', lastKnownBlock.height)
            .replace('{{missedBlockCount}}', missedBlockCount)
            .replace('{{maxErrorRate}}', WATCHDOG_MAX_MISSED)
            .replace('{{artwork}}', stackArtwork(stack))
            .replace('{{date}}', formatDate(lastKnownBlock.time));

        console.log(filterMarkdown(text));

        // don't send telegram notifications if disabled
        if (WATCHDOG_DONT_NOTIFY_MISSED) {
            return
        }

        // If there are missed blocks, update every block,
        // else update every 10 blocks to avoid flood errors:
        const shouldUpdateMessage = missedBlockCount || lastKnownBlock.height % 10 == 0;

        // No ID means we have not sent any messages yet:
        if (! telegramMessageId) {
            return Telegram.sendMessage({ text })
                .then(({ message_id }) => updateLastMessageId(message_id))
                .catch(handleError);
        }

        // We have an ID, so we can update the message:
        if (shouldUpdateMessage) {
            return Telegram
                .editMessageText({ text, message_id: telegramMessageId })
                .catch(handleError);
        }
    },

    /**
     * @param  {Number}  options.missedBlock
     * @return {Promise}
     */
    reportMissingBlock({ missedBlock }) {
        const params = {
            disable_notification: false,
            text: errorMessage
                .replace('{{missedBlock}}', missedBlock.height)
                .replace('{{moniker}}', WATCHDOG_MONIKER),
        };

        console.error(filterMarkdown(params.text));

        // don't send telegram notifications if disabled
        if (WATCHDOG_DONT_NOTIFY_MISSED) {
            return
        }

        return Telegram.sendMessage(params)
            .then(({ message_id }) => resetLastMessageId(message_id))
            .catch(handleError);
    },

    /**
     * @param  {String} tx_hash
     * @return {Promise}
     */
    reportValidatorShutdown(tx_hash) {
        const params = {
            disable_notification: false,
            text: shutdownMessage
                .replace('{{link}}', `${MINTER_EXPLORER_URL}/transactions/${tx_hash}`)
                .replace('{{moniker}}', WATCHDOG_MONIKER),
        };

        console.error(filterMarkdown(params.text));

        return Telegram.sendMessage(params)
            .then(({ message_id }) => resetLastMessageId(message_id))
            .catch(handleError);
    },
};

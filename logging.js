import config from './config';
import telegram from './telegram';

let telegramMessageId = null;

const shutdownMessage = '\ud83d\uded1 *Выключаю валидатор*';
const errorMessage = '\u203c\ufe0f Пропущен блок *{{missedBlock}}*\n*{{moniker}}*';
const statusMessage = 
    'Блок *{{lastBlock}}:*\n' +
    '{{missedBlocks}} пропущено из {{maxErrorRate}}\n' +
    '`{{artwork}}`\n\n' +
    '*{{moniker}}* \ud83d\udd51 {{date}}';

function filterMarkdown (string) {
    return string
        .replace(/\n/g, ' ')
        .replace(/\*/g, '')
        .replace(/`/g, '');
};

function stackArtwork (stack) {
    const map = [];
    for (let item in stack) {
        map.push(stack[item].present ? '.' : '#');
    }

    return map.join('');
};

function updateLastMessageId (id) {
    if (id > telegramMessageId || 0) {
        telegramMessageId = id;
    }
};

function resetLastMessageid (id) {
    if (id > telegramMessageId || 0) {
        telegramMessageId = null;
    }
};

function formatDate (time) {
    const date = new Date(time);
    return date.toLocaleTimeString('ru', {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
};

function handleError ({ response: { data }}) {
    console.error(data);
};

export default {
    updateStatus ({ stack, missedBlocks, lastKnownBlock }) {
        const text = statusMessage
            .replace('{{moniker}}', config.moniker)
            .replace('{{lastBlock}}', lastKnownBlock.height)
            .replace('{{missedBlocks}}', missedBlocks)
            .replace('{{maxErrorRate}}', config.maxErrors)
            .replace('{{artwork}}', stackArtwork(stack))
            .replace('{{date}}', formatDate(lastKnownBlock.time));

        // Если есть пропущенные блоки, обновляем статус каждую итерацию,
        // иначе - раз в 10 блоков, чтобы не насиловать бот апи.
        const shouldUpdateMessage = missedBlocks || lastKnownBlock.height % 10 == 0;

        if (telegramMessageId) {
            if (shouldUpdateMessage) {
                telegram.editMessageText({ text, message_id: telegramMessageId }).catch(handleError);
            }
        } else {
            telegram.sendMessage({ text }).then(({ data: { result: { message_id }}}) => {
                updateLastMessageId(message_id);
            }).catch(handleError);
        }

        console.log(filterMarkdown(text));
    },

    reportMissingBlock ({ missedBlock }) {
        const params = {
            disable_notification: false,
            text: errorMessage
                .replace('{{missedBlock}}', missedBlock.height)
                .replace('{{moniker}}', config.moniker),
        };

        telegram.sendMessage(params).then(({ data: { result: { message_id }}}) => {
            resetLastMessageid(message_id);
        }).catch(handleError);

        console.error(filterMarkdown(params.text));
    },

    reportValidatorShutdown () {
        const params = {
            text: shutdownMessage,
            disable_notification: false,
        };

        telegram.sendMessage(params).then(({ data: { result: { message_id }}}) => {
            resetLastMessageid(message_id);
        }).catch(handleError);

        console.error(filterMarkdown(params.text));
    },
};

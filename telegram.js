import axios from 'axios';
import config from './config';

const http = axios.create({
    baseURL: `https://api.telegram.org/bot${config.telegram.bot_key}`,
});

function getRequestParams(args) {
    return Object.assign({
        chat_id: config.telegram.chat_id,
        disable_notification: true,
        parse_mode: 'Markdown',
    }, args);
};

export default {
    getMe () {
        return http.get('getMe');
    },

    sendMessage ({ ...args }) {
        return http.get('sendMessage', {
            params: getRequestParams(args),
        });
    },

    editMessageText ({ ...args }) {
        return http.get('editMessageText', {
            params: getRequestParams(args),
        });
    },

    deleteMessage ({ ...args }) {
        return http.get('deleteMessage', {
            params: getRequestParams(args),
        });
    },
};

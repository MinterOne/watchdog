import axios from 'axios';
import { TELEGRAM_BOT_API_URL, TELEGRAM_CHAT_ID, TELEGRAM_BOT_KEY } from '../config';

const http = axios.create({
    baseURL: `${TELEGRAM_BOT_API_URL}/bot${TELEGRAM_BOT_KEY}`,
});

/**
 * This function appends the params that are common for all BotAPI methods.
 * @param  {Object} userParams
 * @return {Object}
 */
const buildRequestParams = (userParams) => {
    return Object.assign({
        chat_id: TELEGRAM_CHAT_ID,
        disable_notification: true,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
    }, userParams);
};

/**
 * @param  {Object}  response  Axios response object
 * @return {Promise}
 */
const handleResponse = (response) => {
    if ('data' in response && 'result' in response.data) {
        return Promise.resolve(response.data.result);
    }

    return Promise.reject(response);
};

/**
 * @param  {String}  botApiMethod
 * @param  {Object}  userParams
 * @return {Promise}
 */
const invokeBotApiMethod = (botApiMethod, userParams = {}) => {
    return http.get(botApiMethod, {
        params: buildRequestParams(userParams),
    }).then(handleResponse);
};

export default {
    getMe() {
        return invokeBotApiMethod('getMe');
    },

    sendMessage({ ...params }) {
        return invokeBotApiMethod('sendMessage', params);
    },

    editMessageText({ ...params }) {
        return invokeBotApiMethod('editMessageText', params);
    },
};

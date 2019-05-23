import axios from 'axios';
import config from './config';

const http = axios.create({
    baseURL: config.api.endpoint,
    transformResponse: [function (response) {
        if (! response.startsWith('{')) {
            return response;
        }
        const data = JSON.parse(response);
        return ('result' in data)
            ? data.result
            : data;
    }],
});

export default {
    getStatus () {
        return http.get('/status');
    },

    getBlock (height) {
        return http.get('/block', {
            params: { height },
        });
    },

    getValidators () {
        return http.get('/validators');
    },
};

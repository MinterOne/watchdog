import { Minter, TX_TYPE } from 'minter-js-sdk';
import {
    NODE_API_URL,
    NODE_API_CHAIN_ID,
    NODE_API_TIMEOUT_MS,
    NODE_API_MEMPOOL_RETRY_COUNT,
    NODE_API_GAS_RETRY_COUNT,
    NODE_API_NONCE_RETRY_COUNT,
    MINTER_TX_GAS_COIN_ID,
    MINTER_TX_PRIVATE_KEY,
    WATCHDOG_VALIDATOR_PUBKEY,
} from '../config';

const MinterSDK = new Minter({
    apiType: 'node',
    baseURL: NODE_API_URL,
    timeout: NODE_API_TIMEOUT_MS,
    chainId: NODE_API_CHAIN_ID,
});

const MinterAPI = MinterSDK.apiInstance;

export function getBlock(height) {
    return MinterAPI.get(`/block/${height}`).then((response) => {
        return response.data;
    });
}

export function getStatus() {
    return MinterAPI.get('/status').then((response) => {
        return response.data;
    });
}

export function switchValidatorOff() {
    const txParams = {
        type: TX_TYPE.SET_CANDIDATE_OFF,
        gasCoin: MINTER_TX_GAS_COIN_ID,
        payload: '',
        data: {
            publicKey: WATCHDOG_VALIDATOR_PUBKEY,
        },
    };

    return MinterSDK.postTx(txParams, {
        privateKey: MINTER_TX_PRIVATE_KEY,
        gasRetryLimit: NODE_API_GAS_RETRY_COUNT,
        nonceRetryLimit: NODE_API_NONCE_RETRY_COUNT,
        mempoolRetryLimit: NODE_API_MEMPOOL_RETRY_COUNT,
    }).then((response) => {
        return response.hash;
    });
}

export default {
    getStatus,
    getBlock,
    switchValidatorOff,
};

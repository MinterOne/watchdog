import { Minter, SendTxParams, SetCandidateOffTxParams } from "minter-js-sdk";
import config from './config';
import log from './logging';
import api from './api';

const stack = [];
let monitorTimerPtr;

function remember(height, time, present) {
    stack.push({ height, time, present });
    if (stack.length > config.window) {
        stack.shift();
    }
};

function checkMissingBlocks() {
    const signedBlocks = stack.reduce((count, { present }) => count + present, 0);
    const missedBlocks = stack.length - signedBlocks;
    const maxErrorRate = config.maxErrors;
    const lastKnownBlock = stack.slice(-1)[0];

    if (missedBlocks >= maxErrorRate) {
        switchValidatorOff();
    }

    return lastKnownBlock.present
        ? log.updateStatus({ stack, missedBlocks, lastKnownBlock })
        : log.reportMissingBlock({ missedBlock: lastKnownBlock });
};

function generateTx() {
    const params = {
        chainId: (config.api.testnet ? 2 : 1),
        feeCoinSymbol: (config.api.testnet ? 'MNT' : 'BIP'),
        message: '',
    };

    return new SetCandidateOffTxParams(Object.assign(params, config.txParams));
};

function switchValidatorOff() {
    const tx = generateTx();
    const sdk = new Minter({
        apiType: config.api.type,
        baseURL: config.api.endpoint,
    });

    sdk.postTx(tx).then((txHash) => {
        log.reportValidatorShutdown();
        resetMainLoopAndWait();
    });
};

function checkNextBlock() {
    api.getStatus().then(({ data: { latest_block_height, latest_block_time }}) => {
        if (stack.length && latest_block_height === stack.slice(-1)[0].height) {
            return;
        }

        api.getBlock(latest_block_height).then(({ data: { validators }}) => {
            const candidate = validators.find((validator) => {
                return validator.pub_key === config.txParams.publicKey;
            });

            if (candidate) {
                remember(latest_block_height, latest_block_time, candidate.signed);
                checkMissingBlocks();
            }
        });
    });
};

function startMonitoring() {
    if (! monitorTimerPtr) {
        console.log('Начинаю мониторинг...');
        monitorTimerPtr = setInterval(checkNextBlock, 1500);
    }
};

function resetMainLoopAndWait() {
    if (monitorTimerPtr) {
        clearInterval(monitorTimerPtr);
        monitorTimerPtr = null;
        setTimeout(() => {
            stack.length = 0;
            startMonitoring();
        }, 60000);
    }
};

startMonitoring();

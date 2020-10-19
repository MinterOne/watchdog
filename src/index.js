import { WATCHDOG_WINDOW_WIDTH, WATCHDOG_MAX_MISSED, WATCHDOG_VALIDATOR_PUBKEY } from './config';
import MinterApi from './adapters/MinterNodeApi';
import log from './logging';

const stack = [];
let monitorTimerPtr;

function remember(height, time, present) {
    // Sometimes API is too slow and the same height can be requested multiple times:
    if (stack.some((block) => block.height === height)) {
        console.error(`Block #${height} is already in stack!`);
        return;
    }

    stack.push({ height, time, present });

    if (stack.length > WATCHDOG_WINDOW_WIDTH) {
        stack.shift();
    }
}

function checkMissingBlocks() {
    const missedBlocks = stack.filter((block) => !block.present);
    const missedBlockCount = missedBlocks.length;
    const lastKnownBlock = stack.slice(-1)[0];

    if (missedBlockCount >= WATCHDOG_MAX_MISSED) {
        MinterApi.switchValidatorOff().then((tx_hash) => {
            log.reportValidatorShutdown(tx_hash);
            resetMainLoopAndWait();
        });
    }

    return lastKnownBlock.present
        ? log.updateStatus({ stack, missedBlockCount, lastKnownBlock })
        : log.reportMissingBlock({ missedBlock: lastKnownBlock });
}

function checkNextBlock() {
    MinterApi.getStatus().then(({ latest_block_height, latest_block_time }) => {
        // Block height hasn't changed since the last iteration:
        if (stack.length > 0 && latest_block_height === stack.slice(-1)[0].height) {
            return;
        }

        MinterApi.getBlock(latest_block_height).then((response) => {
            const candidate = response.validators.find((validator) => {
                return validator.public_key === WATCHDOG_VALIDATOR_PUBKEY;
            });

            if (candidate) {
                remember(latest_block_height, latest_block_time, candidate.signed);
                checkMissingBlocks();
            }
        });
    });
}

function startMonitoring() {
    if (! monitorTimerPtr) {
        console.log('Начинаю мониторинг...');
        monitorTimerPtr = setInterval(checkNextBlock, 1500);
    }
}

function resetMainLoopAndWait() {
    if (monitorTimerPtr) {
        clearInterval(monitorTimerPtr);
        monitorTimerPtr = null;

        setTimeout(() => {
            stack.length = 0;
            startMonitoring();
        }, 20000);
    }
}

startMonitoring();

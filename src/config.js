import { castBool, printError } from './helpers';

export const MINTER_MAGIC = Object.freeze({
    CHAIN_MAINNET_ID: 1,
    CHAIN_TESTNET_ID: 2,
    COIN_ID_BIP: 0,
    COIN_ID_MNT: 0,
    EXPLORER_MAINNET_URL: 'https://explorer.minter.network',
    EXPLORER_TESTNET_URL: 'https://explorer.testnet.minter.network',
});

export const NODE_API_IS_TESTNET = castBool(process.env.NODE_API_IS_TESTNET);

export const MINTER_CHAIN_PRIMARY_COIN = NODE_API_IS_TESTNET
    ? MINTER_MAGIC.COIN_ID_MNT
    : MINTER_MAGIC.COIN_ID_BIP;

export const MINTER_CHAIN_ID = NODE_API_IS_TESTNET
    ? MINTER_MAGIC.CHAIN_TESTNET_ID
    : MINTER_MAGIC.CHAIN_MAINNET_ID;

export const MINTER_EXPLORER_URL = NODE_API_IS_TESTNET
    ? MINTER_MAGIC.EXPLORER_TESTNET_URL
    : MINTER_MAGIC.EXPLORER_MAINNET_URL;

export const NODE_API_URL = process.env.NODE_API_URL;
export const NODE_API_CHAIN_ID = parseInt(process.env.NODE_API_CHAIN_ID || MINTER_CHAIN_ID);
export const NODE_API_TIMEOUT_MS = parseInt(process.env.NODE_API_TIMEOUT_MS || 3000);
export const NODE_API_GAS_RETRY_COUNT = parseInt(process.env.NODE_API_GAS_RETRY_COUNT || 3);
export const NODE_API_MEMPOOL_RETRY_COUNT = parseInt(process.env.NODE_API_MEMPOOL_RETRY_COUNT || 3);
export const NODE_API_NONCE_RETRY_COUNT = parseInt(process.env.NODE_API_NONCE_RETRY_COUNT || 3);

export const WATCHDOG_MONIKER = process.env.WATCHDOG_MONIKER || 'watchdog';
export const WATCHDOG_WINDOW_WIDTH = parseInt(process.env.WATCHDOG_WINDOW_WIDTH || 24);
export const WATCHDOG_MAX_MISSED = parseInt(process.env.WATCHDOG_MAX_MISSED || 3);
export const WATCHDOG_VALIDATOR_PUBKEY = process.env.WATCHDOG_VALIDATOR_PUBKEY;
export const WATCHDOG_DONT_NOTIFY_MISSED = castBool(process.env.WATCHDOG_DONT_NOTIFY_MISSED);

export const MINTER_TX_GAS_COIN_ID = parseInt(process.env.MINTER_TX_GAS_COIN_ID || MINTER_CHAIN_PRIMARY_COIN);
export const MINTER_TX_PRIVATE_KEY = typeof process.env.MINTER_TX_PRIVATE_KEY === 'string'
    ? Buffer.from(process.env.MINTER_TX_PRIVATE_KEY, 'hex')
    : process.env.MINTER_TX_PRIVATE_KEY;

export const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
export const TELEGRAM_BOT_KEY = process.env.TELEGRAM_BOT_KEY;
export const TELEGRAM_BOT_API_URL = process.env.TELEGRAM_BOT_API_URL || 'https://api.telegram.org';


const complain_and_exit = (key) => {
    printError(`ERROR: Missing or invalid "${key}" environment value`);
    process.exit(1);
}

if (!WATCHDOG_VALIDATOR_PUBKEY) {
    complain_and_exit('WATCHDOG_VALIDATOR_PUBKEY');
}

if (!MINTER_TX_PRIVATE_KEY || MINTER_TX_PRIVATE_KEY.length != 32) {
    complain_and_exit('MINTER_TX_PRIVATE_KEY');
}

if (!NODE_API_URL) {
    complain_and_exit('NODE_API_URL');
}

import chalk from 'chalk';
import { walletFromPrivateKey } from 'minterjs-wallet';
import {
    NODE_API_IS_TESTNET,
    NODE_API_CHAIN_ID,
    NODE_API_URL,
    MINTER_TX_PRIVATE_KEY,
    WATCHDOG_VALIDATOR_PUBKEY,
} from '../src/config';

console.info(chalk.bold.yellow('='.repeat(32)));
console.info(chalk.bold.yellow(' '.repeat(10) + 'Wallet config'));
console.info(chalk.bold.yellow('='.repeat(32)));

const wallet = walletFromPrivateKey(MINTER_TX_PRIVATE_KEY);

console.info(chalk.bold('Control wallet:\t' + chalk.cyan(wallet.getAddressString())));

console.info("\n");

console.info(chalk.bold.yellow('='.repeat(32)));
console.info(chalk.bold.yellow(' '.repeat(12) + 'API config'));
console.info(chalk.bold.yellow('='.repeat(32)));

console.info(chalk.bold('Testnet mode:\t' + chalk.cyan(NODE_API_IS_TESTNET ? 'ON' : 'OFF')));
console.info(chalk.bold('Chain id:\t' + chalk.cyan(NODE_API_CHAIN_ID)));
console.info(chalk.bold('API endpoint:\t' + chalk.cyan(NODE_API_URL)));

console.info("\n");

console.info(chalk.bold.yellow('='.repeat(32)));
console.info(chalk.bold.yellow(' '.repeat(8) + 'Watchdog config'));
console.info(chalk.bold.yellow('='.repeat(32)));

console.info(chalk.bold('Validator:\t ' + chalk.cyan(WATCHDOG_VALIDATOR_PUBKEY)));

console.info("\n");

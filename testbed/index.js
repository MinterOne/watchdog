import chalk from 'chalk';
import { walletFromPrivateKey } from 'minterjs-wallet';
import MinterApi from '../src/adapters/MinterNodeApi';
import {
    NODE_API_IS_TESTNET,
    NODE_API_CHAIN_ID,
    NODE_API_URL,
    MINTER_TX_PRIVATE_KEY,
    WATCHDOG_VALIDATOR_PUBKEY,
} from '../src/config';

const drawHeader = (string) => {
    const headerLength = 32;
    const separator = '='.repeat(headerLength);
    const title = ' '.repeat(Math.floor((headerLength - string.length) / 2)) + string;

    console.info(chalk.bold.yellow(separator));
    console.info(chalk.bold.yellow(title));
    console.info(chalk.bold.yellow(separator));
};

drawHeader('API config');

console.info(chalk.bold('Endpoint:\t') + NODE_API_URL);
console.info(chalk.bold('Testnet mode:\t') + chalk.bold.cyan(NODE_API_IS_TESTNET ? 'ON' : 'OFF'));

MinterApi.getStatus()
    .then(({ network, catching_up }) => {
        console.info(chalk.bold('Connection:\t') + (catching_up ? chalk.bold.red('SYNCING') : chalk.bold.green('OK')));
        console.info(chalk.bold('Network ID:\t') + network);
        console.info(chalk.bold('Chain id:\t') + NODE_API_CHAIN_ID);
    })
    .catch(() => {
        console.info(chalk.bold('Status:\t\t') + chalk.bold.red('ERROR'));
        console.info(chalk.bold.bgRed('\n/!\\ Cannot connect to ' + NODE_API_URL));
    })
    .then(() => {
        console.info("\n");
    });


const wallet = walletFromPrivateKey(MINTER_TX_PRIVATE_KEY);
let canControl = false;

MinterApi.getCandidate(WATCHDOG_VALIDATOR_PUBKEY)
    .then(({ control_address }) => {
        canControl = control_address === wallet.getAddressString();
    })
    .catch((e) => void(e))
    .then(() => {
        drawHeader('Watchdog config');

        console.info(chalk.bold('Control wallet:\t' + chalk.cyan(wallet.getAddressString())));
        console.info(chalk.bold('Validator:\t' + chalk.cyan(WATCHDOG_VALIDATOR_PUBKEY)));

        canControl
            ? console.info(chalk.bold.bgGreen('\n✓ Wallet has control capabilities\n'))
            : console.info(chalk.bold.bgRed('\n/!\\ Wallet cannot control the validator\n'));
    });

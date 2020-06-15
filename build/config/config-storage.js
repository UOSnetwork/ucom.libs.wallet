"use strict";
const ConfigStorage = {
    test: {
        env: 'test',
        nodeUrl: 'https://staging-mini-mongo.ucommunity.io:6888',
        tableRows: {
            airdropsReceipt: {
                smartContract: 'testairdrop1',
                scope: 'testairdrop1',
                table: 'receipt',
            },
        },
        calculatorUrl: 'https://staging-web-calculator-node.ucommunity.io:6878',
    },
    staging: {
        env: 'staging',
        nodeUrl: 'https://staging-mini-mongo.ucommunity.io:6888',
        tableRows: {
            airdropsReceipt: {
                smartContract: 'testairdrop1',
                scope: 'testairdrop1',
                table: 'receipt',
            },
        },
        calculatorUrl: 'https://staging-web-calculator-node.ucommunity.io:6878',
    },
    production: {
        env: 'production',
        nodeUrl: 'https://mini-mongo.ucommunity.io:6889',
        tableRows: {
            airdropsReceipt: {
                smartContract: 'airdrop11111',
                scope: 'airdrop11111',
                table: 'receipt',
            },
        },
        calculatorUrl: 'https://web-calculator-node.ucommunity.io:6879',
    },
};
module.exports = ConfigStorage;

const ConfigStorage = {
  test: {
    env: 'test',

    nodeUrl: 'https://staging-api-node-2.u.community:7888',
    tableRows: {
      airdropsReceipt: {
        smartContract: 'testairdrop1',
        scope: 'testairdrop1',
        table: 'receipt',
      },
    },

    calculatorUrl: 'http://116.203.29.193:8888',
  },
  staging: {
    env: 'staging',

    nodeUrl: 'https://staging-api-node-2.u.community:7888',
    tableRows: {
      airdropsReceipt: {
        smartContract: 'testairdrop1',
        scope: 'testairdrop1',
        table: 'receipt',
      },
    },

    calculatorUrl: 'http://116.203.29.193:8888',
  },
  production: {
    env: 'production',

    nodeUrl: 'https://mini-mongo.u.community:7889',
    tableRows: {
      airdropsReceipt: {
        smartContract: 'airdrop11111',
        scope: 'airdrop11111',
        table: 'receipt',
      },
    },
    calculatorUrl: 'https://web-calculator-node.u.community:7889',
  },
};

export = ConfigStorage;

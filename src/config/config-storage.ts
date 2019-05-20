const ConfigStorage = {
  test: {
    env: 'test',

    nodeUrl: 'https://staging-mini-mongo.u.community:6888',
    tableRows: {
      airdropsReceipt: {
        smartContract: 'testairdrop1',
        scope: 'testairdrop1',
        table: 'receipt',
      },
    },

    calculatorUrl: 'https://staging-web-calculator-node.u.community:6878',
  },
  staging: {
    env: 'staging',

    nodeUrl: 'https://staging-mini-mongo.u.community:6888',
    tableRows: {
      airdropsReceipt: {
        smartContract: 'testairdrop1',
        scope: 'testairdrop1',
        table: 'receipt',
      },
    },

    calculatorUrl: 'https://staging-web-calculator-node.u.community:6878',
  },
  production: {
    env: 'production',

    nodeUrl: 'https://mini-mongo.u.community:6889',
    tableRows: {
      airdropsReceipt: {
        smartContract: 'airdrop11111',
        scope: 'airdrop11111',
        table: 'receipt',
      },
    },
    calculatorUrl: 'https://web-calculator-node.u.community:6879',
  },
};

export = ConfigStorage;

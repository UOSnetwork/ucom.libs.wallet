/* eslint-disable global-require */
module.exports = {
  WalletApi: require('./lib/wallet-api'),
  SocialApi: require('./lib/social-api'),

  BackendApi: require('./lib/backend-api'),

  TransactionSender: require('./lib/transaction-sender'),
  UosAccountsPropertiesApi: require('./lib/transaction-sender'),
  EosClient: require('./lib/eos-client'),
  Dictionary: {
    BlockchainTrTraces: require('./lib/dictionary/blockchain-tr-traces-dictionary'),
  },
};

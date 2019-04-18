/* eslint-disable global-require */
module.exports = {
  WalletApi: require('./lib/wallet-api.js'),
  SocialApi: require('./lib/social-api.js'),

  BackendApi: require('./lib/backend-api.js'),

  TransactionSender: require('./lib/transaction-sender.js'),
  UosAccountsPropertiesApi: require('./lib/uos-accounts-properties/uos-accounts-properties-api.js'),
  EosClient: require('./lib/eos-client.js'),
  ConfigService: require('./config/config-service.js'),
  Dictionary: {
    BlockchainTrTraces: require('./lib/dictionary/blockchain-tr-traces-dictionary.js'),
  },
};

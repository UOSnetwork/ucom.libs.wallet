/* eslint-disable global-require */
module.exports = {
  WalletApi: require('./build/lib/wallet-api'),
  SocialApi: require('./build/lib/social-api'),

  BackendApi: require('./build/lib/backend-api'),

  TransactionSender: require('./build/lib/transaction-sender'),
  UosAccountsPropertiesApi: require('./build/lib/uos-accounts-properties/uos-accounts-properties-api'),
  EosClient: require('./build/lib/eos-client'),
  ConfigService: require('./build/config/config-service'),
  Dictionary: {
    BlockchainTrTraces: require('./build/lib/dictionary/blockchain-tr-traces-dictionary'),
  },
};

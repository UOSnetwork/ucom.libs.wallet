/* eslint-disable global-require */
module.exports = {
  WalletApi: require('./build/lib/wallet/api/wallet-api'),
  SocialApi: require('./build/lib/social-api'),

  BackendApi: require('./build/lib/backend-api'),

  TransactionSender: require('./build/lib/transaction-sender'),
  UosAccountsPropertiesApi: require('./build/lib/uos-accounts-properties/uos-accounts-properties-api'),
  EosClient: require('./build/lib/common/client/eos-client'),
  ConfigService: require('./build/config/config-service'),
  BlockchainNodes: require('./build/lib/governance/api/blockchain-nodes-api'),
  Dictionary: {
    BlockchainTrTraces: require('./build/lib/dictionary/blockchain-tr-traces-dictionary'),
    BlockchainNodes: require('./build/lib/governance/dictionary/blockchain-nodes-dictionary')
  },
};

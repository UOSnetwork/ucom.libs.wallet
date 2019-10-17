/* eslint-disable global-require */
module.exports = {
  WalletApi: require('./build/lib/wallet/api/wallet-api'),
  SocialApi: require('./build/lib/social-transactions/api/social-api'),
  SocialActionsApi: require('./build/lib/social-transactions/api/social-actions-api'),

  BackendApi: require('./build/lib/backend-api'),
  ContentApi: require('./build/lib/content/api/content-api'),

  Content: {
    ProfileApi:       require('./build/lib/content/api/content-api'),
    PublicationsApi:  require('./build/lib/content/api/content-publications-api'),
    OrganizationsApi: require('./build/lib/content/api/content-organizations-api'),

    ContentInteractionsApi: require('./build/lib/social-transactions/api/content-interactions-api'),
  },

  ContentPublicationsActionsApi: require('./build/lib/content/api/content-publications-actions-api'),

  SocialKeyApi: require('./build/lib/social-key/api/social-key-api'),
  RegistrationApi: require('./build/lib/registration/api/registration-api'),

  TransactionSender: require('./build/lib/transaction-sender'),
  UosAccountsPropertiesApi: require('./build/lib/uos-accounts-properties/uos-accounts-properties-api'),
  EosClient: require('./build/lib/common/client/eos-client'),
  ConfigService: require('./build/config/config-service'),
  PrepareTransactionApi: require('./build/lib/common/api/prepare-transaction-api'),

  BlockchainNodes: require('./build/lib/governance/api/blockchain-nodes-api'),
  Dictionary: {
    BlockchainTrTraces: require('./build/lib/dictionary/blockchain-tr-traces-dictionary'),
    BlockchainNodes:    require('./build/lib/governance/dictionary/blockchain-nodes-dictionary'),
    Interactions:       require('./build/lib/dictionary/interactions-dictionary')
  },
};

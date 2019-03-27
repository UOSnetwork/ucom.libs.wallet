module.exports = {
  WalletApi: require('./lib/wallet-api'),
  SocialApi: require('./lib/social-api'),
  EosClient: require('./lib/eos-client'),
  Dictionary: {
    BlockchainTrTraces: require('./lib/dictionary/blockchain-tr-traces-dictionary')
  }
};
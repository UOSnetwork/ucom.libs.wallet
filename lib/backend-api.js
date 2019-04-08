const SocialTransactionService = require('./service/social-transactions-service');
const SmartContractsDictionary = require('../lib/dictionary/smart-contracts-dictionary');
const TransactionsBuilder = require('../lib/service/transactions-builder.js');

const EosClient = require('../lib/eos-client');

class BackendApi {

  /**
   *
   * @param {string} accountNameFrom
   * @param {string} privateKey
   * @param {string} permission
   * @param {number} externalId
   * @param {number} airdropId
   * @param {string} accountNameTo
   * @param {number} amountInMinor
   * @param {string} symbol
   * @returns {Promise<Object>}
   */
  static async getSignedAirdropTransaction(
    accountNameFrom,
    privateKey,
    permission,

    externalId,
    airdropId,
    accountNameTo,
    amountInMinor,
    symbol,
  ) {
    const smartContract = 'testairdrop1';
    const actionName = 'send';

    const data = {
      symbol,
      external_id: externalId,
      airdrop_id: airdropId,
      amount: amountInMinor,
      acc_name: accountNameTo,
    };

    const actions = TransactionsBuilder.getSingleUserAction(
      accountNameFrom,
      smartContract,
      actionName,
      data,
      permission,
    );

    return EosClient.getSignedTransaction(privateKey, [ actions ]);
  }
}

module.exports = BackendApi;

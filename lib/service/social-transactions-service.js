const PermissionsDictionary           = require('../dictionary/permissions-dictionary');
const SmartContractsActionsDictionary = require('../dictionary/smart-contracts-actions-dictionary');
const InteractionsDictionary          = require('../dictionary/interactions-dictionary');
const TransactionsBuilder             = require('./transactions-builder');
const EosClient                       = require('../eos-client');

const PERMISSION_ACTIVE = PermissionsDictionary.active();

class SocialTransactionsService {
  /**
   *
   * @param {string} accountNameFrom
   * @param {string} privateKey
   * @param {string} accountNameTo
   * @param {string} smartContract
   * @returns {*}
   */
  static getTrustUserSignedTransactions(accountNameFrom, privateKey, accountNameTo, smartContract) {
    const interactionName = InteractionsDictionary.trust();
    const actionJsonData = {
      account_from: accountNameFrom,
      account_to: accountNameTo,
    };

    return this._getSignedTransaction(accountNameFrom, privateKey, smartContract, interactionName, actionJsonData);
  }

  /**
   *
   * @param {string} accountNameFrom
   * @param {string} privateKey
   * @param {string} accountNameTo
   * @param {string} smartContract
   * @returns {*}
   */
  static getUntrustUserSignedTransactions(accountNameFrom, privateKey, accountNameTo, smartContract) {
    const interactionName = InteractionsDictionary.untrust();
    const actionJsonData = {
      account_from: accountNameFrom,
      account_to: accountNameTo,
    };

    return this._getSignedTransaction(accountNameFrom, privateKey, smartContract, interactionName, actionJsonData);
  }

  /**
   *
   * @param {string} accountName
   * @param {string} privateKey
   * @param {string} smartContract
   * @param {string} interactionName
   * @param {Object} actionJsonData
   * @returns {Promise<Object>}
   * @private
   */
  static _getSignedTransaction(accountName, privateKey, smartContract, interactionName, actionJsonData) {
    const actionName = SmartContractsActionsDictionary.socialAction();

    const actionJson = {
      interaction: interactionName,
      data: actionJsonData
    };

    const data = {
      acc: accountName,
      action_json: JSON.stringify(actionJson),
    };

    const actions = TransactionsBuilder.getSingleUserAction(
      accountName,
      smartContract,
      actionName,
      data,
      PERMISSION_ACTIVE,
    );

    return EosClient.getSignedTransaction(privateKey, [ actions ]);
  }
}

module.exports = SocialTransactionsService;

import EosClient = require('../../common/client/eos-client');
import PermissionsDictionary = require('../../dictionary/permissions-dictionary');
import SocialTransactionsUserToUserFactory = require('../services/social-transactions-user-to-user-factory');
import InteractionsDictionary = require('../../dictionary/interactions-dictionary');

const PERMISSION_ACTIVE = PermissionsDictionary.active();

class SocialApi {
  /**
   *
   * @param {string} accountNameFrom
   * @param {string} privateKey
   * @param {string} accountNameTo
   * @param {string} permission
   * @returns {Promise<Object>}
   */
  public static async getTrustUserSignedTransaction(
    accountNameFrom: string,
    privateKey: string,
    accountNameTo: string,
    permission: string = PERMISSION_ACTIVE,
  ): Promise<any> {
    const interactionName = InteractionsDictionary.trust();

    return SocialTransactionsUserToUserFactory.getUserToUserSignedTransaction(
      accountNameFrom,
      privateKey,
      accountNameTo,
      interactionName,
      permission,
    );
  }

  public static async getUntrustUserSignedTransaction(
    accountNameFrom: string,
    privateKey: string,
    accountNameTo: string,
    permission: string = PERMISSION_ACTIVE,
  ): Promise<any> {
    const interactionName = InteractionsDictionary.untrust();

    return SocialTransactionsUserToUserFactory.getUserToUserSignedTransaction(
      accountNameFrom,
      privateKey,
      accountNameTo,
      interactionName,
      permission,
    );
  }

  public static async getReferralFromUserSignedTransaction(
    accountNameReferrer: string,
    privateKey: string,
    accountNameSource: string,
    permission: string = PERMISSION_ACTIVE,
  ): Promise<any> {
    const interactionName = InteractionsDictionary.referral();

    return SocialTransactionsUserToUserFactory.getUserToUserSignedTransaction(
      accountNameReferrer,
      privateKey,
      accountNameSource,
      interactionName,
      permission,
    );
  }

  public static async getReferralFromUserSignedTransactionAsJson(
    accountNameReferrer: string,
    privateKey: string,
    accountNameSource: string,
    permission: string = PERMISSION_ACTIVE,
  ): Promise<string> {
    const signed =  SocialApi.getReferralFromUserSignedTransaction(
      accountNameReferrer,
      privateKey,
      accountNameSource,
      permission,
    );

    return SocialApi.signedTransactionToString(signed);
  }

  /**
   *
   * @param {string} accountNameFrom
   * @param {string} privateKey
   * @param {string} accountNameTo
   * @returns {Promise<string>}
   */
  public static async getTrustUserSignedTransactionsAsJson(accountNameFrom, privateKey, accountNameTo) {
    const signed = await SocialApi.getTrustUserSignedTransaction(
      accountNameFrom,
      privateKey,
      accountNameTo,
    );

    return SocialApi.signedTransactionToString(signed);
  }

  public static async getUnTrustUserSignedTransactionsAsJson(
    accountNameFrom: string,
    privateKey: string,
    accountNameTo: string,
  ): Promise<string> {
    const signed = await SocialApi.getUntrustUserSignedTransaction(
      accountNameFrom,
      privateKey,
      accountNameTo,
    );

    return SocialApi.signedTransactionToString(signed);
  }

  public static signedTransactionToString(signed: any): string {
    return JSON.stringify(signed);
  }

  public static async pushSignedTransactionJson(signedTransactionJson: any): Promise<any> {
    const signedParsed = SocialApi.parseSignedTransactionJson(signedTransactionJson);

    return EosClient.pushTransaction(signedParsed);
  }

  /**
   *
   * @param {string} signedTransactionJson
   * @returns {any}
   */
  public static parseSignedTransactionJson(signedTransactionJson: string): any {
    const signedParsed = JSON.parse(signedTransactionJson);
    signedParsed.serializedTransaction = Uint8Array.from(Object.values(signedParsed.serializedTransaction));

    return signedParsed;
  }
}

export = SocialApi;

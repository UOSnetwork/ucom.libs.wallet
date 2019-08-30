import EosClient = require('../../common/client/eos-client');
import PermissionsDictionary = require('../../dictionary/permissions-dictionary');
import SocialTransactionsUserToUserFactory = require('../services/social-transactions-user-to-user-factory');
import InteractionsDictionary = require('../../dictionary/interactions-dictionary');

class SocialApi {
  public static async getUpvoteContentSignedTransaction(
    accountNameFrom: string,
    privateKey: string,
    accountNameTo: string,
    permission: string = PermissionsDictionary.active(),
  ): Promise<any> {
    const interactionName = InteractionsDictionary.upvote();

    return SocialTransactionsUserToUserFactory.getUserToUserSignedTransaction(
      accountNameFrom,
      privateKey,
      accountNameTo,
      interactionName,
      permission,
    );
  }

  public static async getTrustUserSignedTransaction(
    accountNameFrom: string,
    privateKey: string,
    accountNameTo: string,
    permission: string = PermissionsDictionary.active(),
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
    permission: string = PermissionsDictionary.active(),
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

  public static async getFollowAccountSignedTransaction(
    accountNameFrom: string,
    privateKey: string,
    accountNameTo: string,
    permission: string = PermissionsDictionary.active(),
  ): Promise<any> {
    const interactionName = InteractionsDictionary.followToAccount();

    return SocialTransactionsUserToUserFactory.getUserToUserSignedTransaction(
      accountNameFrom,
      privateKey,
      accountNameTo,
      interactionName,
      permission,
    );
  }

  public static async getUnfollowAccountSignedTransaction(
    accountNameFrom: string,
    privateKey: string,
    accountNameTo: string,
    permission: string = PermissionsDictionary.active(),
  ): Promise<any> {
    const interactionName = InteractionsDictionary.unfollowToAccount();

    return SocialTransactionsUserToUserFactory.getUserToUserSignedTransaction(
      accountNameFrom,
      privateKey,
      accountNameTo,
      interactionName,
      permission,
    );
  }

  public static async getFollowOrganizationSignedTransaction(
    accountNameFrom: string,
    privateKey: string,
    organizationId: string,
    permission: string = PermissionsDictionary.active(),
  ): Promise<any> {
    const interactionName = InteractionsDictionary.followToOrganization();

    return SocialTransactionsUserToUserFactory.getUserToOrganizationSignedTransaction(
      accountNameFrom,
      privateKey,
      organizationId,
      interactionName,
      permission,
    );
  }

  public static async getUnfollowOrganizationSignedTransaction(
    accountNameFrom: string,
    privateKey: string,
    organizationId: string,
    permission: string = PermissionsDictionary.active(),
  ): Promise<any> {
    const interactionName = InteractionsDictionary.unfollowToOrganization();

    return SocialTransactionsUserToUserFactory.getUserToOrganizationSignedTransaction(
      accountNameFrom,
      privateKey,
      organizationId,
      interactionName,
      permission,
    );
  }

  public static async getReferralFromUserSignedTransaction(
    accountNameReferrer: string,
    privateKey: string,
    accountNameSource: string,
    permission: string = PermissionsDictionary.active(),
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
    permission: string = PermissionsDictionary.active(),
  ): Promise<string> {
    const signed =  await SocialApi.getReferralFromUserSignedTransaction(
      accountNameReferrer,
      privateKey,
      accountNameSource,
      permission,
    );

    return SocialApi.signedTransactionToString(signed);
  }

  public static async getTrustUserSignedTransactionsAsJson(
    accountNameFrom: string,
    privateKey: string,
    accountNameTo: string,
    permission = PermissionsDictionary.active(),
  ) {
    const signed = await SocialApi.getTrustUserSignedTransaction(
      accountNameFrom,
      privateKey,
      accountNameTo,
      permission,
    );

    return SocialApi.signedTransactionToString(signed);
  }

  public static async getUnTrustUserSignedTransactionsAsJson(
    accountNameFrom: string,
    privateKey: string,
    accountNameTo: string,
    permission: string = PermissionsDictionary.active(),
  ): Promise<string> {
    const signed = await SocialApi.getUntrustUserSignedTransaction(
      accountNameFrom,
      privateKey,
      accountNameTo,
      permission,
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

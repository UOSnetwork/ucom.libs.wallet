import SocialTransactionsCommonFactory = require('./social-transactions-common-factory');
import TransactionsBuilder = require('../../service/transactions-builder');
import AutoUpdatePostService = require('../../content/service/auto-update-post-service');
import EosClient = require('../../common/client/eos-client');

class SocialTransactionsUserToUserFactory {
  public static async getTrustUntrustUserWithAutoUpdateSignedTransaction(
    accountFrom: string,
    privateKey: string,
    accountTo: string,
    interaction: string,
    permission: string,
  ): Promise<{ blockchain_id: string, signed_transaction: any }> {
    const trustAction = SocialTransactionsUserToUserFactory.getSingleSocialAction(
      accountFrom,
      accountTo,
      interaction,
      permission,
    );

    const autoUpdateProps = AutoUpdatePostService.getAutoUpdateAction(accountFrom, permission);

    const signedTransaction = await EosClient.getSignedTransaction(privateKey, [trustAction, autoUpdateProps.action]);

    return {
      blockchain_id: autoUpdateProps.blockchain_id,
      signed_transaction: signedTransaction,
    };
  }

  public static async getUserToUserSignedTransaction(
    accountNameFrom: string,
    privateKey: string,
    accountNameTo: string,
    interactionName: string,
    permission: string,
  ) {
    const targetBlockchainIdKey = 'account_to';

    return this.getUserToTargetBlockchainIdSignedTransaction(
      accountNameFrom,
      privateKey,
      accountNameTo,
      interactionName,
      targetBlockchainIdKey,
      permission,
    );
  }

  public static async getUserToOrganizationSignedTransaction(
    accountNameFrom: string,
    privateKey: string,
    organizationId: string,
    interactionName: string,
    permission: string,
  ) {
    const targetBlockchainIdKey = 'organization_id_to';

    return this.getUserToTargetBlockchainIdSignedTransaction(
      accountNameFrom,
      privateKey,
      organizationId,
      interactionName,
      targetBlockchainIdKey,
      permission,
    );
  }

  public static async getUserToTargetBlockchainIdSignedTransaction(
    accountNameFrom: string,
    privateKey: string,
    targetBlockchainId: string,
    interactionName: string,
    targetBlockchainIdKey: string,
    permission: string,
  ) {
    const actionJsonData = {
      account_from: accountNameFrom,
      [targetBlockchainIdKey]: targetBlockchainId,
    };

    const content = '';

    return SocialTransactionsCommonFactory.getSignedTransaction(
      accountNameFrom,
      privateKey,
      interactionName,
      actionJsonData,
      content,
      permission,
    );
  }

  public static getSingleSocialAction(
    accountFrom: string,
    accountTo: string,
    interactionName: string,
    permission: string,
  ) {
    const actionData = this.getActionDataWithMetaData(
      accountFrom,
      accountTo,
      interactionName,
    );

    return TransactionsBuilder.getSingleSocialUserAction(
      accountFrom,
      actionData,
      permission,
    );
  }

  private static getActionDataWithMetaData(
    accountFrom: string,
    accountTo: string,
    interactionName: string,
  ) {
    const targetBlockchainIdKey = 'account_to';
    const content = '';

    const actionMetaData = SocialTransactionsCommonFactory.getActionMetaData(
      accountFrom,
      targetBlockchainIdKey,
      accountTo,
    );

    return SocialTransactionsCommonFactory.getActionData(
      accountFrom,
      interactionName,
      actionMetaData,
      content,
    );
  }
}

export = SocialTransactionsUserToUserFactory;

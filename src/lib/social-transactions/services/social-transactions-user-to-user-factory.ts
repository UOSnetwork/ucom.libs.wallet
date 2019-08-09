import SocialTransactionsCommonFactory = require('./social-transactions-common-factory');

class SocialTransactionsUserToUserFactory {
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

  private static async getUserToTargetBlockchainIdSignedTransaction(
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
}

export = SocialTransactionsUserToUserFactory;

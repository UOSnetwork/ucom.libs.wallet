import SocialTransactionsCommonFactory = require('./social-transactions-common-factory');

class SocialTransactionsUserToContentFactory {
  public static async getUserToContentSignedTransaction(
    accountNameFrom: string,
    privateKey: string,
    contentBlockchainId: string,
    interactionName: string,
    permission: string,
  ) {
    const actionJsonData = {
      account_from: accountNameFrom,
      content_id: contentBlockchainId,
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

export = SocialTransactionsUserToContentFactory;

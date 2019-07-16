import SocialTransactionsCommonFactory = require('./social-transactions-common-factory');

class SocialTransactionsUserToUserFactory {
  public static async getUserToUserSignedTransaction(
    accountNameFrom: string,
    privateKey: string,
    accountNameTo: string,
    interactionName: string,
    permission: string,
  ) {
    const actionJsonData = {
      account_from: accountNameFrom,
      account_to: accountNameTo,
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

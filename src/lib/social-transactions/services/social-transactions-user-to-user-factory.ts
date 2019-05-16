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

    return SocialTransactionsCommonFactory.getSignedTransaction(
      accountNameFrom,
      privateKey,
      interactionName,
      actionJsonData,
      permission,
    );
  }
}

export = SocialTransactionsUserToUserFactory;

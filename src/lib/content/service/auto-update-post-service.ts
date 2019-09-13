import InteractionsDictionary = require('../../dictionary/interactions-dictionary');
import ContentIdGenerator = require('./content-id-generator');
import ContentHelper = require('./content-helper');
import SocialTransactionsCommonFactory = require('../../social-transactions/services/social-transactions-common-factory');
import TransactionsBuilder = require('../../service/transactions-builder');

class AutoUpdatePostService {
  public static getAutoUpdateAction(
    accountFrom: string,
    permission: string,
  ) {
    const interactionName: string = InteractionsDictionary.createAutoUpdatePostFromAccount();

    const contentId: string = ContentIdGenerator.getForAutoUpdatePost();
    const content = '';

    const metaData = ContentHelper.getMetadata(accountFrom, contentId);
    const actionData = SocialTransactionsCommonFactory.getActionData(accountFrom, interactionName, metaData, content);

    const action = TransactionsBuilder.getSingleSocialUserAction(accountFrom, actionData, permission);

    return {
      action,
      blockchain_id: contentId,
    };
  }
}

export = AutoUpdatePostService;

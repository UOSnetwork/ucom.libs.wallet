import PermissionsDictionary = require('../../dictionary/permissions-dictionary');
import InteractionsDictionary = require('../../dictionary/interactions-dictionary');
import SocialTransactionsUserToContentFactory = require('../services/social-transactions-user-to-content-factory');

const PERMISSION_ACTIVE = PermissionsDictionary.active();

class ContentInteractionsApi {
  public static async getUpvoteContentSignedTransaction(
    accountNameFrom: string,
    privateKey: string,
    contentBlockchainId: string,
    permission: string = PERMISSION_ACTIVE,
  ): Promise<any> {
    const interactionName = InteractionsDictionary.upvote();

    return SocialTransactionsUserToContentFactory.getUserToContentSignedTransaction(
      accountNameFrom,
      privateKey,
      contentBlockchainId,
      interactionName,
      permission,
    );
  }

  public static async getDownvoteContentSignedTransaction(
    accountNameFrom: string,
    privateKey: string,
    contentBlockchainId: string,
    permission: string = PERMISSION_ACTIVE,
  ): Promise<any> {
    const interactionName = InteractionsDictionary.downvote();

    return SocialTransactionsUserToContentFactory.getUserToContentSignedTransaction(
      accountNameFrom,
      privateKey,
      contentBlockchainId,
      interactionName,
      permission,
    );
  }
}

export = ContentInteractionsApi;

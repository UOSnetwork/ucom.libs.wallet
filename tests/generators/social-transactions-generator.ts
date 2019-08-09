import Helper = require('../helpers/helper');
import InteractionsDictionary = require('../../src/lib/dictionary/interactions-dictionary');
import SocialApi = require('../../src/lib/social-transactions/api/social-api');
import EosClient = require('../../src/lib/common/client/eos-client');
import TransactionsPushResponseChecker = require('../helpers/common/transactions-push-response-checker');
import SocialActionExpectedDataHelper = require('../helpers/social/social-action-expected-data-helper');

class SocialTransactionsGenerator {
  public static async signSendAndCheckUserToAccount(
    interaction: string,
    targetBlockchainId: string,
  ): Promise<void> {
    const accountName = Helper.getTesterAccountName();
    const privateKey = Helper.getTesterAccountPrivateKey();

    let signed;
    let blockchainIdKey = 'account_to';
    switch (interaction) {
      case InteractionsDictionary.followToAccount():
        signed = await SocialApi.getFollowAccountSignedTransaction(accountName, privateKey, targetBlockchainId);
        break;
      case InteractionsDictionary.unfollowToAccount():
        signed = await SocialApi.getUnfollowAccountSignedTransaction(accountName, privateKey, targetBlockchainId);
        break;
      case InteractionsDictionary.followToOrganization():
        signed = await SocialApi.getFollowOrganizationSignedTransaction(accountName, privateKey, targetBlockchainId);
        blockchainIdKey = 'organization_id_to';
        break;
      case InteractionsDictionary.unfollowToOrganization():
        signed = await SocialApi.getUnfollowOrganizationSignedTransaction(accountName, privateKey, targetBlockchainId);
        blockchainIdKey = 'organization_id_to';
        break;
      default:
        throw new TypeError(`Unsupported interaction: ${interaction}`);
    }

    const response = await EosClient.pushTransaction(signed);

    const expected = SocialActionExpectedDataHelper.getOneUserToOtherPushResponse(
      accountName,
      targetBlockchainId,
      interaction,
      blockchainIdKey,
    );
    TransactionsPushResponseChecker.checkOneTransaction(response, expected);
  }
}

export = SocialTransactionsGenerator;

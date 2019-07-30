import Helper = require('../../helpers/helper');
import EosClient = require('../../../src/lib/common/client/eos-client');
import InteractionsDictionary = require('../../../src/lib/dictionary/interactions-dictionary');
import ContentPostsGenerator = require('../../helpers/content/posts/content-posts-generator');
import ContentInteractionsApi = require('../../../src/lib/social-transactions/api/content-interactions-api');
import SocialActionExpectedDataHelper = require('../../helpers/social/social-action-expected-data-helper');

const JEST_TIMEOUT = 10000;

Helper.initForEnvByProcessVariable();

const accountName = Helper.getTesterAccountName();
const privateKey = Helper.getTesterAccountPrivateKey();
const contentBlockchainId: string = ContentPostsGenerator.getSamplePostBlockchainId();

it('Upvote content', async () => {
  const signedObject = await ContentInteractionsApi.getUpvoteContentSignedTransaction(
    accountName,
    privateKey,
    contentBlockchainId,
  );

  const response = await EosClient.pushTransaction(signedObject);
  const expectedActionJsonData = {
    account_from: accountName,
    content_id: contentBlockchainId,
  };

  SocialActionExpectedDataHelper.expectSocialActionDataWithoutContent(
    response,
    accountName,
    InteractionsDictionary.upvote(),
    expectedActionJsonData,
  );
}, JEST_TIMEOUT);

it('Downvote content', async () => {
  const signedObject = await ContentInteractionsApi.getDownvoteContentSignedTransaction(
    accountName,
    privateKey,
    contentBlockchainId,
  );

  const response = await EosClient.pushTransaction(signedObject);
  const expectedActionJsonData = {
    account_from: accountName,
    content_id: contentBlockchainId,
  };

  SocialActionExpectedDataHelper.expectSocialActionDataWithoutContent(
    response,
    accountName,
    InteractionsDictionary.downvote(),
    expectedActionJsonData,
  );
}, JEST_TIMEOUT);

export {};

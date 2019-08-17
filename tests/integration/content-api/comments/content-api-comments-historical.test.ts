import Helper = require('../../../helpers/helper');
import ContentPublicationsApi = require('../../../../src/lib/content/api/content-publications-api');
import EosClient = require('../../../../src/lib/common/client/eos-client');
import ContentPostsGenerator = require('../../../helpers/content/posts/content-posts-generator');
import ContentChecker = require('../../../helpers/content/posts/content-checker');
import InteractionsDictionary = require('../../../../src/lib/dictionary/interactions-dictionary');
import ContentCommentsGenerator = require('../../../helpers/content/posts/content-comments-generator');
import ContentOrganizationsGenerator = require('../../../helpers/content/posts/content-organizations-generator');
import SmartContractsActionsDictionary = require('../../../../src/lib/dictionary/smart-contracts-actions-dictionary');

const JEST_TIMEOUT = 25000;

Helper.initForEnvByProcessVariable();

const { EntityNames } = require('ucom.libs.common').Common.Dictionary;

const accountNameFrom = Helper.getTesterAccountName();

it('Resend comment or reply from account', async () => {
  const postBlockchainId = ContentPostsGenerator.getSamplePostBlockchainId();
  const commentBlockchainId = ContentCommentsGenerator.getSampleCommentBlockchainId();

  const content = {
    ...ContentCommentsGenerator.getCommentInputFields(),

    commentable_blockchain_id:  postBlockchainId,
    parent_blockchain_id:       postBlockchainId,
    author_account_name:        accountNameFrom,
    organization_blockchain_id: null,
    created_at:                 ContentCommentsGenerator.getSampleCommentInputCreatedAt(),
  };

  const interactionName = InteractionsDictionary.createCommentFromAccount();

  const signedTransaction = await ContentPublicationsApi.signResendCommentFromAccount(
    accountNameFrom,
    Helper.getHistoricalSenderPrivateKey(),
    content,
    commentBlockchainId,
    postBlockchainId,
    false,
  );

  const response = await EosClient.pushTransaction(signedTransaction);

  const expectedActName: string = SmartContractsActionsDictionary.historicalSocialAction();

  ContentChecker.checkCommentPushingResponse(
    response,
    interactionName,
    accountNameFrom,
    commentBlockchainId,
    postBlockchainId,
    EntityNames.POSTS,
    postBlockchainId,
    null,
    content.created_at,
    expectedActName,
    Helper.getHistoricalSenderAccountName(),
  );
}, JEST_TIMEOUT);

it('Resend comment or reply from organization', async () => {
  const postBlockchainId          = ContentPostsGenerator.getSamplePostBlockchainId();
  const commentBlockchainId       = ContentCommentsGenerator.getSampleCommentBlockchainId();
  const organizationBlockchainId  = ContentOrganizationsGenerator.getSampleOrganizationBlockchainId();

  const content = {
    ...ContentCommentsGenerator.getCommentInputFields(),

    commentable_blockchain_id:  postBlockchainId,
    parent_blockchain_id:       postBlockchainId,
    author_account_name:        accountNameFrom,
    organization_blockchain_id: organizationBlockchainId,
    created_at:                 ContentCommentsGenerator.getSampleCommentInputCreatedAt(),
  };

  const interactionName = InteractionsDictionary.createCommentFromOrganization();

  const signedTransaction = await ContentPublicationsApi.signResendCommentFromOrganization(
    accountNameFrom,
    Helper.getHistoricalSenderPrivateKey(),
    content,
    commentBlockchainId,
    postBlockchainId,
    organizationBlockchainId,
    false,
  );

  const response = await EosClient.pushTransaction(signedTransaction);

  const expectedActName: string = SmartContractsActionsDictionary.historicalSocialAction();

  ContentChecker.checkCommentPushingResponse(
    response,
    interactionName,
    accountNameFrom,
    commentBlockchainId,
    postBlockchainId,
    EntityNames.POSTS,
    postBlockchainId,
    organizationBlockchainId,
    content.created_at,
    expectedActName,
    Helper.getHistoricalSenderAccountName(),
  );
}, JEST_TIMEOUT);

export {};

/* eslint-disable security/detect-object-injection,no-useless-escape */
import Helper = require('../../../helpers/helper');
import PermissionsDictionary = require('../../../../src/lib/dictionary/permissions-dictionary');
import ContentPublicationsApi = require('../../../../src/lib/content/api/content-publications-api');
import EosClient = require('../../../../src/lib/common/client/eos-client');
import ContentPostsGenerator = require('../../../helpers/content/posts/content-posts-generator');
import ContentChecker = require('../../../helpers/content/posts/content-checker');
import InteractionsDictionary = require('../../../../src/lib/dictionary/interactions-dictionary');
import ContentCommentsGenerator = require('../../../helpers/content/posts/content-comments-generator');
import ContentOrganizationsGenerator = require('../../../helpers/content/posts/content-organizations-generator');

const JEST_TIMEOUT = 15000;

Helper.initForEnvByProcessVariable();

const { EntityNames } = require('ucom.libs.common').Common.Dictionary;

const accountNameFrom = Helper.getTesterAccountName();
const privateKey      = Helper.getTesterAccountSocialPrivateKey();
const permission      = PermissionsDictionary.social();

describe('Create comment', () => {
  it('Create comment or reply from account', async () => {
    const postBlockchainId = ContentPostsGenerator.getSamplePostBlockchainId();

    const content = {
      ...ContentCommentsGenerator.getCommentInputFields(),

      commentable_blockchain_id:  postBlockchainId,
      parent_blockchain_id:       postBlockchainId,
      author_account_name:        accountNameFrom,
      organization_blockchain_id: null,
    };

    const interactionName = InteractionsDictionary.createCommentFromAccount();

    const { signed_transaction, blockchain_id } = await ContentPublicationsApi.signCreateCommentFromUser(
      accountNameFrom,
      privateKey,
      postBlockchainId,
      content,
      false,
      permission,
    );

    const response = await EosClient.pushTransaction(signed_transaction);

    ContentChecker.checkCommentPushingResponse(
      response,
      interactionName,
      accountNameFrom,
      blockchain_id,
      postBlockchainId,
      EntityNames.POSTS,
      postBlockchainId,
    );
  }, JEST_TIMEOUT);

  it('Create comment or reply from organization', async () => {
    const postBlockchainId = ContentPostsGenerator.getSamplePostBlockchainId();
    const organizationBlockchainId = ContentOrganizationsGenerator.getBlockchainId();

    const content = {
      ...ContentCommentsGenerator.getCommentInputFields(),

      commentable_blockchain_id:  postBlockchainId,
      parent_blockchain_id:       postBlockchainId,
      author_account_name:        accountNameFrom,
      organization_blockchain_id: organizationBlockchainId,
    };

    const interactionName = InteractionsDictionary.createCommentFromOrganization();

    const { signed_transaction, blockchain_id } = await ContentPublicationsApi.signCreateCommentFromOrganization(
      accountNameFrom,
      privateKey,
      postBlockchainId,
      organizationBlockchainId,
      content,
      false,
      permission,
    );

    const response = await EosClient.pushTransaction(signed_transaction);

    ContentChecker.checkCommentPushingResponse(
      response,
      interactionName,
      accountNameFrom,
      blockchain_id,
      postBlockchainId,
      EntityNames.POSTS,
      postBlockchainId,
    );
  }, JEST_TIMEOUT);
});

describe('Update comment', () => {
  it('Update comment or reply from account', async () => {
    const postBlockchainId = ContentPostsGenerator.getSamplePostBlockchainId();

    const content = {
      ...ContentCommentsGenerator.getCommentInputFields(),

      commentable_blockchain_id:  postBlockchainId,
      parent_blockchain_id:       postBlockchainId,
      author_account_name:        accountNameFrom,
      organization_blockchain_id: null,
    };

    content.created_at = ContentPostsGenerator.getSamplePostInputCreatedAt();
    const interactionName = InteractionsDictionary.updateCommentFromAccount();

    const blockchainId = ContentPostsGenerator.getSamplePostBlockchainId();

    const signed_transaction = await ContentPublicationsApi.signUpdateCommentFromAccount(
      accountNameFrom,
      privateKey,
      postBlockchainId,
      content,
      blockchainId,
      false,
      permission,
    );

    const response = await EosClient.pushTransaction(signed_transaction);

    ContentChecker.checkCommentPushingResponse(
      response,
      interactionName,
      accountNameFrom,
      blockchainId,
      postBlockchainId,
      EntityNames.POSTS,
      postBlockchainId,
    );
  }, JEST_TIMEOUT);

  it('Update comment or reply from organization', async () => {
    const postBlockchainId  = ContentPostsGenerator.getSamplePostBlockchainId();
    const orgBlockchainId   = ContentOrganizationsGenerator.getBlockchainId();

    const content = {
      ...ContentCommentsGenerator.getCommentInputFields(),

      commentable_blockchain_id:  postBlockchainId,
      parent_blockchain_id:       postBlockchainId,
      author_account_name:        accountNameFrom,
      organization_blockchain_id: orgBlockchainId,
    };

    content.created_at = ContentPostsGenerator.getSamplePostInputCreatedAt();
    const interactionName = InteractionsDictionary.updateCommentFromOrganization();

    const blockchainId = ContentPostsGenerator.getSamplePostBlockchainId();

    const signed_transaction = await ContentPublicationsApi.signUpdateCommentFromOrganization(
      accountNameFrom,
      privateKey,
      postBlockchainId,
      orgBlockchainId,
      content,
      blockchainId,
      false,
      permission,
    );

    const response = await EosClient.pushTransaction(signed_transaction);

    ContentChecker.checkCommentPushingResponse(
      response,
      interactionName,
      accountNameFrom,
      blockchainId,
      postBlockchainId,
      EntityNames.POSTS,
      postBlockchainId,
    );
  }, JEST_TIMEOUT);
});

export {};

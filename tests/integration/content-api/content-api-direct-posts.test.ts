/* eslint-disable security/detect-object-injection,no-useless-escape */
import Helper = require('../../helpers/helper');
import PermissionsDictionary = require('../../../src/lib/dictionary/permissions-dictionary');
import ContentPublicationsApi = require('../../../src/lib/content/api/content-publications-api');
import EosClient = require('../../../src/lib/common/client/eos-client');
import ContentPostsGenerator = require('../../helpers/content/posts/content-posts-generator');
import ContentOrganizationsGenerator = require('../../helpers/content/posts/content-organizations-generator');
import ContentPostsChecker = require('../../helpers/content/posts/content-checker');
import InteractionsDictionary = require('../../../src/lib/dictionary/interactions-dictionary');

const { EntityNames } = require('ucom.libs.common').Common.Dictionary;

const JEST_TIMEOUT = 15000;

Helper.initForEnvByProcessVariable();

const accountNameFrom = Helper.getTesterAccountName();
const accountNameTo = Helper.getAccountNameTo();
const privateKey      = Helper.getTesterAccountPrivateKey();
const permission      = PermissionsDictionary.active();

describe('Create direct post', () => {
  it('Create a direct post from account to account', async () => {
    const content = ContentPostsGenerator.getDirectPostOrRepostInputFields();
    const interactionName = InteractionsDictionary.createDirectPostForAccount();

    const { signed_transaction, blockchain_id } = await ContentPublicationsApi.signCreateDirectPostForAccount(
      accountNameFrom,
      privateKey,
      accountNameTo,
      content,
      permission,
    );

    const response = await EosClient.pushTransaction(signed_transaction);
    ContentPostsChecker.checkDirectPostPushingResponse(
      response,
      interactionName,
      accountNameFrom,
      blockchain_id,
      EntityNames.USERS,
      accountNameTo,
    );
  }, JEST_TIMEOUT);

  it('Create a direct post from user to organization', async () => {
    const content = ContentPostsGenerator.getDirectPostOrRepostInputFields();
    const interactionName = InteractionsDictionary.createDirectPostForOrganization();

    const organizationBlockchainId: string = ContentOrganizationsGenerator.getSampleOrganizationBlockchainId();

    const { signed_transaction, blockchain_id } = await ContentPublicationsApi.signCreateDirectPostForOrganization(
      accountNameFrom,
      organizationBlockchainId,
      privateKey,
      content,
      permission,
    );

    const response = await EosClient.pushTransaction(signed_transaction);
    ContentPostsChecker.checkDirectPostPushingResponse(
      response,
      interactionName,
      accountNameFrom,
      blockchain_id,
      EntityNames.ORGANIZATIONS,
      organizationBlockchainId,
    );
  }, JEST_TIMEOUT);
});

describe('Update direct posts', () => {
  it('Update direct post from account to account', async () => {
    const content       = ContentPostsGenerator.getDirectPostOrRepostInputFields();
    content.created_at  = ContentPostsGenerator.getSamplePostInputCreatedAt();
    const blockchainId  = ContentPostsGenerator.getSamplePostBlockchainId();

    const interactionName = InteractionsDictionary.updateDirectPostForAccount();

    const signed_transaction = await ContentPublicationsApi.signUpdateDirectPostForAccount(
      accountNameFrom,
      privateKey,
      accountNameTo,
      content,
      blockchainId,
      permission,
    );

    const response = await EosClient.pushTransaction(signed_transaction);

    ContentPostsChecker.checkDirectPostPushingResponse(
      response,
      interactionName,
      accountNameFrom,
      blockchainId,
      EntityNames.USERS,
      accountNameTo,
    );
  }, JEST_TIMEOUT);

  it('Update direct post from account to organization', async () => {
    const content       = ContentPostsGenerator.getDirectPostOrRepostInputFields();
    content.created_at  = ContentPostsGenerator.getSamplePostInputCreatedAt();
    const blockchainId  = ContentPostsGenerator.getSamplePostBlockchainId();

    const interactionName = InteractionsDictionary.updateDirectPostForOrganization();
    const organizationBlockchainId = ContentOrganizationsGenerator.getSampleOrganizationBlockchainId();

    const signed_transaction = await ContentPublicationsApi.signUpdateDirectPostForOrganization(
      accountNameFrom,
      privateKey,
      organizationBlockchainId,
      content,
      blockchainId,
      permission,
    );

    const response = await EosClient.pushTransaction(signed_transaction);

    ContentPostsChecker.checkDirectPostPushingResponse(
      response,
      interactionName,
      accountNameFrom,
      blockchainId,
      EntityNames.ORGANIZATIONS,
      organizationBlockchainId,
    );
  }, JEST_TIMEOUT);
});

export {};

/* eslint-disable security/detect-object-injection,no-useless-escape */
import { JEST_TIMEOUT_LONGER } from '../../helpers/jest/jest-dictionary';

import Helper = require('../../helpers/helper');
import PermissionsDictionary = require('../../../src/lib/dictionary/permissions-dictionary');
import ContentPublicationsApi = require('../../../src/lib/content/api/content-publications-api');
import EosClient = require('../../../src/lib/common/client/eos-client');
import ContentPostsGenerator = require('../../helpers/content/posts/content-posts-generator');
import ContentOrganizationsGenerator = require('../../helpers/content/posts/content-organizations-generator');
import ContentPostsChecker = require('../../helpers/content/posts/content-checker');
import InteractionsDictionary = require('../../../src/lib/dictionary/interactions-dictionary');
import ContentPublicationsActionsApi = require('../../../src/lib/content/api/content-publications-actions-api');
import MultiSignatureApi = require('../../../src/lib/multi-signature/api/multi-signature-api');
import CommonChecker = require('../../helpers/common/common-checker');

const JEST_TIMEOUT = 15000;

Helper.initForProductionEnv();

const accountNameFrom = Helper.getTesterAccountName();
const privateKey      = Helper.getTesterAccountSocialPrivateKey();
const permission      = PermissionsDictionary.social();

const multiSignatureAccount = Helper.getMultiSignatureAccount();

describe('Create publication', () => {
  it('Send a new publication from User to the blockchain', async () => {
    const content = ContentPostsGenerator.getSamplePostInputFields();
    const interactionName = InteractionsDictionary.createMediaPostFromAccount();

    const { signed_transaction, blockchain_id } = await ContentPublicationsApi.signCreatePublicationFromUser(
      accountNameFrom,
      privateKey,
      content,
      permission,
    );

    const response = await EosClient.pushTransaction(signed_transaction);

    ContentPostsChecker.checkPostPushingFromUserResponse(response, accountNameFrom, interactionName, blockchain_id);
  }, JEST_TIMEOUT);

  it('Smoke - send a new publication from organization to the blockchain', async () => {
    const content                   = ContentPostsGenerator.getSamplePostInputFields();
    const organizationBlockchainId  = ContentOrganizationsGenerator.getBlockchainId();

    const { action } = ContentPublicationsActionsApi.getCreatePublicationFromOrganizationAction(
      multiSignatureAccount, organizationBlockchainId, content,
    );

    const response = await MultiSignatureApi.proposeApproveAndExecuteByProposer(
      accountNameFrom, privateKey, permission, [action],
    );

    CommonChecker.expectNotEmpty(response);
  }, JEST_TIMEOUT_LONGER);
});

describe('Update publication', () => {
  it('Send an updated publication from User to the blockchain', async () => {
    const content = ContentPostsGenerator.getSamplePostInputFields();
    content.created_at = ContentPostsGenerator.getSamplePostInputCreatedAt();

    const interactionName = InteractionsDictionary.updateMediaPostFromAccount();

    const blockchainId = ContentPostsGenerator.getSamplePostBlockchainId();

    const signed_transaction = await ContentPublicationsApi.signUpdatePublicationFromUser(
      accountNameFrom,
      privateKey,
      content,
      blockchainId,
      permission,
    );

    const response = await EosClient.pushTransaction(signed_transaction);

    ContentPostsChecker.checkPostPushingFromUserResponse(response, accountNameFrom, interactionName, blockchainId);
  }, JEST_TIMEOUT);

  it('Send an updated publication from organization to the blockchain', async () => {
    const givenContent         = ContentPostsGenerator.getSamplePostInputFields();
    givenContent.created_at    = ContentPostsGenerator.getSamplePostInputCreatedAt();
    const organizationBlockchainId = ContentOrganizationsGenerator.getBlockchainId();

    const publicationBlockchainId = ContentPostsGenerator.getSamplePostBlockchainId();

    const action = ContentPublicationsActionsApi.getUpdatePublicationFromOrganizationAction(
      multiSignatureAccount,
      organizationBlockchainId,
      givenContent,
      publicationBlockchainId,
    );

    const response = await MultiSignatureApi.proposeApproveAndExecuteByProposer(
      accountNameFrom, privateKey, permission, [action],
    );

    CommonChecker.expectNotEmpty(response);
  }, JEST_TIMEOUT_LONGER);
});

describe('Legacy', () => {
  it('Send a new publication from organization to the blockchain', async () => {
    const content         = ContentPostsGenerator.getSamplePostInputFields();
    const interactionName = InteractionsDictionary.createMediaPostFromOrganization();
    const orgBlockchainId = ContentOrganizationsGenerator.getBlockchainId();

    const { signed_transaction, blockchain_id } = await ContentPublicationsApi.signCreatePublicationFromOrganization(
      accountNameFrom,
      privateKey,
      orgBlockchainId,
      content,
      permission,
    );

    const response = await EosClient.pushTransaction(signed_transaction);

    ContentPostsChecker.checkPostPushingFromOrganizationResponse(
      response,
      accountNameFrom,
      interactionName,
      blockchain_id,
      orgBlockchainId,
    );
  }, JEST_TIMEOUT);

  it('Send an updated publication from organization to the blockchain', async () => {
    const content         = ContentPostsGenerator.getSamplePostInputFields();
    content.created_at    = ContentPostsGenerator.getSamplePostInputCreatedAt();
    const interactionName = InteractionsDictionary.updateMediaPostFromOrganization();
    const orgBlockchainId = ContentOrganizationsGenerator.getBlockchainId();

    const blockchainId = ContentPostsGenerator.getSamplePostBlockchainId();

    const signed_transaction = await ContentPublicationsApi.signUpdatePublicationFromOrganization(
      accountNameFrom,
      privateKey,
      orgBlockchainId,
      content,
      blockchainId,
      permission,
    );

    const response = await EosClient.pushTransaction(signed_transaction);

    ContentPostsChecker.checkPostPushingFromOrganizationResponse(
      response,
      accountNameFrom,
      interactionName,
      blockchainId,
      orgBlockchainId,
    );
  }, JEST_TIMEOUT);
});

export {};

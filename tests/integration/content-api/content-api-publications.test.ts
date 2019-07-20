/* eslint-disable security/detect-object-injection,no-useless-escape */
import Helper = require('../../helpers/helper');
import PermissionsDictionary = require('../../../src/lib/dictionary/permissions-dictionary');
import ContentPublicationsApi = require('../../../src/lib/content/api/content-publications-api');
import EosClient = require('../../../src/lib/common/client/eos-client');
import ContentPostsGenerator = require('../../helpers/content/posts/content-posts-generator');
import ContentOrganizationsGenerator = require('../../helpers/content/posts/content-organizations-generator');
import ContentPostsChecker = require('../../helpers/content/posts/content-posts-checker');
import InteractionsDictionary = require('../../../src/lib/dictionary/interactions-dictionary');

const JEST_TIMEOUT = 15000;

describe('Send profile and get profile status', () => {
  Helper.initForEnvByProcessVariable();

  const accountNameFrom = Helper.getTesterAccountName();
  const privateKey      = Helper.getTesterAccountPrivateKey();
  const permission      = PermissionsDictionary.active();

  describe('Positive', () => {
    describe('Create publication', () => {
      it('Send a new publication from User to the blockchain', async () => {
        const content = ContentPostsGenerator.getSamplePostInputFields();
        const interactionName = InteractionsDictionary.createMediaPostFromAccount();

        const { signed, contentId } = await ContentPublicationsApi.signCreatePublicationFromUser(
          accountNameFrom,
          privateKey,
          content,
          permission,
        );

        const response = await EosClient.pushTransaction(signed);

        ContentPostsChecker.checkSamplePostPushingFromUserResponse(response, accountNameFrom, interactionName, contentId);
      }, JEST_TIMEOUT);

      it('Send a new publication from organization to the blockchain', async () => {
        const content         = ContentPostsGenerator.getSamplePostInputFields();
        const interactionName = InteractionsDictionary.createMediaPostFromOrganization();
        const orgBlockchainId = ContentOrganizationsGenerator.getSampleOrganizationBlockchainId();

        const { signed, contentId } = await ContentPublicationsApi.signCreatePublicationFromOrganization(
          accountNameFrom,
          privateKey,
          orgBlockchainId,
          content,
          permission,
        );

        const response = await EosClient.pushTransaction(signed);

        ContentPostsChecker.checkSamplePostPushingFromOrganizationResponse(
          response,
          accountNameFrom,
          interactionName,
          contentId,
          orgBlockchainId,
        );
      }, JEST_TIMEOUT);
    });
    describe('Update publication', () => {
      it('Send an updated publication from User to the blockchain', async () => {
        const content = ContentPostsGenerator.getSamplePostInputFields();
        const interactionName = InteractionsDictionary.updateMediaPostFromAccount();

        const { signed, contentId } = await ContentPublicationsApi.signUpdatePublicationFromUser(
          accountNameFrom,
          privateKey,
          content,
          permission,
        );

        const response = await EosClient.pushTransaction(signed);

        ContentPostsChecker.checkSamplePostPushingFromUserResponse(response, accountNameFrom, interactionName, contentId);
      }, JEST_TIMEOUT);

      it('Send an updated publication from organization to the blockchain', async () => {
        const content         = ContentPostsGenerator.getSamplePostInputFields();
        const interactionName = InteractionsDictionary.updateMediaPostFromOrganization();
        const orgBlockchainId = ContentOrganizationsGenerator.getSampleOrganizationBlockchainId();

        const { signed, contentId } = await ContentPublicationsApi.signUpdatePublicationFromOrganization(
          accountNameFrom,
          privateKey,
          orgBlockchainId,
          content,
          permission,
        );

        const response = await EosClient.pushTransaction(signed);

        ContentPostsChecker.checkSamplePostPushingFromOrganizationResponse(
          response,
          accountNameFrom,
          interactionName,
          contentId,
          orgBlockchainId,
        );
      }, JEST_TIMEOUT);
    });
  });
});

export {};

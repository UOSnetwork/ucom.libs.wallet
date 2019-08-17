/* eslint-disable security/detect-object-injection,no-useless-escape */
import Helper = require('../../helpers/helper');
import ContentPublicationsApi = require('../../../src/lib/content/api/content-publications-api');
import EosClient = require('../../../src/lib/common/client/eos-client');
import ContentPostsGenerator = require('../../helpers/content/posts/content-posts-generator');
import ContentOrganizationsGenerator = require('../../helpers/content/posts/content-organizations-generator');
import ContentPostsChecker = require('../../helpers/content/posts/content-checker');
import InteractionsDictionary = require('../../../src/lib/dictionary/interactions-dictionary');
import SmartContractsDictionary = require('../../../src/lib/dictionary/smart-contracts-dictionary');

const JEST_TIMEOUT = 15000;

describe('Resend media-posts (publications) to the blockchain', () => {
  Helper.initForEnvByProcessVariable();

  const accountNameFrom = Helper.getTesterAccountName();

  describe('Positive', () => {
    it('Resend a publication from User to the blockchain', async () => {
      const content = ContentPostsGenerator.getSamplePostInputFields();

      content.created_at = ContentPostsGenerator.getSamplePostInputCreatedAt();
      const interactionName = InteractionsDictionary.createMediaPostFromAccount();

      const blockchainId = ContentPostsGenerator.getSamplePostBlockchainId();

      const signedTransaction = await ContentPublicationsApi.signResendPublicationFromUser(
        accountNameFrom,
        Helper.getHistoricalSenderPrivateKey(),
        content,
        blockchainId,
      );

      const response = await EosClient.pushTransaction(signedTransaction);

      ContentPostsChecker.checkResendPostPushingFromUserResponse(
        response,
        SmartContractsDictionary.historicalSenderAccountName(),
        accountNameFrom,
        interactionName,
        blockchainId,
        content.created_at,
      );
    }, JEST_TIMEOUT);

    it('Resend a publication from organization to the blockchain', async () => {
      const content         = ContentPostsGenerator.getSamplePostInputFields();
      const interactionName = InteractionsDictionary.createMediaPostFromOrganization();
      const orgBlockchainId = ContentOrganizationsGenerator.getSampleOrganizationBlockchainId();
      const postBlockchainId = ContentPostsGenerator.getSamplePostBlockchainId();

      content.created_at = ContentPostsGenerator.getSamplePostInputCreatedAt();

      const signedTransaction = await ContentPublicationsApi.signResendPublicationFromOrganization(
        accountNameFrom,
        Helper.getHistoricalSenderPrivateKey(),
        orgBlockchainId,
        content,
        postBlockchainId,
      );

      const response = await EosClient.pushTransaction(signedTransaction);

      ContentPostsChecker.checkResendPostPushingFromOrganization(
        response,
        SmartContractsDictionary.historicalSenderAccountName(),
        accountNameFrom,
        interactionName,
        postBlockchainId,
        orgBlockchainId,
        content.created_at,
      );
    }, JEST_TIMEOUT);
  });
});

export {};

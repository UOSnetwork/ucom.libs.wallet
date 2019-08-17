/* eslint-disable security/detect-object-injection,no-useless-escape */
import Helper = require('../../helpers/helper');
import ContentPublicationsApi = require('../../../src/lib/content/api/content-publications-api');
import EosClient = require('../../../src/lib/common/client/eos-client');
import ContentPostsGenerator = require('../../helpers/content/posts/content-posts-generator');
import ContentOrganizationsGenerator = require('../../helpers/content/posts/content-organizations-generator');
import ContentPostsChecker = require('../../helpers/content/posts/content-checker');
import InteractionsDictionary = require('../../../src/lib/dictionary/interactions-dictionary');
import SmartContractsDictionary = require('../../../src/lib/dictionary/smart-contracts-dictionary');
import SmartContractsActionsDictionary = require('../../../src/lib/dictionary/smart-contracts-actions-dictionary');

const JEST_TIMEOUT = 15000;

Helper.initForEnvByProcessVariable();
const { EntityNames } = require('ucom.libs.common').Common.Dictionary;

const accountNameFrom = Helper.getTesterAccountName();
const accountNameTo = Helper.getAccountNameTo();

it('Resend direct post from account to account to the blockchain', async () => {
  const content = ContentPostsGenerator.getDirectPostOrRepostInputFields();

  content.created_at = ContentPostsGenerator.getSamplePostInputCreatedAt();
  const interactionName = InteractionsDictionary.createDirectPostForAccount();

  const blockchainId = ContentPostsGenerator.getSamplePostBlockchainId();

  const signedTransaction = await ContentPublicationsApi.signResendDirectPostsToAccount(
    accountNameFrom,
    Helper.getHistoricalSenderPrivateKey(),
    accountNameTo,
    content,
    blockchainId,
  );

  const response = await EosClient.pushTransaction(signedTransaction);

  const expectedActName: string = SmartContractsActionsDictionary.historicalSocialAction();

  ContentPostsChecker.checkDirectPostPushingResponse(
    response,
    interactionName,
    accountNameFrom,
    blockchainId,
    EntityNames.USERS,
    accountNameTo,
    content.created_at,
    expectedActName,
    SmartContractsDictionary.historicalSenderAccountName(),
  );
}, JEST_TIMEOUT);

it('Resend direct post from account to the organization to the blockchain', async () => {
  const content = ContentPostsGenerator.getDirectPostOrRepostInputFields();

  content.created_at = ContentPostsGenerator.getSamplePostInputCreatedAt();
  const interactionName = InteractionsDictionary.createDirectPostForOrganization();

  const blockchainId = ContentPostsGenerator.getSamplePostBlockchainId();
  const organizationBlockchainId = ContentOrganizationsGenerator.getSampleOrganizationBlockchainId();

  const signedTransaction = await ContentPublicationsApi.signResendDirectPostsToOrganization(
    accountNameFrom,
    Helper.getHistoricalSenderPrivateKey(),
    organizationBlockchainId,
    content,
    blockchainId,
  );

  const response = await EosClient.pushTransaction(signedTransaction);

  const expectedActName: string = SmartContractsActionsDictionary.historicalSocialAction();

  ContentPostsChecker.checkDirectPostPushingResponse(
    response,
    interactionName,
    accountNameFrom,
    blockchainId,
    EntityNames.ORGANIZATIONS,
    organizationBlockchainId,
    content.created_at,
    expectedActName,
    SmartContractsDictionary.historicalSenderAccountName(),
  );
}, JEST_TIMEOUT);

export {};

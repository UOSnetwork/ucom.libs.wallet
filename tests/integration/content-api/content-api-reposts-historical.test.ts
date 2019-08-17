/* eslint-disable security/detect-object-injection,no-useless-escape */
import Helper = require('../../helpers/helper');
import ContentPublicationsApi = require('../../../src/lib/content/api/content-publications-api');
import EosClient = require('../../../src/lib/common/client/eos-client');
import ContentPostsGenerator = require('../../helpers/content/posts/content-posts-generator');
import ContentPostsChecker = require('../../helpers/content/posts/content-posts-checker');
import SmartContractsActionsDictionary = require('../../../src/lib/dictionary/smart-contracts-actions-dictionary');
import SmartContractsDictionary = require('../../../src/lib/dictionary/smart-contracts-dictionary');

const JEST_TIMEOUT = 15000;

Helper.initForEnvByProcessVariable();

const accountNameFrom = Helper.getTesterAccountName();

it('Resend reposts - historical', async () => {
  const content = ContentPostsGenerator.getDirectPostOrRepostInputFields();
  content.created_at = ContentPostsGenerator.getSamplePostInputCreatedAt();

  const blockchainId = `${ContentPostsGenerator.getSamplePostBlockchainId()}999`;
  const parentBlockchainId = ContentPostsGenerator.getSamplePostBlockchainId();

  const signedTransaction = await ContentPublicationsApi.signResendReposts(
    accountNameFrom,
    Helper.getHistoricalSenderPrivateKey(),
    parentBlockchainId,
    content,
    blockchainId,
  );

  const expectedActName: string = SmartContractsActionsDictionary.historicalSocialAction();

  const response = await EosClient.pushTransaction(signedTransaction);
  ContentPostsChecker.checkRepostPushingResponse(
    response,
    accountNameFrom,
    blockchainId,
    parentBlockchainId,
    content.created_at,
    expectedActName,
    SmartContractsDictionary.historicalSenderAccountName(),
  );
}, JEST_TIMEOUT);

export {};

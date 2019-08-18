import Helper = require('../../../helpers/helper');
import ContentOrganizationsGenerator = require('../../../helpers/content/posts/content-organizations-generator');
import InteractionsDictionary = require('../../../../src/lib/dictionary/interactions-dictionary');
import ContentOrganizationsApi = require('../../../../src/lib/content/api/content-organizations-api');
import EosClient = require('../../../../src/lib/common/client/eos-client');
import ContentChecker = require('../../../helpers/content/posts/content-checker');
import SmartContractsDictionary = require('../../../../src/lib/dictionary/smart-contracts-dictionary');
import SmartContractsActionsDictionary = require('../../../../src/lib/dictionary/smart-contracts-actions-dictionary');

const JEST_TIMEOUT = 15000;

Helper.initForEnvByProcessVariable();

const accountNameFrom = Helper.getTesterAccountName();

it('Resend already created organizations - historical transactions', async () => {
  const content = ContentOrganizationsGenerator.getFormFields();

  content.created_at = ContentOrganizationsGenerator.getCreatedAt();
  const interactionName = InteractionsDictionary.createOrganization();

  const blockchainId = ContentOrganizationsGenerator.getBlockchainId();

  const signedTransaction = await ContentOrganizationsApi.signResendOrganizations(
    accountNameFrom,
    Helper.getHistoricalSenderPrivateKey(),
    content,
    blockchainId,
  );

  const response = await EosClient.pushTransaction(signedTransaction);

  ContentChecker.checkOrganizationPushingResponse(
    response,
    interactionName,
    accountNameFrom,
    blockchainId,
    content.created_at,
    SmartContractsActionsDictionary.historicalSocialAction(),
    SmartContractsDictionary.historicalSenderAccountName(),
  );
}, JEST_TIMEOUT);

export {};

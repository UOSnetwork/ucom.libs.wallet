import Helper = require('../../../helpers/helper');
import PermissionsDictionary = require('../../../../src/lib/dictionary/permissions-dictionary');
import EosClient = require('../../../../src/lib/common/client/eos-client');
import ContentPostsChecker = require('../../../helpers/content/posts/content-checker');
import InteractionsDictionary = require('../../../../src/lib/dictionary/interactions-dictionary');
import ContentOrganizationsApi = require('../../../../src/lib/content/api/content-organizations-api');
import ContentOrganizationsGenerator = require('../../../helpers/content/posts/content-organizations-generator');

const JEST_TIMEOUT = 15000;

Helper.initForEnvByProcessVariable();

const accountNameFrom = Helper.getTesterAccountName();
const privateKey      = Helper.getTesterAccountPrivateKey();
const permission      = PermissionsDictionary.active();

it('Create organization (community)', async () => {
  const content = ContentOrganizationsGenerator.getFormFields();
  const interactionName = InteractionsDictionary.createOrganization();

  const { signed_transaction, blockchain_id } = await ContentOrganizationsApi.signCreateOrganization(
    accountNameFrom,
    privateKey,
    content,
    permission,
  );

  const response = await EosClient.pushTransaction(signed_transaction);

  ContentPostsChecker.checkOrganizationPushingResponse(response, interactionName, accountNameFrom, blockchain_id);
}, JEST_TIMEOUT);

it('Update organization (community)', async () => {
  const content       = ContentOrganizationsGenerator.getFormFields();
  content.created_at  = ContentOrganizationsGenerator.getCreatedAt();

  const blockchainId    = ContentOrganizationsGenerator.getBlockchainId();
  const interactionName = InteractionsDictionary.updateOrganization();

  const signed_transaction = await ContentOrganizationsApi.signUpdateOrganization(
    accountNameFrom,
    privateKey,
    content,
    blockchainId,
    permission,
  );

  const response = await EosClient.pushTransaction(signed_transaction);

  ContentPostsChecker.checkOrganizationPushingResponse(response, interactionName, accountNameFrom, blockchainId);
}, JEST_TIMEOUT);

export {};

/* eslint-disable security/detect-object-injection,no-useless-escape */
import Helper = require('../../helpers/helper');
import PermissionsDictionary = require('../../../src/lib/dictionary/permissions-dictionary');
import ContentPublicationsApi = require('../../../src/lib/content/api/content-publications-api');
import EosClient = require('../../../src/lib/common/client/eos-client');
import ContentPostsGenerator = require('../../helpers/content/posts/content-posts-generator');
import ContentPostsChecker = require('../../helpers/content/posts/content-checker');

const JEST_TIMEOUT = 15000;

Helper.initForEnvByProcessVariable();

const accountNameFrom = Helper.getTesterAccountName();
const privateKey      = Helper.getTesterAccountSocialPrivateKey();
const permission      = PermissionsDictionary.social();

it('Create repost', async () => {
  const content = ContentPostsGenerator.getDirectPostOrRepostInputFields();

  const parentBlockchainId = ContentPostsGenerator.getSamplePostBlockchainId();

  const { signed_transaction, blockchain_id } = await ContentPublicationsApi.signCreateRepostPostForAccount(
    accountNameFrom,
    privateKey,
    parentBlockchainId,
    content,
    permission,
  );

  const response = await EosClient.pushTransaction(signed_transaction);
  ContentPostsChecker.checkRepostPushingResponse(
    response,
    accountNameFrom,
    blockchain_id,
    parentBlockchainId,
  );
}, JEST_TIMEOUT);

export {};

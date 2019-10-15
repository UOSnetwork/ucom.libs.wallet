import { PrepareTransactionApi } from '../../../src/lib/common/api/prepare-transaction-api';
import { SocialActionsApi } from '../../../src/lib/social-transactions/api/social-actions-api';

import Helper = require('../../helpers/helper');
import InteractionsDictionary = require('../../../src/lib/dictionary/interactions-dictionary');
import SocialTransactionsGenerator = require('../../generators/social-transactions-generator');
import ContentOrganizationsGenerator = require('../../helpers/content/posts/content-organizations-generator');
import PermissionsDictionary = require('../../../src/lib/dictionary/permissions-dictionary');
import CommonChecker = require('../../helpers/common/common-checker');

const JEST_TIMEOUT = 40000;

Helper.initForEnvByProcessVariable();

const permission = PermissionsDictionary.social();

it('Follow account', async () => {
  const interaction = InteractionsDictionary.followToAccount();
  const targetBlockchainId = Helper.getAccountNameTo();

  await SocialTransactionsGenerator.signSendAndCheckUserToAccount(interaction, targetBlockchainId, permission);
}, JEST_TIMEOUT);

it('should get action part', async () => {
  const broadcast = false;
  const action = SocialActionsApi.getFollowAccountAction(Helper.getTesterAccountName(), Helper.getAccountNameTo(), PermissionsDictionary.active());

  CommonChecker.expectNotEmpty(action);

  const transactionParams = PrepareTransactionApi.getTransactionParams(broadcast);
  CommonChecker.expectNotEmpty(transactionParams);
});

it('Unfollow account', async () => {
  const interaction = InteractionsDictionary.unfollowToAccount();
  const targetBlockchainId = Helper.getAccountNameTo();

  await SocialTransactionsGenerator.signSendAndCheckUserToAccount(interaction, targetBlockchainId, permission);
}, JEST_TIMEOUT);

it('Follow organization', async () => {
  const interaction = InteractionsDictionary.followToOrganization();
  const targetBlockchainId = ContentOrganizationsGenerator.getBlockchainId();

  await SocialTransactionsGenerator.signSendAndCheckUserToAccount(interaction, targetBlockchainId, permission);
}, JEST_TIMEOUT);

it('Unfollow organization', async () => {
  const interaction = InteractionsDictionary.unfollowToOrganization();
  const targetBlockchainId = ContentOrganizationsGenerator.getBlockchainId();

  await SocialTransactionsGenerator.signSendAndCheckUserToAccount(interaction, targetBlockchainId, permission);
}, JEST_TIMEOUT);

export {};

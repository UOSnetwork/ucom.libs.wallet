/* eslint-disable no-bitwise,security/detect-object-injection,jest/no-disabled-tests */

import {
  CheckManyObjectsOptionsDto,
  ObjectInterfaceRulesDto,
} from '../../../helpers/common/interfaces/options-interfaces';


import Helper = require('../../../helpers/helper');
import ConfigService = require('../../../../src/config/config-service');
import BlockchainNodesApi = require('../../../../src/lib/governance/api/blockchain-nodes-api');
import CommonChecker = require('../../../helpers/common/common-checker');
import UosAccountsPropertiesApi = require('../../../../src/lib/uos-accounts-properties/uos-accounts-properties-api');
import BlockchainNodesHelper = require('../../../helpers/blockchain-nodes/blockchain-nodes-helper');
import WalletApi = require('../../../../src/lib/wallet/api/wallet-api');
import EosClient = require('../../../../src/lib/common/client/eos-client');

ConfigService.initNodeJsEnv();
ConfigService.initForTestEnv();

EosClient.initForTestEnv();
EosClient.setNodeJsEnv();

Helper.initForTestEnv();

const JEST_TIMEOUT = 20000;

const accountName = Helper.getTesterAccountName();
const privateKey = Helper.getTesterAccountPrivateKey();

describe('Blockchain nodes fetching', () => {
  // eslint-disable-next-line sonarjs/cognitive-complexity
  describe('Positive', () => {
    it('Vote for block producers and check nodes state', async () => {
      await Helper.stakeSomethingIfNecessary(accountName, privateKey);
      await WalletApi.voteForBlockProducers(accountName, privateKey, []);

      const uosAccounts = await UosAccountsPropertiesApi.getAllAccountsTableRows('name', true);
      const stakedBalance = +uosAccounts[accountName].staked_balance;
      const scaledImportance = +uosAccounts[accountName].scaled_importance;

      const { blockProducersWithVoters } = await BlockchainNodesApi.getAll();

      const amountToVote = 2;

      const twoNodesToTest = BlockchainNodesHelper.getNodesAmountWithData(blockProducersWithVoters, amountToVote);

      await WalletApi.voteForBlockProducers(accountName, privateKey, Object.keys(twoNodesToTest));

      const { blockProducersWithVoters:nodesAfterTwoVotes } = await BlockchainNodesApi.getAll();


      for (const title in twoNodesToTest) {
        if (!twoNodesToTest.hasOwnProperty(title)) {
          continue;
        }

        const before = twoNodesToTest[title];

        const after = nodesAfterTwoVotes.indexedNodes[title];
        CommonChecker.expectNotEmpty(after);

        expect(after.votes_count).toBe(before.votes_count + 1);
        expect(after.votes_amount).toBe(before.votes_amount + stakedBalance);
        expect(after.scaled_importance_amount).toBe(before.scaled_importance_amount + scaledImportance);
      }

      const singleNodeToVote = Object.keys(twoNodesToTest)[0];
      await WalletApi.voteForBlockProducers(accountName, privateKey, [singleNodeToVote]);

      const { blockProducersWithVoters:nodesAfterSingleVote } = await BlockchainNodesApi.getAll();

      for (const title in twoNodesToTest) {
        if (!twoNodesToTest.hasOwnProperty(title)) {
          continue;
        }

        const nodeAfterSingle = nodesAfterSingleVote.indexedNodes[title];
        const nodeAfterTwo = nodesAfterTwoVotes.indexedNodes[title];

        CommonChecker.expectNotEmpty(nodeAfterSingle);
        CommonChecker.expectNotEmpty(nodeAfterTwo);

        if (title === singleNodeToVote) {
          expect(nodeAfterSingle.votes_count).toBe(nodeAfterTwo.votes_count);
          expect(nodeAfterSingle.votes_amount).toBe(nodeAfterTwo.votes_amount);
          expect(nodeAfterSingle.scaled_importance_amount).toBe(nodeAfterTwo.scaled_importance_amount);
        } else {
          expect(nodeAfterSingle.votes_count).toBe(nodeAfterTwo.votes_count - 1);
          expect(nodeAfterSingle.votes_amount).toBe(nodeAfterTwo.votes_amount - stakedBalance);
          expect(nodeAfterSingle.scaled_importance_amount).toBe(nodeAfterTwo.scaled_importance_amount - scaledImportance);
        }
      }
    }, JEST_TIMEOUT * 2);

    it('Vote for calculators and check nodes state', async () => {
      await Helper.stakeSomethingIfNecessary(accountName, privateKey);
      await WalletApi.voteForCalculatorNodes(accountName, privateKey, []);

      const uosAccounts = await UosAccountsPropertiesApi.getAllAccountsTableRows('name', true);
      const stakedBalance = +uosAccounts[accountName].staked_balance;
      const scaledImportance = +uosAccounts[accountName].scaled_importance;

      const { calculatorsWithVoters } = await BlockchainNodesApi.getAll();

      const amountToVote = 2;

      const twoNodesToTest = BlockchainNodesHelper.getNodesAmountWithData(calculatorsWithVoters, amountToVote);

      await WalletApi.voteForCalculatorNodes(accountName, privateKey, Object.keys(twoNodesToTest));

      const { calculatorsWithVoters:nodesAfterTwoVotes } = await BlockchainNodesApi.getAll();

      for (const title in twoNodesToTest) {
        if (!twoNodesToTest.hasOwnProperty(title)) {
          continue;
        }

        const before = twoNodesToTest[title];

        const after = nodesAfterTwoVotes.indexedNodes[title];
        CommonChecker.expectNotEmpty(after);

        expect(after.votes_count).toBe(before.votes_count + 1);
        expect(after.votes_amount).toBe(before.votes_amount + stakedBalance);
        expect(after.scaled_importance_amount).toBe(before.scaled_importance_amount + scaledImportance);
      }

      const singleNodeToVote = Object.keys(twoNodesToTest)[0];
      await WalletApi.voteForCalculatorNodes(accountName, privateKey, [singleNodeToVote]);

      const { calculatorsWithVoters:nodesAfterSingleVote } = await BlockchainNodesApi.getAll();

      for (const title in twoNodesToTest) {
        if (!twoNodesToTest.hasOwnProperty(title)) {
          continue;
        }

        const nodeAfterSingle = nodesAfterSingleVote.indexedNodes[title];
        const nodeAfterTwo = nodesAfterTwoVotes.indexedNodes[title];

        CommonChecker.expectNotEmpty(nodeAfterSingle);
        CommonChecker.expectNotEmpty(nodeAfterTwo);

        if (title === singleNodeToVote) {
          expect(nodeAfterSingle.votes_count).toBe(nodeAfterTwo.votes_count);
          expect(nodeAfterSingle.votes_amount).toBe(nodeAfterTwo.votes_amount);
          expect(nodeAfterSingle.scaled_importance_amount).toBe(nodeAfterTwo.scaled_importance_amount);
        } else {
          expect(nodeAfterSingle.votes_count).toBe(nodeAfterTwo.votes_count - 1);
          expect(nodeAfterSingle.votes_amount).toBe(nodeAfterTwo.votes_amount - stakedBalance);
          expect(nodeAfterSingle.scaled_importance_amount).toBe(nodeAfterTwo.scaled_importance_amount - scaledImportance);
        }
      }
    }, JEST_TIMEOUT * 2);

    it('Fetch current block producers and check interfaces', async () => {
      const { blockProducersWithVoters, calculatorsWithVoters } = await BlockchainNodesApi.getAll();

      const expectedProducersFields: ObjectInterfaceRulesDto = {
        title: {
          type: 'string',
          length: 1,
        },
        votes_count: {
          type: 'number',
          length: 0,
        },
        votes_amount: {
          type: 'number',
          length: 0,
        },
        currency: {
          type: 'string',
          length: 1,
          value: 'UOS',
        },
        scaled_importance_amount: {
          type: 'number',
          length: 0,
        },
        bp_status: {
          type: 'number',
          length: 0,
        },
      };

      const blockProducersOptions: CheckManyObjectsOptionsDto = {
        exactKeysAmount: true,
        keyIs: 'title',
      };

      CommonChecker.checkManyObjectsInterface(
        blockProducersWithVoters.indexedNodes,
        expectedProducersFields,
        blockProducersOptions,
      );

      CommonChecker.checkManyObjectsInterface(
        calculatorsWithVoters.indexedNodes,
        expectedProducersFields,
        blockProducersOptions,
      );

      const expectedVotersFields: ObjectInterfaceRulesDto = {
        account_name: {
          type: 'string',
          length: 1,
        },
        staked_balance: {
          type: 'number',
          length: 0,
        },
        scaled_importance: {
          type: 'number',
          length: 0,
        },
      };

      const votersOptions: CheckManyObjectsOptionsDto = {
        exactKeysAmount: true,
        keyIs: 'account_name',
      };

      CommonChecker.checkManyObjectsInterface(
        blockProducersWithVoters.indexedVoters,
        expectedVotersFields,
        votersOptions,
      );

      CommonChecker.checkManyObjectsInterface(
        calculatorsWithVoters.indexedVoters,
        expectedVotersFields,
        votersOptions,
      );
    }, JEST_TIMEOUT);
  });
});

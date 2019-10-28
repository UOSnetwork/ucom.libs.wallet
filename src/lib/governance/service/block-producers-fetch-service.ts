import SmartContractsDictionary from '../../dictionary/smart-contracts-dictionary';
import { UOS } from '../../dictionary/currency-dictionary';

import EosClient = require('../../common/client/eos-client');
import BlockchainNodesDictionary = require('../dictionary/blockchain-nodes-dictionary');

class BlockProducersFetchService {
  public static async getActiveBlockProducers(): Promise<any> {
    const rpc = EosClient.getRpcClient();

    return rpc.get_producer_schedule();
  }

  public static async getAllWithVoters(
    uosAccounts,
  ): Promise<{ indexedNodes, indexedVoters }> {
    const rpc = EosClient.getRpcClient();
    const [manyVotersRows, producersSchedule, manyNodes] = await Promise.all([
      this.getVotesTableRows(),
      rpc.get_producer_schedule(),
      rpc.get_producers(true, '', 1000),
    ]);

    const activeNodes = this.extractActiveProducers(producersSchedule);
    const { indexedNodes, indexedVoters } =
      this.processVotersAndVotedProducers(manyVotersRows, activeNodes, uosAccounts);
    this.addOtherProducers(manyNodes, indexedNodes);

    return {
      indexedNodes,
      indexedVoters,
    };
  }

  private static extractActiveProducers(producersSchedule) {
    const activeProducers = {};
    if (producersSchedule && producersSchedule.active && producersSchedule.active.producers) {
      for (const producerData of producersSchedule.active.producers) {
        activeProducers[producerData.producer_name] = true;
      }
    }

    return activeProducers;
  }

  private static addOtherProducers(manyNodes, processedNodes): void {
    for (let i = 0; i < manyNodes.rows.length; i += 1) {
      const producerSet = manyNodes.rows[i];

      if (processedNodes[producerSet.owner]) {
        continue;
      }

      processedNodes[producerSet.owner] = {
        title:        producerSet.owner,
        votes_count:  0,
        votes_amount: 0,
        currency:     UOS,
        scaled_importance_amount: 0,
        bp_status:    BlockchainNodesDictionary.getBackupOrInactive(producerSet),
      };
    }
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  private static processVotersAndVotedProducers(
    votersRows,
    activeProducers,
    uosAccounts,
  ): { indexedNodes, indexedVoters } {
    const indexedVoters: any = {};
    const indexedNodes: any = {};

    for (const voter of votersRows) {
      const properties = uosAccounts[voter.owner];
      if (!properties) {
        continue;
      }

      if (!properties.scaled_importance) {
        throw new Error(`There is no scaled_importance inside properties for voter: ${voter.owner}`);
      }

      if (!properties.staked_balance) {
        throw new Error(`There is no staked_balance inside properties for voter: ${voter.owner}`);
      }

      for (const producer of voter.producers) {
        if (!indexedNodes[producer]) {
          indexedNodes[producer] = {
            title:        producer,
            votes_count:  0,
            votes_amount: 0,
            currency:     UOS,

            scaled_importance_amount: 0,

            bp_status:    activeProducers[producer] ?
              BlockchainNodesDictionary.statusActive()
              : BlockchainNodesDictionary.statusBackup(),
          };
        }

        indexedNodes[producer].votes_count += 1;
        indexedNodes[producer].votes_amount += +properties.staked_balance;
        indexedNodes[producer].scaled_importance_amount += +properties.scaled_importance;
      }

      indexedVoters[voter.owner] = {
        account_name:   voter.owner,
        staked_balance: +properties.staked_balance,
        scaled_importance: +properties.scaled_importance,
        nodes: voter.producers,
      };
    }

    return {
      indexedNodes,
      indexedVoters,
    };
  }

  private static async getVotesTableRows(): Promise<any> {
    return EosClient.getTableRowsWithBatching(
      SmartContractsDictionary.eosIo(),
      SmartContractsDictionary.eosIo(),
      SmartContractsDictionary.votersTableName(),
      'owner',
      500,
    );
  }
}

export = BlockProducersFetchService;

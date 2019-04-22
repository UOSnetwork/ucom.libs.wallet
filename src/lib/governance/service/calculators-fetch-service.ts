import SmartContractsDictionary from '../../dictionary/smart-contracts-dictionary';

import EosClient = require('../../common/client/eos-client');
import BlockchainNodesDictionary = require('../dictionary/blockchain-nodes-dictionary');

const _ = require('lodash');

class CalculatorsFetchService {
  public static async getAllWithVoters(
    uosAccounts,
  ): Promise<{ indexedNodes, indexedVoters }> {
    const [manyNodes, manyVotersRows] = await Promise.all([
      this.getAllNodes(),
      this.getAllVoters(),
    ]);

    const activeCalculators = this.extractActiveNodes(manyNodes);
    const { indexedNodes, indexedVoters } = this.processVotersAndVotedNodes(
      manyVotersRows,
      activeCalculators,
      uosAccounts,
      'calculators',
    );

    this.addOtherProducers(manyNodes, indexedNodes);

    return {
      indexedNodes,
      indexedVoters,
    };
  }

  private static extractActiveNodes(manyProducers) {
    const activeProducers = {};

    const sortedProducers = _.cloneDeep(manyProducers)
      .sort((a, b) => +b.total_votes - a.total_votes);

    let counter = 0;
    for (const producer of sortedProducers) {
      if (producer.is_active !== 1) {
        continue;
      }

      activeProducers[producer.owner] = true;

      counter += 1;
      if (counter === BlockchainNodesDictionary.activeNumber()) {
        break;
      }
    }

    return activeProducers;
  }

  private static addOtherProducers(manyNodes, activeNodes): void {
    for (const node of manyNodes) {
      if (activeNodes[node.owner]) {
        continue;
      }

      activeNodes[node.owner] = {
        title:        node.owner,
        votes_count:  0,
        votes_amount: 0,

        scaled_importance_amount: 0,

        currency:     'UOS',
        bp_status:    BlockchainNodesDictionary.getBackupOrInactive(node),
      };
    }
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  private static processVotersAndVotedNodes(
    votersRows,
    activeProducers,
    uosAccounts,
    votesIndex: string,
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

      for (const producer of voter[votesIndex]) {
        if (!indexedNodes[producer]) {
          indexedNodes[producer] = {
            title:        producer,
            votes_count:  0,
            votes_amount: 0,
            currency:     'UOS',

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
        nodes: voter[votesIndex],
      };
    }

    return {
      indexedNodes,
      indexedVoters,
    };
  }

  private static async getAllNodes(): Promise<any> {
    return EosClient.getTableRowsWithBatching(
      SmartContractsDictionary.eosIo(),
      SmartContractsDictionary.eosIo(),
      SmartContractsDictionary.calculatorsTableName(),
      'owner',
      500,
    );
  }

  private static async getAllVoters(): Promise<any> {
    return EosClient.getTableRowsWithBatching(
      SmartContractsDictionary.eosIo(),
      SmartContractsDictionary.eosIo(),
      SmartContractsDictionary.calculatorsVotersTableName(),
      'owner',
      500,
    );
  }
}

export = CalculatorsFetchService;

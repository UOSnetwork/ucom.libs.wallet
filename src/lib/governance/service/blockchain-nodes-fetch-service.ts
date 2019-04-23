import BlockProducersFetchService = require('./block-producers-fetch-service');
import UosAccountsPropertiesApi = require('../../uos-accounts-properties/uos-accounts-properties-api');
import CalculatorsFetchService = require('./calculators-fetch-service');

class BlockchainNodesFetchService {
  public static async getBlockProducersAndCalculatorsWithVoters(

  ): Promise<{ blockProducersWithVoters, calculatorsWithVoters }> {
    const uosAccounts = await UosAccountsPropertiesApi.getAllAccountsTableRows('name', true);
    const [blockProducersWithVoters, calculatorsWithVoters] = await Promise.all([
      BlockProducersFetchService.getAllWithVoters(uosAccounts),
      CalculatorsFetchService.getAllWithVoters(uosAccounts),
    ]);

    this.normalizeData(blockProducersWithVoters);
    this.normalizeData(calculatorsWithVoters);

    return {
      blockProducersWithVoters,
      calculatorsWithVoters,
    };
  }

  private static normalizeData(data: { indexedNodes, indexedVoters }) {
    const nodes = data.indexedNodes;
    for (const title in nodes) {
      if (!nodes.hasOwnProperty(title)) {
        continue;
      }

      nodes[title].scaled_importance_amount = +nodes[title].scaled_importance_amount.toFixed(10);
    }

    const voters = data.indexedVoters;
    for (const accountName in voters) {
      if (!voters.hasOwnProperty(accountName)) {
        continue;
      }

      voters[accountName].scaled_importance = +voters[accountName].scaled_importance.toFixed(10);
    }
  }
}

export = BlockchainNodesFetchService;

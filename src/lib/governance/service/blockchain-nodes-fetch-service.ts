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

    return {
      blockProducersWithVoters,
      calculatorsWithVoters,
    };
  }
}

export = BlockchainNodesFetchService;

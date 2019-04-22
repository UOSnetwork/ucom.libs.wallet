import BlockchainNodesFetchService = require('../service/blockchain-nodes-fetch-service');

class BlockchainNodesApi {
  public static async getAll(): Promise<{ blockProducersWithVoters, calculatorsWithVoters }> {
    return BlockchainNodesFetchService.getBlockProducersAndCalculatorsWithVoters();
  }
}

export = BlockchainNodesApi;

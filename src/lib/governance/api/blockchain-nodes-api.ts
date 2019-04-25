import BlockchainNodesFetchService = require('../service/blockchain-nodes-fetch-service');

class BlockchainNodesApi {
  public static async getActiveBlockProducers(): Promise<string[]> {
    const data = await BlockchainNodesFetchService.getActiveBlockProducers();

    return data.active.producers;
  }

  public static async getAll(): Promise<{ blockProducersWithVoters, calculatorsWithVoters }> {
    return BlockchainNodesFetchService.getBlockProducersAndCalculatorsWithVoters();
  }
}

export = BlockchainNodesApi;

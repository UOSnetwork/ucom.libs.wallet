"use strict";
const BlockchainNodesFetchService = require("../service/blockchain-nodes-fetch-service");
class BlockchainNodesApi {
    static async getActiveBlockProducers() {
        const data = await BlockchainNodesFetchService.getActiveBlockProducers();
        return data.active.producers;
    }
    static async getAll() {
        return BlockchainNodesFetchService.getBlockProducersAndCalculatorsWithVoters();
    }
}
module.exports = BlockchainNodesApi;

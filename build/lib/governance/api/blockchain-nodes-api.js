"use strict";
const BlockchainNodesFetchService = require("../service/blockchain-nodes-fetch-service");
class BlockchainNodesApi {
    static async getAll() {
        return BlockchainNodesFetchService.getBlockProducersAndCalculatorsWithVoters();
    }
}
module.exports = BlockchainNodesApi;

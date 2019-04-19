"use strict";
const BlockProducersFetchService = require("../service/block-producers-fetch-service");
class BlockProducersApi {
    static async getAllNodes() {
        return BlockProducersFetchService.getBlockProducers();
    }
}
module.exports = BlockProducersApi;

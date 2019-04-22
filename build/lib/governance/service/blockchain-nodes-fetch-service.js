"use strict";
const BlockProducersFetchService = require("./block-producers-fetch-service");
const UosAccountsPropertiesApi = require("../../uos-accounts-properties/uos-accounts-properties-api");
const CalculatorsFetchService = require("./calculators-fetch-service");
class BlockchainNodesFetchService {
    static async getBlockProducersAndCalculatorsWithVoters() {
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
module.exports = BlockchainNodesFetchService;

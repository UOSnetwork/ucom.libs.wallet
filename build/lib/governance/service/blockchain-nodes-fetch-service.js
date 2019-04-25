"use strict";
const BlockProducersFetchService = require("./block-producers-fetch-service");
const UosAccountsPropertiesApi = require("../../uos-accounts-properties/uos-accounts-properties-api");
const CalculatorsFetchService = require("./calculators-fetch-service");
class BlockchainNodesFetchService {
    static getActiveBlockProducers() {
        return BlockProducersFetchService.getActiveBlockProducers();
    }
    static async getBlockProducersAndCalculatorsWithVoters() {
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
    static normalizeData(data) {
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
module.exports = BlockchainNodesFetchService;

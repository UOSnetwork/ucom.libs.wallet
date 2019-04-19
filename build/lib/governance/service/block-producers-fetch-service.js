"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const eos_client_1 = __importDefault(require("../../eos-client"));
const smart_contracts_dictionary_1 = __importDefault(require("../../dictionary/smart-contracts-dictionary"));
const BlockchainNodesDictionary = require("../api/dictionary/blockchain-nodes-dictionary");
class BlockProducersFetchService {
    static async getAllWithVoters(uosAccounts) {
        const rpc = eos_client_1.default.getRpcClient();
        const [manyVotersRows, producersSchedule, manyNodes] = await Promise.all([
            this.getVotesTableRows(),
            rpc.get_producer_schedule(),
            rpc.get_producers(true, '', 1000),
        ]);
        const activeNodes = this.extractActiveProducers(producersSchedule);
        const { processedNodes, manyVoters } = this.processVotersAndVotedProducers(manyVotersRows, activeNodes, uosAccounts);
        this.addOtherProducers(manyNodes, processedNodes);
        return {
            processedNodes,
            manyVoters,
        };
    }
    static extractActiveProducers(producersSchedule) {
        const activeProducers = {};
        if (producersSchedule && producersSchedule.active && producersSchedule.active.producers) {
            for (const producerData of producersSchedule.active.producers) {
                activeProducers[producerData.producer_name] = true;
            }
        }
        return activeProducers;
    }
    static addOtherProducers(manyNodes, processedNodes) {
        for (let i = 0; i < manyNodes.rows.length; i += 1) {
            const producerSet = manyNodes.rows[i];
            if (processedNodes[producerSet.owner]) {
                continue;
            }
            processedNodes[producerSet.owner] = {
                title: producerSet.owner,
                votes_count: 0,
                votes_amount: 0,
                currency: 'UOS',
                bp_status: BlockchainNodesDictionary.getBackupOrInactive(producerSet),
            };
        }
    }
    static processVotersAndVotedProducers(votersRows, activeProducers, uosAccounts) {
        const manyVoters = {};
        const processedNodes = {};
        for (const voter of votersRows) {
            const properties = uosAccounts[voter.owner];
            if (!properties) {
                continue;
            }
            if (!properties.scaled_importance) {
                throw new Error(`There is no scaled_importance inside properties for voter: ${voter.owner}`);
            }
            for (const producer of voter.producers) {
                if (!processedNodes[producer]) {
                    processedNodes[producer] = {
                        title: producer,
                        votes_count: 0,
                        votes_amount: 0,
                        currency: 'UOS',
                        scaled_importance_amount: 0,
                        bp_status: activeProducers[producer] ?
                            BlockchainNodesDictionary.statusActive()
                            : BlockchainNodesDictionary.statusBackup(),
                    };
                }
                processedNodes[producer].votes_count += 1;
                processedNodes[producer].votes_amount += +voter.staked / 10000;
                processedNodes[producer].scaled_importance_amount += +properties.scaled_importance;
            }
            manyVoters[voter.owner] = voter;
        }
        return {
            processedNodes,
            manyVoters,
        };
    }
    static async getVotesTableRows() {
        return eos_client_1.default.getTableRowsWithBatching(smart_contracts_dictionary_1.default.eosIo(), smart_contracts_dictionary_1.default.eosIo(), smart_contracts_dictionary_1.default.votersTableName(), 'owner', 500);
    }
}
module.exports = BlockProducersFetchService;

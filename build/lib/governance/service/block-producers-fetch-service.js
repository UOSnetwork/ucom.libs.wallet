"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const smart_contracts_dictionary_1 = __importDefault(require("../../dictionary/smart-contracts-dictionary"));
const EosClient = require("../../common/client/eos-client");
const BlockchainNodesDictionary = require("../dictionary/blockchain-nodes-dictionary");
class BlockProducersFetchService {
    static async getAllWithVoters(uosAccounts) {
        const rpc = EosClient.getRpcClient();
        const [manyVotersRows, producersSchedule, manyNodes] = await Promise.all([
            this.getVotesTableRows(),
            rpc.get_producer_schedule(),
            rpc.get_producers(true, '', 1000),
        ]);
        const activeNodes = this.extractActiveProducers(producersSchedule);
        const { indexedNodes, indexedVoters } = this.processVotersAndVotedProducers(manyVotersRows, activeNodes, uosAccounts);
        this.addOtherProducers(manyNodes, indexedNodes);
        return {
            indexedNodes,
            indexedVoters,
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
                scaled_importance_amount: 0,
                bp_status: BlockchainNodesDictionary.getBackupOrInactive(producerSet),
            };
        }
    }
    // eslint-disable-next-line sonarjs/cognitive-complexity
    static processVotersAndVotedProducers(votersRows, activeProducers, uosAccounts) {
        const indexedVoters = {};
        const indexedNodes = {};
        for (const voter of votersRows) {
            const properties = uosAccounts[voter.owner];
            if (!properties) {
                continue;
            }
            if (!properties.scaled_importance) {
                throw new Error(`There is no scaled_importance inside properties for voter: ${voter.owner}`);
            }
            if (!properties.staked_balance) {
                throw new Error(`There is no staked_balance inside properties for voter: ${voter.owner}`);
            }
            for (const producer of voter.producers) {
                if (!indexedNodes[producer]) {
                    indexedNodes[producer] = {
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
                indexedNodes[producer].votes_count += 1;
                indexedNodes[producer].votes_amount += +properties.staked_balance;
                indexedNodes[producer].scaled_importance_amount += +properties.scaled_importance;
            }
            indexedVoters[voter.owner] = {
                account_name: voter.owner,
                staked_balance: +properties.staked_balance,
                scaled_importance: +properties.scaled_importance,
                nodes: voter.producers,
            };
        }
        return {
            indexedNodes,
            indexedVoters,
        };
    }
    static async getVotesTableRows() {
        return EosClient.getTableRowsWithBatching(smart_contracts_dictionary_1.default.eosIo(), smart_contracts_dictionary_1.default.eosIo(), smart_contracts_dictionary_1.default.votersTableName(), 'owner', 500);
    }
}
module.exports = BlockProducersFetchService;

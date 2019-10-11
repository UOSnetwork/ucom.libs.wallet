"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const smart_contracts_dictionary_1 = __importDefault(require("../../dictionary/smart-contracts-dictionary"));
const currency_dictionary_1 = require("../../dictionary/currency-dictionary");
const EosClient = require("../../common/client/eos-client");
const BlockchainNodesDictionary = require("../dictionary/blockchain-nodes-dictionary");
const _ = require('lodash');
class CalculatorsFetchService {
    static async getAllWithVoters(uosAccounts) {
        const [manyNodes, manyVotersRows] = await Promise.all([
            this.getAllNodes(),
            this.getAllVoters(),
        ]);
        const activeCalculators = this.extractActiveNodes(manyNodes);
        const { indexedNodes, indexedVoters } = this.processVotersAndVotedNodes(manyVotersRows, activeCalculators, uosAccounts, 'calculators');
        this.addOtherProducers(manyNodes, indexedNodes);
        return {
            indexedNodes,
            indexedVoters,
        };
    }
    static extractActiveNodes(manyProducers) {
        const activeProducers = {};
        const sortedProducers = _.cloneDeep(manyProducers)
            .sort((a, b) => +b.total_votes - a.total_votes);
        let counter = 0;
        for (const producer of sortedProducers) {
            if (producer.is_active !== 1) {
                continue;
            }
            activeProducers[producer.owner] = true;
            counter += 1;
            if (counter === BlockchainNodesDictionary.activeNumber()) {
                break;
            }
        }
        return activeProducers;
    }
    static addOtherProducers(manyNodes, activeNodes) {
        for (const node of manyNodes) {
            if (activeNodes[node.owner]) {
                continue;
            }
            activeNodes[node.owner] = {
                title: node.owner,
                votes_count: 0,
                votes_amount: 0,
                scaled_importance_amount: 0,
                currency: currency_dictionary_1.UOS,
                bp_status: BlockchainNodesDictionary.getBackupOrInactive(node),
            };
        }
    }
    // eslint-disable-next-line sonarjs/cognitive-complexity
    static processVotersAndVotedNodes(votersRows, activeProducers, uosAccounts, votesIndex) {
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
            for (const producer of voter[votesIndex]) {
                if (!indexedNodes[producer]) {
                    indexedNodes[producer] = {
                        title: producer,
                        votes_count: 0,
                        votes_amount: 0,
                        currency: currency_dictionary_1.UOS,
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
                nodes: voter[votesIndex],
            };
        }
        return {
            indexedNodes,
            indexedVoters,
        };
    }
    static async getAllNodes() {
        return EosClient.getTableRowsWithBatching(smart_contracts_dictionary_1.default.eosIo(), smart_contracts_dictionary_1.default.eosIo(), smart_contracts_dictionary_1.default.calculatorsTableName(), 'owner', 500);
    }
    static async getAllVoters() {
        return EosClient.getTableRowsWithBatching(smart_contracts_dictionary_1.default.eosIo(), smart_contracts_dictionary_1.default.eosIo(), smart_contracts_dictionary_1.default.calculatorsVotersTableName(), 'owner', 500);
    }
}
module.exports = CalculatorsFetchService;

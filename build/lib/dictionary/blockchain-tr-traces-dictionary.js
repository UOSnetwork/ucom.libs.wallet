"use strict";
const TR_LABEL_TRANSFER_FROM = 10;
const TR_LABEL_TRANSFER_TO = 11;
const TR_TYPE_TRANSFER = 12;
const TR_LABEL_TRANSFER_FOREIGN = 13;
const TR_TYPE_STAKE_RESOURCES = 20;
const TR_TYPE_STAKE_WITH_UNSTAKE = 21;
const TR_TYPE_UNSTAKING_REQUEST = 30;
const TR_TYPE_VOTE_FOR_BP = 40;
const TR_TYPE_VOTE_FOR_CALCULATOR_NODES = 41;
const TR_TYPE_CLAIM_EMISSION = 50;
const TR_TYPE_BUY_RAM = 60;
const TR_TYPE_SELL_RAM = 61;
const TR_TYPE_MYSELF_REGISTRATION = 100;
const TR_TYPE_UNKNOWN = 1000;
const TRANSACTION_TYPES = [
    TR_TYPE_TRANSFER,
    TR_TYPE_STAKE_RESOURCES,
    TR_TYPE_STAKE_WITH_UNSTAKE,
    TR_TYPE_UNSTAKING_REQUEST,
    TR_TYPE_VOTE_FOR_BP,
    TR_TYPE_CLAIM_EMISSION,
    TR_TYPE_BUY_RAM,
    TR_TYPE_SELL_RAM,
    TR_TYPE_MYSELF_REGISTRATION,
];
class BlockchainTrTracesDictionary {
    static getLabelTransferFrom() {
        return TR_LABEL_TRANSFER_FROM;
    }
    static getLabelTransferTo() {
        return TR_LABEL_TRANSFER_TO;
    }
    static getLabelTransferForeign() {
        return TR_LABEL_TRANSFER_FOREIGN;
    }
    static getTypeTransfer() {
        return TR_TYPE_TRANSFER;
    }
    static getTypeStakeResources() {
        return TR_TYPE_STAKE_RESOURCES;
    }
    static getTypeUnstakingRequest() {
        return TR_TYPE_UNSTAKING_REQUEST;
    }
    static getTypeVoteForBp() {
        return TR_TYPE_VOTE_FOR_BP;
    }
    static getTypeVoteForCalculatorNodes() {
        return TR_TYPE_VOTE_FOR_CALCULATOR_NODES;
    }
    static getTypeBuyRamBytes() {
        return TR_TYPE_BUY_RAM;
    }
    static getTypeSellRam() {
        return TR_TYPE_SELL_RAM;
    }
    static getTypeClaimEmission() {
        return TR_TYPE_CLAIM_EMISSION;
    }
    static getTypeStakeWithUnstake() {
        return TR_TYPE_STAKE_WITH_UNSTAKE;
    }
    static getTypeMyselfRegistration() {
        return TR_TYPE_MYSELF_REGISTRATION;
    }
    static getTypeUnknown() {
        return TR_TYPE_UNKNOWN;
    }
    static getAllTransactionTypes() {
        return TRANSACTION_TYPES;
    }
}
module.exports = BlockchainTrTracesDictionary;

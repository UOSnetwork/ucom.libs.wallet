const TR_TYPE_TRANSFER            = 12;

const TR_TYPE_STAKE_RESOURCES     = 20;
const TR_TYPE_STAKE_WITH_UNSTAKE  = 21;

const TR_TYPE_UNSTAKING_REQUEST   = 30;
const TR_TYPE_VOTE_FOR_BP         = 40;
const TR_TYPE_VOTE_FOR_CALCULATOR_NODES = 41;

const TR_TYPE_CLAIM_EMISSION      = 50;

const TR_TYPE_BUY_RAM             = 60;
const TR_TYPE_SELL_RAM            = 61;

const TR_TYPE_MYSELF_REGISTRATION = 100;

const TR_LABEL_TRANSFER_FROM      = 10;
const TR_LABEL_TRANSFER_TO        = 11;
const TR_LABEL_TRANSFER_FOREIGN   = 13;

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

  /**
   *
   * @returns {number}
   */
  static getLabelTransferFrom() {
    return TR_LABEL_TRANSFER_FROM;
  }

  /**
   *
   * @returns {number}
   */
  static getLabelTransferTo() {
    return TR_LABEL_TRANSFER_TO;
  }

  /**
   *
   * @returns {number}
   */
  static getLabelTransferForeign() {
    return TR_LABEL_TRANSFER_FOREIGN;
  }

  /**
   *
   * @returns {number}
   */
  static getTypeTransfer() {
    return TR_TYPE_TRANSFER;
  }

  /**
   *
   * @returns {number}
   */
  static getTypeStakeResources() {
    return TR_TYPE_STAKE_RESOURCES;
  }

  /**
   *
   * @returns {number}
   */
  static getTypeUnstakingRequest() {
    return TR_TYPE_UNSTAKING_REQUEST;
  }

  /**
   *
   * @returns {number}
   */
  static getTypeVoteForBp() {
    return TR_TYPE_VOTE_FOR_BP;
  }

  /**
   *
   * @returns {number}
   */
  static getTypeVoteForCalculatorNodes() {
    return TR_TYPE_VOTE_FOR_CALCULATOR_NODES;
  }

  /**
   *
   * @returns {number}
   */
  static getTypeBuyRamBytes() {
    return TR_TYPE_BUY_RAM;
  }

  /**
   *
   * @returns {number}
   */
  static getTypeSellRam() {
    return TR_TYPE_SELL_RAM;
  }


  /**
   *
   * @returns {number}
   */
  static getTypeClaimEmission() {
    return TR_TYPE_CLAIM_EMISSION;
  }

  /**
   *
   * @returns {number}
   */
  static getTypeStakeWithUnstake() {
    return TR_TYPE_STAKE_WITH_UNSTAKE;
  }

  /**
   *
   * @returns {number}
   */
  static getTypeMyselfRegistration() {
    return TR_TYPE_MYSELF_REGISTRATION;
  }

  /**
   *
   * @returns {number[]}
   */
  static getAllTransactionTypes() {
    return TRANSACTION_TYPES;
  }
}

module.exports = BlockchainTrTracesDictionary;
const TR_LABEL_TRANSFER_FROM            = 10;
const TR_LABEL_TRANSFER_TO              = 11;
const TR_TYPE_TRANSFER                  = 12;
const TR_LABEL_TRANSFER_FOREIGN         = 13;

const TR_TYPE_STAKE_RESOURCES           = 20;
const TR_TYPE_STAKE_WITH_UNSTAKE        = 21;

const TR_TYPE_UNSTAKING_REQUEST         = 30;
const TR_TYPE_VOTE_FOR_BP               = 40;
const TR_TYPE_VOTE_FOR_CALCULATOR_NODES = 41;

const TR_TYPE_CLAIM_EMISSION            = 50;

const TR_TYPE_BUY_RAM                   = 60;
const TR_TYPE_SELL_RAM                  = 61;

const TR_TYPE_MYSELF_REGISTRATION       = 100;


const TR_TYPE_UNKNOWN                   = 1000;

const TRANSACTION_TYPES: number[] = [
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
  public static getLabelTransferFrom(): number {
    return TR_LABEL_TRANSFER_FROM;
  }

  public static getLabelTransferTo(): number {
    return TR_LABEL_TRANSFER_TO;
  }

  public static getLabelTransferForeign(): number {
    return TR_LABEL_TRANSFER_FOREIGN;
  }

  public static getTypeTransfer(): number {
    return TR_TYPE_TRANSFER;
  }

  public static getTypeStakeResources(): number {
    return TR_TYPE_STAKE_RESOURCES;
  }

  public static getTypeUnstakingRequest(): number {
    return TR_TYPE_UNSTAKING_REQUEST;
  }

  public static getTypeVoteForBp(): number {
    return TR_TYPE_VOTE_FOR_BP;
  }

  public static getTypeVoteForCalculatorNodes(): number {
    return TR_TYPE_VOTE_FOR_CALCULATOR_NODES;
  }

  public static getTypeBuyRamBytes(): number {
    return TR_TYPE_BUY_RAM;
  }

  public static getTypeSellRam(): number {
    return TR_TYPE_SELL_RAM;
  }

  public static getTypeClaimEmission(): number {
    return TR_TYPE_CLAIM_EMISSION;
  }

  public static getTypeStakeWithUnstake(): number {
    return TR_TYPE_STAKE_WITH_UNSTAKE;
  }

  public static getTypeMyselfRegistration(): number {
    return TR_TYPE_MYSELF_REGISTRATION;
  }

  public static getTypeUnknown(): number {
    return TR_TYPE_UNKNOWN;
  }

  public static getAllTransactionTypes(): number[] {
    return TRANSACTION_TYPES;
  }
}

export = BlockchainTrTracesDictionary;

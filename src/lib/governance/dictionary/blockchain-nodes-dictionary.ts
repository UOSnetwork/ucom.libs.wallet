const BP_STATUS__ACTIVE   = 1;
const BP_STATUS__BACKUP   = 2;
const BP_STATUS__INACTIVE = 3;

const TYPE_BLOCK_PRODUCER = 1;
const TYPE_CALCULATOR = 2;

const ACTIVE_NUMBER = 21;

class BlockchainNodesDictionary {
  public static typeBlockProducer(): number {
    return TYPE_BLOCK_PRODUCER;
  }

  public static typeCalculator(): number {
    return TYPE_CALCULATOR;
  }

  public static activeNumber(): number {
    return ACTIVE_NUMBER;
  }

  public static statusActive(): number {
    return BP_STATUS__ACTIVE;
  }

  public static statusBackup(): number {
    return BP_STATUS__BACKUP;
  }

  public static statusInactive(): number {
    return BP_STATUS__INACTIVE;
  }

  public static getBackupOrInactive(node: any): number {
    if (typeof node.is_active === 'undefined') {
      throw new TypeError(`Node must have a field is_active: ${JSON.stringify(node)}`);
    }

    return node.is_active === 1 ? this.statusBackup() : this.statusInactive();
  }
}

export = BlockchainNodesDictionary;

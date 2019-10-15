import { BLOCKS_BEHIND, EXPIRATION_IN_SECONDS } from '../../dictionary/transaction-dictionary';

export class PrepareTransactionService {
  public static getTransactionParams(broadcast: boolean) {
    return {
      broadcast,
      blocksBehind:   BLOCKS_BEHIND,
      expireSeconds:  EXPIRATION_IN_SECONDS,
    };
  }
}

import { PrepareTransactionService } from '../services/prepare-transaction-service';

export class PrepareTransactionApi {
  public static getTransactionParams(broadcast: boolean) {
    return PrepareTransactionService.getTransactionParams(broadcast);
  }
}

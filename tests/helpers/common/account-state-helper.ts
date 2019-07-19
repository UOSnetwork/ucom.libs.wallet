import { IFreeUsedTotal } from '../../../src/lib/account/interfaces/account-state-interfaces';

import WalletApi = require('../../../src/lib/wallet/api/wallet-api');

class AccountStateHelper {
  public static async getCurrentResourceDelta(
    accountName: string,
    resourceName: string,
    resourceBefore: IFreeUsedTotal,
  ): Promise<IFreeUsedTotal> {
    const resourceAfter = await this.getCurrentResource(accountName, resourceName);

    return {
      free: resourceAfter.free    - resourceBefore.free,
      used: resourceAfter.used    - resourceBefore.used,
      total: resourceAfter.total  - resourceBefore.total,
    };
  }

  public static async getCurrentResource(
    accountName: string,
    resource: string,
  ): Promise<IFreeUsedTotal> {
    const state = await WalletApi.getAccountState(accountName);

    const result = state.resources[resource];

    if (!result) {
      throw new TypeError(`There is no resource ${resource} inside user state: ${JSON.stringify(state)}`);
    }

    return {
      free: result.free,
      used: result.used,
      total: result.total,
    };
  }
}

export = AccountStateHelper;

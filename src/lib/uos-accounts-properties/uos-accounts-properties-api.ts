import CalculatorRpcClient = require('../common/client/calculator-rpc-client');

class UosAccountsPropertiesApi {
  public static async getAccountsTableRows(
    lowerBound: number,
    limit: number,
  ): Promise<any> {
    const rpc = CalculatorRpcClient.getClient();

    const query = {
      limit,
      lower_bound: lowerBound,
    };

    return rpc.fetch(
      '/v1/uos_rates/get_accounts',
      query,
    );
  }

  public static async getAllAccountsTableRows(): Promise<any[]> {
    let lowerBound = 0;
    const limit = 500;

    let result: any = [];
    do {
      const response = await this.getAccountsTableRows(lowerBound, limit);
      if (response.accounts.length === 0) {
        break;
      }

      result = Array.prototype.concat(result, response.accounts);

      lowerBound += limit;

      if (lowerBound >= 100000) {
        throw new Error('Overflow trigger');
      }

      // eslint-disable-next-line no-constant-condition
    } while (true);

    return result;
  }
}

export = UosAccountsPropertiesApi;

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

    const response = await rpc.fetch('/v1/uos_rates/get_accounts', query);

    return (typeof response === 'string') ? JSON.parse(response) : response;
  }

  public static async getAllAccountsTableRows(indexBy: string | null = null, flatten = true): Promise<any> {
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

    if (indexBy === null) {
      return result;
    }

    const processedResult: any = {};

    for (const item of result) {
      let processed;

      if (flatten) {
        processed = {
          ...item.values,
          account_name: item.name,
        };
      } else {
        processed = item;
      }

      if (!item[indexBy]) {
        throw new Error(`There is no field ${indexBy} inside: ${JSON.stringify(item)}`);
      }

      processedResult[item[indexBy]] = processed;
    }

    return processedResult;
  }
}

export = UosAccountsPropertiesApi;

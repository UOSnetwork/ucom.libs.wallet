import CalculatorRpcClient = require('../common/client/calculator-rpc-client');

class UosAccountsPropertiesApi {
  public static async getImportanceTableRows(
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
}

export = UosAccountsPropertiesApi;

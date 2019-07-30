class TransactionsPushResponseChecker {
  static checkOneTransaction(trxResponse, expected) {
    expect(typeof trxResponse.transaction_id).toBe('string');
    expect(trxResponse.processed).toMatchObject(expected);
  }

  public static getDataFromPushResponse(response): any {
    const { act } = response.processed.action_traces[0];

    return act.data;
  }
}

export = TransactionsPushResponseChecker;

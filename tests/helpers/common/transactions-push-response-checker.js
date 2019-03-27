class TransactionsPushResponseChecker {
  static checkOneTransaction(trxResponse, expected) {
    expect(typeof trxResponse.transaction_id).toBe('string');
    expect(trxResponse.processed).toMatchObject(expected);
  }
}

module.exports = TransactionsPushResponseChecker;

class WalletApi {
  /**
   * @param {string} accountName
   * @return {{tokens: {active: number}}}
   */
  static async getAccountState(accountName) {
    return {
      tokens: {
        active:           1515.0004,
        staked:           1203.05,
        staked_delegated: 503,
        emission:         0.001
      },
      resources: {
        ram: {
          dimension: 'kB',
          free: 0.035,
          total: 5.25,
        },
        cpu: {
          dimension: 'sec',
          free: 0.0002,
          total: 0.0052,
        },
        net: {
          dimension: 'kB',
          free: 0.03,
          total: 6.07,
        },
      }
    }
  }

  /**
   *
   * @param {number} amountInBytes
   * @return {{dimension: string, price: number}}
   */
  static getRamPriceByBytes(amountInBytes) {
    return {
      amount:     amountInBytes,
      dimension:  'bytes',

      currency:   'UOS',
      price:      amountInBytes * 0.05,
    };
  }
}

module.exports = WalletApi;
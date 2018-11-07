const resources = [
  'cpu', 'net', 'ram',
];

require('jest-expect-message');

class Helper {

  /**
   *
   * @return {string}
   */
  static getTesterAccountName() {
    return 'autotester';
  }

  /**
   *
   * @return {string}
   */
  static getNonExistedAccountName() {
    return '1utoteste1';
  }

  /**
   *
   * @param {Object} data
   */
  static checkStateStructure(data) {
    const tokensFields = [
      'active', 'emission', 'staked', 'staked_delegated', 'unstaking_request',
    ];

    expect(data.tokens).toBeDefined();
    tokensFields.forEach(field => {
      expect(data.tokens[field]).toBeDefined();
    });
    expect(data.tokens.active).toBeGreaterThan(0);

    this._checkUnstakingRequest(data.tokens.unstaking_request, 'tokens');

    for(let i = 0; i < resources.length; i++) {
      const expected = resources[i];

      const resource = data.resources[expected];

      expect(resource, `There is no resource ${expected}`).toBeDefined();
      expect(resource.dimension, `There is no dimension field for ${expected}`).toBeDefined();

      expect(resource.used, `Wrong value for resource ${expected}`).toBeGreaterThan(0);
      expect(resource.free, `Wrong value for resource ${expected}`).toBeGreaterThan(0);
      expect(resource.total, `Wrong value for resource ${expected}`).toBeGreaterThan(0);

      if (expected !== 'ram') {
        this._checkUnstakingRequest(resource.unstaking_request, expected);

        expect(resource.tokens, `There is no correct tokens object for ${expected}`).toBeDefined();
        expect(resource.tokens.currency, `There is no correct tokens object for ${expected}`).toBeDefined();
        expect(resource.tokens.delegated, `There is unstaking_request object for ${expected}`).toBeDefined();
        expect(resource.tokens.self_delegated, `There is unstaking_request object for ${expected}`).toBeDefined();
      }
    }
  }

  /**
   *
   * @param {Object} data
   * @param {string} errorLabel
   * @private
   */
  static _checkUnstakingRequest(data, errorLabel) {
    expect(data, `There is no correct unstaking_request object for ${errorLabel}`).toBeDefined();

    const required = [
      'amount', 'currency', 'request_datetime',
    ];

    required.forEach(field => {
      expect(data[field], `There is no correct unstaking_request object for ${errorLabel}`).toBeDefined();
    });
  }
}

module.exports = Helper;
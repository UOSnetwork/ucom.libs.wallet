const SOCIAL_ACTION = 'socialaction';
const VOTE_FOR_CALCULATORS = 'votecalc';

class SmartContractsActionsDictionary {
  /**
   *
   * @returns {string}
   */
  static socialAction() {
    return SOCIAL_ACTION;
  }

  /**
   *
   * @returns {string}
   */
  static voteForCalculators() {
    return VOTE_FOR_CALCULATORS;
  }
}

module.exports = SmartContractsActionsDictionary;

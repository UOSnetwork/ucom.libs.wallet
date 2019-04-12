const UOS_ACTIVITY = 'uos.activity';
const TST_ACTIVITY = 'tst.activity';

const EOS_IO = 'eosio';

class SmartContractsDictionary {
  /**
   *
   * @returns {string}
   */
  static uosActivity() {
    return UOS_ACTIVITY;
  }

  /**
   *
   * @returns {string}
   */
  static eosIo() {
    return EOS_IO;
  }

  /**
   *
   * @returns {string}
   */
  static tstActivity() {
    return TST_ACTIVITY;
  }
}

module.exports = SmartContractsDictionary;

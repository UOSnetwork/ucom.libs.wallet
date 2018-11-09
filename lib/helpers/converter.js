const moment    = require('moment');
const UNSTAKE_WITHIN_DAYS = 3; // TODO - move to config

class Converter {
  /**
   *
   * @param {string} stringValue
   * @param {string} token
   * @return {number}
   */
  static getTokensAmountFromString(stringValue, token = 'UOS') {
    let value = stringValue.replace(` ${token}`, '');

    return +value;
  }

  /**
   *
   * @param {string} stringValue
   * @return {number}
   */
  static getRamAmountFromString(stringValue) {
    let value = stringValue.replace(` RAM`, '');

    return +value;
  }

  /**
   *
   * @param {string} requestDatetime
   * @return {string}
   */
  static getRequestDateTime(requestDatetime) {
    const date = moment(requestDatetime + 'Z');
    return date.utc().format();
  }

  /**
   *
   * @param {string} requestDatetime
   * @return {string}
   */
  static getUnstakedOnDatetime(requestDatetime) {
    const date = moment(requestDatetime + 'Z');
    const newDate = date.add(UNSTAKE_WITHIN_DAYS, 'days');

    return newDate.utc().format();
  }
}

module.exports = Converter;
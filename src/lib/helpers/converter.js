const moment    = require('moment');
const bytebuffer = require('bytebuffer');
const Long = bytebuffer.Long;

const bigNumber = require('bignumber.js');
const UNSTAKE_WITHIN_DAYS = 3; // #task - move to config

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

  /**
   *
   * @param {string} accountName
   * @returns {string}
   */
  static getAccountNameAsBoundString(accountName) {
    const encoded = new bigNumber(this.encodeName(accountName, false));

    return encoded.toString();
  }

  /**
   Copied from eosjs v16
   Encode a name (a base32 string) to a number.

   For performance reasons, the blockchain uses the numerical encoding of strings
   for very common types like account names.

   @see types.hpp string_to_name

   @arg {string} name - A string to encode, up to 12 characters long.
   @arg {string} [littleEndian = true] - Little or Bigendian encoding

   @return {string<uint64>} - compressed string (from name arg).  A string is
   always used because a number could exceed JavaScript's 52 bit limit.
  */
  static encodeName(name) {
    let littleEndian = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

    if (typeof name !== 'string') throw new TypeError('name parameter is a required string');

    if (name.length > 12) throw new TypeError('A name can be up to 12 characters long');

    let bitstr = '';
    for (let i = 0; i <= 12; i++) {
      // process all 64 bits (even if name is short)
      let c = i < name.length ? this.charidx(name[i]) : 0;
      let bitlen = i < 12 ? 5 : 4;
      let bits = Number(c).toString(2);
      if (bits.length > bitlen) {
        throw new TypeError('Invalid name ' + name);
      }
      bits = '0'.repeat(bitlen - bits.length) + bits;
      bitstr += bits;
    }

    // noinspection JSUnresolvedFunction
    let value = Long.fromString(bitstr, true, 2);

    // convert to LITTLE_ENDIAN
    let leHex = '';
    let bytes = littleEndian ? value.toBytesLE() : value.toBytesBE();
    let _iteratorNormalCompletion = true;
    let _didIteratorError = false;
    let _iteratorError = undefined;

    try {
      for (let _iterator = bytes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        let b = _step.value;

        let n = Number(b).toString(16);
        leHex += (n.length === 1 ? '0' : '') + n;
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        // noinspection JSUnresolvedVariable
        if (!_iteratorNormalCompletion && _iterator.return) {
          // noinspection JSUnresolvedVariable
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          // noinspection ThrowInsideFinallyBlockJS
          throw _iteratorError;
        }
      }
    }

    // noinspection JSUnresolvedFunction
    let ulName = Long.fromString(leHex, true, 16).toString();

    // console.log('encodeName', name, value.toString(), ulName.toString(), JSON.stringify(bitstr.split(/(.....)/).slice(1)))

    return ulName.toString();
  }

  static charidx(ch) {
    let charmap = '.12345abcdefghijklmnopqrstuvwxyz';

    let idx = charmap.indexOf(ch);
    if (idx === -1) throw new TypeError('Invalid character: \'' + ch + '\'');

    return idx;
  };
}

module.exports = Converter;
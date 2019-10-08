import BigNumber from 'bignumber.js';

const moment    = require('moment');
const bytebuffer = require('bytebuffer');

const { Long } = bytebuffer;

const BigNumberLib = require('bignumber.js');

const UNSTAKE_WITHIN_DAYS = 3; // #task - move to config

interface NameWithEncoded {
  name: string,
  encoded: BigNumber,
}

class ConverterHelper {
  public static getTokensAmountFromString(stringValue: string, token: string = 'UOS'): number {
    const value = stringValue.replace(` ${token}`, '');

    return +value;
  }

  public static getRamAmountFromString(stringValue: string): number {
    const value = stringValue.replace(' RAM', '');

    return +value;
  }

  public static getRequestDateTime(requestDatetime: string): string {
    const date = moment(`${requestDatetime}Z`);
    return date.utc().format();
  }

  public static getUnstakedOnDatetime(requestDatetime: string): string {
    const date = moment(`${requestDatetime}Z`);
    const newDate = date.add(UNSTAKE_WITHIN_DAYS, 'days');

    return newDate.utc().format();
  }

  public static getAccountNameAsBoundString(accountName: string): string {
    const encoded = this.getAccountNameAsBigNumber(accountName);

    return encoded.toString();
  }

  public static getAccountNameAsBigNumber(accountName: string): BigNumber {
    return new BigNumberLib(this.encodeName(accountName, false));
  }

  public static sortAccountNamesByUInt64(accountNames: string[]): string[] {
    const usersWithEncoded: NameWithEncoded[] = [];

    for (const name of accountNames) {
      usersWithEncoded.push({
        name,
        encoded: this.getAccountNameAsBigNumber(name),
      });
    }

    usersWithEncoded.sort((a: NameWithEncoded, b: NameWithEncoded) => a.encoded.comparedTo(b.encoded));

    return usersWithEncoded.map((item: NameWithEncoded) => item.name);
  }

  /**
   Copied from eosJs v16
   Encode a name (a base32 string) to a number.

   For performance reasons, the blockchain uses the numerical encoding of strings
   for very common types like account names.

   @see types.hpp string_to_name

   @arg {string} name - A string to encode, up to 12 characters long.
   @arg {string} [littleEndian = true] - Little or Bigendian encoding

   @return string - compressed string (from name arg).  A string is
   always used because a number could exceed JavaScript's 52 bit limit.
  */
  // eslint-disable-next-line sonarjs/cognitive-complexity
  private static encodeName(name, littleEndian = false): string {
    // eslint-disable-next-line prefer-rest-params

    if (typeof name !== 'string') throw new TypeError('name parameter is a required string');

    if (name.length > 12) throw new TypeError('A name can be up to 12 characters long');

    let bitstr = '';
    for (let i = 0; i <= 12; i += 1) {
      // process all 64 bits (even if name is short)
      const c = i < name.length ? this.charIdx(name[i]) : 0;
      const bitlen = i < 12 ? 5 : 4;
      let bits = Number(c).toString(2);
      if (bits.length > bitlen) {
        throw new TypeError(`Invalid name: ${name}`);
      }
      bits = '0'.repeat(bitlen - bits.length) + bits;
      bitstr += bits;
    }

    // noinspection JSUnresolvedFunction
    const value = Long.fromString(bitstr, true, 2);

    // convert to LITTLE_ENDIAN
    let leHex = '';
    const bytes = littleEndian ? value.toBytesLE() : value.toBytesBE();
    let iteratorNormalCompletion = true;
    let didIteratorError = false;
    let iteratorError;
    let iterator;

    try {
      // eslint-disable-next-line no-cond-assign,no-underscore-dangle,no-shadow
      for (let _iterator = bytes[Symbol.iterator](), _step; !(iteratorNormalCompletion = (_step = _iterator.next()).done); iteratorNormalCompletion = true) {
        const b = _step.value;

        const n = Number(b).toString(16);
        leHex += (n.length === 1 ? '0' : '') + n;
      }
    } catch (error) {
      didIteratorError = true;
      iteratorError = error;
    } finally {
      try {
        // noinspection JSUnusedAssignment
        if (!iteratorNormalCompletion && iterator.return) {
          // noinspection JSUnusedAssignment
          iterator.return();
        }
      } finally {
        if (didIteratorError) {
          // eslint-disable-next-line no-unsafe-finally
          throw iteratorError;
        }
      }
    }

    // noinspection JSUnresolvedFunction
    const ulName = Long.fromString(leHex, true, 16).toString();

    return ulName.toString();
  }

  private static charIdx(ch: string) {
    const charMap = '.12345abcdefghijklmnopqrstuvwxyz';

    const idx = charMap.indexOf(ch);
    // eslint-disable-next-line prefer-template
    if (idx === -1) throw new TypeError('Invalid character: \'' + ch + '\'');

    return idx;
  }
}

export = ConverterHelper;

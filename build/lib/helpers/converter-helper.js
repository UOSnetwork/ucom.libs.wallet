"use strict";
const moment = require('moment');
const bytebuffer = require('bytebuffer');
const { Long } = bytebuffer;
const BigNumberLib = require('bignumber.js');
const UNSTAKE_WITHIN_DAYS = 3; // #task - move to config
class ConverterHelper {
    static getTokensAmountFromString(stringValue, token = 'UOS') {
        const value = stringValue.replace(` ${token}`, '');
        return +value;
    }
    static getRamAmountFromString(stringValue) {
        const value = stringValue.replace(' RAM', '');
        return +value;
    }
    static getRequestDateTime(requestDatetime) {
        const date = moment(`${requestDatetime}Z`);
        return date.utc().format();
    }
    static getUnstakedOnDatetime(requestDatetime) {
        const date = moment(`${requestDatetime}Z`);
        const newDate = date.add(UNSTAKE_WITHIN_DAYS, 'days');
        return newDate.utc().format();
    }
    static getAccountNameAsBoundString(accountName) {
        const encoded = this.getAccountNameAsBigNumber(accountName);
        return encoded.toString();
    }
    static getAccountNameAsBigNumber(accountName) {
        return new BigNumberLib(this.encodeName(accountName, false));
    }
    static getUniqueAccountNamesSortedByUInt64(accountNames) {
        const sorted = this.sortAccountNamesByUInt64(accountNames);
        return [
            ...new Set(sorted),
        ];
    }
    static sortAccountNamesByUInt64(accountNames) {
        const usersWithEncoded = [];
        for (const name of accountNames) {
            usersWithEncoded.push({
                name,
                encoded: this.getAccountNameAsBigNumber(name),
            });
        }
        usersWithEncoded.sort((a, b) => a.encoded.comparedTo(b.encoded));
        return usersWithEncoded.map((item) => item.name);
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
    static encodeName(name, littleEndian = false) {
        // eslint-disable-next-line prefer-rest-params
        if (typeof name !== 'string')
            throw new TypeError('name parameter is a required string');
        if (name.length > 12)
            throw new TypeError('A name can be up to 12 characters long');
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
        }
        catch (error) {
            didIteratorError = true;
            iteratorError = error;
        }
        finally {
            try {
                // noinspection JSUnusedAssignment
                if (!iteratorNormalCompletion && iterator.return) {
                    // noinspection JSUnusedAssignment
                    iterator.return();
                }
            }
            finally {
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
    static charIdx(ch) {
        const charMap = '.12345abcdefghijklmnopqrstuvwxyz';
        const idx = charMap.indexOf(ch);
        // eslint-disable-next-line prefer-template
        if (idx === -1)
            throw new TypeError('Invalid character: \'' + ch + '\'');
        return idx;
    }
}
module.exports = ConverterHelper;

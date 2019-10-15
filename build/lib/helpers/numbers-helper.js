"use strict";
class NumbersHelper {
    static generateRandomInteger(min, max) {
        return this.generateRandomNumber(min, max, 0);
    }
    static generateRandomNumber(min, max, precision) {
        return +(Math.random() * (max - min) + min).toFixed(precision);
    }
    static processFieldToBeNumeric(value, fieldName, precision, disallowZero, disallowNegative) {
        const processed = +(+value).toFixed(precision);
        if (!Number.isFinite(processed)) {
            throw new TypeError(`Number is not finite. Field name is: ${fieldName}, basic value is: ${value}`);
        }
        if (disallowZero && processed === 0) {
            throw new TypeError(`It is not allowed for ${fieldName} to be zero. Initial value is: ${value}`);
        }
        if (disallowNegative && processed < 0) {
            throw new TypeError(`It is not allowed for ${fieldName} to be negative. Initial value is: ${value}`);
        }
        return processed;
    }
}
module.exports = NumbersHelper;

"use strict";
const { BadRequestError } = require('../errors/errors');
class InputValidator {
    /**
     *
     * @param {number}  value
     * @param {string}  exceptionField
     * @return {boolean}
     */
    static isPositiveInt(value, exceptionField = 'general') {
        if (Number.isInteger(value) && +value > 0) {
            return true;
        }
        throw new BadRequestError([{
                field: exceptionField,
                message: 'Input value must be an integer and greater than zero',
            }]);
    }
    /**
     *
     * @param {number}  value
     * @param {string}  exceptionField
     * @return {boolean}
     */
    static isNonNegativeInt(value, exceptionField = 'general') {
        if (Number.isInteger(value) && +value >= 0) {
            return true;
        }
        throw new BadRequestError([{
                field: exceptionField,
                message: 'Input value must be an integer and greater than or equal to zero',
            }]);
    }
}
module.exports = InputValidator;

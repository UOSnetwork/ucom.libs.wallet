class NumbersHelper {
  /**
   *
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  static generateRandomInteger(min, max) {
    return this.generateRandomNumber(min, max, 0);
  }

  /**
   *
   * @param {number} min
   * @param {number} max
   * @param {number }precision
   * @returns {number}
   */
  static generateRandomNumber(min, max, precision) {
    return +(Math.random() * (max - min) + min).toFixed(precision);
  }
}

export = NumbersHelper;

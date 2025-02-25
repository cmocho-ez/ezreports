export default class Bytes {
  /**
   * @param {{
   *  case: [string],
   *  decimalPlaces: [number]
   *  fixedDecimals: [boolean]
   *  thousandsSeparator: [string]
   *  unitSeparator: [string]
   *  }} [options] bytes options.
   *
   */
  constructor(options) {
    this.map = {
      b: 1,
      kb: 1 << 10,
      mb: 1 << 20,
      gb: 1 << 30,
      tb: Math.pow(1024, 4),
      pb: Math.pow(1024, 5),
    };
    this.formatThousandsRegExp = /\B(?=(\d{3})+(?!\d))/g;
    this.formatDecimalsRegExp = /(?:\.0*|(\.[^0]+)0+)$/;
    this.parseRegExp = /^((-|\+)?(\d+(?:\.\d+)?)) *(kb|mb|gb|tb|pb)$/i;

    this.options = options;

    this.format = this.format.bind(this);
    this.parse = this.parse.bind(this);
  }

  /**
   * Format the given value in bytes into a string.
   *
   * If the value is negative, it is kept as such. If it is a float,
   * it is rounded.
   *
   * @param {number} value
   * @param {object} [options]
   * @param {number} [options.decimalPlaces=2]
   * @param {number} [options.fixedDecimals=false]
   * @param {string} [options.thousandsSeparator=]
   * @param {string} [options.unit=]
   * @param {string} [options.unitSeparator=]
   *
   * @returns {string|null}
   * @public
   */
  format(value) {
    const { map, formatThousandsRegExp, formatDecimalsRegExp, options } = this;

    if (!Number.isFinite(value)) {
      return null;
    }

    let mag = Math.abs(value);
    let thousandsSeparator = options?.thousandsSeparator || "";
    let unitSeparator = options?.unitSeparator || "";
    let decimalPlaces = options?.decimalPlaces !== undefined ? options?.decimalPlaces : 2;
    let fixedDecimals = Boolean(options?.fixedDecimals);
    let unit = options?.unit || "";

    if (!unit || !map[unit.toLowerCase()]) {
      if (mag >= map.pb) {
        unit = "PB";
      } else if (mag >= map.tb) {
        unit = "TB";
      } else if (mag >= map.gb) {
        unit = "GB";
      } else if (mag >= map.mb) {
        unit = "MB";
      } else if (mag >= map.kb) {
        unit = "KB";
      } else {
        unit = "B";
      }
    }

    let val = value / map[unit.toLowerCase()];
    let str = val.toFixed(decimalPlaces);

    if (!fixedDecimals) {
      str = str.replace(formatDecimalsRegExp, "$1");
    }

    if (thousandsSeparator) {
      str = str
        .split(".")
        .map(function (s, i) {
          return i === 0 ? s.replace(formatThousandsRegExp, thousandsSeparator) : s;
        })
        .join(".");
    }

    return str + unitSeparator + unit;
  }

  /**
   * Parse the string value into an integer in bytes.
   * If no unit is given, it is assumed the value is in bytes.
   *
   * @param {number|string} value
   *
   * @returns {number|null}
   * @public
   */

  parse(value) {
    const { map, parseRegExp } = this;

    if (typeof value === "number" && !isNaN(value)) {
      return value;
    }

    if (typeof value !== "string") {
      return null;
    }

    // Test if the string passed is valid
    let results = parseRegExp.exec(value);
    let floatValue;
    let unit = "b";

    if (!results) {
      // Nothing could be extracted from the given string
      floatValue = parseInt(value, 10);
      unit = "b";
    } else {
      // Retrieve the value and the unit
      floatValue = parseFloat(results[1]);
      unit = results[4].toLowerCase();
    }

    if (isNaN(floatValue)) {
      return null;
    }

    return Math.floor(map[unit] * floatValue);
  }
}

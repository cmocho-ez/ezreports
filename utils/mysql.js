import { createConnection } from "mysql2/promise";

export default class MySQL {
  constructor(config) {
    if (!config) throw new Error("Missing parameter: config");
    this.config = config;
  }

  /**
   *
   * @param {String} query The SQL query to run
   * @param {Array|Object} values An array with the parameter values
   * @returns {Object} The result of the query
   */
  async Query(query, values = null) {
    const conn = await createConnection(this.config);
    const result = await conn.query(query, values);
    await conn.end();

    return {
      rows: result[0],
      fields: result[1],
      rowsAffected: result[0].affectedRows,
    };
  }

  async QueryTransaction(query, values = null) {
    const conn = await createConnection(this.config);
    await conn.beginTransaction();

    let result;

    try {
      result = await conn.query(query, values);
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      await conn.end();
    }

    return {
      rows: result[0],
      fields: result[1],
      rowsAffected: result[0].affectedRows,
    };
  }

  async Execute(procedure, input = [], output) {
    const conn = await createConnection(this.config);
    const result = await conn.query(`call ${procedure} (?)`, [input]);

    return {
      rows: result[0],
      fields: result[1],
      rowsAffected: result[0].affectedRows,
    };
  }
}

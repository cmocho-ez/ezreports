import * as sql from "mssql";

export default class MSSQL {
  /**
   * Creates an instance of the class with the given configuration.
   *
   * @constructor
   * @param {Object} config - The configuration object.
   * @example
   * {user: '...',password: '...',server: 'localhost',database: '...',port: 1433}
   * @example
   * 'Server=localhost,1433;Database=database;User Id=username;Password=password;Encrypt=true'
   * @example
   * 'Server=*.database.windows.net;Database=database;Authentication=Active Directory Integrated;Client secret=clientsecret;Client Id=clientid;Tenant Id=tenantid;Encrypt=true'
   */
  constructor(config) {
    if (!config) throw new Error("Missing parameter: config");
    this.config = config;
  }

  /**
   *
   * @param {String} query The SQL query to run
   * @param {Array<{name: string, type: sql.ISqlType, value: any}>} [values=[]] - An array of objects containing the name, type, and value of the parameters to be passed to the query.
   * @returns {Object} The result of the query
   */
  async Query(query, values = []) {
    const pool = await sql.connect(this.config);
    const request = pool.request();

    values.forEach((value) => {
      result.input(value.name, value.type, value.value);
    });

    const result = await request.query(query);
    await pool.close();

    return {
      rows: result.recordset,
      fields: result.output,
      rowsAffected: result.rowsAffected,
    };
  }

  /**
   * Executes a SQL query within a transaction.
   *
   * @param {string} query - The SQL query to be executed.
   * @param {Array<{name: string, type: sql.ISqlType, value: any}>} [values=[]] - An array of objects containing the name, type, and value of the parameters to be passed to the query.
   * @returns {Promise<{rows: Array, fields: Object}>} - A promise that resolves to an object containing the rows and fields of the result set.
   * @throws {Error} - Throws an error if the transaction fails.
   */
  async QueryTransaction(query, values = []) {
    const pool = await sql.connect(this.config);
    const transaction = new sql.Transaction(pool);
    const request = new sql.Request(transaction);

    let result = null;

    values.forEach((value) => {
      result.input(value.name, value.type, value.value);
    });

    try {
      await transaction.begin();
      result = await request.query(query);
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    } finally {
      await pool.close();
    }

    return {
      rows: result.recordset,
      fields: result.output,
      rowsAffected: result.rowsAffected,
    };
  }

  /**
   * Executes a stored procedure with the given input and output parameters.
   *
   * @param {string} procedure - The name of the stored procedure to execute.
   * @param {Array<{name: string, type: sql.ISqlType, value: any}>} [input=[]] - An array of input parameters, each with properties: name, type, and value.
   * @param {Array<{name: string, type: sql.ISqlType}>?} output - An array of output parameters, each with properties: name and type.
   * @returns {Promise<Object>} - A promise that resolves to an object containing the result of the execution:
   *   - rows: The recordset returned by the stored procedure.
   *   - fields: The output parameters returned by the stored procedure.
   *   - rowsAffected: The number of rows affected by the stored procedure.
   * @throws {Error} - Throws an error if the execution fails.
   */
  async Execute(procedure, input = [], output) {
    const pool = await sql.connect(this.config);
    const request = pool.request();

    input.forEach((value) => {
      result.input(value.name, value.type, value.value);
    });

    output?.forEach((value) => {
      result.output(value.name, value.type);
    });

    const result = await request.execute(procedure);
    await pool.close();

    return {
      rows: result.recordset,
      fields: result.output,
      rowsAffected: result.rowsAffected,
    };
  }
}

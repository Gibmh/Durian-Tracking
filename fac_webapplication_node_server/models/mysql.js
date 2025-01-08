require("dotenv").config();
const SQLUSER = process.env.SQLUSER;
const SQLPASSWORD = process.env.SQLPASSWORD;
const SQLSERVER = process.env.SQLSERVER;
const SQLDATABASE = process.env.SQLDATABASE;

const sql = require("mssql");
const sqlConfig = {
  user: SQLUSER,
  password: SQLPASSWORD,
  database: SQLDATABASE,
  server: SQLSERVER,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    trustServerCertificate: true, // change to true for local dev / self-signed certs
  },
};

const connection = async () => {
  try {
    // make sure that any items are correctly URL encoded in the connection string
    await sql.connect(sqlConfig).then(function (result, err) {
      if (err == undefined) {
        console.log("connected");
      } else {
        console.log("connection failed");
        console.log(err);
      }
    });
  } catch (err) {
    console.log("connection failed");
    console.log(err);
  }
};

const UPDATE = async (table_name, update_values, condition) => {
  return new Promise(async (resolve, reject) => {
    let condition_ = "";
    if (condition) {
      condition_ = condition;
    } else {
      condition_ = "";
    }

    const result = await sql.query(
      `update ${table_name} set ${update_values} ${condition_}`
    );

    resolve(result);
  });
};

const INSERT = async (table_name, insert_values) => {
  const columns = Object.keys(insert_values).join(", ");
  const values = Object.values(insert_values)
    .map((value) => `'${value}'`)
    .join(", ");
  console.log(`INSERT INTO ${table_name} (${columns}) VALUES (${values})`);
  const result = await sql.query(
    `INSERT INTO ${table_name} (${columns}) VALUES (${values})`
  );

  return result;
};

const DELETE = async (table_name, condition) => {
  let condition_ = "";
  if (condition) {
    condition_ = condition;
  }

  const result = await sql.query(`delete from ${table_name} ${condition_}`);

  return result;
};

const SELECT = async (select, table) => {
  return new Promise(async (resolve, reject) => {
    const result = await sql.query("select " + select + " from " + table + " ");

    resolve(result);
  });
};

const executeScarlarFunction = async (table) => {
  return new Promise(async (resolve, reject) => {
    const result = await sql.query("select " + table + " ");

    resolve(result);
  });
};

const executeJsonProcedure = async (pro_name, params) => {
  try {
    // console.log(`EXEC ${pro_name} N'${params.toString()}'`)
    const result = await sql.query(
      `EXEC ${pro_name} N'${JSON.stringify(params, null, 2)}'`
    );
    return result;
  } catch (error) {
    console.error("Error executing stored procedure:", error);
    throw error; // Ném lỗi để xử lý ở phía gọi hàm
  }
};

const executeProcedure = async (pro_name, params) => {
  try {
    // Tạo chuỗi tham số từ đối số 'params'
    let paramStr = "";
    if (params && params.length > 0) {
      paramStr = params
        .map((param) => (typeof param === "number" ? param : `N'${param}'`))
        .join(", ");
    }
    console.log(`EXEC ${pro_name} ${paramStr}`);
    // Gọi stored procedure và trả về kết quả
    const result = await sql.query(`EXEC ${pro_name} ${paramStr}`);
    return result;
  } catch (error) {
    console.error("Error executing stored procedure:", error);
    throw error; // Ném lỗi để xử lý ở phía gọi hàm
  }
};

module.exports = {
  connection,
  SELECT,
  UPDATE,
  INSERT,
  DELETE,
  executeProcedure,
  executeScarlarFunction,
  executeJsonProcedure,
};

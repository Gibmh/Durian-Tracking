require("dotenv").config();
const SQLUSER = process.env.SQLUSER;
const SQLPASSWORD = process.env.SQLPASSWORD;
const SQLSERVER = process.env.SQLSERVER;
const SQLDATABASE = process.env.SQLDATABASE;
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const sql = require("mssql");
const mqtt = require("mqtt");
const db = require("./models/mysql");
const auth = require("./routes/auth/auth");
const data = require("./routes/data/data");

const config = {
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

const bootstrap = async () => {
  try {
    // Kết nối với SQL Server
    await db.connection();
    const host = ["http://192.168.0.9:3000"];
    const pool = await sql.connect(config);
    console.log("Connected to SQL Server successfully");

    // Cấu hình CORS và body parser
    app.use(
      cors({
        origin: (origin, callback) => {
          if (host.includes(origin) || !origin) {
            callback(null, true);
          } else {
            callback(new Error("Not allowed by CORS"));
          }
        },
        credentials: true,
        optionsSuccessStatus: 200,
      })
    );
    app.use(bodyParser.json());
    app.use("/auth", auth);
    app.use("/data", data);

    // Start server
    const port = process.env.PORT || 3001;
    app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`);
    });

    // MQTT Client Configuration
    const brokerUrl = "mqtt://broker.emqx.io";
    const brokerPort = 1883;

    // Kết nối đến MQTT Broker
    const mqttClient = mqtt.connect(`${brokerUrl}:${brokerPort}`);

    // Export MQTT client để có thể sử dụng trong các file khác
    module.exports.mqttClient = mqttClient;

    mqttClient.on("connect", () => {
      console.log("Connected to MQTT Broker at", brokerUrl);
      mqttClient.subscribe("FlyBug__sensorData", (err) => {
        if (err) {
          console.log("Error subscribing to topic:", err);
        } else {
          console.log("Subscribed to topic FlyBug__sensorData");
        }
      });
    });

    mqttClient.on("message", async (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log("Received data:", data);

        // Kiểm tra nếu dữ liệu hợp lệ
        if (data.idesp && data.humid !== undefined && data.temp !== undefined) {
          // Lấy id_sensor từ id_esp
          const request = pool.request();
          request.input("idesp", sql.Char, data.idesp); // Truyền tham số

          const result = await request.query(
            "SELECT id_sensor FROM SensorManagement WHERE id_esp = @idesp"
          );

          if (result.recordset && result.recordset.length > 0) {
            const id_sensor = result.recordset[0].id_sensor;
            console.log("id_sensor:", id_sensor, "for id_esp:", data.idesp);

            // Insert dữ liệu vào bảng SensorValues
            const insertRequest = pool.request();
            insertRequest.input("id_sensor", sql.Char, id_sensor);
            insertRequest.input("value_humid", sql.Float, data.humid);
            insertRequest.input("value_temp", sql.Float, data.temp);

            const insertResult = await insertRequest.query(
              "INSERT INTO SensorValues (id_sensor, value_humid, value_temp) VALUES (@id_sensor, @value_humid, @value_temp)"
            );

            // console.log("Data inserted into SensorValues:", insertResult);
          } else {
            console.log("No matching id_sensor found for id_esp:", data.idesp);
          }
        } else {
          console.log("Invalid data received:", data);
        }
      } catch (err) {
        console.error("Failed to process MQTT message:", err);
      }
    });
  } catch (err) {
    console.error("Error during bootstrap:", err);
  }
};

// Khởi tạo ứng dụng
bootstrap();

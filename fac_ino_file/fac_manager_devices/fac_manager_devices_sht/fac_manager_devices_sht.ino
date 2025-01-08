#include <EEPROM.h>
#include <ArduinoJson.h>
#include "wifiConnection.h"
#include "mqttConnection.h"
#include "PumpController.h"

#include <NTPClient.h>
const char* ntpServer = "pool.ntp.org";
const int ntpPort = 123;
int s1=D8; // trong
int s2=D7; // ngoài

WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, ntpServer, ntpPort);

const long timeZoneOffset = 7 * 3600;  // Đổi thành số giây

String ssid = "DAT_MOBILE";
String password = "ktd01042013";

const char* mqtt_server = "broker.emqx.io";
const uint16_t mqtt_port = 1883;

String send_to_client = "ServerToClient";
String client_to_server = "ClientToServer";
String last_will_message = "LastWillMessage";
const char* mqtt_client_id = "helloem";

uint32_t chipId = ESP.getChipId();
String id_esp = String(chipId, HEX);

String x_send_to_client = id_esp + send_to_client;
String x_client_to_server = id_esp + client_to_server;
String x_last_will_message = id_esp + last_will_message;

const char* char_x_send_to_client = x_send_to_client.c_str();
const char* char_x_client_to_server = x_client_to_server.c_str();
const char* char_x_last_will_message = x_last_will_message.c_str();

const int NUM_PUMPS = 4;
const int pumpPins[NUM_PUMPS] = { 14, 12, 13, 15 };  // D5, D6, D7, D8
WiFiConnection wifiConn;
MQTTConnection mqttConn(mqtt_server, mqtt_client_id, char_x_send_to_client, char_x_client_to_server, char_x_last_will_message);
PumpController pumpControllers;
struct Pump {
  int index;
  String action;
  String message;
  bool isOn;
  String lastPayloadSent;
};

Pump pumps[NUM_PUMPS] = {
  { 1, "manual", "off", false },
  { 2, "auto", "80", false },
  { 3, "manual", "off", false },
  { 4, "manual", "off", false }
};

const unsigned long sendInterval = 1000;

void savePayloadSumToEEPROM(const String& payload_sum) {
  for (int i = 0; i < payload_sum.length(); ++i) {
    EEPROM.write(i, payload_sum[i]);
  }
  EEPROM.write(payload_sum.length(), '\0');
  EEPROM.commit();
}

bool isJsonPayloadValid(const String& payload) {
  // Tạo một bộ đệm đủ lớn để chứa dữ liệu JSON
  StaticJsonDocument<512> doc;

  // Phân tích chuỗi JSON và kiểm tra tính hợp lệ
  DeserializationError error = deserializeJson(doc, payload);

  // Kiểm tra lỗi phân tích JSON
  if (error) {
    Serial.print("deserializeJson() failed: ");
    Serial.println(error.c_str());
    return false;
  }

  // Kiểm tra xem payload có phải là một mảng không
  if (!doc.is<JsonArray>()) {
    Serial.println("JSON is not an array");
    return false;
  }

  // Lấy mảng JSON từ doc
  JsonArray arr = doc.as<JsonArray>();

  // Kiểm tra xem mảng có đủ 4 phần tử không
  if (arr.size() != NUM_PUMPS) {
    Serial.print("JSON array size is not ");
    Serial.println(NUM_PUMPS);
    return false;
  }

  return true;
}

String loadPayloadSumFromEEPROM() {
  char buffer[512];
  size_t i;
  for (i = 0; i < sizeof(buffer) - 1; ++i) {
    buffer[i] = EEPROM.read(i);
    if (buffer[i] == '\0') break;
  }
  buffer[i] = '\0';
  return String(buffer);
}

bool previousPumpState[4] = { false, false, false, false };

void checkAndSendPumpState() {
  for (int i = 0; i < 4; i++) {
    if (pumpControllers.pumpState[i] != previousPumpState[i]) {
      previousPumpState[i] = pumpControllers.pumpState[i];

      if (pumpControllers.pumpState[i]) {
        StaticJsonDocument<200> doc;
        doc["id_esp"] = id_esp;
        doc["index"] = i + 1;
        char buffer[256];
        serializeJson(doc, buffer);
        mqttConn.publish("pumpState", buffer);
      }
    }
  }
}

unsigned long getCurrentSecondsFromMidnight() {
  unsigned long totalSeconds;
  time_t currentEpochTime = timeClient.getEpochTime();  // Assume timeClient is accessible and defined elsewhere
  struct tm* currentTimeStruct = localtime(&currentEpochTime);
  int hour = currentTimeStruct->tm_hour;
  int minute = currentTimeStruct->tm_min;
  int second = currentTimeStruct->tm_sec;

  totalSeconds = hour * 3600 + minute * 60 + second;

  return totalSeconds;
}

void checkAndProcessPumpStateChanges(String payload_sum, unsigned long currentSeconds) {
  bool anyPumpStateChanged = false;

  // Kiểm tra nếu có bất kỳ trạng thái bơm nào thay đổi
  for (int i = 0; i < 4; i++) {
    if (pumpControllers.isPumpStateChange[i]) {
      mqttConn.publish(char_x_send_to_client, payload_sum.c_str());
      savePayloadSumToEEPROM(payload_sum);
      pumpControllers.prevPumpState[i] = pumpControllers.pumpState[i];
      pumpControllers.isPumpStateChange[i] = false;
    }
  }
}


// Thay đổi độ ẩm chênh lệch cho phép
const float HUMIDITY_THRESHOLD = 0.5;

// Thay đổi thời gian gửi dữ liệu (5 phút)
const unsigned long SEND_INTERVAL = 5 * 60 * 1000;  // 5 phút tính bằng milliseconds

// Biến lưu trữ thời gian gửi dữ liệu trước đó
unsigned long lastSendTime = 0;

// Biến lưu trữ độ ẩm trước đó
float previousHumidity = -1;

float getvalue()
{
  float hsc=1.0;
  int value=analogRead(A0);
  float tdsvalue = value*(3.3/1024.0);
  return ((133.42*tdsvalue*tdsvalue*tdsvalue-255.86*tdsvalue*tdsvalue+857.39*tdsvalue)*hsc);
}

// Hàm gửi dữ liệu cảm biến qua MQTT
void sendSensorData(const String& idesp) {
  // Đọc dữ liệu từ cảm biến
//pumpControllers.sht31.readHumidity();
 // float temperature = pumpControllers.sht31.readTemperature();
  digitalWrite(s1,HIGH);
  delay(100);
  float temperature = getvalue();
  delay(100);
  digitalWrite(s1,LOW);
  delay(100);
  digitalWrite(s2,HIGH);
  delay(100);
  float humidity = getvalue();
  delay(100);
  digitalWrite(s2,LOW);


  
  // In ra giá trị cảm biến
  Serial.print("Humidity: ");
  Serial.println(humidity);
  Serial.print("Temperature: ");
  Serial.println(temperature);
  Serial.print("id_esp: ");
  Serial.println(idesp);

  // Tạo đối tượng JSON
  StaticJsonDocument<200> jsonDoc;
  jsonDoc["idesp"] = idesp;
  jsonDoc["humid"] = humidity;
  jsonDoc["temp"] = temperature;

  // Chuyển đổi đối tượng JSON thành chuỗi
  String jsonString;
  serializeJson(jsonDoc, jsonString);

  // Gửi chuỗi JSON qua MQTT
  mqttConn.publish("FlyBug__sensorData", jsonString.c_str());

  // Cập nhật độ ẩm trước đó
  previousHumidity = humidity;
  // Cập nhật thời gian gửi dữ liệu
  lastSendTime = millis();
}


void setup() {
  Serial.begin(9600);
  EEPROM.begin(512);
  previousHumidity = pumpControllers.sht31.readHumidity();
  lastSendTime = millis();
  String initialPayload = loadPayloadSumFromEEPROM();
  bool validPayload = isJsonPayloadValid(initialPayload);
  WiFiConnection::WifiCredentials wifiCreds = wifiConn.activateAPMode();
  ssid = wifiCreds.ssid;
  password = wifiCreds.password;
  pinMode(s1,OUTPUT);
  pinMode(s2,OUTPUT);
  digitalWrite(s1,LOW);
  digitalWrite(s2,LOW);
  wifiConn.connectToWiFi(ssid, password);
  while (!wifiConn.isConnected()) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi connected");
  mqttConn.setupMQTT();
  while (!mqttConn.connected()) {
    mqttConn.reconnectMQTT();
    delay(500);
    Serial.print(".");
  }
  Serial.println("MQTT connected");
  for (int i = 0; i < NUM_PUMPS; ++i) {
    pinMode(pumpPins[i], OUTPUT);
    digitalWrite(pumpPins[i], LOW);
  }
  if (validPayload) {
    mqttConn.publish(char_x_send_to_client, initialPayload.c_str());
  } else {
    StaticJsonDocument<512> doc;
    JsonArray arr = doc.to<JsonArray>();
    for (int i = 0; i < NUM_PUMPS; ++i) {
      JsonObject pump = arr.createNestedObject();
      pump["index"] = pumps[i].index;
      pump["payload"]["action"] = pumps[i].action;
      pump["payload"]["messages"] = pumps[i].message;
      pump["payload"]["status"] = pumps[i].isOn;
    }
    serializeJson(doc, initialPayload);
    savePayloadSumToEEPROM(initialPayload);
    mqttConn.publish(char_x_send_to_client, initialPayload.c_str());
  }
  timeClient.begin();
  timeClient.setTimeOffset(timeZoneOffset);
}

void loop() {
  timeClient.update();
  if (!wifiConn.isConnected()) {
    wifiConn.connectToWiFi(ssid, password);
  }
  if (!mqttConn.connected()) {
    mqttConn.reconnectMQTT();
  }

  String payload_sum = loadPayloadSumFromEEPROM();
  unsigned long currentSeconds = getCurrentSecondsFromMidnight();


  if (mqttConn.isMessagesArrive) {
    String updatedPayload = pumpControllers.handleNewMessages(mqttConn.currentAction, mqttConn.currentMessage, mqttConn.currentIndex, payload_sum.c_str());

    pumpControllers.processPumpAction(updatedPayload.c_str(), pumpPins, NUM_PUMPS, currentSeconds);
    updatedPayload = pumpControllers.handleNewMessages(mqttConn.currentAction, mqttConn.currentMessage, mqttConn.currentIndex, payload_sum.c_str());

    if (payload_sum != updatedPayload) {
      mqttConn.publish(char_x_send_to_client, updatedPayload.c_str());
      payload_sum = updatedPayload;
      savePayloadSumToEEPROM(payload_sum);
    }

    mqttConn.isMessagesArrive = false;
  }

  checkAndProcessPumpStateChanges(payload_sum, currentSeconds);
  pumpControllers.processPumpAction(payload_sum.c_str(), pumpPins, NUM_PUMPS, currentSeconds);
  // checkAndSendPumpState();
  unsigned long currentMillis = millis();


  // if (currentMillis - lastSendTime >= sendInterval) {
  //   lastSendTime = currentMillis;


  //  mqttConn.publish(char_x_send_to_client, payload_sum.c_str());
  // }
  // Cập nhật payload_sum từ handleNewMessages
  StaticJsonDocument<1024> doc;
  DeserializationError error = deserializeJson(doc, payload_sum);
  for (JsonObject pump : doc.as<JsonArray>()) {
    int index = pump["index"];
    String action = pump["payload"]["action"].as<String>();
    String message = pump["payload"]["messages"].as<String>();
    bool status = pump["payload"]["status"];

    status = pumpControllers.pumpState[index - 1];

    pump["payload"]["status"] = status;
  }

  unsigned long currentTime = millis();
  float currentHumidity = pumpControllers.sht31.readHumidity();

 // Kiểm tra điều kiện gửi dữ liệu
  if (abs(currentHumidity - previousHumidity) >= HUMIDITY_THRESHOLD || 
      (currentTime - lastSendTime >= SEND_INTERVAL)) {
    // Gửi dữ liệu
    sendSensorData(id_esp);
  }



  mqttConn.loop();
}

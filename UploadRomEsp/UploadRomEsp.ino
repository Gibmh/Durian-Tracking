#include <Arduino.h>
#include <EEPROM.h>
#include <ArduinoJson.h>

// Địa chỉ bắt đầu lưu trữ trong EEPROM
#define EEPROM_ADDR 0
String dataToWrite = "{'id_esp':'ESP0004','ssid':'','pass':'','version':'1.0.0'}";
  const char* id_esp ;
  const char* ssid ;
  const char* pass ;
  const char* version ;
void setup() {
  Serial.begin(115200);

  // Khởi tạo EEPROM
  EEPROM.begin(512);

  // // Chuỗi cần ghi vào EEPROM
  

  // // Ghi từng ký tự của chuỗi vào EEPROM
  for (unsigned int i = 0; i < dataToWrite.length(); ++i) {
    EEPROM.write(EEPROM_ADDR + i, dataToWrite[i]);
  }

  // Lưu trữ thay đổi vào EEPROM
  EEPROM.commit();

  // Đọc dữ liệu từ EEPROM và in ra Serial Monitor
  String readData;
  for (unsigned int i = 0; i < dataToWrite.length(); ++i) {
    readData += char(EEPROM.read(EEPROM_ADDR + i));
  }
  EEPROM.end();

  //convert string -> Json
  readData.replace("'", "\"");
  DynamicJsonDocument doc(400);

  // Phân tích chuỗi JSON
  DeserializationError error = deserializeJson(doc, dataToWrite);

  if (error) {
    Serial.print(F("deserializeJson() failed: "));
    Serial.println(error.f_str());
    return;
  }
  id_esp = doc["id_esp"];
  ssid = doc["ssid"];
  pass = doc["pass"];
  version = doc["version"];

  
}

void loop() {
  // Code trong loop không cần thiết trong ví dụ này
  Serial.print("id_esp: ");
  Serial.println(id_esp);
  Serial.print("ssid: ");
  Serial.println(ssid);
  Serial.print("pass: ");
  Serial.println(pass);
  Serial.print("version: ");
  Serial.println(version);

  delay(1000);
}

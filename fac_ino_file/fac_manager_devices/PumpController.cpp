#include "PumpController.h"
#include <ArduinoJson.h>
PumpController::PumpController() {
  if (!sht31.begin(0x44)) {
    Serial.println("Couldn't find SHT31 sensor 1!");
  } else {
    Serial.println("SHT31 sensor 1 initialized successfully!");
  }
}
char* PumpController::handleNewMessages(String currentAction, String currentMessage, int currentIndex, const char* payload_sum) {
  StaticJsonDocument<2048> doc;  // Dung lượng tối đa cho bộ nhớ tạm thời
  DeserializationError error = deserializeJson(doc, payload_sum);

  if (error) {
    Serial.print(F("deserializeJson() failed: "));
    Serial.println(error.c_str());
    return nullptr;
  }

  // Lặp qua từng phần tử trong payload_sum
  bool updated = false;
  for (JsonObject pump : doc.as<JsonArray>()) {
    int index = pump["index"];
    if (index == currentIndex) {
      // Cập nhật action
      pump["payload"]["action"] = currentAction;
      pump["payload"]["messages"] = currentMessage;
      pump["payload"]["status"] = pumpState[index - 1];
      Serial.println(currentMessage);
      updated = true;
      break;
    }
  }

  if (!updated) {
    Serial.println(F("No matching index found in payload_sum."));
    return nullptr;
  }

  // Chuyển đổi doc trở lại thành chuỗi JSON
  static char updated_payload_sum[2048];  // Dung lượng tối đa cho bộ nhớ tạm thời
  serializeJson(doc, updated_payload_sum, sizeof(updated_payload_sum));


  return updated_payload_sum;
}

void PumpController::processPumpAction(const char* payload_sum, const int pumpPins[], int numPumps, unsigned long currentSeconds) {
  StaticJsonDocument<512> doc;
  DeserializationError error = deserializeJson(doc, payload_sum);

  if (error) {
    Serial.print(F("deserializeJson() failed: "));
    Serial.println(error.f_str());
    return;
  }

  for (JsonObject pump : doc.as<JsonArray>()) {
    int index = pump["index"];
    String action = pump["payload"]["action"].as<String>();
    String message = pump["payload"]["messages"].as<String>();
    if (index > 0 && index <= numPumps) {
      int pumpPin = pumpPins[index - 1];

   if (action == "manual") {
  if (message == "on") {
    // Turn on both relays for the selected pump
    digitalWrite(pumpPins[index * 2 - 2], HIGH);  // First relay (e.g., D5 for pump 1)
    digitalWrite(pumpPins[index * 2 - 1], HIGH);  // Second relay (e.g., D6 for pump 1)

    pumpState[index - 1] = true;
  } else if (message == "off") {
    // Turn off both relays for the selected pump
    digitalWrite(pumpPins[index * 2 - 2], LOW);  // First relay (e.g., D5 for pump 1)
    digitalWrite(pumpPins[index * 2 - 1], LOW);  // Second relay (e.g., D6 for pump 1)

    pumpState[index - 1] = false;
  }
} else if (action == "auto") {      /////////////////////////
        char msg[message.length() + 1];
        message.toCharArray(msg, sizeof(msg));
        char* token = strtok(msg, " ");
        int threshold = atoi(token);
        char* status = strtok(NULL, " ");
        String statusStr = String(status);

       int realvalue = 0;
  for (int i = 1; i <= 10; ++i) realvalue += analogRead(A0);
  int value = realvalue / 10;

  float humidity = 100 - map(value, 350, 1023, 0, 100);

        if (currentSeconds - lastWateringTime[index - 1] >= 2) {
          if (pumpState[index - 1]) {
            digitalWrite(pumpPins[index * 2 - 2], LOW);  // First relay (e.g., D5 for pump 1)
            digitalWrite(pumpPins[index * 2 - 1], LOW); 
            pumpState[index - 1] = false;
            Serial.println(pumpPin);
            Serial.println("off");
            if (pumpState[index - 1] != prevPumpState[index - 1]) {
              isPumpStateChange[index - 1] = true;
            }
          } else {
            if (humidity < threshold && statusStr == "on") {
              digitalWrite(pumpPins[index * 2 - 2], HIGH); 
              delay(5000); // First relay (e.g., D5 for pump 1)
              digitalWrite(pumpPins[index * 2 - 2], LOW);
              digitalWrite(pumpPins[index * 2 - 1], HIGH); 
              delay(5000);
              digitalWrite(pumpPins[index * 2 - 1], LOW); 
              pumpState[index - 1] = true;
              Serial.println(pumpPin);
              Serial.println("on");
              if (pumpState[index - 1] != prevPumpState[index - 1]) {
                isPumpStateChange[index - 1] = true;
              }
            }
          }
          lastWateringTime[index - 1] = currentSeconds;
        }

      } else if (action == "schedule") {
        char msg[message.length() + 1];
        message.toCharArray(msg, sizeof(msg));
        char* token = strtok(msg, " ");
        int numTimes = atoi(token);

        if (numTimes == 0) {
          digitalWrite(pumpPin, LOW);
          pumpState[index - 1] = false;
        } else {
          String times[numTimes];
          int count = 0;
          int wateringTimeSeconds = atoi(strtok(NULL, " "));
          token = strtok(NULL, " ");
          while (token != NULL && count < numTimes) {
            times[count++] = String(token);
            token = strtok(NULL, " ");
          }
          int pumpPin2=pumpPins[index * 2 - 1];
          handleScheduleTimes(pumpPin, pumpPin2, index, times, numTimes, currentSeconds, wateringTimeSeconds);
        }
      } else {
        // Serial.print("Invalid action '");
        // Serial.print(action);
        // Serial.println("' for pump action");
      }
    } else {
      // Serial.print("Invalid index '");
      // Serial.print(index);
      // Serial.println("'");
    }
  }
}


void PumpController::handleScheduleTimes(int pumpPin, int pumpPin2, int index, String times[], int numTimes, unsigned long currentSeconds, int wateringTimeSeconds) {
  // Calculate current millis

  unsigned long currentMillis = currentSeconds * 1000;
  // Calculate millis watering time
  unsigned long wateringTimeMillis = wateringTimeSeconds * 1000;
  for (int i = 0; i < numTimes; ++i) {
    int hours, minutes;
    sscanf(times[i].c_str(), "%d:%d", &hours, &minutes);

    unsigned long scheduleSeconds = hours * 3600 + minutes * 60;
    unsigned long scheduleMillis = scheduleSeconds * 1000;


    unsigned long endWateringTime = scheduleMillis + wateringTimeMillis;
    unsigned long endWateringTimeSeconds = endWateringTime / 1000;

    if (currentMillis == scheduleMillis) {
        digitalWrite(pumpPin, HIGH); 
        delay(wateringTimeMillis); // First relay (e.g., D5 for pump 1)
        digitalWrite(pumpPin, LOW);
        digitalWrite(pumpPin2, HIGH); 
        delay(wateringTimeMillis);
        digitalWrite(pumpPin2, LOW); 
      lastWateringTime[index - 1] = currentMillis;
      pumpState[index - 1] = true;
    }
    if (currentMillis - lastWateringTime[index - 1] == wateringTimeMillis) {
        digitalWrite(pumpPin, LOW);  
    digitalWrite(pumpPin2, LOW);
      pumpState[index - 1] = false;
    }
    if (pumpState[index - 1] != prevPumpState[index - 1]) {
      isPumpStateChange[index - 1] = true;
    }
  }
}


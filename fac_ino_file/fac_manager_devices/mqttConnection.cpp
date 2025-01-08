#include "MQTTConnection.h"
#include <ArduinoJson.h> // Thêm include cho thư viện ArduinoJson

MQTTConnection::MQTTConnection(const char* server, const char* client_id, const char* topic_send, const char* topic_receive, const char* mqtt_topic_lwm)
  : mqtt_server(server), mqtt_client_id(client_id), mqtt_topic_send(topic_send), mqtt_topic_receive(topic_receive), mqtt_topic_lwm(mqtt_topic_lwm),
    mqttClient(espClient) {
  mqttClient.setServer(mqtt_server, 1883);
  mqttClient.setCallback([&](char* topic, byte* payload, unsigned int length) {
    this->mqttCallback(topic, payload, length);
  });
}

void MQTTConnection::setupMQTT() {
  mqttClient.setServer(mqtt_server, 1883);
  mqttClient.setCallback([this](char* topic, byte* payload, unsigned int length) {
    this->mqttCallback(topic, payload, length);
  });
}

void MQTTConnection::reconnectMQTT() {
  while (!mqttClient.connected()) {
    Serial.print("Attempting MQTT connection...");
    if (mqttClient.connect(mqtt_client_id, mqtt_topic_lwm, 0, true, "{\"status\": false}")) {
      Serial.println("connected");
      mqttClient.publish(mqtt_topic_lwm, "{\"status\": true}", true);
      mqttClient.subscribe(mqtt_topic_receive);
      mqttClient.subscribe(mqtt_topic_lwm);
      // mqttClient.subscribe(mqtt_topic_send);
      Serial.println("mqtt_topic_lwm");
      Serial.println(mqtt_topic_lwm); 

    } else {
      Serial.print("failed, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void MQTTConnection::loop() {
  mqttClient.loop();
}

void MQTTConnection::publish(const char* topic, const char* message) {
  if (mqttClient.connected()) {
    mqttClient.publish(topic, message, true);
  }
}

bool MQTTConnection::connected() {
  return mqttClient.connected();
}

void MQTTConnection::mqttCallback(char* topic, byte* payload, unsigned int length) {
  if (strcmp(topic, mqtt_topic_receive) == 0) {
    isMessagesArrive = true;
    Serial.print("Nhận dữ liệu trên topic receive: ");

    payload[length] = '\0';

    StaticJsonDocument<200> doc;
    DeserializationError error = deserializeJson(doc, payload);

    if (error) {
      Serial.print("Lỗi phân tích JSON: ");
      Serial.println(error.c_str());
      return;
    }

    currentIndex = atoi(doc["index"]);
    currentAction = String(doc["payload"]["action"].as<const char*>());
    currentMessage = String(doc["payload"]["messages"].as<const char*>());
  } else if (strcmp(topic, mqtt_topic_send) == 0) {
    Serial.print("Nhận dữ liệu trên web gửi xuống ");
  } else {
    Serial.print("Nhận dữ liệu trên topic khác: ");
  }
}
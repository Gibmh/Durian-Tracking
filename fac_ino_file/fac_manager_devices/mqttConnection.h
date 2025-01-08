#ifndef MQTT_CONNECTION_H
#define MQTT_CONNECTION_H

#include <Arduino.h>
#include <WiFiClient.h>
#include <PubSubClient.h>

class MQTTConnection {
public:
  MQTTConnection(const char* server, const char* client_id, const char* topic_send, const char* topic_recive, const char* mqtt_topic_lwm);
  void setupMQTT();
  void reconnectMQTT();
  void loop();
  bool connected();
  void publish(const char* topic, const char* payload);

  const char* mqtt_topic_send; // Đảm bảo rằng biến này có thể truy cập từ bên ngoài
  const char* mqtt_server;
  const char* mqtt_client_id;
  const char* mqtt_topic_receive;
  const char* mqtt_topic_lwm;
  WiFiClient espClient;
  PubSubClient mqttClient;
  bool isMessagesArrive = false;
  String currentAction;
  String currentMessage;
  int currentIndex;

  void mqttCallback(char* topic, byte* payload, unsigned int length);
};

#endif // MQTT_CONNECTION_H

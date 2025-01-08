#include "WiFiConnection.h"

WiFiConnection::WiFiConnection() {}

void WiFiConnection::connectToWiFi(const String& ssid, const String& password) {
  WiFi.begin(ssid.c_str(), password.c_str());
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

WiFiConnection::WifiCredentials WiFiConnection::activateAPMode() {
  Serial.println("Starting Access Point Mode");

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("Disconnecting from WiFi");
    WiFi.disconnect();
    delay(1000);
  }

  WifiCredentials creds;
  if (!wifiManager.autoConnect("ESP8266_AP")) {
    Serial.println("Failed to connect and hit timeout");
    ESP.restart();
    delay(1);
  } else {
    Serial.println("Connected to WiFi");
    Serial.print("SSID: ");
    Serial.println(WiFi.SSID());
    Serial.print("Password: ");
    Serial.println(WiFi.psk());
    creds.ssid = WiFi.SSID();
    creds.password = WiFi.psk();
  }
  return creds;
}

bool WiFiConnection::isConnected() {
  return WiFi.status() == WL_CONNECTED;
}

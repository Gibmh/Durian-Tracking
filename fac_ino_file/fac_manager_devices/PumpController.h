#ifndef PumpController_h
#define PumpController_h

#include <Arduino.h>
#include <Wire.h>
#include "Adafruit_SHT31.h"

class PumpController {
  public:
    Adafruit_SHT31 sht31 = Adafruit_SHT31();
    PumpController();
    char* handleNewMessages(String currentAction, String currentMessage, int currentIndex, const char* payload_sum);
    void processPumpAction(const char* payload_sum,const int pumpPins[], int numPumps, unsigned long currentSeconds);
    bool isPumpStateChange[4] =  {false, false, false, false};
    bool pumpState[4] = {false, false, false, false};
    bool prevPumpState[4] = {false, false, false, false};
    void handleScheduleTimes(int pumpPin, int pumpPin2, int index, String times[], int numTimes, unsigned long currentSeconds, int wateringTime);
    unsigned long lastWateringTime[4] = {0};

    
};

#endif

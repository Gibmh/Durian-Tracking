import React, { useState, forwardRef, useImperativeHandle } from 'react';
import './timepicker.scss';

const hours = [...Array(24).keys()].map(h => h.toString().padStart(2, '0'));
const minutes = [...Array(60).keys()].map(m => m.toString().padStart(2, '0'));

const HourMinutePicker = forwardRef(({ onTimeChange }, ref) => {
  const [selectedHour, setSelectedHour] = useState(null);
  const [selectedMinute, setSelectedMinute] = useState(null);

  useImperativeHandle(ref, () => ({
    handleClearClick
  }));

  const handleHourClick = (hour) => {
    setSelectedHour(hour);
    if (selectedMinute !== null) {
      onTimeChange(`${hour}:${selectedMinute}`);
    }
  };

  const handleMinuteClick = (minute) => {
    setSelectedMinute(minute);
    if (selectedHour !== null) {
      onTimeChange(`${selectedHour}:${minute}`);
    }
  };

  const handleClearClick = () => {
    setSelectedHour(null);
    setSelectedMinute(null);
  };

  return (
    <div className="picker-container">
      <div className="picker-container_Hours">
        {hours.map((hour) => (
          <div
            key={hour}
            className={`picker-item ${selectedHour === hour ? 'selected' : ''}`}
            onClick={() => handleHourClick(hour)}
          >
            {hour}
          </div>
        ))}
      </div>
      <div className="picker-container_Minutes">
        {minutes.map((minute) => (
          <div
            key={minute}
            className={`picker-item ${selectedMinute === minute ? 'selected' : ''}`}
            onClick={() => handleMinuteClick(minute)}
          >
            {minute}
          </div>
        ))}
      </div>
    </div>
  );
});

export default HourMinutePicker;

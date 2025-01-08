import React, { useEffect, useState, useRef } from "react";
import { BrowserView, MobileView } from "react-device-detect";
import Loading from "../Home/loading";
import { callAPi } from "../../services/UserService";
import dayjs from 'dayjs';

import './weather.scss'
const Weather = ({ weatherState, location }) => {
    const [loading, setLoading] = useState(true)
    const [city, setCity] = useState("")
    const [weatherData,setWeatherData] = useState([])
    useEffect(() => {
        if (Object.keys(location).length > 0) {
            getWeather()
        }
    }, [location])  

    const getWeather = async () => {
        if(location.lat == null || location.lng == null) return
        const url = `https://api.weatherapi.com/v1/forecast.json?key=c91e8733b7d64ff0be573627242606&q=${location.lat},${location.lng}&days=3`
        let res = await callAPi(
            "get",
            url,
        );
        setCity(res.location.name)
        let data = [] 
        res.forecast.forecastday.map((item, index) => {
            item.hour.map((item, index) => {
                if (index == 4 || index == 10 ||index == 16 || index == 22  ) {

                    // data = [...data, {time :item.time,temp_c:item.temp_c,precip_in:item.precip_in,cloud:item.cloud,is_day:item.is_day}];
                    
                    const date = dayjs((item.time).split(' ')[0]).format('DD-MM-YYYY')
                    const time = (item.time).split(' ')[1]
                    let url_icon = ""
                    if (item.is_day == 0) {
                        url_icon = "/icons/Night.png"
                    }
                    else if(item.precip_in >= 0.07){
                        url_icon = "/icons/rain.png"
                    }
                    else if(item.cloud > 60){
                        url_icon = "/icons/cloudy.png"
                    }
                    else{
                        url_icon = "/icons/sun.png"
                    }
                    data = [...data,{id:item.time,date:date,time:time,temp:item.temp_c,img:url_icon}]
                }


            })
            
        })
        setWeatherData(data)
        setLoading(false)
    }
    // const weatherData = [{
    //     id: 1,
    //     img: "/icons/cloudy.png",
    //     time: "9:00 AM",
    //     temperature: "32"
    // },
    // {
    //     id: 2,
    //     img: "/icons/snowing.png",
    //     time: "14:00 PM",
    //     temperature: "28"
    // },
    // {
    //     id: 3,
    //     img: "/icons/sun.png",
    //     time: "22:00 PM",
    //     temperature: "36"
    // },
    // {
    //     id: 4,
    //     img: "/icons/cloudy.png",
    //     time: "9:00 AM",
    //     temperature: "32"
    // },
    // {
    //     id: 5,
    //     img: "/icons/snowing.png",
    //     time: "14:00 PM",
    //     temperature: "28"
    // },
    // {
    //     id: 6,
    //     img: "/icons/sun.png",
    //     time: "22:00 PM",
    //     temperature: "36"
    // }
    // ]
    return (
      <>
        <BrowserView
          className="Fac_Weather"
          style={
            weatherState
              ? { width: "13rem", animation: "SlideMenuLeft 0.2s ease-in-out" }
              : { display: "none" }
          }
        >
          <div className="Fac_Weather_Web">
            {loading ? (
              <div className="Fac_Weather_Web_Container center">
                <Loading />
              </div>
            ) : (
              <div className="Fac_Weather_Web_Container">
                {city}

                {weatherData.map((item) => (
                  <div
                    className="Fac_Weather_Web_Container_Elements"
                    key={item.id}
                  >
                    <img
                      className="Fac_Weather_Web_Container_Elements_Icon"
                      src={item.img}
                      alt=""
                    ></img>
                    <div className="Date">{item.date}</div>
                    <div className="Date">{item.time}</div>
                    <div>{item.temp}°</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </BrowserView>

        <MobileView
          className="Fac_Weather"
          style={
            weatherState
              ? { width: "100%", animation: "SlideMenuLeft 0.2s ease-in-out" }
              : { display: "none" }
          }
        >
          <div className="Fac_Weather_Mobile">
            {loading ? (
              <div className="Fac_Weather_Mobile_Container center">
                <Loading />
              </div>
            ) : (
              <div className="Fac_Weather_Mobile_Container">
                <div className="Fac_Weather_Mobile_Container_Location">
                  {city}
                </div>
                <div className="Fac_Weather_Web_Container_Weather"
                style={{display: "flex", width: "100%", overflowX: "auto"}}>
                  {weatherData.map((item) => (
                    <div
                      className="Fac_Weather_Mobile_Container_Elements"
                      key={item.id}
                    >
                      <img
                        className="Fac_Weather_Mobile_Container_Elements_Icon"
                        src={item.img}
                        alt=""
                      ></img>
                      <div className="Date">{item.date}</div>
                      <div className="Date">{item.time}</div>
                      <div>{item.temp}°</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </MobileView>
      </>
    )
}

export default Weather
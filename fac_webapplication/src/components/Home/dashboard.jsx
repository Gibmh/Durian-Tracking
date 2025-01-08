import React, { useEffect, useState, useRef, useContext } from "react";
import "./home.scss";
import { BrowserView, MobileView } from "react-device-detect";
import { MdOutlineLibraryAdd } from "react-icons/md";
import { MdCircle } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { FiSettings } from "react-icons/fi";

import { callAPi } from "../../services/UserService";
import Loading from "./loading";
import { AuthContext } from "../Context/AuthContext";
import { FaRegAddressBook } from "react-icons/fa6";
import { Client, Message } from 'paho-mqtt';

export const Dashboard = ({ weatherState, handleAddDevice, setLocation }) => {
  const { URL, login, user, farmsct, authDispatch } = useContext(AuthContext);
  const navigate = useNavigate();
  const [farms, setFarms] = useState([]);
  const [totalfarms, setTotalFarms] = useState([]);
  const [loadingState, setLoadingState] = useState(true)
  const [client, setClient] = useState(null);
  const [connectStatus, setConnectStatus] = useState("Disconnected");

  useEffect(() => {
    if (login.status === true) { getDashboard() }
  }, [login.status])


  useEffect(() => {
    if (client !== null && connectStatus != "Connected" && connectStatus != "Connecting") {
      setConnectStatus("Connecting");
      client.connect({
        onSuccess: () => {

          subcribeFarmTopic();
          setConnectStatus("Connected");
        },
        onFailure: (message) => {
          console.log("Connect fail : " + message);
          setConnectStatus("Disconected");
        },

      });
      client.onMessageArrived = (message) => {
        const index = (message.destinationName).indexOf("LastWillMessage");
         const data = JSON.parse(message.payloadString);

        if (index !== -1)  {
          const id_farm = (message.destinationName).substring(0, index);
          var temp = [...farms]
          temp.map((farm) => {
            if (farm.id_esp_ === id_farm) {
              farm.state = data.status
            }
          })
        
          setFarms(temp)
          setTotalFarms(temp)
        }
      };
      client.onConnectionLost = (responseObject) => {
        console.log("connection lost : " + responseObject.errorCode);
        setConnectStatus("Disconected");
      }
    }
  }, [client, connectStatus])

  useEffect(() => {
    if (Object.keys(farms).length > 0) {
      connectMqtt();
    }
  }, [farms])


  const connectMqtt = () => {
    const options = {
      clientId: "id_" + parseInt(Math.random() * 100000), // Tạo clientId ngẫu nhiên
      host: 'broker.emqx.io',
      port: 8083,
      path: '/mqtt',
    };
    const newClient = new Client(options.host, options.port, options.clientId);
    setClient(newClient);
  }
  const disconnectMqtt = () => {
    if (connectStatus == "Connected" && client.isConnected()) {
      client.disconnect();
      setConnectStatus("Disconnected");
    }
  }
  const subcribeFarmTopic = () => {
    console.log(farms)
    farms.map((farm) => {
      const lastwillmessage_topic = farm.id_esp_ + "LastWillMessage";
      client.subscribe(lastwillmessage_topic);
    })
  }

  const getDashboard = async () => {
    let res = await callAPi(
      "get",
      `${URL}/data/getDashboard/${user.id_user_}`,
    );
    
    res.data = res.data.map((item) => {
  return { ...item, state: false };
});

    console.log(res.data)
    setLoadingState(false)
    setTotalFarms(res.data)
    setFarms(res.data)
  }

  const navigateToFarm = (id_esp) => {
    let farms_temp = [];
    totalfarms.map((item) => {
      const info = {
        id_esp: item.id_esp_,
        name: item.name_esp_,

      };
      farms_temp = [...farms_temp, info];
    });
    getWeather(id_esp);
    authDispatch({
      type: "SET_FARM",
      payload: farms_temp,
    });
    sessionStorage.setItem("last_click", 2);
    sessionStorage.setItem("last_farm", id_esp);
    navigate(`/farm/${id_esp}`);
  };

  const getWeather = async (id_esp) => {
    const location = farms.find((farm) => farm.id_esp_ == id_esp);
    setLocation({ lat: location.latitude_, lng: location.longtitude_ });
  };
  const navigateToSetting = (event, id) => {
    event.stopPropagation();
    const farmsetting = farms.find((farm) => farm.id_esp_ == id);
    authDispatch({
      type: "SET_CURRENT_FARM",
      payload: farmsetting,
    });
    handleAddDevice("farm");
    navigate(`/editfarm/${id}`);
  };

  const handleChange = (event) => {
    if (farms == undefined) return;
    const newValue = event.target.value;
    let farm_search = [];
    totalfarms.map((item) => {
      if (
        item.name_esp_.toLowerCase().includes(newValue.toLowerCase()) ||
        item.description_.toLowerCase().includes(newValue.toLowerCase())
      ) {
        farm_search = [...farm_search, item];
      }
    });
    setFarms(farm_search);
  };

  return (
    <div className="Fac_Home">
      <BrowserView
        className="Fac_Home_Web"
        style={weatherState ? { paddingLeft: "15px" } : { paddingLeft: "0px" }}
      >
        <div className="Fac_Home_Web_Dashboardcontainer">
          <div className="Fac_Home_Web_Dashboardcontainer_Header">
            Quản lí
            <div className="center">
              <input
                className="Fac_Home_Web_Dashboardcontainer_Header_Input"
                type="text"
                onChange={(e) => {
                  handleChange(e);
                }}
                placeholder="Tìm kiếm..."
              ></input>
              <button
                className="Fac_Home_Web_Dashboardcontainer_Header_Button"
                onClick={() => {
                  sessionStorage.setItem("last_click", 3);
                  sessionStorage.setItem("last_service", "farm");
                  handleAddDevice("farm");
                  navigate(`/addfarm/${user.id_user_}`);
                }}
              >
                <MdOutlineLibraryAdd
                  size={28}
                  style={{ marginRight: "10px" }}
                />{" "}
                Tạo vùng
              </button>
            </div>
          </div>
          {loadingState ? (
            <div
              className="Fac_Home_Web_Dashboardcontainer_Farms"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Loading />
            </div>
          ) : (
            {
              ...(farms.length == 0 ? (
                <div
                  className="Fac_Home_Web_Dashboardcontainer_Farms"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <h1>Bạn chưa thêm vùng nào của khu vườn</h1>
                </div>
              ) : (
                <div className="Fac_Home_Web_Dashboardcontainer_Farms">
                  {farms.map((item) => (
                    <div
                      className="Fac_Home_Web_Dashboardcontainer_Farms_Item"
                      key={item.id_esp_}
                      onClick={() => navigateToFarm(item.id_esp_)}
                    >
                      <div className="Fac_Home_Web_Dashboardcontainer_Farms_Item_Header">
                        {item.name_esp_}

                        <div className="center">
                          <div
                            className="Fac_Home_Web_Dashboardcontainer_Farms_Item_Header_Edit"
                            onClick={(e) => navigateToSetting(e, item.id_esp_)}
                          >
                            Cài đặt
                            <FiSettings className="Icon" size={20} />
                          </div>
                          {console.log(item.state)}
                          {item.state ? (
                            
                            <div className="Fac_Home_Web_Dashboardcontainer_Farms_Item_Header_State">
                              <MdCircle
                                size={20}
                                color="#8AFF02"
                                style={{ marginTop: "1px", marginRight: "5px" }}
                              />
                              Đã kêt nối
                            </div>
                          ) : (
                            <div
                              className="Fac_Home_Web_Dashboardcontainer_Farms_Item_Header_State"
                              style={{ width: "160px" }}
                            >
                              <MdCircle
                                size={20}
                                color="#FE0707"
                                style={{ marginTop: "1px", marginRight: "5px" }}
                              />
                              Chưa kết nối
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="Fac_Home_Web_Dashboardcontainer_Farms_Item_Description">
                        {item.description_}
                      </div>
                      <div className="Fac_Home_Web_Dashboardcontainer_Farms_Item_Amount">
                        <div>Cảm biến: {item.number_of_sensor_ != undefined ? item.number_of_sensor_ : 0}</div>
                        <div style={{ marginLeft: "10px" }}>
                          Thiết bị: {item.number_of_equipment_ != undefined ? item.number_of_equipment_ : 0}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )),
            }
          )}
        </div>
      </BrowserView>

      <MobileView
        className="Fac_Home_Mobile"
        style={weatherState ? { paddingLeft: "0" } : { paddingLeft: "0px" }}
      >
        <div className="Fac_Home_Mobile_Dashboardcontainer">
          <div className="Fac_Home_Mobile_Dashboardcontainer_Header">
            <div className="Fac_Home_Mobile_Dashboardcontainer_Header_Content">
              Nông trại
              <button
                className="Fac_Home_Mobile_Dashboardcontainer_Header_Button"
                onClick={() => {
                  handleAddDevice("farm");
                  navigate(`/addfarm/${user.id_user_}`);
                }}
              >
                <MdOutlineLibraryAdd
                  size={24}
                  style={{ marginRight: "10px" }}
                />{" "}
                Thêm bộ quản lí
              </button>
            </div>
            <input
              className="Fac_Home_Mobile_Dashboardcontainer_Header_Input"
              type="text"
              onChange={(e) => {
                handleChange(e);
              }}
              placeholder="Search..."
            ></input>
          </div>
          {loadingState ? (
            <div
              className="Fac_Home_Mobile_Dashboardcontainer_Farms"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Loading />
            </div>
          ) : (
            {
              ...(farms.length == 0 ? (
                <div
                  className="Fac_Home_Mobile_Dashboardcontainer_Farms"
                  style={{
                    
                  }}
                >
                  <h1>You haven't added farm yet</h1>
                </div>
              ) : (
                <div className="Fac_Home_Mobile_Dashboardcontainer_Farms">
                  {farms.map((item) => (
                    <div
                      className="Fac_Home_Mobile_Dashboardcontainer_Farms_Item"
                      key={item.id_esp_}
                      onClick={() => navigateToFarm(item.id_esp_)}
                    >
                      <div className="Fac_Home_Mobile_Dashboardcontainer_Farms_Item_Header">
                        <div style={{display:"flex", alignItems: "center", fontSize: "24px", fontWeight: 500, width: "90%",}}>
                          {item.state ? (
                            <MdCircle
                              size={20}
                              color="#8AFF02"
                              style={{ marginTop: "1px", marginRight: "5px" }}
                            />
                          ) : (
                            <MdCircle
                              size={20}
                              color="#FE0707"
                              style={{ marginTop: "1px", marginRight: "5px" }}
                            />
                          )}
                          <span>
                            {item.name_esp_}
                          </span>
                          
                        </div>

                        <div
                          className="Fac_Home_Mobile_Dashboardcontainer_Farms_Item_Header_Edit"
                          onClick={(e) => navigateToSetting(e, item.id_esp_)}
                        >
                          <FiSettings className="Icon" size={20} />
                        </div>
                      </div>
                      <div className="Fac_Home_Mobile_Dashboardcontainer_Farms_Item_Description">
                        {item.description_}
                      </div>
                      <div className="Fac_Home_Mobile_Dashboardcontainer_Farms_Item_Amount">
                        <div>sensors: {item.number_of_sensor_}</div>
                        <div style={{ marginLeft: "10px" }}>
                          equipments: {item.number_of_equipment_}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )),
            }
          )}
        </div>
      </MobileView>
    </div>
  );

}
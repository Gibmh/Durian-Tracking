import React, { useEffect, useState, useRef, useContext } from "react";
import './home.scss'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { BrowserView, MobileView } from "react-device-detect";
import { IoIosAddCircleOutline } from "react-icons/io";
import { useParams, useNavigate } from "react-router-dom";
import { MdArrowBackIosNew } from "react-icons/md";
import { MdCircle } from "react-icons/md";
import { callAPi } from "../../services/UserService";
import { AuthContext } from "../Context/AuthContext";
import dayjs from 'dayjs';
import { FiSettings, FiPlus, FiXCircle, FiEdit3 } from "react-icons/fi"
import { Client, Message } from 'paho-mqtt';
import Loading from "./loading";
import { TbDatabaseSearch } from "react-icons/tb";
import HourMinutePicker from "../Time/timepicker";
import { Popup } from "../Popup/popup";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { stringify } from "ajv";
const Farm = ({ weatherState, handleAddDevice }) => {
  const { URL, authDispatch } = useContext(AuthContext);
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const [id, setId] = useState("");
  const [listEquipmentState, setListEquipmentState] = useState(false);
  const [listEquipment, setListEquipment] = useState([]);
  const [equipment, setEquipment] = useState("Equipment 1");
  const [listModeState, setListModeState] = useState(false);
  const [mode, setMode] = useState("Manual");
  const [currentMode, setCurrentMode] = useState("Thủ công");
  const [timeTableState, setTimeTableState] = useState(false);
  const [timeState, setTimeState] = useState(true);
  const [timeList, setTimeList] = useState([]);
  const [offset, setOffset] = useState(5);
  const [offsetState, setOffsetState] = useState(false);
  const seconds = [...Array(59).keys()];
  const [farmConnected, setFarmConnected] = useState(false);

  const [modeState, setModeState] = useState(false);// state cho to toogle
  const [bumperState, setBumperState] = useState(false);
  const sliderRef = useRef(null);
  const [value, setValue] = useState(50); // value cho slider
  const [loadingState, setLoadingState] = useState(true)
  const [farm, setFarm] = useState([]);
  const [data, setData] = useState([]);
  const [currentDate, setcurrentDate] = useState("___-___-___");
  const [client, setClient] = useState(null);
  const [connectStatus, setConnectStatus] = useState("Disconnected");
  const [time, setTime] = useState('');
  const [notification, setNotification] = useState(false);

  const handleTimeChange = (newTime) => {
    setTime(newTime);
  };

  const handleClose = () => {
    setNotification(false);
  };

  const hourMinutePickerRef = useRef(null);

  const handleClearClickFromParent = () => {
    if (hourMinutePickerRef.current) {
      hourMinutePickerRef.current.handleClearClick();
    }
  };
 
  useEffect(() => {
    setId(paramId || '')
    
  }, [])

  useEffect(() => {
   
    if (client !== null && connectStatus != "Connected" && connectStatus != "Connecting") {
      
      setConnectStatus("Connecting");
      client.connect({
        onSuccess: () => {
          const lastwillmessage_topic = id + "LastWillMessage";
          const ServerToClient_topic = id + "ServerToClient";
          client.subscribe(lastwillmessage_topic);
          client.subscribe(ServerToClient_topic)
          setConnectStatus("Connected");
        },
        onFailure: (message) => {
          console.log("Connect fail : " + message);
          setConnectStatus("Disconected");
        },

      });
      client.onMessageArrived = (message) => {

        if (message.destinationName == id + "LastWillMessage") {


          if (JSON.parse(message.payloadString)["status"] == true) {
            setFarmConnected(true)
          }
          else setFarmConnected(false)

        }
        else if (message.destinationName == id + "ServerToClient") {
          getLastStatus(message.payloadString)
        }
      };
      client.onConnectionLost = (responseObject) => {
        console.log("connection lost : " + responseObject.errorCode);
        setConnectStatus("Disconected");
      }
    }
  }, [client])

  useEffect(() => {
    const fetchData = async () => {
    if (id !== '') {
      

      setConnectStatus("Disconnected");
    setClient(null);
      getFarm(id, 1)

    }
  }
    fetchData();

    const intervalId = setInterval(fetchData, 60000);

    // Cleanup interval khi component bị unmount
    return () => clearInterval(intervalId);
  }, [id])

  useEffect(() => {
    
    if (farm.length !== 0) {
      connectMqtt();
      if (farm[0]["Sensors"] != undefined) {
        currentDateFunc()
        setFarmData()
      }
      else {
        setcurrentDate("___-___-___")
        setData([])
      }
      setLoadingState(false)
    }
  }, [farm])


  const handleModeToggleChange = () => {
    if (farmConnected && connectStatus == "Connected" && client.isConnected()) {
      setModeState(!modeState)
      if (mode == "Manual") {
        const body = {
          modeState: !modeState
          
        }
        sendMessage(body)
      }
      else if (mode == "Automatic") {
        const body = {
          modeState: !modeState,
          value: value
        }
        sendMessage(body)
      }
      else if (mode == "Timer") {
        const body = {
          modeState: !modeState,
          offset: offset,
          timeList: timeList
        }
        sendMessage(body)
      }
    }
    else {
      toast.error("Farm is not connected");
    }
  }
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

  const sendMessage = (data) => {
    try {

      let body = {}
      let payload = {}
      if (mode == "Manual") {
        body["index"] = farm[0]["_index"].toString()
        payload["action"] = "manual"
        if (data.modeState == true) {
          payload["messages"] = "on"
        }
        else payload["messages"] = "off"
      }
      else if (mode == "Automatic") {
        body["index"] = farm[0]["_index"].toString()
        payload["action"] = "auto"
        if (data.modeState == true) {
          payload["messages"] = (data.value).toString() + " on"
        }
        else payload["messages"] = (data.value).toString() + " off"
      }
      else if (mode == "Timer") {
        body["index"] = farm[0]["_index"].toString()
        payload["action"] = "schedule"
        if (data.modeState == true) {
          const time = (data.timeList).length.toString() + " " + (data.offset).toString() + " " + (data.timeList).join(' ')
          payload["messages"] = time
        }
        else {
          const time = "0" + " " + (data.offset).toString()
          payload["messages"] = time
        }
      }
      body["payload"] = payload
      var message = new Message(JSON.stringify(body));
      const clientToServer_topic = id + "ClientToServer";
      message.destinationName = clientToServer_topic;
      client.send(message);
    }
    catch (e) {
      alert(e);
    }
  };

  const handleAddTime = async () => {
    if (time != "") {
      let flag = false;
      timeList.forEach(element => {
        if (element == time) {
          toast.error("time exist")
          flag = true;
          return
        }
      });
      if (flag) return
      let body = [
        `${farm[0]["id"]}`, // id equipment
        `${offset}`,
        `${time}:00`, // mode state
      ];
      let res = await callAPi("post", `${URL}/data/insertschedule`, body)
      if (!res.status) {
        toast.error("add equipment fail");
      }
      else {
        setTime("")
        handleClearClickFromParent()
        setTimeList(prevTimeList => {
          const updatedTimeList = [...prevTimeList, time];
          updatedTimeList.sort((a, b) => {
            const [hoursA, minutesA] = a.split(':').map(Number);
            const [hoursB, minutesB] = b.split(':').map(Number);
            return hoursA - hoursB || minutesA - minutesB;
          });
          const body = {
            modeState: modeState,
            offset: offset,
            timeList: updatedTimeList
          }
          sendMessage(body)
          return updatedTimeList;
        });
        toast.info("add time success");
      }
    }
  }

  const handlEditOffset = async (currentOffset) => {
    let body = [
      `${farm[0]["id"]}`, // id equipment
      `${currentOffset}`
    ];
    let res = await callAPi("post", `${URL}/data/editchedule`, body)
    if (!res.status) {
      toast.error("update offset fail");
    }
    else {
      setOffset(currentOffset)
      const body = {
        modeState: modeState,
        offset: currentOffset,
        timeList: timeList
      }
      sendMessage(body)
      toast.info("update offset success");
    }
  }

  const getFarm = async (id_esp, id_equipment) => {

    setLoadingState(true)
    let res = await callAPi(
      "get",
      `${URL}/data/getequipment/${id_esp}/${id_equipment}`,
    );

    if (res.status && timeTableState == false) {
      setFarm(res.data)

    }
    else setLoadingState(false)
  }

  const currentDateFunc = () => {

    if (farm[0]["Sensors"][0]["value"] != undefined) {

      const date = dayjs((farm[0]["Sensors"][0]["value"][0]["datetime"]).split('T')[0]).format('DD-MM-YYYY')
      setcurrentDate(date)
    }
    else {
      setcurrentDate("___-___-___")
    }


  }
  function timeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours * 60 + minutes;
  }
  const getSchedule = async () => {
    let res = await callAPi(
      "get",
      `${URL}/data/getschedule/${farm[0]["id"]}`,
    );

    if (res.status && res["data"].length > 0) {
      setOffset(res["data"][0]["times_offset"])
      const sortedArray = [...res.data]
        .sort((a, b) => {
          const timeA = timeToMinutes(a.time_string);
          const timeB = timeToMinutes(b.time_string);
          return timeA - timeB;
        })
        .map(item => item.time_string);
      setTimeList(sortedArray)
    }
  }

  const handleDeleteTime = async (time, index) => {
    let body = [
      `${farm[0]["id"]}`, // id equipment
      `${time}:00` // mode state
    ];
    let res = await callAPi("post", `${URL}/data/deleteschedule`, body)
    if (!res.status) {
      toast.error("delete time fail");
    }
    else {

      setTimeList(prevTimeList => {
        const newTimeList = [...prevTimeList]; // Tạo bản sao của mảng
        newTimeList.splice(index, 1); // Xóa phần tử
        const body = {
          modeState: modeState,
          offset: offset,
          timeList: newTimeList
        }
        sendMessage(body)
        return newTimeList; // Trả về mảng mới
      });
      toast.info("delete time success");
    }
  }

  const setFarmData = async () => {
    console.log(farm[0])
    if (farm[0]["Sensors"][0]["value"] != undefined) {
      let temp = []
      farm[0]["Sensors"][0]["value"].map((item, index) => {
        const date = (item.datetime).split('T')[0]
        const time = (item.datetime).split('T')[1]
        let value = {}
        value = {
          id: index + 1,
          date: dayjs(date).format('DD-MM-YYYY'),
          time: time.slice(0, 5)
        }
        for (let i = 0; i < farm[0]["Sensors"].length; i++) {
          if ((farm[0]["Sensors"][i]["category"] == "sht"||farm[0]["Sensors"][i]["category"] == "tds")  && farm[0]["Sensors"][i]["value"][index]["value_humid"] != undefined) {
           
            value = {
              ...value,
              sht_humid: farm[0]["Sensors"][i]["value"][index]["value_humid"],
              sht_temp: farm[0]["Sensors"][i]["value"][index]["value_temp"],
            }
          }
          else {
            const type = farm[0]["Sensors"][i]["category"];
            value = {
              ...value,
              [type]: farm[0]["Sensors"][i]["value"][index]["value_humid"]
            }

          }

        }

        temp = [
          value
          , ...temp]
    console.log(temp)
        setData(temp)
      })
    }
    else {
      setData([])
    }
  }
  

  const getLastStatus = async (message) => {
    let laststatus = JSON.parse(message).find((item) => item["index"] == farm[0]["_index"])["payload"]
    if (laststatus != undefined) {
      if (laststatus["action"] == "manual") {
        setMode("Manual")
        if (laststatus["messages"] == "on") {
          setModeState(true)
        }
        else setBumperState(false)
        if (laststatus["status"] == true) {
          setBumperState(true)
        }
        else setBumperState(false)
      }
      else if (laststatus["action"] == "auto") {
        setMode("Automatic")
        if (laststatus["status"] == true) {
          setBumperState(true)
        }
        else setBumperState(false)
        if (laststatus["messages"].split(' ')[1] == 'off') {
          setModeState(false)
        }
        else {
          setModeState(true)
        }
        const value = parseInt(laststatus["messages"].split(' ')[0], 10);
        setValue(value)
      }
      else if (laststatus["action"] == "schedule") {
        setMode("Timer")
        if (laststatus["status"] == true) {
          setBumperState(true)
        }
        else setBumperState(false)
        const toggleState = laststatus["messages"].split(' ')[0]
        if (toggleState == '0') {
          setModeState(false)
        }
        else {
          setModeState(true)
        }
        getSchedule()
      }
      else {
        setModeState(false);
        setMode("Manual");
        setBumperState(false)
        setValue(80)
      }

    }
  }

  const handleEquipmentButton = async () => {
    setListEquipmentState(!listEquipmentState)
    let res = await callAPi(
      "get",
      `${URL}/data/getequipmentlist/${id}`,
    );
    if (res.status) {
      setListEquipment(res.data["equipment"])
    }
    else {
      alert("get ting fail")
    }
  }


  const handleChange = () => {
    setValue(sliderRef.current.value);
    const body = {
      modeState: modeState,
      value: sliderRef.current.value
    }
    sendMessage(body)


  };


  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length && !timeTableState) {
      const data = payload[0].payload;
      if (farm[0]["Sensors"][0]["category"] == "sht")
      {
        return (

          <div className="custom-tooltip" style={{ backgroundColor: 'black', border: '1px solid #ccc', padding: '10px', borderRadius: "15px" }}>
            <p className="label">{`Ngày: ${data.date}`}</p>
            <p className="label">{`Độ ẩm: ${data.sht_humid} %`}</p>
            <p className="label">{`Nhiệt độ: ${data.sht_temp} °C`}</p>
          </div>
        );
      }
      else 
      {
        return (

          <div className="custom-tooltip" style={{ backgroundColor: 'black', border: '1px solid #ccc', padding: '10px', borderRadius: "15px" }}>
            <p className="label">{`Ngày: ${data.date}`}</p>
            <p className="label">{`Bên trong: ${data.sht_humid} ppm`}</p>
            <p className="label">{`Bên ngoài: ${data.sht_temp} ppm`}</p>
          </div>
        );
      }
      
    }

    return null;
  };

  const navigateToSetting = () => {
    authDispatch({
      type: "SET_CURRENT_DEVICE",
      payload: farm[0],
    });
    handleAddDevice("equipment")

    navigate(`/editfarm/${id}`)
  };
function checkSensor(farm) {
  if (farm[0]["Sensors"][0]["category"] == "sht") {
    return "Thêm máy bơm";
  }
  return "Thêm hệ thống cống"; // Giá trị mặc định nếu không thỏa mãn điều kiện
}
  return (
    <div className="Fac_Home" >
      <BrowserView className="Fac_Home_Web" style={weatherState ? { paddingLeft: "15px" } : { paddingLeft: "0px" }} >
        {loadingState ?
          <div className="Fac_Home_Web_Farmcontainer center">
            <Loading />
          </div>
          : (farm.length != 0 ?
            <div className="Fac_Home_Web_Farmcontainer">
              {notification ? <Popup message={"Độ mặn vượt ngưỡng"}  onClose={handleClose} ></Popup> : null} 

              <div className="Fac_Home_Web_Farmcontainer_Header">
                
                <div className="Fac_Home_Web_Farmcontainer_Header_Left">

                  <MdArrowBackIosNew size={28} style={{ marginRight: "10px", paddingTop: "7px", cursor: "pointer" }} onClick={() => { navigate("/dashboard"); sessionStorage.setItem("last_click", 1); disconnectMqtt() }} />
                  <div style={{ width: "100%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    Nông trại 
                  </div>

                </div>
                <div className="Fac_Home_Web_Farmcontainer_Header_Right">
                  {/* <button className="Fac_Home_Web_Farmcontainer_Header_Right_Button" onClick={() => { disconnectMqtt(); sessionStorage.setItem("last_click", 5); sessionStorage.setItem("last_farm", id); navigate(`/history/${id}`); }} >
                    <TbDatabaseSearch size={20} className="Icon" />
                    History
                  </button> */}
                  <button className="Fac_Home_Web_Farmcontainer_Header_Right_Button" onClick={() => { handleAddDevice("equipment"); disconnectMqtt(); navigateToSetting() }} >
                    <FiSettings size={20} className="Icon" />
                    Cài đặt
                  </button>
                  <button className="Fac_Home_Web_Farmcontainer_Header_Right_Button" onClick={() => { handleAddDevice("equipment"); disconnectMqtt(); sessionStorage.setItem("last_click", 3); sessionStorage.setItem("last_service", "equipment"); sessionStorage.setItem("last_farm", id);; navigate(`/addfarm/${id}`); }} >
                    <IoIosAddCircleOutline size={26} className="Icon" />
                    {checkSensor(farm)}
                  </button>

                  {farmConnected ?
                    <div className="Fac_Home_Web_Farmcontainer_Header_Right_Status">

                      <MdCircle size={18} color="#8AFF02" style={{ marginRight: "5px", marginTop: "3px" }} />
                      Đã kết nối
                    </div>
                    :
                    <div className="Fac_Home_Web_Farmcontainer_Header_Right_Status">

                      <MdCircle size={18} color="#ff0000" style={{ marginRight: "5px", marginTop: "3px" }} />
                      Chưa kết nối
                    </div>
                  }


                </div>
              </div>

              <div className="Fac_Home_Web_Farmcontainer_Chart">
                <div className="Fac_Home_Web_Farmcontainer_Chart_Left" style={{padding: 0}}>

                  {
                    data.length != 0 ? <ResponsiveContainer width="100%" height="100%">
                      <AreaChart

                        data={data}
                        margin={{
                          top: 10,
                          right: 30,
                          left: 0,
                          bottom: 0,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="time"
                          tick={{ fontSize: 18, fill: '#fff' }} // Configures font size and color
                          stroke="#fff" // Configures stroke color
                          tickLine={false} // Configures tick line color
                          axisLine={{ stroke: '#fff', strokeWidth: 3 }} // Configures axis line color
                        />
                        {farm[0]["Sensors"][0]["category"] == "sht" ?<YAxis
                          tick={{ fontSize: 18, fill: '#fff' }} // Configures font size and color
                          stroke="#fff" // Configures stroke color
                          tickLine={false} // Configures tick line color
                          axisLine={{ stroke: '#fff', strokeWidth: 2 }}
                          type="number"
                          domain={[0, 120]}
                        /> :<YAxis
                          tick={{ fontSize: 18, fill: '#fff' }} // Configures font size and color
                          stroke="#fff" // Configures stroke color
                          tickLine={false} // Configures tick line color
                          axisLine={{ stroke: '#fff', strokeWidth: 2 }}
                          type="number"
                          domain={[0, 500]}
                        />}
                        

                        <Tooltip
                          content={<CustomTooltip />}
                          cursor={false}
                          contentStyle={{ borderRadius: '0.1px' }}

                        />


                        <Area type="monotone"
                          dataKey="sht_humid"
                          stroke="#0061f2" // Màu xanh đậm cho đường line
                          strokeWidth={2} //
                          fill="#95C5FF"
                          dot={{ fill: 'blue', stroke: '#0061f2', strokeWidth: 0, r: 4 }} // Đặc và màu xanh đậm cho các điểm dữ liệu
                        // isAnimationActive={false}
                        />
                        <Area type="monotone"
                          dataKey="sht_temp"
                          stroke="#FF2828"
                          strokeWidth={2}
                          fill="#F75B5B"
                          dot={{ fill: 'red', stroke: '#FF2828', strokeWidth: 0, r: 4 }}
                          // isAnimationActive={false}
                        />
                        <Area type="monotone"
                          dataKey="ph"
                          stroke="#24761D"
                          strokeWidth={2}
                          fill="#ACFDA5"
                          dot={{ fill: 'green', stroke: '#33A829', strokeWidth: 0, r: 4 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                      : <></>
                  }

                </div>
                <div className="Fac_Home_Web_Farmcontainer_Chart_Right">

                  <div className="Fac_Home_Web_Farmcontainer_Chart_Right_Header" >
                    {/*{equipment}*/}
                    Thông số
                  </div>
                  {/* {
                    listEquipmentState ?
                      <div className="Fac_Home_Web_Farmcontainer_Chart_Right_Dropbox">
                        Equipment
                      </div>
                      :
                      <></>
                  } */}

                  <div style={{ width: "100%", height: "1px", borderTop: "2px solid white", marginTop: "10px" }}></div>
                  <div className="Fac_Home_Web_Farmcontainer_Chart_Right_Date">
                    Ngày : {currentDate}
                  </div>
                  <div style={{ marginTop: "10px", marginRight: "auto" }}>

                    {farm[0]["Sensors"] != undefined ?
                      (farm[0]["Sensors"]).map((item) => (
                        item.category === "sht" ?
                          <div key={item.id}>
                            <div className="Fac_Home_Web_Farmcontainer_Chart_Right_Content">
                              <MdCircle size={15} color="#0061f2" style={{ marginRight: "5px" }} />
                              Độ ẩm
                            </div>
                            <div className="Fac_Home_Web_Farmcontainer_Chart_Right_Content">
                              <MdCircle size={15} color="#FF2828" style={{ marginRight: "5px" }} />
                              Nhiệt độ
                            </div>
                          </div>

                          :
                          <div key={item.id}>
                            <div className="Fac_Home_Web_Farmcontainer_Chart_Right_Content">
                              <MdCircle size={15} color="#0061f2" style={{ marginRight: "5px" }} />
                              Bên ngoài
                            </div>
                            <div className="Fac_Home_Web_Farmcontainer_Chart_Right_Content">
                              <MdCircle size={15} color="#FF2828" style={{ marginRight: "5px" }} />
                              Bên trong
                            </div>
                          </div>

                      )
                      ) : <></>}
                  </div>



                </div>
              </div>
              <div className="Fac_Home_Web_Farmcontainer_Controller">
                <div className="Fac_Home_Web_Farmcontainer_Controller_Header">
                  {farm[0].name}
                  <div className="Fac_Home_Web_Farmcontainer_Controller_Header_Mode">
                    Chế độ:
                    <div className="Fac_Home_Web_Farmcontainer_Controller_Header_Mode_State" onClick={() => setListModeState(!listModeState)}>
                      {currentMode}
                    </div>
                    {
                      listModeState
                        ?
                        <div className="Fac_Home_Web_Farmcontainer_Controller_Header_Mode_State_Dropbox">
                          <div className="Fac_Home_Web_Farmcontainer_Controller_Header_Mode_State_Dropbox_Item" onClick={() => { setCurrentMode("Thủ công");setMode("Manual"); setModeState(false); setListModeState(false) }}>
                            Thủ công
                          </div>
                          <div className="Fac_Home_Web_Farmcontainer_Controller_Header_Mode_State_Dropbox_Item" onClick={() => { setCurrentMode("Tự động") ;setMode("Automatic"); setModeState(false); setListModeState(false) }}>
                            Tự động
                          </div>
                          <div className="Fac_Home_Web_Farmcontainer_Controller_Header_Mode_State_Dropbox_Item" onClick={() => {  setCurrentMode("Hẹn giờ");setMode("Timer"); setModeState(false); setListModeState(false); getSchedule() }}>
                            Hẹn giờ
                          </div>

                        </div>
                        :
                        <></>
                    }

                  </div>



                </div>
                {
                  mode == "Manual" ?
                    <div className="Fac_Home_Web_Farmcontainer_Controller_Body">
                      <div className="Fac_Home_Web_Farmcontainer_Controller_Body_Control">
                        <label className="Fac_Home_Web_Farmcontainer_Controller_Body_Control_switch">
                          <input className="Fac_Home_Web_Farmcontainer_Controller_Body_Control_switch_Input" type="checkbox" checked={modeState} onChange={() => { handleModeToggleChange() }} />
                          <span className="slider round"></span>
                        </label>

                        {/* <div className="Fac_Home_Web_Farmcontainer_Controller_Body_Control_Statecontainer">
                          Bump:
                          {bumperState ?
                            <div className="Fac_Home_Web_Farmcontainer_Controller_Body_Control_Statecontainer_State">
                              ON
                              <MdCircle size={15} color="#8AFF02" style={{ marginLeft: "10px" }} />
                            </div>
                            :
                            <div className="Fac_Home_Web_Farmcontainer_Controller_Body_Control_Statecontainer_State">
                              OFF
                              <MdCircle size={15} color="#FE0707" style={{ marginLeft: "10px" }} />
                            </div>
                          }
                        </div> */}
                      </div>
                    </div>

                    : mode == "Automatic" ?
                      <div className="Fac_Home_Web_Farmcontainer_Controller_Body">
                        <div className="Fac_Home_Web_Farmcontainer_Controller_Body_Control">
                          <label className="Fac_Home_Web_Farmcontainer_Controller_Body_Control_switch">
                            <input className="Fac_Home_Web_Farmcontainer_Controller_Body_Control_switch_Input" type="checkbox" checked={modeState} onChange={() => { handleModeToggleChange() }} />
                            <span className="slider round"></span>
                          </label>

                          {/* <div className="Fac_Home_Web_Farmcontainer_Controller_Body_Control_Statecontainer">
                            Bump:
                            {bumperState ?
                              <div className="Fac_Home_Web_Farmcontainer_Controller_Body_Control_Statecontainer_State">
                                ON
                                <MdCircle size={15} color="#8AFF02" style={{ marginLeft: "10px" }} />

                              </div>
                              :
                              <div className="Fac_Home_Web_Farmcontainer_Controller_Body_Control_Statecontainer_State">
                                OFF
                                <MdCircle size={15} color="#FE0707" style={{ marginLeft: "10px" }} />

                              </div>
                            }
                          </div> */}
                        </div>
                        <div className="Fac_Home_Web_Farmcontainer_Controller_Body_Control_Slidecontainer">
                          {farm[0]["Sensors"][0]["category"] == "sht" ?<input
                            type="range"
                            min="60"
                            max="100"
                            value={value}
                            onChange={handleChange}
                            ref={sliderRef} // Sử dụng ref ở đây
                            className="Fac_Home_Web_Farmcontainer_Controller_Body_Control_Slidecontainer_Slider"
                          /> :<input
                            type="range"
                            min="100"
                            max="500"
                            value={value}
                            onChange={handleChange}
                            ref={sliderRef} // Sử dụng ref ở đây
                            className="Fac_Home_Web_Farmcontainer_Controller_Body_Control_Slidecontainer_Slider"
                          />}
                          
                          <div style={{ marginLeft: "10px", fontSize: "20px" }}>{value}</div>
                        </div>
                      </div>
                      :
                      <div className="Fac_Home_Web_Farmcontainer_Controller_Body">
                        <div className="Fac_Home_Web_Farmcontainer_Controller_Body_Control">
                          <label className="Fac_Home_Web_Farmcontainer_Controller_Body_Control_switch">
                            <input className="Fac_Home_Web_Farmcontainer_Controller_Body_Control_switch_Input" type="checkbox" checked={modeState} onChange={() => { handleModeToggleChange() }} />
                            <span className="slider round"></span>
                          </label>

                          <div className="Fac_Home_Web_Farmcontainer_Controller_Body_Control_Statecontainer">
                            
                            {bumperState ?
                              <div className="Fac_Home_Web_Farmcontainer_Controller_Body_Control_Statecontainer_State">
                                ON
                                <MdCircle size={15} color="#8AFF02" style={{ marginLeft: "10px" }} />
                              </div>
                              :
                              <div className="Fac_Home_Web_Farmcontainer_Controller_Body_Control_Statecontainer_State">
                                
                               {/* / <MdCircle size={15} color="#FE0707" style={{ marginLeft: "10px" }} /> */}
                              </div>
                            }
                          </div>
                        </div>
                        <div className="Fac_Home_Web_Farmcontainer_Controller_Body_Control_Timecontainer" onClick={() => { setTimeTableState(!timeTableState) }}>
                          {timeList.map((time, index) => (
                            <div className="Fac_Home_Web_Farmcontainer_Controller_Body_Control_Timecontainer_Times" key={index}>
                              {time}
                            </div>
                          ))}
                        </div>

                      </div>
                }

              </div>
              {timeTableState ?
                <div className="Fac_Home_Web_Farmcontainer_Settime" style={timeState ? { width: "220px" } : { width: "350px" }}>
                  <div className="Fac_Home_Web_Farmcontainer_Settime_Title">
                    <div className="Fac_Home_Web_Farmcontainer_Settime_Title_Offset">
                      Thời lượng:
                      <div className="Fac_Home_Web_Farmcontainer_Settime_Title_Offset_Input" onClick={() => { setOffsetState(!offsetState) }}>
                        {offset}
                      </div>
                      {
                        offsetState &&
                        <div className="Fac_Home_Web_Farmcontainer_Settime_Title_Offset_Dropbox">
                          {seconds.map((item) => (
                            <div className="Fac_Home_Web_Farmcontainer_Settime_Title_Offset_Dropbox_Item" key={item} onClick={() => { handlEditOffset(item + 1); setOffsetState(false) }}>
                              {item + 1}
                            </div>
                          ))}


                        </div>
                      }
                    </div>

                    <div className="Fac_Home_Web_Farmcontainer_Settime_Title_Icon" onClick={() => { setTimeTableState(!timeTableState) }}>
                      <FiPlus size={30} />
                    </div>
                  </div>
                  <div className="Fac_Home_Web_Farmcontainer_Settime_Body">
                    <div className="Fac_Home_Web_Farmcontainer_Settime_Body_Left" style={timeState ? {} : { borderRight: "2px solid white" }}>
                      <div className="Fac_Home_Web_Farmcontainer_Settime_Body_Left_Title">
                        Thời gian:
                        <FiPlus className="Icon" onClick={() => { setTimeState(!timeState) }} size={28} />
                      </div>
                      <div className="Fac_Home_Web_Farmcontainer_Settime_Body_Left_Times">
                        {timeList.map((item, index) => (

                          <div className="Fac_Home_Web_Farmcontainer_Settime_Body_Left_Times_Item" key={index}>
                            {item}
                            <div className="Fac_Home_Web_Farmcontainer_Settime_Body_Left_Times_Item_Edit">
                              <FiXCircle className="Icon" onClick={() => { handleDeleteTime(item, index) }} size={28} />
                            </div>
                          </div>
                        ))}

                      </div>
                    </div>
                    {!timeState ? <div className="Fac_Home_Web_Farmcontainer_Settime_Body_Right">
                      <HourMinutePicker onTimeChange={handleTimeChange} ref={hourMinutePickerRef} />
                      <button className="Fac_Home_Web_Farmcontainer_Settime_Body_Right_Button" onClick={() => { handleAddTime() }}>Add</button>
                    </div> : <></>}

                  </div>
                </div>
                : <></>}

            </div> :
            <div className="Fac_Home_Web_Farmcontainer">
              <div className="Fac_Home_Web_Farmcontainer_Header">
                <div className="Fac_Home_Web_Farmcontainer_Header_Left">

                  <MdArrowBackIosNew size={28} style={{ marginRight: "10px", paddingTop: "7px", cursor: "pointer" }} onClick={() => { navigate("/dashboard"); disconnectMqtt() }} />
                  <div style={{ width: "100%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    Farm name
                  </div>

                </div>
                <div className="Fac_Home_Web_Farmcontainer_Header_Right">
                  
                  <button className="Fac_Home_Web_Farmcontainer_Header_Right_Button block"  >
                    <FiSettings size={20} className="Icon" />
                    Setting
                  </button>
                  <button className="Fac_Home_Web_Farmcontainer_Header_Right_Button" onClick={() => { handleAddDevice("equipment"); disconnectMqtt(); navigate(`/addfarm/${id}`); }} >
                    <IoIosAddCircleOutline size={26} className="Icon" />
                    Add device
                  </button>
                  <div className="Fac_Home_Web_Farmcontainer_Header_Right_Status">

                    <MdCircle size={18} color="#ff0000" style={{ marginRight: "5px", marginTop: "3px" }} />
                    Chưa kết nối
                  </div>

                </div>
              </div>
              <div className="Fac_Home_Web_Farmcontainer_Nofarm">No farm to display!</div>
            </div>)



        }
      </BrowserView>

      <MobileView
        className="Fac_Home_Mobile"
        style={weatherState ? { paddingLeft: "0" } : { paddingLeft: "0px" }}
      >
        {loadingState ? (
          <div className="Fac_Home_Mobile_Farmcontainer center">
            <Loading />
          </div>
        ) : farm.length != 0 ? (
          <div className="Fac_Home_Mobile_Farmcontainer">
            <div className="Fac_Home_Mobile_Farmcontainer_Header">
              <div className="Fac_Home_Mobile_Farmcontainer_Header_Left">
                <>
                  <MdArrowBackIosNew
                    size={28}
                    style={{ paddingTop: "7px", cursor: "pointer" }}
                    onClick={() => {
                      navigate("/dashboard");
                      disconnectMqtt();
                    }}
                  />
                  <div
                    style={{
                      width: "100%",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    Nông trại
                  </div>
                </>
                <>
                  <div className="Fac_Home_Mobile_Farmcontainer_Header_Right_Status">
                    <MdCircle
                      size={18}
                      color="#8AFF02"
                      style={{ marginRight: "5px", marginTop: "3px" }}
                    />
                    Đã kết nối
                  </div>
                </>
              </div>
              <div className="Fac_Home_Mobile_Farmcontainer_Header_Right">
                {/* <button
                  className="Fac_Home_Mobile_Farmcontainer_Header_Right_Button"
                  onClick={() => {
                    handleAddDevice("equipment");
                    disconnectMqtt();
                    navigate(`/addfarm/${id}`);
                  }}
                >
                  <TbDatabaseSearch size={20} className="Icon" />
                  History
                </button> */}
                <button
                  className="Fac_Home_Mobile_Farmcontainer_Header_Right_Button"
                  onClick={() => {
                    handleAddDevice("equipment");
                    disconnectMqtt();
                    navigateToSetting();
                  }}
                >
                  <FiSettings size={20} className="Icon" />
                  Cài đặt
                </button>
                <button
                  className="Fac_Home_Mobile_Farmcontainer_Header_Right_Button"
                  onClick={() => {
                    handleAddDevice("equipment");
                    disconnectMqtt();
                    navigate(`/addfarm/${id}`);
                  }}
                >
                  <IoIosAddCircleOutline size={26} className="Icon" />
                  Add device
                </button>
              </div>
            </div>

            <div className="Fac_Home_Mobile_Farmcontainer_Chart">
              <div className="Fac_Home_Mobile_Farmcontainer_Chart_Left">
                {data.length != 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={data}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="time"
                        tick={{ fontSize: 18, fill: "#fff" }} // Configures font size and color
                        stroke="#fff" // Configures stroke color
                        tickLine={false} // Configures tick line color
                        axisLine={{ stroke: "#fff", strokeWidth: 3 }} // Configures axis line color
                      />
                      <YAxis
                        tick={{ fontSize: 18, fill: "#fff" }} // Configures font size and color
                        stroke="#fff" // Configures stroke color
                        tickLine={false} // Configures tick line color
                        axisLine={{ stroke: "#fff", strokeWidth: 2 }}
                      />

                      <Tooltip
                        content={<CustomTooltip />}
                        cursor={false}
                        contentStyle={{ borderRadius: "0.1px" }}
                      />

                      <Area
                        type="monotone"
                        dataKey="sht_humid"
                        stroke="#0061f2" // Màu xanh đậm cho đường line
                        strokeWidth={2} //
                        fill="#95C5FF"
                        dot={{
                          fill: "blue",
                          stroke: "#0061f2",
                          strokeWidth: 0,
                          r: 4,
                        }} // Đặc và màu xanh đậm cho các điểm dữ liệu
                      />
                      <Area
                        type="monotone"
                        dataKey="sht_temp"
                        stroke="#FF2828"
                        strokeWidth={2}
                        fill="#F75B5B"
                        dot={{
                          fill: "red",
                          stroke: "#FF2828",
                          strokeWidth: 0,
                          r: 4,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="ph"
                        stroke="#24761D"
                        strokeWidth={2}
                        fill="#ACFDA5"
                        dot={{
                          fill: "green",
                          stroke: "#33A829",
                          strokeWidth: 0,
                          r: 4,
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <></>
                )}
              </div>
              <div className="Fac_Home_Mobile_Farmcontainer_Chart_Right">
                <div
                  className="Fac_Home_Mobile_Farmcontainer_Chart_Right_Header"
                  onClick={() => handleEquipmentButton()}
                >
                  {equipment}
                </div>
                {listEquipmentState ? (
                  <div className="Fac_Home_Mobile_Farmcontainer_Chart_Right_Dropbox">
                    {listEquipment.map((item, index) => (
                      <div
                        className="Fac_Home_Mobile_Farmcontainer_Chart_Right_Dropbox_Item"
                        key={item.id_equipment}
                        onClick={() => {
                          getFarm(id, item.id_equipment);
                          setEquipment("Equipment " + (index + 1));
                          setListEquipmentState(false);
                          setListModeState(false);
                        }}
                      >
                        Equipment {index + 1}
                      </div>
                    ))}
                  </div>
                ) : (
                  <></>
                )}

                <div
                  style={{
                    width: "100%",
                    height: "1px",
                    borderTop: "2px solid white",
                    marginTop: "10px",
                  }}
                ></div>
                <div className="Fac_Home_Mobile_Farmcontainer_Chart_Right_Date">
                  Date : {currentDate}
                </div>
                <div style={{ marginTop: "10px", marginRight: "auto" }}>
                  {farm[0]["Sensors"] != undefined ? (
                    farm[0]["Sensors"].map((item) =>
                      item.category === "sht" ? (
                        <div key={item.id}>

                          <div className="Fac_Home_Mobile_Farmcontainer_Chart_Right_Content">
                            <MdCircle
                              size={15}
                              color="#0061f2"
                              style={{ marginRight: "5px" }}
                            />
                            Humidity
                          </div>
                          <div className="Fac_Home_Mobile_Farmcontainer_Chart_Right_Content">
                            <MdCircle
                              size={15}
                              color="#FF2828"
                              style={{ marginRight: "5px" }}
                            />
                            Temperature
                          </div>
                        </div>
                      ) : (
                        <div
                          className="Fac_Home_Mobile_Farmcontainer_Chart_Right_Content"
                          key={item.id}
                        >
                          <MdCircle
                            size={15}
                            color="#33A829"
                            style={{ marginRight: "5px" }}
                          />
                          Ph
                        </div>
                      )
                    )
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            </div>
            <div className="Fac_Home_Mobile_Farmcontainer_Controller">
              <div className="Fac_Home_Mobile_Farmcontainer_Controller_Header">
                {farm[0].name}
                <div className="Fac_Home_Mobile_Farmcontainer_Controller_Header_Mode">
                  Mode:
                  <div
                    className="Fac_Home_Mobile_Farmcontainer_Controller_Header_Mode_State"
                    onClick={() => setListModeState(!listModeState)}
                  >
                    {mode}
                  </div>
                  {listModeState ? (
                    <div className="Fac_Home_Mobile_Farmcontainer_Controller_Header_Mode_State_Dropbox">
                      <div
                        className="Fac_Home_Mobile_Farmcontainer_Controller_Header_Mode_State_Dropbox_Item"
                        onClick={() => {
                          setMode("Manual");
                          setListModeState(false);
                        }}
                      >
                        Manual
                      </div>
                      <div
                        className="Fac_Home_Mobile_Farmcontainer_Controller_Header_Mode_State_Dropbox_Item"
                        onClick={() => {
                          setMode("Automatic");
                          setListModeState(false);
                        }}
                      >
                        Automatic
                      </div>
                      <div
                        className="Fac_Home_Mobile_Farmcontainer_Controller_Header_Mode_State_Dropbox_Item"
                        onClick={() => {
                          setMode("Timer");
                          setListModeState(false);
                        }}
                      >
                        Timer
                      </div>
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
              </div>
              { mode == "Manual" ?
                    <div className="Fac_Home_Mobile_Farmcontainer_Controller_Body">
                      <div className="Fac_Home_Mobile_Farmcontainer_Controller_Body_Control">
                        <label className="Fac_Home_Mobile_Farmcontainer_Controller_Body_Control_switch">
                          <input className="Fac_Home_Mobile_Farmcontainer_Controller_Body_Control_switch_Input" type="checkbox" checked={modeState} onChange={() => { handleModeToggleChange() }} />
                          <span className="slider round"></span>
                        </label>

                        <div className="Fac_Home_Mobile_Farmcontainer_Controller_Body_Control_Statecontainer">
                          Bump:
                          {bumperState ?
                            <div className="Fac_Home_Mobile_Farmcontainer_Controller_Body_Control_Statecontainer_State">
                              ON
                              <MdCircle size={15} color="#8AFF02" style={{ marginLeft: "10px" }} />
                            </div>
                            :
                            <div className="Fac_Home_Mobile_Farmcontainer_Controller_Body_Control_Statecontainer_State">
                              OFF
                              <MdCircle size={15} color="#FE0707" style={{ marginLeft: "10px" }} />
                            </div>
                          }
                        </div>
                      </div>
                    </div>

                    : mode == "Automatic" ?
                      <div className="Fac_Home_Mobile_Farmcontainer_Controller_Body">
                        <div className="Fac_Home_Mobile_Farmcontainer_Controller_Body_Control">
                          <label className="Fac_Home_Mobile_Farmcontainer_Controller_Body_Control_switch">
                            <input className="Fac_Home_Mobile_Farmcontainer_Controller_Body_Control_switch_Input" type="checkbox" checked={modeState} onChange={() => { handleModeToggleChange() }} />
                            <span className="slider round"></span>
                          </label>

                          <div className="Fac_Home_Mobile_Farmcontainer_Controller_Body_Control_Statecontainer">
                            Bump:
                            {bumperState ?
                              <div className="Fac_Home_Mobile_Farmcontainer_Controller_Body_Control_Statecontainer_State">
                                ON
                                <MdCircle size={15} color="#8AFF02" style={{ marginLeft: "10px" }} />

                              </div>
                              :
                              <div className="Fac_Home_Mobile_Farmcontainer_Controller_Body_Control_Statecontainer_State">
                                OFF
                                <MdCircle size={15} color="#FE0707" style={{ marginLeft: "10px" }} />

                              </div>
                            }
                          </div>
                        </div>
                        <div className="Fac_Home_Mobile_Farmcontainer_Controller_Body_Control_Slidecontainer">
                          <input
                            type="range"
                            min="60"
                            max="100"
                            value={value}
                            onChange={handleChange}
                            ref={sliderRef} // Sử dụng ref ở đây
                            className="Fac_Home_Mobile_Farmcontainer_Controller_Body_Control_Slidecontainer_Slider"
                          />
                          <div style={{ marginLeft: "10px", fontSize: "20px" }}>{value}</div>
                        </div>
                      </div>
                      :
                      <div className="Fac_Home_Mobile_Farmcontainer_Controller_Body">
                        <div className="Fac_Home_Mobile_Farmcontainer_Controller_Body_Control">
                          <label className="Fac_Home_Mobile_Farmcontainer_Controller_Body_Control_switch">
                            <input className="Fac_Home_Mobile_Farmcontainer_Controller_Body_Control_switch_Input" type="checkbox" checked={modeState} onChange={() => { handleModeToggleChange() }} />
                            <span className="slider round"></span>
                          </label>

                          <div className="Fac_Home_Mobile_Farmcontainer_Controller_Body_Control_Statecontainer">
                            Bump:
                            {bumperState ?
                              <div className="Fac_Home_Mobile_Farmcontainer_Controller_Body_Control_Statecontainer_State">
                                ON
                                <MdCircle size={15} color="#8AFF02" style={{ marginLeft: "10px" }} />
                              </div>
                              :
                              <div className="Fac_Home_Mobile_Farmcontainer_Controller_Body_Control_Statecontainer_State">
                                OFF
                                <MdCircle size={15} color="#FE0707" style={{ marginLeft: "10px" }} />
                              </div>
                            }
                          </div>
                        </div>
                        <div className="Fac_Home_Mobile_Farmcontainer_Controller_Body_Control_Timecontainer" onClick={() => { setTimeTableState(!timeTableState) }}>
                          {timeList.map((time, index) => (
                            <div className="Fac_Home_Mobile_Farmcontainer_Controller_Body_Control_Timecontainer_Times" key={index}>
                              {time}
                            </div>
                          ))}
                        </div>

                      </div>
                }
            </div>
            {timeTableState ? (
              <div
                className="Fac_Home_Mobile_Farmcontainer_Settime"
                // style={timeState ? { width: "220px" } : { width: "350px" }}
              >
                <div className="Fac_Home_Mobile_Farmcontainer_Settime_Title">
                  <div className="Fac_Home_Mobile_Farmcontainer_Settime_Title_Offset">
                    Offset:
                    <div
                      className="Fac_Home_Mobile_Farmcontainer_Settime_Title_Offset_Input"
                      onClick={() => {
                        setOffsetState(!offsetState);
                      }}
                    >
                      <div className="Fac_Home_Mobile_Farmcontainer_Settime_Title_Offset_Input_Selection">
                        {offset}
                      </div>
                    </div>
                    {offsetState && (
                      <div
                        className="Fac_Home_Mobile_Farmcontainer_Settime_Title_Offset_Dropbox"
                        style={{
                          position: "absolute",
                          top: "48px",
                          left: "75px",
                          height: "110px",
                          marginTop: "8px",
                          padding: "8px 30px",
                          overflowY: "auto",
                          backgroundColor: "#000",
                          borderRadius: "8px",
                          outline: "2px solid rgba(255, 255, 255, 0.9)",
                          boxShadow:
                            "rgba(#000, 0.3) 0 15px 35px -20px, rgba(#fff, 0.7) 0 30px 60px -30px",
                          zIndex: 100,
                        }}
                      >
                        {seconds.map((item) => (
                          <div
                            className="Fac_Home_Mobile_Farmcontainer_Settime_Title_Offset_Dropbox_Item"
                            style={{textAlign: "center"}}
                            key={item}
                            onClick={() => {
                              handlEditOffset(item + 1);
                              setOffsetState(false);
                            }}
                          >
                            {item + 1}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div
                    className="Fac_Home_Mobile_Farmcontainer_Settime_Title_Icon"
                    onClick={() => {
                      setTimeTableState(!timeTableState);
                    }}
                  >
                    <FiPlus size={30} />
                  </div>
                </div>
                <div className="Fac_Home_Mobile_Farmcontainer_Settime_Body">
                  <div
                    className="Fac_Home_Mobile_Farmcontainer_Settime_Body_Left"
                    style={timeState ? {} : { borderRight: "2px solid white" }}
                  >
                    <div className="Fac_Home_Mobile_Farmcontainer_Settime_Body_Left_Title">
                      Time:
                      <FiPlus
                        className="Icon"
                        onClick={() => {
                          setTimeState(!timeState);
                        }}
                        size={28}
                      />
                    </div>
                    <div className="Fac_Home_Mobile_Farmcontainer_Settime_Body_Left_Times">
                      {timeList.map((item, index) => (
                        <div
                          className="Fac_Home_Mobile_Farmcontainer_Settime_Body_Left_Times_Item"
                          key={index}
                        >
                          {item}
                          <div className="Fac_Home_Mobile_Farmcontainer_Settime_Body_Left_Times_Item_Edit">
                            <FiXCircle
                              className="Icon"
                              onClick={() => {
                                handleDeleteTime(item, index);
                              }}
                              size={28}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {!timeState ? (
                    <div className="Fac_Home_Mobile_Farmcontainer_Settime_Body_Right">
                      <HourMinutePicker
                        onTimeChange={handleTimeChange}
                        ref={hourMinutePickerRef}
                      />
                      <button
                        className="Fac_Home_Mobile_Farmcontainer_Settime_Body_Right_Button"
                        onClick={() => {
                          handleAddTime();
                        }}
                      >
                        Add
                      </button>
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            ) : (
              <></>
            )}
          </div>
        ) : (
          <div className="Fac_Home_Mobile_Farmcontainer">
            <div className="Fac_Home_Mobile_Farmcontainer_Header">
              <div className="Fac_Home_Mobile_Farmcontainer_Header_Left">
                <MdArrowBackIosNew
                  size={28}
                  style={{
                    marginRight: "10px",
                    paddingTop: "7px",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    navigate("/dashboard");
                    disconnectMqtt();
                  }}
                />
                <div
                  style={{
                    width: "100%",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  Farm name
                </div>
              </div>
              <div className="Fac_Home_Mobile_Farmcontainer_Header_Right">
                <button
                  className="Fac_Home_Mobile_Farmcontainer_Header_Right_Button"
                  onClick={() => {
                    handleAddDevice("equipment");
                    disconnectMqtt();
                    navigate(`/addfarm/${id}`);
                  }}
                >
                  <TbDatabaseSearch size={20} className="Icon" />
                  History
                </button>
                <button
                  className="Fac_Home_Mobile_Farmcontainer_Header_Right_Button"
                  onClick={() => {
                    handleAddDevice("equipment");
                    disconnectMqtt();
                    navigateToSetting();
                  }}
                >
                  <FiSettings size={20} className="Icon" />
                  Setting
                </button>
                <button
                  className="Fac_Home_Mobile_Farmcontainer_Header_Right_Button"
                  onClick={() => {
                    handleAddDevice("equipment");
                    disconnectMqtt();
                    navigate(`/addfarm/${id}`);
                  }}
                >
                  <IoIosAddCircleOutline size={26} className="Icon" />
                  Add device
                </button>
                <div className="Fac_Home_Mobile_Farmcontainer_Header_Right_Status">
                  <MdCircle
                    size={18}
                    color="#8AFF02"
                    style={{ marginRight: "5px", marginTop: "3px" }}
                  />
                  Connected
                </div>
              </div>
            </div>
            <div className="Fac_Home_Mobile_Farmcontainer_Nofarm">
              No farm to display!
            </div>
          </div>
        )}
      </MobileView>
    </div>
  )
}

export default Farm
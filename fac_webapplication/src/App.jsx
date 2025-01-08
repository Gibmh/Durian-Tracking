import React, { useContext, useEffect, useState } from "react";
import { BrowserView, MobileView } from "react-device-detect";
import {
  BrowserRouter as Router,
  Route,
  Navigate,
  Routes,
  useNavigate,
} from "react-router-dom";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import ForgotPassw from "./components/Auth/ForgotPassw";
import { Dashboard } from "./components/Home/dashboard";
import NewPassw from "./components/Auth/NewPassw";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { callAPi } from "./services/UserService";
import Menu from "./components/Menu/menu";
import Weather from "./components/Weather/weather";
import Farm from "./components/Home/farm";
import Addfarm from "./components/Home/newfarm";
import User from "./components/Home/user";
import Editfarm from "./components/Home/editfarm";
import Adminpage from "./components/Admin/admin";
import History from "./components/History/History";
//
import { AuthContext } from "./components/Context/AuthContext";
function App() {
  const navigate = useNavigate()
  const [weatherState, setWeatherState] = useState(true);
  const [addDeviceState, setAddDeviceState] = useState("");
  const [location,setLocation] = useState({
    lat: 10.8231,
    lng: 106.6297,
});
  const { URL, login, authDispatch } = useContext(AuthContext);
  const handleWeather = (status) => {
    if (status == true)
      {
        setWeatherState(false);

      }
      else 
    setWeatherState(!weatherState);
  };
  const handleAddDevice = (key) => {
    setAddDeviceState(key);
  };
  const getUserByToken = async (isToken) => {
    const checkApi = async () => {    
     let res = await callAPi(
       "post",
       `${URL}/auth/verify-jwt`,
       {
         token: isToken,
       }
     );
     // console.log(res.data[0].user_name_);
     if (res.status) {
      // console.log(res.data[0])
      authDispatch({
        type: "SET_LOGIN",
        payload: { status: true},
      });
       authDispatch({
         type: "SET_USER",
         payload: res.data[0],
       })
       if (sessionStorage.getItem("last_click") == 1) {
        navigate("/dashboard")
       }
       else if (sessionStorage.getItem("last_click") == 2) {
        const id_esp = sessionStorage.getItem("last_farm")
        navigate(`/farm/${id_esp}`);
       }
       else if (sessionStorage.getItem("last_click") == 3) {
        const last_service = sessionStorage.getItem("last_service")
        if (last_service == "farm")
        {
          setAddDeviceState("farm");
          navigate(`/addfarm/${(res.data[0])["id_user_"]}`);
        }
        else 
        {
          setAddDeviceState("equipment");

          const id_esp = sessionStorage.getItem("last_farm")
          navigate(`/addfarm/${id_esp}`);
        }
        
       }
       else if (sessionStorage.getItem("last_click") == 4) {
        navigate("/usersetting");
       }
       else if (sessionStorage.getItem("last_click") == 5) {
        const id_esp = sessionStorage.getItem("last_farm")
        navigate(`/history/${id_esp}`);
       }

     }};
   checkApi();
 }
  useEffect(() => {
    let token = null;
    if (localStorage.getItem("token")) {
      token = JSON.parse(localStorage.getItem("token"));
      getUserByToken(token);
     
    }
    if (!token && sessionStorage.getItem("token")) {
      token = JSON.parse(sessionStorage.getItem("token"));
      getUserByToken(token);
      
    }
    if (!token) {
      authDispatch({
        type: "SET_LOGIN",
        payload: { status: false },
      });
    }
  }, []);


  // useEffect(() => {
  //     //array index obj.key

  //     // key and value
  //     // let obj = {
  //     //   data:{name:'loc', age:'29'},
  //     //   2:{name:'duc', age:'49'},
  //     //   info:{name:'cuong', age:'19'},
  //     //   4:{name:'trieu', age:'18'},
  //     // }

  //     // Object.entries(obj).map((item) => {
  //     //   // console.log(obj[key])
  //     //   console.log(item[0], item[1])
  //     // })

  //     //read obj
  //     // Object.entries(obj).map(([key, value]) => {
  //     //   // console.log(obj[key])
  //     //   console.log(value)
  //     // })

  //     // Object.keys(obj).map((key) => {
  //     //   console.log(key, obj[key])
  //     // })

  //   //  // add
  //   //   obj['5']={name:'tung', age:'19'}

  //   //   console.log('add',obj)

  //   //   //delete
  //   //   delete obj['data']
  //   //   console.log('delete',obj) 

  //     //update
  //     // obj['4']={
  //     //   ...obj['4'],
  //     //   name:'loc',
  //     // }
  //     // console.log('update',obj)


  //     // for (const key in obj) {
  //     //   console.log(key, obj[key])
  //     // }

  //     // console.log(obj['1'].name)

  //     // obj.map((item) => {
  //     //   console.log(item)
  //     // })

  // },[])


  return (
    <div className="App">
      <BrowserView>
        <header className="App-header">
          {login.status ? (
            <div style={{ position: "fixed", width: "100%", height: "100%" }}>
              <img
                src="/images/b3.jpg"
                alt=""
                style={{
                  position: "fixed",
                  zIndex: "-1",
                  width: "100%",
                  height: "100%",
                  filter: "brightness(0.9)",
                }}
              />
              <Menu handleWeather={handleWeather} weatherState={weatherState} />
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  height: `calc(100vh - 50px)`,
                  padding: "15px",
                  boxSizing: "border-box",
                  position: "fixed",
                  zIndex: "-1",
                }}
              >
                <Weather weatherState={weatherState} location={location}/>
                <Routes>
                  <Route
                    path="/dashboard"
                    element={
                      <Dashboard
                        weatherState={weatherState}
                        handleAddDevice={handleAddDevice}
                        setLocation={setLocation}
                      />
                    }
                  />
                  <Route
                    path="/farm/:id"
                    element={<Farm weatherState={weatherState} handleAddDevice={handleAddDevice} />}
                  />
                  <Route
                    path="/addfarm/:id"
                    element={
                      <Addfarm
                        weatherState={weatherState}
                        addDeviceState={addDeviceState}
                      />
                    }
                  />
                  <Route
                    path="/editfarm/:id"
                    element={
                      <Editfarm
                        weatherState={weatherState}
                        addDeviceState={addDeviceState}
                      />
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <Adminpage/>
                    }
                  />
                  <Route
                    path="/usersetting"
                    element={<User weatherState={weatherState} />}
                  />
                  <Route
                    path="/history/:id"
                    element={<History weatherState={weatherState} />}
                  />
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
              </div>
            </div>
          ) : (
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/login" />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgotpassword" element={<ForgotPassw />} />
              <Route path="/newpassw" element={<NewPassw />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          )}
        </header>
      </BrowserView>
      <MobileView>
        <header className="App-header">
          {login.status ? (
            <div style={{ position: "", width: "100%", height: "100%" }}>
              <img
                src="/images/b3.jpg"
                alt=""
                style={{
                  position: "fixed",
                  zIndex: "-1",
                  width: "100%",
                  height: "100%",
                  filter: "brightness(0.9)",
                }}
              />
              <Menu handleWeather={handleWeather} weatherState={weatherState} />
              <div
                style={{
                  marginBottom: "18%",
                  padding: "15px",
                  boxSizing: "border-box",
                }}
              >
                <Weather weatherState={weatherState} location={location}/>
                <Routes>
                  <Route
                    path="/dashboard"
                    element={
                      <Dashboard
                        weatherState={weatherState}
                        handleAddDevice={handleAddDevice}
                        setLocation={setLocation}
                      />
                    }
                  />
                  <Route
                    path="/farm/:id"
                    element={<Farm weatherState={weatherState} handleAddDevice={handleAddDevice} />}
                  />
                  <Route
                    path="/addfarm/:id"
                    element={
                      <Addfarm
                        weatherState={weatherState}
                        addDeviceState={addDeviceState}
                      />
                    }
                  />
                  <Route
                    path="/editfarm/:id"
                    element={
                      <Editfarm
                        weatherState={weatherState}
                        addDeviceState={addDeviceState}
                      />
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <Adminpage/>
                    }
                  />
                  <Route
                    path="/usersetting"
                    element={<User weatherState={weatherState} />}
                  />
                  <Route
                    path="/history/:id"
                    element={<History weatherState={weatherState} />}
                  />
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
              </div>
            </div>
          ) : (
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/login" />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgotpassword" element={<ForgotPassw />} />
              <Route path="/newpassw" element={<NewPassw />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          )}
        </header>
      </MobileView>
      <ToastContainer  autoClose={1500}/>
    </div>
  );
}

export default function WrappedApp() {
  return (
    <Router>
      <App />
    </Router>
  );
}

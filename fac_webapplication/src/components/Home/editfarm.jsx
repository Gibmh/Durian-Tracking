import React, { useState, useRef, useEffect, useContext } from "react";
import './home.scss'
import { BrowserView, MobileView } from "react-device-detect";
import { MdArrowBackIosNew } from "react-icons/md";
import { useParams, useNavigate } from "react-router-dom";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { AuthContext } from "../Context/AuthContext";
import { callAPi } from "../../services/UserService";
import { GoogleMap, useLoadScript, MarkerF } from "@react-google-maps/api";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { stringify } from "ajv";
const libraries = ['places']

const EditFarm = ({ weatherState, addDeviceState }) => {
  const { id: paramId } = useParams();
  const [farmSeleted, setFarmSelected] = useState("")
  const [farmSeletedState, setFarmSelectedState] = useState(false)
  const navigate = useNavigate();
  const { URL, farmsct, user, currentDevice, currentFarm } = useContext(AuthContext);

  const [equipmentName, setEquipmentName] = useState("");
  const [farmName, setFarmName] = useState("");
  const [farmDescription, setFarmDescription] = useState("");
  const [farmAddress, setFarmAddress] = useState("");

  const [selectedLocation, setSelectedLocation] = useState({});
  const [query, setQuery] = useState("");
  const [pinState, setPinState] = useState(false)
  const [pin, setPin] = useState("")
  const [pinAvailable, setPinAvalable] = useState({})

  const autoCompleteRef = useRef(null);
  const googleMapsApiKey = "AIzaSyBF_aYE1ude5Qh1-SEoX1yMVAKz7Z46r7o";
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey,
    libraries
  });
  let autoComplete;
  const mapRef = React.useRef();

  const onMapLoad = React.useCallback((map) => {
    mapRef.current = map;
    mapRef.current.setZoom(20);
  }, []);
  const getAvailableIndex = async (id) => {
    let res = await callAPi(
      "get",
      `${URL}/data/getavailableindex/${id}`,
    );
    if (res.status) {
      setPinAvalable((res.data)[0])
    }
  }

  useEffect(() => {
    if (farmsct.length != 0) {

      const currentFarm = farmsct.find(farm => farm.id_esp == paramId)
      getAvailableIndex(paramId)
      setFarmSelected(currentFarm["name"])
    }
  }, [farmsct]);


  // useEffect(() => {
  //     if (farmAddress != "" && autoCompleteRef.current && farmNameRef.current && farmDescriptionRef.current) {
  //         farmNameRef.current.value = farmName
  //         farmDescriptionRef.current.value = farmDescription
  //         autoCompleteRef.current.value = farmAddress
  //     }
  // }, [farmAddress, farmName, farmDescription]);


  // useEffect(() => {
  //   if (equipmentName != "" && equipmentNameRef.current) {
  //     equipmentNameRef.current.value = equipmentName
  //   }
  // }, [equipmentName])


  useEffect(() => {
    if (Object.keys(currentFarm).length > 0) {
      setFarmName(currentFarm.name_esp_)
      setFarmDescription(currentFarm.description_)
      setFarmAddress(currentFarm.Address)
      if (currentFarm["latitude_"] != null && currentFarm["longtitude_"] != null) {
        setSelectedLocation({ lat: currentFarm["latitude_"], lng: currentFarm["longtitude_"] })
      }
      else setSelectedLocation({ lat: 10.8231, lng: 106.6297, })
    }
  }, [currentFarm]);

  useEffect(() => {
    if (Object.keys(currentDevice).length > 0) {
      setPin(currentDevice["_index"])
      setEquipmentName(currentDevice["name"])
    }
  }, [currentDevice])

  const handleScriptLoad = (updateQuery, autoCompleteRef) => {
    autoComplete = new window.google.maps.places.Autocomplete(
      autoCompleteRef.current,
      {
        componentRestrictions: { country: "VN" },
      }
    );


    autoComplete.addListener("place_changed", () => {

      handlePlaceSelect(updateQuery);

    });
  };

  if (loadError) return "Error loading maps";
  if (!isLoaded) return "Loading Maps...";

  const handlePlaceSelect = async (updateQuery) => {
    const addressObject = await autoComplete.getPlace();
    const query = addressObject.formatted_address;
    updateQuery(query);
    setFarmAddress(query);
    const latLng = {
      lat: addressObject?.geometry?.location?.lat(),
      lng: addressObject?.geometry?.location?.lng(),
    };
    setSelectedLocation(latLng);
  };

  const Focus = () => {
    handleScriptLoad(setQuery, autoCompleteRef)
  }

  const handleEditEquipmentClick = async () => {
    if (equipmentName != "") {
      const selectedFarm = farmsct.find(farm => farm.name == farmSeleted)
      let body = [
        currentDevice["id"],
        selectedFarm["id_esp"],
        equipmentName,
        parseInt(pin, 10)
      ];
      console.log(body)
      let res = await callAPi("post", `${URL}/data/editequipment`, body)
      if (!res.status) {
        alert("update fail")
      }
      else navigate(-1)
    }
    else toast.error("please enter name equipment");
  }
  const handleEditFarmClick = async () => {
    if (autoCompleteRef.current.value != "" && farmName != "" && farmDescription != "") {
      console.log(user.id_user_)
      let body = [
        paramId,
        farmName,
        farmDescription,
        selectedLocation.lat,
        selectedLocation.lng,
        autoCompleteRef.current.value
      ]
      let res = await callAPi("post", `${URL}/data/editfarm`, body)
      if (!res.status) {
        alert("update fail")
      }
      else navigate(-1)
    }
    else toast.error("please enter infomation");
  }


  return (
    <div className="Fac_Home">
      <BrowserView className="Fac_Home_Web" style={weatherState ? { paddingLeft: "15px" } : { paddingLeft: "0px" }}>
        <div className="Fac_Home_Web_Addfarmcontainer">

          <div className="Fac_Home_Web_Addfarmcontainer_Title">
            <MdArrowBackIosNew size={28} style={{ marginRight: "10px", paddingTop: "7px", cursor: "pointer" }} onClick={() => navigate(-1)} />
            {addDeviceState == "farm" ?
              <div style={{ width: "100%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                Chỉnh sửa bộ quản lí
              </div> :
              <div style={{ width: "100%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                Chỉnh sử thiết bị
              </div>
            }

          </div>
          {
            currentFarm != undefined && addDeviceState == "farm" ?
              <div className="Fac_Home_Web_Addfarmcontainer_Body" style={{ justifyContent: "space-between" }}>
                <div className="Fac_Home_Web_Addfarmcontainer_Body_Left">
                  <div className="Fac_Home_Web_Addfarmcontainer_Body_Left_Items">
                    Tên:
                    <input
                      id="myInput"
                      className="Fac_Home_Web_Addfarmcontainer_Body_Left_Items_Input"
                      maxLength="30"
                      value={farmName}
                      onChange={(e) => setFarmName(e.target.value)} ></input>
                  </div>
                  <div className="Fac_Home_Web_Addfarmcontainer_Body_Left_Items" style={{ marginTop: "15px" }} >
                    Địa chỉ:
                    <input
                      id="autocomplete"
                      maxLength="30"
                      className="Fac_Home_Web_Addfarmcontainer_Body_Left_Items_Input"
                      ref={autoCompleteRef}
                      value={farmAddress}
                      onChange={(e) => setFarmAddress(e.target.value)}
                      onFocus={Focus}>
                    </input>
                  </div>
                  <div className="Fac_Home_Web_Addfarmcontainer_Body_Left_Items" style={{ marginTop: "15px" }} >
                    Mô tả:
                    <textarea
                      maxLength="150"
                      className="Fac_Home_Web_Addfarmcontainer_Body_Left_Items_Input"
                      style={{ height: "100px", textAlign: "left" }}
                      value={farmDescription}
                      onChange={(e) => setFarmDescription(e.target.value)}></textarea>
                  </div>
                </div>
                <div className="Fac_Home_Web_Addfarmcontainer_Body_Right">
                  {Object.keys(selectedLocation).length > 0 ?
                    <div className="Fac_Home_Web_Addfarmcontainer_Body_Right_Map" >
                      <GoogleMap
                        mapContainerStyle={{
                          height: "320px",
                        }}
                        center={selectedLocation}
                        zoom={13}
                        onLoad={onMapLoad}
                      >
                        <MarkerF
                          position={selectedLocation}
                          icon={"http://maps.google.com/mapfiles/ms/icons/green-dot.png"}
                        />
                      </GoogleMap>
                    </div> : <></>
                  }
                  <div className="Fac_Home_Web_Addfarmcontainer_Body_Right_Buttons">
                    <button className="Fac_Home_Web_Addfarmcontainer_Body_Right_Buttons_Items" onClick={() => handleEditFarmClick()}>
                      <AiOutlinePlusCircle size={20} style={{ marginRight: "10px" }} />
                      Cập nhật
                    </button>
                  </div>
                </div>
              </div>
              :
              <div className="Fac_Home_Web_Addfarmcontainer_Body" style={{ justifyContent: "space-between" }}>
                <div className="Fac_Home_Web_Addfarmcontainer_Body_Left">
                  <div className="Fac_Home_Web_Addfarmcontainer_Body_Left_Items">
                    Tên thiết bị:
                    <input className="Fac_Home_Web_Addfarmcontainer_Body_Left_Items_Input" maxLength="30" 
                    value={equipmentName}
                    onChange={(e) => setEquipmentName(e.target.value)}   
                    ></input>
                  </div>
                  <div className="Fac_Home_Web_Addfarmcontainer_Body_Left_Index" onClick={() => { setPinState(!pinState) }}>
                    Chân:
                    <div className="Fac_Home_Web_Addfarmcontainer_Body_Left_Index_Selection">
                      {pin}
                      {pinState ? <div className="Fac_Home_Web_Addfarmcontainer_Body_Left_Index_Selection_Dropbox">
                        {Object.entries(pinAvailable).map(([key, value], index) => (
                          value ? (<div className="Items" onClick={() => setPin((index + 1).toString())} key={index}>
                            {index + 1}
                          </div>)


                            :
                            (<div className="Itemsdisable" key={index}>
                              {index + 1}
                            </div>)
                        ))}


                      </div> : <></>}

                    </div>

                  </div>
                </div>
                <div className="Fac_Home_Web_Addfarmcontainer_Body_Right">

                  <div className="Fac_Home_Web_Addfarmcontainer_Body_Right_Farmselection">
                    Bộ quản lí:
                    <div className="Fac_Home_Web_Addfarmcontainer_Body_Right_Farmselection_Input " onClick={() => setFarmSelectedState(!farmSeletedState)} style={{ cursor: "pointer" }}>
                      {farmSeleted}
                    </div>
                    {
                      farmSeletedState ?
                        <div className="Fac_Home_Web_Addfarmcontainer_Body_Right_Farmselection_Dropbox">

                          {farmsct != undefined && farmsct.map((item, index) => {
                            return (
                              <div className="Fac_Home_Web_Addfarmcontainer_Body_Right_Farmselection_Dropbox_Items" key={item.id_esp} onClick={() => { setFarmSelected(item.name); setFarmSelectedState(false) }}>
                                {item.name}
                              </div>
                            )
                          })
                          }
                        </div>
                        : <></>
                    }
                  </div>
                  <div className="Fac_Home_Web_Addfarmcontainer_Body_Right_Buttons">

                    <button className="Fac_Home_Web_Addfarmcontainer_Body_Right_Buttons_Items" onClick={() => handleEditEquipmentClick()}>
                      <AiOutlinePlusCircle size={20} style={{ marginRight: "10px" }} />
                      Cập nhật
                    </button>
                  </div>
                </div>
              </div>
          }
        </div>
      </BrowserView>
      <MobileView
        className="Fac_Home_Mobile"
        style={weatherState ? { paddingLeft: "0" } : { paddingLeft: "0px" }}
      >
        <div className="Fac_Home_Mobile_Editfarmcontainer">
          <div className="Fac_Home_Mobile_Editfarmcontainer_Title">
            <MdArrowBackIosNew
              size={28}
              style={{
                marginRight: "10px",
                paddingTop: "7px",
                cursor: "pointer",
              }}
              onClick={() => navigate(-1)}
            />
            {addDeviceState == "farm" ? (
              <div
                style={{
                  width: "100%",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                Edit farm
              </div>
            ) : (
              <div
                style={{
                  width: "100%",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                Edit equipment
              </div>
            )}
          </div>
          {currentFarm != undefined && addDeviceState == "farm" ? (
            <div
              className="Fac_Home_Mobile_Editfarmcontainer_Body"
              style={{ justifyContent: "space-between" }}
            >
              <div>
                <div className="Fac_Home_Mobile_Editfarmcontainer_Body_Left">
                  <div className="Fac_Home_Mobile_Editfarmcontainer_Body_Left_Items">
                    Name:
                    <input
                      className="Fac_Home_Mobile_Editfarmcontainer_Body_Left_Items_Input"
                      maxLength="30"
                      value={farmName}
                      onChange={(e) => setFarmName(e.target.value)}
                    ></input>
                  </div>
                  <div
                    className="Fac_Home_Mobile_Editfarmcontainer_Body_Left_Items"
                    style={{ marginTop: "15px" }}
                  >
                    Address:
                    <input
                      id="autocomplete"
                      maxLength="30"
                      className="Fac_Home_Mobile_Editfarmcontainer_Body_Left_Items_Input"
                      ref={autoCompleteRef}
                      value={farmAddress}
                      onChange={(e) => setFarmAddress(e.target.value)}
                      onFocus={Focus}
                    ></input>
                  </div>
                  <div
                    className="Fac_Home_Mobile_Editfarmcontainer_Body_Left_Items"
                    style={{ marginTop: "15px" }}
                  >
                    Description:
                    <textarea
                      maxLength="150"
                      className="Fac_Home_Mobile_Editfarmcontainer_Body_Left_Items_Input"
                      style={{ height: "100px", textAlign: "left" }}
                      value={farmDescription}
                      onChange={(e) => setFarmDescription(e.target.value)}
                    ></textarea>
                  </div>
                </div>
                <div className="Fac_Home_Mobile_Editfarmcontainer_Body_Right">
                  {Object.keys(selectedLocation).length > 0 ? (
                    <div className="Fac_Home_Mobile_Editfarmcontainer_Body_Right_Map">
                      <GoogleMap
                        mapContainerStyle={{
                          height: "320px",
                        }}
                        center={selectedLocation}
                        zoom={13}
                        onLoad={onMapLoad}
                      >
                        <MarkerF
                          position={selectedLocation}
                          icon={
                            "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                          }
                        />
                      </GoogleMap>
                    </div>
                  ) : (
                    <></>
                  )}

                  <div className="Fac_Home_Mobile_Editfarmcontainer_Body_Right_Buttons">
                    <button
                      className="Fac_Home_Mobile_Editfarmcontainer_Body_Right_Buttons_Items"
                      onClick={() => handleEditFarmClick()}
                    >
                      <AiOutlinePlusCircle
                        size={20}
                        style={{ marginRight: "10px" }}
                      />
                      Update farm
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="Fac_Home_Mobile_Editfarmcontainer_Body"
              style={{ justifyContent: "space-between" }}
            >
              <div className="Fac_Home_Mobile_Editfarmcontainer_Body_Left">
                <div className="Fac_Home_Mobile_Editfarmcontainer_Body_Left_Items">
                  Bump name:
                  <input
                    className="Fac_Home_Mobile_Editfarmcontainer_Body_Left_Items_Input"
                    maxLength="30"
                    value={equipmentName}
                    onChange={(e) => setEquipmentName(e.target.value)}                  
                    ></input>
                </div>
              </div>
              <div className="Fac_Home_Mobile_Editfarmcontainer_Body_Right">
                <div className="Fac_Home_Mobile_Editfarmcontainer_Body_Right_Farmselection">
                  Farm selection:
                  <div
                    className="Fac_Home_Mobile_Editfarmcontainer_Body_Right_Farmselection_Input "
                    onClick={() => setFarmSelectedState(!farmSeletedState)}
                    style={{ cursor: "pointer" }}
                  >
                    {farmSeleted}
                  </div>
                  {farmSeletedState ? (
                    <div className="Fac_Home_Mobile_Editfarmcontainer_Body_Right_Farmselection_Dropbox">
                      {farmsct != undefined &&
                        farmsct.map((item, index) => {
                          return (
                            <div
                              className="Fac_Home_Mobile_Editfarmcontainer_Body_Right_Farmselection_Dropbox_Items"
                              key={item.id_esp}
                              onClick={() => {
                                setFarmSelected(item.name);
                                setFarmSelectedState(false);
                              }}
                            >
                              {item.name}
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
                <div className="Fac_Home_Mobile_Editfarmcontainer_Body_Right_Buttons">
                  <button
                    className="Fac_Home_Mobile_Editfarmcontainer_Body_Right_Buttons_Items"
                    onClick={() => handleEditEquipmentClick()}
                  >
                    <AiOutlinePlusCircle
                      size={20}
                      style={{ marginRight: "10px" }}
                    />
                    Update equipment
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </MobileView>
    </div>
  )
}
export default EditFarm
import React,{useContext, useEffect, useRef, useState} from "react";
import { BrowserView, MobileView } from "react-device-detect";
import { IoIosAddCircleOutline } from "react-icons/io";
import { callAPi } from "../../services/UserService";
import { AuthContext } from "../Context/AuthContext";


import "./admin.scss"

const QrcodeView = () => {
    const { URL } = useContext(AuthContext);

    const [categoryOption,setCategoryDropboxOption] = useState(false);
    const [categoryDropboxItem,setCategoryDropboxItem] = useState("");

    const [deviceIDOption,setdeviceIDOption] = useState(false);
    const [devices,setDevice] = useState([]);
    const [deviceID,setDeviceID] = useState("");

    useEffect((event) => {
        const handleClick = (event) => {
            let clickedElement = event.target;
            // Kiểm tra component bị click bằng cách sử dụng className hoặc bất kỳ thuộc tính nào
            if (clickedElement.id !== "Category" && !clickedElement.classList.contains("Fac_Admin_Web_Manager_Qrcode_Body_Content_Left_DropboxHeader_Content") ) {
                // console.log("Category Option",categoryOption);
                if(categoryOption){
                    setCategoryDropboxOption(false);
                }
            }
            if(clickedElement.id !== "DeviceID" && !clickedElement.classList.contains("Fac_Admin_Web_Manager_Qrcode_Body_Content_Left_DropboxHeader_Content")){
                console.log(clickedElement);
                // console.log("deviceID Option",deviceIDOption);
                if(deviceIDOption){
                    setdeviceIDOption(false);
                }
            }

        };

        // Thêm sự kiện click cho document
        document.addEventListener('click', handleClick);

        // Cleanup sự kiện khi component unmount
        return () => {
            document.removeEventListener('click', handleClick);
        };
    },[categoryOption, deviceIDOption]);

    const dropboxItemContent = ["Esp","Equipment","Sensor"] 


    
    const [url,setUrl] = useState("");
    const prevUrl = useRef("");

    const handleCategoryOption=()=>{
        setCategoryDropboxOption(!categoryOption);
        console.log("Category Option",!categoryOption);
    }   
    const handleDeviceOption= async ()=>{
        if(categoryDropboxItem ===""){
            alert("Please choose category");
            return;
        }
        console.log(url);
        if(prevUrl.current !== url){
            let res = await callAPi("get",`${url}`);
            console.log("res");
            if(res.status === true){
                setDevice(res.data);
            }
            console.log(res.data); 
            prevUrl.current = url;
        }

        setdeviceIDOption(!deviceIDOption); 
        console.log("Device Option",!deviceIDOption);

    }

    const chooseCategoryDropboxItem = async (item = "")=>{
        setUrl(`${URL}/data/getavailable${item.toLowerCase()}`);
        setCategoryDropboxItem(item);
        handleCategoryOption();
    }

    return(
        <div className="Fac_Admin_Web_Manager">
            <BrowserView className="Fac_Admin_Web_Manager_Qrcode">
                <div className="Fac_Admin_Web_Manager_Qrcode_Header">
                    <div className="Fac_Admin_Web_Manager_Qrcode_Header_Title">
                        Create QR code
                    </div>
                </div>
                <div className="Fac_Admin_Web_Manager_Qrcode_Body">
                    <div className="Fac_Admin_Web_Manager_Qrcode_Body_Content">
                        <div className="Fac_Admin_Web_Manager_Qrcode_Body_Content_Left">
                                <p className="Text">Category</p>
                                <div className="Fac_Admin_Web_Manager_Qrcode_Body_Content_Left_DropboxHeader" id ="Category"
                                     onClick={()=>{handleCategoryOption()}}>
                                            <p className="Fac_Admin_Web_Manager_Qrcode_Body_Content_Left_DropboxHeader_Content">{categoryDropboxItem}</p>
                                </div>
                                {
                                    categoryOption ? (   
                                                        <div className="Dropbox">
                                                        {dropboxItemContent.map((item,index)=>(
                                                            <div className="Dropbox_Item" key={index} onClick={()=>{chooseCategoryDropboxItem(item)}}>{item}</div>
                                                        ))}
                                                        </div>
                                                    ): (<div></div>)
                                }

                                <p className="Text ">Device ID</p>
                                <div className="Fac_Admin_Web_Manager_Qrcode_Body_Content_Left_DropboxHeader" id="DeviceID"  onClick={()=>{handleDeviceOption()}}>
                                    <p className="Fac_Admin_Web_Manager_Qrcode_Body_Content_Left_DropboxHeader_Content">{deviceID}</p>
                                </div>
                                {
                                    deviceIDOption ? (   
                                                        <div className="Dropbox">
                                                            {devices.map((item,index)=>(
                                                                <div className="Dropbox_Item" key={index} onClick={()=>{setDeviceID(item['id'])}}>{item['id']}</div>
                                                            ))}
                                                        </div>
                                                    ): (<div></div>)
                                    
                                }
                                {

                                }
                                <div className="Button">
                                    <IoIosAddCircleOutline className="Icon"/>
                                    <p>Generate QR Code</p>
                                </div>
                            </div> 
                        <div className="Fac_Admin_Web_Manager_Qrcode_Body_Content_Right"/>
                    </div>
                </div>
            </BrowserView>
        </div>
    )
}

export default QrcodeView
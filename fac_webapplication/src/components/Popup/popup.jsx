import { useState,useEffect } from "react";
import React from "react";
import './popup.scss'
import { IoClose } from "react-icons/io5";




export const Popup = ({message,onClose}) => {
    
    return(
        <div className="Popup_Container">
            <div className="Popup_Container_MessageBox">
                <div className="Popup_Container_MessageBox_Icon">
                    <div className="Popup_Container_MessageBox_Icon_Close" onClick={onClose} >
                        <IoClose color="black" size={30} />
                    </div>
                </div>
                <div className="Popup_Container_MessageBox_Message">
                    {message}
                </div>
            </div>
        </div>
    )
}
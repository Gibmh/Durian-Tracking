import React,{useContext, useEffect, useState} from "react";
import { BrowserView, MobileView } from "react-device-detect";
import { FiPlusCircle } from "react-icons/fi";
import { DataTable } from "react-table"

export const EspView = () => {
    const columns = [
        "Name",
        "Aage",
        "Email",

    ]

    const data = [
        {
            name: 'John',
            age: 30,
            email: 'fX5K1@example.com',
        },
        {
            name: 'John',
            age: 30,
            email: 'fX5K1@example.com',
        },
        {
            name: 'John',
            age: 30,
            email: 'fX5K1@example.com',
        },
        {
            name: 'John',
            age: 30,
            email: 'fX5K1@example.com',
        },
        {
            name: 'John',
            age: 30,
            email: 'fX5K1@example.com',
        },
        {
            name: 'John',
            age: 30,
            email: 'fX5K1@example.com',
        },
        {
            name: 'John',
            age: 30,
            email: 'fX5K1@example.com',
        },
        {
            name: 'John',
            age: 30,
            email: 'fX5K1@example.com',
        },
        {
            name: 'John',
            age: 30,
            email: 'fX5K1@example.com',
        },
        {
            name: 'John',
            age: 30,
            email: 'fX5K1@example.com',
        },
        {
            name: 'John',
            age: 30,
            email: 'fX5K1@example.com',
        },
        {
            name: 'John',
            age: 30,
            email: 'fX5K1@example.com',
        },
        {
            name: 'John',
            age: 30,
            email: 'fX5K1@example.com',
        },
        {
            name: 'John',
            age: 30,
            email: 'fX5K1@example.com',
        },
        {
            name: 'John',
            age: 30,
            email: 'fX5K1@example.com',
        },
        {
            name: 'John',
            age: 30,
            email: 'fX5K1@example.com',
        },
        {
            name: 'John',
            age: 30,
            email: 'fX5K1@example.com',
        },
        {
            name: 'John',
            age: 30,
            email: 'fX5K1@example.com',
        },
        {
            name: 'John',
            age: 30,
            email: 'fX5K1@example.com',
        },
    ]


    return(
        <div className="Fac_Admin_Web_Manager">
            <BrowserView className="Fac_Admin_Web_Manager_Esp">
                <div className="Fac_Admin_Web_Manager_Esp_Header">
                    <div className="Fac_Admin_Web_Manager_Esp_Header_Left">
                        <div className="Fac_Admin_Web_Manager_Esp_Header_Left_Title">Esp</div>
                    </div>
                    <div className="Fac_Admin_Web_Manager_Esp_Header_Center">
                        <input type="text" className="Fac_Admin_Web_Manager_Esp_Header_Center_Search" spellCheck="false" placeholder="Search..."/>
                        <div className="Fac_Admin_Web_Manager_Esp_Header_Center_NewFarm" >
                            <div className="Fac_Admin_Web_Manager_Esp_Header_Center_NewFarm_Button">
                                <FiPlusCircle className="Icon" />
                                <div className="Content">{data.length}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="Fac_Admin_Web_Manager_Esp_Body">
                   <div className="Fac_Admin_Web_Manager_Esp_Body_Table">
                            <div className="Fac_Admin_Web_Manager_Esp_Body_Table_Header" >
                                {columns.map((column,index)=>{
                                    return(
                                        <div className="Fac_Admin_Web_Manager_Esp_Body_Table_Header_Item" key={index}>{column}</div>
                                    )
                                })}
                            </div>
                            <div className="Fac_Admin_Web_Manager_Esp_Body_Table_Data">
                                {
                                    data.map((item,index)=>{
                                        return(
                                            <div className="Fac_Admin_Web_Manager_Esp_Body_Table_Data_Row" key={index}>
                                                <div className="Fac_Admin_Web_Manager_Esp_Body_Table_Data_Row_Item"><div>{item.name}</div></div>
                                                <div className="Fac_Admin_Web_Manager_Esp_Body_Table_Data_Row_Item"><div>{item.age}</div></div>
                                                <div className="Fac_Admin_Web_Manager_Esp_Body_Table_Data_Row_Item"><div>{item.email}</div></div>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                   </div>
                </div>
            </BrowserView>
        </div>
    )
}
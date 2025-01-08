import { BrowserView, MobileView } from "react-device-detect";
import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiPhone,
  FiUser,
} from "react-icons/fi";
import "./Auth.scss";
//
import { signUpPassword, checkUserName, checkEmail } from "../../validation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
//
import { AuthContext } from "../Context/AuthContext";
import { callAPi, fetchOneUser } from "../../services/UserService";
import { BiPhone } from "react-icons/bi";
const Signup = () => {
  const { URL, login, user, authDispatch } = useContext(AuthContext);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const handleOpenEye = () => {
    setOpen(!open);
  };
  const [open1, setOpen1] = useState(false);
  const handleOpenEye1 = () => {
    setOpen1(!open1);
  };
  //
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");

  const [usernameErr, setUsernameErr] = useState("");
  const [emailErr, setEmailErr] = useState("");
  const [phoneErr, setPhoneErr] = useState("");
  const [passwordErr, setPasswordErr] = useState("");
  const [rePasswordErr, setRePasswordErr] = useState("");

  const handleChangeUsername = (e) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
  };
  const validateUsername = (username) => {
    if (username.trim() === "") {
      setUsernameErr("Vui lòng nhập tên đăng nhập");
      return false;
    } else {
      setUsernameErr("");
      return true;
    }
  };
  const handleChangeEmail = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
  };
  const validatePhone = (phone) => {
    if (phone.trim() === "") {
      setPhoneErr("Vui lòng nhập số điện thoại");
      return false;
    } else {
      setPhoneErr("");
      return true;
    }
  };
  const handleChangePhone = (e) => {
    const newPhone = e.target.value;
    setPhone(newPhone);
  };
  const validateEmail = (email) => {
    if (email.trim() === "") {
      setEmailErr("Vui lòng nhập email");
      return false;
    } else if (!checkEmail(email)) {
      setEmailErr("Vui lòng nhập đúng định dạng email");
      return false;
    } else {
      setEmailErr("");
      return true;
    }
  };

  const handleChangePassword = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
  };
  const validatePassword = (password) => {
    if (password.trim() === "") {
      setPasswordErr("Vui lòng nhập mật khẩu");
      return false;
    } else {
      setPasswordErr("");
      return true;
    }
  };
  const handleChangeRePassword = (e) => {
    const newRePassword = e.target.value;
    setRePassword(newRePassword);
  };
  const validateRePassword = (password, rePassword) => {
    if (rePassword.trim() === "") {
      setRePasswordErr("Vui lòng xác nhận mật khẩu");
      return false;
    } else if (password !== rePassword) {
      setRePasswordErr("Vui lòng xác nhận đúng mật khẩu");
      return false;
    } else {
      setRePasswordErr("");
      return true;
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const isUsernameValid = validateUsername(username);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isRePasswordValid = validateRePassword(password, rePassword);
    const isPhoneValid = validatePhone(phone);
    if (
      isUsernameValid &&
      isEmailValid &&
      isPasswordValid &&
      isRePasswordValid &&
      isPhoneValid
    ) {
      setUsernameErr("");
      setEmailErr("");
      setPhoneErr("");
      setPasswordErr("");
      setRePasswordErr("");
      const checkApi = async () => {
        let body = {
          name: username,
          password: password,
          gmail: email,
          phone_no: phone,
          membership: "basic",
        };

        let res = await callAPi("post", `${URL}/auth/createUser`, body);
        console.log(res.data);
        if (res.data === 1) {
          // alert("dang ky thanh cong ");
          navigate("/login");
        } else {
          // alert("dang ky khong thanh cong ");
        }
      };
      checkApi();
    }
  };
  return (
    <div className="Auth">
      <BrowserView className="Auth_BrowserView">
        <div
          className="Auth_BrowserView_Container"
          style={{ marginTop: "100px" }}
        >
          <form
            onSubmit={handleSubmit}
            className="Auth_BrowserView_Container_Form"
          >
            <div className="Auth_BrowserView_Container_Form_Header">
              <div>Đăng ký</div>
            </div>
            <div className="Auth_BrowserView_Container_Form_Body">
              <div className="Auth_BrowserView_Container_Form_Body_Item">
                <div
                  className={`Auth_BrowserView_Container_Form_Body_Item_Content ${
                    usernameErr ? "Error" : ""
                  }`}
                >
                  <div className="Auth_BrowserView_Container_Form_Body_Item_Content_Input">
                    <input
                      id="username"
                      type="text"
                      placeholder="Tên tài khoản"
                      onChange={handleChangeUsername}
                    />
                  </div>
                  <div className="Auth_BrowserView_Container_Form_Body_Item_Content_Icon">
                    <FiUser color={usernameErr ? "red" : "white"} size={24} />
                  </div>
                </div>
                <div className="Auth_BrowserView_Container_Form_Body_Item_Validate">
                  {usernameErr}
                </div>
              </div>
              <div className="Auth_BrowserView_Container_Form_Body_Item">
                <div
                  className={`Auth_BrowserView_Container_Form_Body_Item_Content ${
                    emailErr ? "Error" : ""
                  }`}
                >
                  <div className="Auth_BrowserView_Container_Form_Body_Item_Content_Input">
                    <input
                      id="email"
                      type="email"
                      placeholder="Email"
                      onChange={handleChangeEmail}
                    />
                  </div>
                  <div className="Auth_BrowserView_Container_Form_Body_Item_Content_Icon">
                    <FiMail color={emailErr ? "red" : "white"} size={24} />
                  </div>
                </div>
                <div className="Auth_BrowserView_Container_Form_Body_Item_Validate">
                  {emailErr}
                </div>
              </div>
              <div className="Auth_BrowserView_Container_Form_Body_Item">
                <div
                  className={`Auth_BrowserView_Container_Form_Body_Item_Content ${
                    phoneErr ? "Error" : ""
                  }`}
                >
                  <div className="Auth_BrowserView_Container_Form_Body_Item_Content_Input">
                    <input
                      id="phone"
                      type="text"
                      placeholder="Số điện thoại"
                      onChange={handleChangePhone}
                    />
                  </div>
                  <div className="Auth_BrowserView_Container_Form_Body_Item_Content_Icon">
                    <FiPhone color={phoneErr ? "red" : "white"} size={24} />
                  </div>
                </div>
                <div className="Auth_BrowserView_Container_Form_Body_Item_Validate">
                  {phoneErr}
                </div>
              </div>
              <div className="Auth_BrowserView_Container_Form_Body_Item">
                <div
                  className={`Auth_BrowserView_Container_Form_Body_Item_Content ${
                    passwordErr ? "Error" : ""
                  }`}
                >
                  <div className="Auth_BrowserView_Container_Form_Body_Item_Content_Input">
                    <input
                      id="password"
                      type={open ? "text" : "password"}
                      placeholder="Mật khẩu"
                      onChange={handleChangePassword}
                    />
                  </div>
                  <div
                    onClick={() => handleOpenEye()}
                    className="Auth_BrowserView_Container_Form_Body_Item_Content_IconEye"
                  >
                    {open ? <FiEye size={18} /> : <FiEyeOff size={18} />}
                  </div>
                  <div className="Auth_BrowserView_Container_Form_Body_Item_Content_Icon">
                    <FiLock color={passwordErr ? "red" : "white"} size={24} />
                  </div>
                </div>
                <div className="Auth_BrowserView_Container_Form_Body_Item_Validate">
                  {passwordErr}
                </div>
              </div>
              <div className="Auth_BrowserView_Container_Form_Body_Item">
                <div
                  className={`Auth_BrowserView_Container_Form_Body_Item_Content ${
                    rePasswordErr ? "Error" : ""
                  }`}
                >
                  <div className="Auth_BrowserView_Container_Form_Body_Item_Content_Input">
                    <input
                      id="confirm_password"
                      type={open1 ? "text" : "password"}
                      placeholder="Xác nhận mật khẩu"
                      onChange={handleChangeRePassword}
                    />
                  </div>
                  <div
                    onClick={() => handleOpenEye1()}
                    className="Auth_BrowserView_Container_Form_Body_Item_Content_IconEye"
                  >
                    {open1 ? <FiEye size={18} /> : <FiEyeOff size={18} />}
                  </div>
                  <div className="Auth_BrowserView_Container_Form_Body_Item_Content_Icon">
                    <FiLock color={rePasswordErr ? "red" : "white"} size={24} />
                  </div>
                </div>
                <div className="Auth_BrowserView_Container_Form_Body_Item_Validate">
                  {rePasswordErr}
                </div>
              </div>
            </div>
            <div className="Auth_BrowserView_Container_Form_Footer">
              <button type="submit">Đăng ký</button>

              <div className="Auth_BrowserView_Container_Form_Footer_Choice">
                <div onClick={() => navigate("/login")}>
                  Bạn đã có tài khoản?
                </div>
                <div onClick={() => navigate("/login")}>Đăng nhập</div>
              </div>
            </div>
          </form>
        </div>
      </BrowserView>

      <MobileView className="Auth_MobileView">
        <div>
          <div>
            <div className="Auth_MobileView_Title">
              <h1>Chào mừng bạn</h1>
              <p>Đăng nhập vào tài khoản của bạn</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="Auth_MobileView_Container">
            <div className="Auth_MobileView_Container_Form">
              <div className="Auth_MobileView_Container_Form_Body">
                <div className="Auth_MobileView_Container_Form_Body_Item">
                  <div
                    className={`Auth_MobileView_Container_Form_Body_Item_Content ${
                      usernameErr ? "Error" : ""
                    }`}
                  >
                    <div className="Auth_MobileView_Container_Form_Body_Item_Content_Input">
                      <div className="Auth_MobileView_Container_Form_Body_Item_Content_Icon">
                        <FiUser
                          color={usernameErr ? "red" : "black"}
                          size={24}
                        />
                      </div>
                      <input
                        id="username"
                        type="text"
                        placeholder="Tên tài khoản"
                        onChange={handleChangeUsername}
                      />
                    </div>
                  </div>
                  <div className="Auth_MobileView_Container_Form_Body_Item_Validate">
                    {usernameErr}
                  </div>
                </div>
                <div className="Auth_MobileView_Container_Form_Body_Item">
                  <div
                    className={`Auth_MobileView_Container_Form_Body_Item_Content ${
                      emailErr ? "Error" : ""
                    }`}
                  >
                    <div className="Auth_MobileView_Container_Form_Body_Item_Content_Input">
                      <div className="Auth_MobileView_Container_Form_Body_Item_Content_Icon">
                        <FiMail color={emailErr ? "red" : "black"} size={24} />
                      </div>
                      <input
                        id="email"
                        type="email"
                        placeholder="Email"
                        onChange={handleChangeEmail}
                      />
                    </div>
                  </div>
                  <div className="Auth_MobileView_Container_Form_Body_Item_Validate">
                    {emailErr}
                  </div>
                </div>
                <div className="Auth_MobileView_Container_Form_Body_Item">
                  <div
                    className={`Auth_MobileView_Container_Form_Body_Item_Content ${
                      phoneErr ? "Error" : ""
                    }`}
                  >
                    <div className="Auth_MobileView_Container_Form_Body_Item_Content_Input">
                      <div className="Auth_MobileView_Container_Form_Body_Item_Content_Icon">
                        <FiPhone color={phoneErr ? "red" : "black"} size={24} />
                      </div>
                      <input
                        id="phone"
                        type="text"
                        placeholder="Số điện thoại"
                        onChange={handleChangePhone}
                      />
                    </div>
                  </div>
                  <div className="Auth_MobileView_Container_Form_Body_Item_Validate">
                    {phoneErr}
                  </div>
                </div>
                <div className="Auth_MobileView_Container_Form_Body_Item">
                  <div
                    className={`Auth_MobileView_Container_Form_Body_Item_Content ${
                      passwordErr ? "Error" : ""
                    }`}
                  >
                    <div className="Auth_MobileView_Container_Form_Body_Item_Content_Input">
                      <div className="Auth_MobileView_Container_Form_Body_Item_Content_Icon">
                        <FiLock
                          color={passwordErr ? "red" : "black"}
                          size={24}
                        />
                      </div>
                      <input
                        id="password"
                        type={open ? "text" : "password"}
                        placeholder="Mật khẩu"
                        onChange={handleChangePassword}
                      />
                    </div>
                    <div
                      onClick={() => handleOpenEye()}
                      className="Auth_MobileView_Container_Form_Body_Item_Content_IconEye"
                    >
                      {open ? <FiEye size={18} /> : <FiEyeOff size={18} />}
                    </div>
                  </div>
                  <div className="Auth_MobileView_Container_Form_Body_Item_Validate">
                    {passwordErr}
                  </div>
                </div>

                <div className="Auth_MobileView_Container_Form_Body_Item">
                  <div
                    className={`Auth_MobileView_Container_Form_Body_Item_Content ${
                      rePasswordErr ? "Error" : ""
                    }`}
                  >
                    <div className="Auth_MobileView_Container_Form_Body_Item_Content_Input">
                      <div className="Auth_MobileView_Container_Form_Body_Item_Content_Icon">
                        <FiLock
                          color={rePasswordErr ? "red" : "black"}
                          size={24}
                        />
                      </div>
                      <input
                        id="confirm_password"
                        type={open1 ? "text" : "password"}
                        placeholder="Xác nhận mật khẩu"
                        onChange={handleChangeRePassword}
                      />
                    </div>
                    <div
                      onClick={() => handleOpenEye1()}
                      className="Auth_MobileView_Container_Form_Body_Item_Content_IconEye"
                    >
                      {open1 ? <FiEye size={18} /> : <FiEyeOff size={18} />}
                    </div>
                  </div>
                  <div className="Auth_MobileView_Container_Form_Body_Item_Validate">
                    {rePasswordErr}
                  </div>
                </div>



              </div>
              <div className="Auth_MobileView_Container_Form_Footer">
                <button type="submit">Đăng ký</button>

                <div className="Auth_MobileView_Container_Form_Footer_Choice">
                  <div onClick={() => navigate("/login")}>
                    Bạn đã có tài khoản?
                  </div>
                  <div onClick={() => navigate("/login")}>Đăng nhập</div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </MobileView>
    </div>
  );
};

export default Signup;

import { BrowserView, MobileView } from "react-device-detect";
import { useNavigate } from "react-router-dom";
import React, { useContext, useState } from "react";
import { FiMail } from "react-icons/fi";
import "./Auth.scss";
//
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
//
import { callAPi } from "../../services/UserService";
//
import { checkEmail, checkOTP } from "../../validation";
import { CiBarcode } from "react-icons/ci";
//
import { AuthContext } from "../Context/AuthContext";
const ForgotPassw = () => {
  const { URL, login, user, authDispatch } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOTP] = useState("");
  const [errorEmail, setErrorEmail] = useState("");
  const [errorOtp, setErrorOtp] = useState("");

  const validateEmail = (email) => {
    if (email.trim() === "") {
      setErrorEmail("Vui lòng nhập email");
      return false;
    } else if (!checkEmail(email)) {
      setErrorEmail("Vui được nhập đúng định dạng email");
      return false;
    } else {
      setErrorEmail("");
      return true;
    }
  };
  const validateOtp = (otp) => {
    if (otp.trim() === "") {
      setErrorOtp("Vui lòng nhập OTP");
      return false;
    } else if (!checkOTP(otp)) {
      setErrorOtp("Vui lòng nhập OTP có 6 số");
      return false;
    } else {
      setErrorOtp("");
      return true;
    }
  };
  const handleChangEmail = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
  };
  const handleChangOTP = (e) => {
    const newOTP = e.target.value;
    setOTP(newOTP);
  };
  const handleSendOtp = async (e) => {
    e.preventDefault();
    const isEmailValid = validateEmail(email);
    if (isEmailValid) {
      setErrorEmail("");
      const checkApi = async () => {
        let res = await callAPi("post", `${URL}/auth/request-otp`, {
          email: email,
        });
        if (res.status) {
          toast.success(res.message);
        } else {
          toast.error(res.message);
        }
      };
      checkApi();
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEmailValid = validateEmail(email);
    const isOTPValid = validateOtp(otp);
    if (isEmailValid && isOTPValid) {
      setErrorOtp("");
      setErrorEmail("");
      console.log(email);
      console.log(otp);
      const checkApi = async () => {
        let res = await callAPi("post", `${URL}/auth/verify-otp`, {
          email: email,
          otp: otp,
        });

        console.log(res);
        if (res.status) {
          navigate("/newpassw", { state: { email: email } });
        } else {
          toast.error(res.message);
        }
      };
      checkApi();
    }
  };
  return (
    <div className="Auth">
      <BrowserView className="Auth_BrowserView">
        <form className="Auth_BrowserView_Container" onSubmit={handleSubmit}>
          <div className="Auth_BrowserView_Container_Form">
            <div className="Auth_BrowserView_Container_Form_Header">
              <div>Quên mật khẩu </div>
            </div>
            <div className="Auth_BrowserView_Container_Form_Body">
              <div className="Auth_BrowserView_Container_Form_Body_Item">
                <div
                  className={`Auth_BrowserView_Container_Form_Body_Item_Content ${
                    errorEmail ? "Error" : ""
                  }`}
                >
                  <div className="Auth_BrowserView_Container_Form_Body_Item_Content_Input">
                    <input
                      type="text"
                      placeholder="Nhập Email"
                      value={email}
                      onChange={handleChangEmail}
                    />
                  </div>
                  <div className="Auth_BrowserView_Container_Form_Body_Item_Content_Icon">
                    <FiMail color={errorEmail ? "red" : "white"} size={24} />
                  </div>
                </div>
                <div className="Auth_BrowserView_Container_Form_Body_Item_Validate">
                  {errorEmail}
                </div>
              </div>
              <div className="Auth_BrowserView_Container_Form_Body_Item">
                <div
                  className={`Auth_BrowserView_Container_Form_Body_Item_Content ${
                    errorOtp ? "Error" : ""
                  }`}
                >
                  <div className="Auth_BrowserView_Container_Form_Body_Item_Content_Input">
                    <input
                      type="text"
                      placeholder="Nhập mã OTP"
                      value={otp}
                      onChange={handleChangOTP}
                    />
                  </div>
                  <div className="Auth_BrowserView_Container_Form_Body_Item_Content_Icon">
                    <CiBarcode color={errorOtp ? "red" : "white"} size={24} />
                  </div>
                </div>
                <div className="Auth_BrowserView_Container_Form_Body_Item_Validate">
                  {errorOtp}
                </div>
              </div>
              <div className="Auth_BrowserView_Container_Form_Body_Item">
                <div
                  onClick={handleSendOtp}
                  className="Auth_BrowserView_Container_Form_Body_Item_OTP"
                >
                  <p>Gửi mã OTP</p>
                </div>
              </div>
            </div>
            <div className="Auth_BrowserView_Container_Form_Footer">
              <button type="submit">Xác nhận</button>
              <div className="Auth_BrowserView_Container_Form_Footer_Choice">
                <div onClick={() => navigate("/login")}>
                  Quay lại trang đăng nhập?
                </div>
                <div onClick={() => navigate("/login")}>Đăng nhập</div>
              </div>
            </div>
          </div>
        </form>
      </BrowserView>

      <MobileView className="Auth_MobileView">
        <div>
          <div>
            <div className="Auth_MobileView_Title">
              <h1>Quên mật khẩu</h1>
              <p>Đặt lại mật khẩu</p>
            </div>
          </div>
          <form className="Auth_MobileView_Container" onSubmit={handleSubmit}>
            <div className="Auth_MobileView_Container_Form">
              <div className="Auth_MobileView_Container_Form_Body">
                <div className="Auth_MobileView_Container_Form_Body_Item">
                  <div
                    className={`Auth_MobileView_Container_Form_Body_Item_Content ${
                      errorEmail ? "Error" : ""
                    }`}
                  >
                    <div className="Auth_MobileView_Container_Form_Body_Item_Content_Input">
                      <input
                        type="text"
                        placeholder="Nhập Email"
                        value={email}
                        onChange={handleChangEmail}
                      />
                    </div>
                    <div className="Auth_MobileView_Container_Form_Body_Item_Content_Icon">
                      <FiMail color={errorEmail ? "red" : "white"} size={24} />
                    </div>
                  </div>
                  <div className="Auth_MobileView_Container_Form_Body_Item_Validate">
                    {errorEmail}
                  </div>
                </div>
                <div className="Auth_MobileView_Container_Form_Body_Item">
                  <div
                    className={`Auth_MobileView_Container_Form_Body_Item_Content ${
                      errorOtp ? "Error" : ""
                    }`}
                  >
                    <div className="Auth_MobileView_Container_Form_Body_Item_Content_Input">
                      <input
                        type="text"
                        placeholder="Nhập mã OTP"
                        value={otp}
                        onChange={handleChangOTP}
                      />
                    </div>
                    <div className="Auth_MobileView_Container_Form_Body_Item_Content_Icon">
                      <CiBarcode color={errorOtp ? "red" : "white"} size={24} />
                    </div>
                  </div>
                  <div className="Auth_MobileView_Container_Form_Body_Item_Validate">
                    {errorOtp}
                  </div>
                </div>
                <div className="Auth_MobileView_Container_Form_Body_Item">
                  <div
                    onClick={handleSendOtp}
                    className="Auth_MobileView_Container_Form_Body_Item_OTP"
                  >
                    <p>Gửi mã OTP</p>
                  </div>
                </div>
              </div>
              <div className="Auth_MobileView_Container_Form_Footer">
                <button type="submit">Xác nhận</button>
                <div className="Auth_MobileView_Container_Form_Footer_Choice">
                  <div onClick={() => navigate("/login")}>
                    Quay lại trang đăng nhập?
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

export default ForgotPassw;

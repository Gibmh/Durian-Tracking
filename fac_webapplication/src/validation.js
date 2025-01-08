const checkUserName = (name) => name.length >= 7;

const checkPassword = (password) => password.length >= 6;

const loginUserName = (loginName, dataName) => {
  return loginName === dataName;
};

const loginPassword = (loginPassword, dataPassword) => {
  return loginPassword === dataPassword;
};

const signUpPassword = (signUpPassword, dataPassword) => {
  return signUpPassword === dataPassword; 
}

const checkOTP = (otp) => otp.length === 6;

const checkEmail = (email) => {
  const reg =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return reg.test(String(email).toLowerCase());
};

const checkPhone = (phone) => {
  const reg = /^\d{10}$/;
  return reg.test(String(phone).toLowerCase());
};

export {signUpPassword, checkUserName, checkPassword, checkEmail, checkOTP, checkPhone, loginUserName, loginPassword };

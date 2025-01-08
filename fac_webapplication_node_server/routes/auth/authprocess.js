require("dotenv").config();
const jwt = require("jsonwebtoken");
const db = require("../../models/mysql");

const EMAIL_ACCOUNT = process.env.EMAIL_ACCOUNT;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const SECRET_KEY = process.env.SECRET_KEY;
const nodemailer = require("nodemailer");
const otpStore = {};

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.hoasen.edu.vn",
  port: 465,
  secure: true,
  auth: {
    user: EMAIL_ACCOUNT,
    pass: EMAIL_PASSWORD,
  },
});
const storeOtp = (email, otp) => {
  const currentTime = Date.now();
  otpStore[email] = { otp, time: currentTime, used: false }; // Ghi đè OTP cũ nếu email đã tồn tại

  // Xóa OTP sau 5 phút (300000 ms)
  setTimeout(() => {
    if (otpStore[email] && otpStore[email].time === currentTime) {
      delete otpStore[email];
    }
  }, 300000);
};
const requestOTP = async (email) => {
  console.log(email);
  const otp = generateOTP();
  storeOtp(email, otp);
  let res = await db.SELECT("*", "get_user_by_gmail('" + email + "')");
  let status = res.recordset[0].status_;
  let username = res.recordset[0].name_;
  const emailContent = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
    <h2 style="color: #333333; text-align: center; border-bottom: 2px solid #eaeaea; padding-bottom: 10px;">
        Xác Minh OTP FAC
    </h2>
    <p style="font-size: 16px; color: #555555;">
        Có vẻ như bạn đã quên mật khẩu tại <span style="color: #007bff; font-weight: bold;">FAC - Nông trại thông minh</span> và đang cố gắng xác minh email của mình.
    </p>
    <p style="font-size: 16px; color: #555555;">Đây là mã xác minh. Vui lòng sao chép và xác minh email của bạn. Mã OTP này sẽ tồn tại trong 5 phút.</p>
    <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0;">
        <h3 style="color: #ff6f61; margin: 0;">Mã Xác Minh</h3>
        <h1 style="font-size: 36px; color: #333333; margin: 10px 0;">${otp}</h1>
        <h3 style="color: #555555; margin: 0;">Tên Người Dùng</h3>
        <h2 style="font-size: 24px; color: #007bff; margin: 10px 0;">${username}</h2>
    </div>
    <p style="font-size: 14px; color: #999999;">Nếu email này không dành cho bạn, vui lòng bỏ qua và xóa nó. Cảm ơn bạn đã thông cảm.</p>
    <footer style="font-size: 12px; color: #888888; text-align: center; border-top: 1px solid #eaeaea; padding-top: 10px; margin-top: 20px;">
        <p style="margin: 5px 0;">FAC - Nông trại thông minh</p>
        <p style="margin: 5px 0;">Địa chỉ: Số 123, Đường ABC, Quận 1, TP.HCM</p>
        <p style="margin: 5px 0;">Hotline: 0123 456 789</p>
        <p style="margin: 5px 0;">Email: support@fac.com</p>
        <p style="margin: 5px 0;">© 2023 FAC. All rights reserved.</p>
    </footer>
</div>
        `;
  const mailOptions = {
    from: EMAIL_ACCOUNT,
    to: email,
    subject: "OTP Verification",
    html: emailContent,
  };
  return new Promise(async (resolve, reject) => {
    console.log();
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        resolve({
          status: false,
          error,
          message: `OTP has not been sent to your ${email}`,
        });
      } else {
        if (status === 200) {
          resolve({
            status: true,
            message: "OTP đã được gửi cho email của bạn",
          });
        } else {
          resolve({ status: false, message: "Email này chưa được đăng ký" });
        }
      }
    });
  });
};

const validateOTP = async (email, otp) => {
  return new Promise(async (resolve, reject) => {
    try {
      const otpData = await getOtpData(email);

      if (!otpData) {
        resolve({ status: false, message: "OTP not found" });
        return;
      }

      if (otpData.used) {
        resolve({ status: false, message: "OTP has already been used" });
        return;
      }

      const currentTime = Date.now();
      const otpAge = (currentTime - otpData.time) / 1000 / 60; // Tính tuổi của OTP tính bằng phút

      if (otpAge > 5) {
        await deleteOtpData(email); // Xóa OTP đã hết hạn
        resolve({ status: false, message: "OTP has expired" });
        return;
      }

      if (otpData.otp === otp) {
        await markOtpAsUsed(email); // Đánh dấu OTP đã được sử dụng
        resolve({ status: true, message: "OTP is valid" });
      } else {
        resolve({ status: false, message: "Invalid OTP" });
      }
    } catch (error) {
      resolve({ status: false, code: 255, message: "Error System" });
    }
  });
};
// Giả định các hàm này là bất đồng bộ và sử dụng await khi gọi chúng
const getOtpData = async (email) => {
  // Thực hiện truy xuất otpData từ otpStore
  return otpStore[email];
};

const deleteOtpData = async (email) => {
  // Thực hiện xóa otpData khỏi otpStore
  delete otpStore[email];
};

const markOtpAsUsed = async (email) => {
  // Đánh dấu otpData là đã sử dụng
  if (otpStore[email]) {
    otpStore[email].used = true;
  }
};
const getUserByID = async (usr) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await db.SELECT("*", "get_user_by_id('" + usr + "')");
      resolve({ status: true, data: res.recordsets[0] });
    } catch (error) {
      // reject(error);
      resolve({ status: false, code: 255, message: "Error System" });
    }
  });
};

const checkValidUser = async (name, pass) => {
  return new Promise(async (resolve, reject) => {
    content = {
      name: name,
      pass: pass,
    };
    let asscessToken = jwt.sign(content, SECRET_KEY, { expiresIn: "24h" });

    try {
      let res = await db.SELECT(
        "*",
        "check_valid_user('" + name + "', '" + pass + "')"
      );
      if (res.recordsets[0].length > 0) {
        delete res.recordsets[0][0].password;
      }
      console.log(res);
      resolve({ status: true, data: res.recordsets[0], asscessToken });
    } catch (error) {
      // reject(error);
      resolve({ status: false, code: 255, message: "Error System" });
    }
  });
};
const LoginWhenIsToken = async (name, pass) => {
  return new Promise(async (resolve, reject) => {
    content = {
      name: name,
      pass: pass,
    };
    try {
      let res = await db.SELECT(
        "*",
        "check_valid_user('" + name + "', '" + pass + "')"
      );
      if (res.recordsets[0].length > 0) {
        delete res.recordsets[0][0].password;
      }
      console.log(res);
      resolve({ status: true, data: res.recordsets[0] });
    } catch (error) {
      // reject(error);
      resolve({ status: false, code: 255, message: "Error System" });
    }
  });
};

function verifyToken(token) {
  return new Promise((resolve, reject) => {
    if (!token) {
      resolve({ status: 401, message: "Token không được cung cấp" });
    }

    jwt.verify(token, SECRET_KEY, async (err, decoded) => {
      if (err) {
        console.error("Lỗi xác thực token:", err);
        resolve({ status: false, message: "Token không hợp lệ" });
      } else {
        try {
          const userResult = await LoginWhenIsToken(decoded.name, decoded.pass);
          if (userResult.status) {
            resolve({ status: true, data: userResult.data });
          } else {
            resolve({ status: false, message: userResult.message });
          }
        } catch (err) {
          console.error("Lỗi hệ thống:", err);
          resolve({ status: false, code: 255, message: "Error System" });
        }
      }
    });
  });
}
const createUser = async (body) => {
  return new Promise(async (resolve, reject) => {
    const { username, email } = body;

    try {
      let res = await db.INSERT("Users", body);
      console.log(res);
      resolve({ status: true, data: res.rowsAffected[0] });
    } catch (error) {
      resolve({ status: false, code: 255, message: "Error System" });
    }
  });
};

const deleteUser = async (name) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await db.DELETE("Users", "where name = '" + name + "'");
      console.log(res);
      resolve({ status: true, data: res.rowsAffected[0] });
    } catch (error) {
      resolve({ status: false, code: 255, message: "Error System" });
    }
  });
};
const editUser = async (body) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await db.executeProcedure("dbo.edit_user_pro", body);
      console.log(res);
      resolve({ status: true, data: res.recordset[0] });
    } catch (error) {
      resolve({ status: false, code: 255, message: "Error System" });
    }
  });
};

const changePassword = async (body) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await db.executeProcedure("dbo.edit_pwd_on_email", body);
      console.log(res);
      resolve({ status: true, message: "Đã đổi mật khẩu thành công" });
    } catch (error) {
      resolve({ status: false, code: 255, message: "Error System" });
    }
  });
};

module.exports = {
  getUserByID,
  createUser,
  deleteUser,
  editUser,
  checkValidUser,
  requestOTP,
  validateOTP,
  changePassword,
  verifyToken,
};

// import  axios from './customize-axios'; //aka import  axios from 'axios';
import axios from "axios";

export const host = "https://ngunemay123.bsite.net";

export const callAPi = (method, host, body) => {
  return new Promise(async (resolve, reject) => {
    try {
      await axios[method](host, body, {
        withCredentials: false,
      })
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    } catch (error) {
      reject(error);
    }
  });
};

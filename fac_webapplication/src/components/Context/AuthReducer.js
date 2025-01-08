const INITIAL_STATE = {
  // URL: "http://10.101.172.53:3001",
  // URL: "http://103.130.211.141:8080",
  URL: "http://192.168.0.9:3001",
  // URL: "192.168.110.242:3001",
  //URL: "http://192.168.1.76:3001",
  login: {},
  user: {},
  farmsct: [],
  currentFarm: {},
  currentDevice: {},
};
const AuthReducer = (state, action) => {
  //action = {type, payload: {tab, visual, setting, lastid, name, control}}
  // var x,y,z,t,n,c;
  switch (action.type) {
    case "URL":
      return {
        ...state,
        URL: action.payload,
      };
    case "SET_LOGIN":
      return {
        ...state,
        login: action.payload,
      };
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
      };
    case "SET_FARM":
      return {
        ...state,
        farmsct: action.payload,
      };
    case "SET_CURRENT_FARM":
      return {
        ...state,
        currentFarm: action.payload,
      };
    case "SET_CURRENT_DEVICE":
      return {
        ...state,
        currentDevice: action.payload,
      };
    default:
      return state;
  }
};
export { INITIAL_STATE };
export default AuthReducer;

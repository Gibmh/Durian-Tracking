
const INITIAL_STATE = {
    data :{}
};

const ToolReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_DATA':
            return {
                ...state,
                data: action.payload
            }
        
        default:
            return state;
    }


}

export { INITIAL_STATE }
export default ToolReducer;
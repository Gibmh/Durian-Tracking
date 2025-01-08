import { createContext, useReducer } from "react";
//import Logger from "../Logger";
import ToolReducer,{INITIAL_STATE} from "./ToolReducer";

export const ToolContext = createContext(INITIAL_STATE);


export const ToolContextProvider =({children})=>{
    const [state, toolDispatch] = useReducer(ToolReducer, INITIAL_STATE);

    return (
        <ToolContext.Provider value = {{
                data: state.data,
                toolDispatch
            }}
        >
            {children}
        </ToolContext.Provider>
    )

}
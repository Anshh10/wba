import { createStore, applyMiddleware } from "redux";
import { thunk } from "redux-thunk"; // Import thunk as a named export
import { createLogger } from "redux-logger";
import rootReducer from "../reducers";

const loggerMiddleware = createLogger();

export const store = createStore(
  rootReducer,
  applyMiddleware(thunk, loggerMiddleware) // Use thunk here
);

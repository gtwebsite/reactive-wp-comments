import createDataContext from "./createDataContext";
import { settingActions, settingReducer, settingInitialState } from "./settingContext";

const actions = { ...settingActions };

const reducer = ({ setting }, action) => ({
  setting: settingReducer(setting, action),
});

const initialState = {
  setting: settingInitialState,
};

export const { Context, Provider } = createDataContext(reducer, actions, initialState);
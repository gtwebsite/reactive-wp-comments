const setSetting = dispatch => {
  return setting => {
    dispatch({ type: "set_setting", payload: setting });
  };
};

export const settingActions = {
  setSetting,
};

export const settingReducer = (state, action) => {
  switch (action.type) {
    case "set_setting":
      return action.payload;
    default:
      return state;
  }
};

export const settingInitialState = {
  comments: [],
  comments_count: parseInt( rwpc_object.comments ),
  activeComment: 0,
  post_id: parseInt( rwpc_object.post_id ),
};
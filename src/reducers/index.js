import { combineReducers } from 'redux';
import clientReducer from './clientReducer';
import conversationReducer from './conversationReducer';
import messageReducer from './messageReducer';
import userReducer from './userReducer';

export { default as clientReducer } from './clientReducer';
export { default as conversationReducer } from './conversationReducer';
export { default as messageReducer } from './messageReducer';
export { default as userReducer } from './userReducer';

export default combineReducers({
  client: clientReducer,
  conversation: conversationReducer,
  message: messageReducer,
  user: userReducer
});

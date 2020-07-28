import { combineReducers } from 'redux';
import clientReducer from './clientReducer';
import conversationReducer from './conversationReducer';
import messageReducer from './messageReducer';
import userReducer from './userReducer';

export default combineReducers({
  client: clientReducer,
  conversation: conversationReducer,
  message: messageReducer,
  user: userReducer
});

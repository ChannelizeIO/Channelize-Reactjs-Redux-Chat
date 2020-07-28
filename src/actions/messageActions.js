import { 
  LOADING_MESSAGE_LIST,
  MESSAGE_LIST_FAIL,
  MESSAGE_LIST_SUCCESS,
  SENDING_MESSAGE,
  SEND_MESSAGE_FAIL,
  SEND_MESSAGE_SUCCESS,
  SENDING_FILE,
  SEND_FILE_FAIL,
  SEND_FILE_SUCCESS,
  LOADING_LOAD_MORE_MESSAGES,
  LOAD_MORE_MESSAGES_SUCCESS,
  LOAD_MORE_MESSAGES_FAIL,
  SET_ACTIVE_CONVERSATION,
  SET_ACTIVE_USERID
} from '../constants';

export const sendFileToConversation = (client, conversation, file, body, attachmentType) => {
  return dispatch => {
    dispatch({
      type: SENDING_FILE,
      payload: body
    });

    let createThumbnail = attachmentType === "application" ? false : true;

    const fileData = client.File.upload(file, attachmentType, createThumbnail, (err, fileData) => {
      if (err) {
        body.error = err;
        dispatch({
          type: SEND_FILE_FAIL,
          payload: body
        });
        return;
      }

      body['attachments'] = [fileData];
      return conversation.sendMessage(body, (err, response) => {
        if (err) {
          body.error = err;
          dispatch({
            type: SEND_FILE_FAIL,
            payload: body
          });
          return;
        }
        dispatch({
          type: SEND_FILE_SUCCESS,
          payload: response
        });
        return;
      });
    });
  }
};

export const sendMessageToConversation = (conversation, body) => {
  return dispatch => {
    dispatch({
      type: SENDING_MESSAGE,
      payload: body
    });
    return conversation.sendMessage(body, (err, response) => {
      if (err) {
        body.error = err;
        dispatch({
          type: SEND_MESSAGE_FAIL,
          payload: body
        });
      }
      dispatch({
        type: SEND_MESSAGE_SUCCESS,
        payload: response
      });
    })
  };
};

export const sendMessageToUserId = (client, body) => {
  return dispatch => {
    dispatch({
      type: SENDING_MESSAGE,
      payload: body
    });
    return client.Message.sendMessage(body, (err, response) => {
      if (err) {
        dispatch({
          type: SEND_MESSAGE_FAIL,
          payload: err
        });
      }
      dispatch({
        type: SEND_MESSAGE_SUCCESS,
        payload: response
      });
    })
  };
};

export const getMessageList = (messageListQuery) => {
  return dispatch => {
    dispatch({
      type: LOADING_MESSAGE_LIST,
      payload: {}
    });
    return messageListQuery.list((err, response) => {
      if (err) {
        dispatch({
          type: MESSAGE_LIST_FAIL,
          payload: err
        });
      }
      dispatch({
        type: MESSAGE_LIST_SUCCESS,
        payload: response.reverse()
      });
    })
  };
};

export const loadMoreMessages = (messageListQuery) => {
  return dispatch => {
    dispatch({
      type: LOADING_LOAD_MORE_MESSAGES,
      payload: {}
    });
    return messageListQuery.list((err, response) => {
      if (err) {
        dispatch({
          type: LOAD_MORE_MESSAGES_FAIL,
          payload: err
        });
      }
      dispatch({
        type: LOAD_MORE_MESSAGES_SUCCESS,
        payload: response.reverse()
      });
    })
  };
};

export const setActiveConversation = (conversation) => {
  return dispatch => {
    dispatch({
      type: SET_ACTIVE_CONVERSATION,
      payload: conversation
    });
  };
};

export const setActiveUserId = (userId) => {
  return dispatch => {
    dispatch({
      type: SET_ACTIVE_USERID,
      payload: userId
    });
  };
};
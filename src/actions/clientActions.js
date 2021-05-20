import {
  CONNECTING,
  CONNECT_SUCCESS,
  CONNECT_FAIL,
  DISCONNECT_SUCCESS,
  DISCONNECT_FAIL,
  TYPING_EVENT,
  NEW_MESSAGE_RECEIVED_EVENT,
  DELETE_MESSAGE_FOR_EVERYONE_EVENT,
  DELETE_MESSAGE_EVENT,
  USER_STATUS_UPDATED_EVENT,
  MARK_AS_READ_EVENT,
  USER_BLOCKED_EVENT,
  USER_UNBLOCKED_EVENT,
  USER_JOINED_EVENT,
  MEMBERS_ADDED_EVENT,
  MEMBERS_REMOVED_EVENT,
  CONVERSATION_UPDATED_EVENT,
  USER_UPDATED_EVENT,
  CONVERSATION_BAN_UPDATED_EVENT,
} from '../constants';

const _connect = (client, userId, accessToken) => {
  return new Promise((resolve, reject) => {
    if (!client) {
      reject('Channelize.io client was not created.');
    }

    if (userId && accessToken) {
      return client.connect(userId, accessToken, (error, res) => {
        if (error) {
          return reject('Channelize.io connection Failed.');
        } else {
          return resolve(res);
        }
      });
    }

    client.connectAsAnonymous((error, res) => {
      if (error) {
        reject('Channelize.io connection Failed.');
      } else {
        resolve(res);
      }
    });
  });
};

export const setConnected = (value = true) => {
  return dispatch => {
    dispatch({
      type: CONNECT_SUCCESS,
      payload: {}
    });
  }
}

export const chConnect = (client, userId, accessToken) => {
  return dispatch => {
    dispatch({
      type: CONNECTING,
      payload: {}
    });
    return _connect(client, userId, accessToken)
      .then(response => connectSuccess(dispatch, response))
      .catch(error => connectFail(dispatch, error));
  };
};

const connectSuccess = (dispatch, response) => {
  dispatch({
    type: CONNECT_SUCCESS,
    payload: response
  });
};

const connectFail = (dispatch, error) => {
  dispatch({
    type: CONNECT_FAIL,
    payload: error
  });
};

const _disconnect = (client) => {
  return new Promise((resolve, reject) => {
    if (client) {
      client.disconnect(() => {
        resolve(null);
      });
    } else {
      resolve(null);
    }
  });
};

export const chDisconnect = (client) => {
  return dispatch => {
    return _disconnect(client)
      .then(response => disconnectSuccess(dispatch, response))
      .catch(error => disconnectFail(dispatch, error));
  };
};

const disconnectSuccess = (dispatch, response) => {
  dispatch({
    type: DISCONNECT_SUCCESS,
    payload: response
  });
};

const disconnectFail = (dispatch, error) => {
  dispatch({
    type: DISCONNECT_FAIL,
    payload: error
  });
};

export const registerEventHandlers = (client) => {
  return dispatch => {
    client.chsocket.on('user.status_updated', function (payload) {
      dispatch({
        type: USER_STATUS_UPDATED_EVENT,
        payload: payload
      });
    });

    client.chsocket.on('user.updated', function (payload) {
      dispatch({
        type: USER_UPDATED_EVENT,
        payload: payload
      });
    });

    client.chsocket.on('user.message_created', function (response) {
      dispatch({
        type: NEW_MESSAGE_RECEIVED_EVENT,
        payload: response
      });
    });

    client.chsocket.on('message.deleted_for_everyone', function (response) {
      dispatch({
        type: DELETE_MESSAGE_FOR_EVERYONE_EVENT,
        payload: response
      });
    });

    client.chsocket.on('user.message_deleted', function (response) {
      const { conversation } = response;
      // Get the lastest conversation object to handle the last message in the conversation list.
      client.Conversation.getConversation(conversation.id, null, (err, conversation) => {
        if (err) return;

        response.conversation = conversation;
        dispatch({
          type: DELETE_MESSAGE_EVENT,
          payload: response
        });
      });
    });

    client.chsocket.on('user.joined', function (response) {
      // Load conversation will all attributes from server
      const { conversation } = response;
      client.Conversation.getConversation(conversation.id, null, (err, conversation) => {
        if (err) {
          return;
        }

        response.conversation = conversation;

        dispatch({
          type: USER_JOINED_EVENT,
          payload: response
        });
      })
    });

    client.chsocket.on('conversation.members_added', function (response) {
      dispatch({
        type: MEMBERS_ADDED_EVENT,
        payload: response
      });
    });

    client.chsocket.on('conversation.members_removed', function (response) {
      dispatch({
        type: MEMBERS_REMOVED_EVENT,
        payload: response
      });
    });

    client.chsocket.on('user.conversation_ban_updated', function (response) {
      dispatch({
        type: CONVERSATION_BAN_UPDATED_EVENT,
        payload: response
      });
    });

    client.chsocket.on('conversation.updated', function (response) {
      dispatch({
        type: CONVERSATION_UPDATED_EVENT,
        payload: response
      });
    });

    client.chsocket.on('conversation.mark_as_read', function (response) {
      dispatch({
        type: MARK_AS_READ_EVENT,
        payload: response
      });
    });

    client.chsocket.on('conversation.typing', function (response) {
      dispatch({
        type: TYPING_EVENT,
        payload: response
      });
    });

    client.chsocket.on('user.blocked', function (response) {
      dispatch({
        type: USER_BLOCKED_EVENT,
        payload: response
      });
    });

    client.chsocket.on('user.unblocked', function (response) {
      dispatch({
        type: USER_UNBLOCKED_EVENT,
        payload: response
      });
    });
  };
};
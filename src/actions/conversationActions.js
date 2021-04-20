import { 
  LOADING_CONVERSATION_LIST,
  CONVERSATION_LIST_FAIL,
  CONVERSATION_LIST_SUCCESS,
  LOADING_LOAD_MORE_CONVERSATIONS,
  LOAD_MORE_CONVERSATIONS_FAIL,
  LOAD_MORE_CONVERSATIONS_SUCCESS,
  BAN_CONVERSATION_USERS,
  BAN_CONVERSATION_USERS_FAIL,
  BAN_CONVERSATION_USERS_SUCCESS,
  UNBAN_CONVERSATION_USERS,
  UNBAN_CONVERSATION_USERS_FAIL,
  UNBAN_CONVERSATION_USERS_SUCCESS,
  LOADING_CONVERSATION_BAN_LIST,
  CONVERSATION_BAN_LIST_FAIL,
  CONVERSATION_BAN_LIST_SUCCESS,
} from '../constants';

export const getConversationList = (conversationListQuery) => {
  return dispatch => {
    dispatch({
      type: LOADING_CONVERSATION_LIST,
      payload: {}
    });
    return conversationListQuery.list((err, response) => {
      if (err) {
        dispatch({
          type: CONVERSATION_LIST_FAIL,
          payload: err
        });
      }
      dispatch({
        type: CONVERSATION_LIST_SUCCESS,
        payload: response
      }); 
    })
  };
};

export const loadMoreConversations = (conversationListQuery) => {
  return dispatch => {
    dispatch({
      type: LOADING_LOAD_MORE_CONVERSATIONS,
      payload: {}
    });
    return conversationListQuery.list((err, response) => {
      if (err) {
        dispatch({
          type: LOAD_MORE_CONVERSATIONS_FAIL,
          payload: err
        });
      }
      dispatch({
        type: LOAD_MORE_CONVERSATIONS_SUCCESS,
        payload: response
      });
    })
  };
};

export const getConversationBanList = (conversationBanListQuery) => {
  return dispatch => {
    dispatch({
      type: LOADING_CONVERSATION_BAN_LIST,
      payload: {}
    });
    return conversationBanListQuery.list((err, response) => {
      if (err) {
        dispatch({
          type: CONVERSATION_BAN_LIST_FAIL,
          payload: err
        });
      }
      dispatch({
        type: CONVERSATION_BAN_LIST_SUCCESS,
        payload: response
      }); 
    })
  };
};

export const banConversationUsers = (conversation, userIds, displayName) => {
  return dispatch => {
    dispatch({
      type: BAN_CONVERSATION_USERS,
      payload: {}
    });

    return conversation.banUsers(userIds, null, null, (err, response) => {
      if (err) {
        dispatch({
          type: BAN_CONVERSATION_USERS_FAIL,
          payload: err
        });
      }
      dispatch({
        type: BAN_CONVERSATION_USERS_SUCCESS,
        payload: { conversation, userIds, displayName}
      });
    });
  };
};

export const unbanConversationUsers = (conversation, userIds) => {
  return dispatch => {
    dispatch({
      type: UNBAN_CONVERSATION_USERS,
      payload: {}
    });

    return conversation.unbanUsers(userIds, (err, response) => {
      if (err) {
        dispatch({
          type: UNBAN_CONVERSATION_USERS_FAIL,
          payload: err
        });
      }
      dispatch({
        type: UNBAN_CONVERSATION_USERS_SUCCESS,
        payload: { conversation, userIds}
      });
    });
  };
};

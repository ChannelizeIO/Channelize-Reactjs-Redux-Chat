import { 
  LOADING_FRIENDS_LIST,
  FRIENDS_LIST_FAIL,
  FRIENDS_LIST_SUCCESS,
  LOADING_LOAD_MORE_FRIENDS,
  LOAD_MORE_FRIENDS_SUCCESS,
  LOAD_MORE_FRIENDS_FAIL,
  LOADING_MORE_USERS_LIST,
  MORE_USERS_LIST_FAIL,
  MORE_USERS_LIST_SUCCESS,
  LOADING_SEARCH_FRIENDS,
  SEARCH_FRIENDS_SUCCESS,
  SEARCH_FRIENDS_FAIL
} from '../constants';

export const getFriendsList = (userListQuery) => {
  return dispatch => {
    dispatch({
      type: LOADING_FRIENDS_LIST,
      payload: {}
    });
    return userListQuery.friendsList((err, response) => {
      if (err) {
        dispatch({
          type: FRIENDS_LIST_FAIL,
          payload: err
        });
      }
      dispatch({
        type: FRIENDS_LIST_SUCCESS,
        payload: response
      });
    })
  };
};

export const loadMoreFriends = (userListQuery) => {
  return dispatch => {
    dispatch({
      type: LOADING_LOAD_MORE_FRIENDS,
      payload: {}
    });
    return userListQuery.friendsList((err, response) => {
      if (err) {
        dispatch({
          type: LOAD_MORE_FRIENDS_FAIL,
          payload: err
        });
      }
      dispatch({
        type: LOAD_MORE_FRIENDS_SUCCESS,
        payload: response
      });
    })
  };
};

export const getMoreUsersList = (userListQuery) => {
  return dispatch => {
    dispatch({
      type: LOADING_MORE_USERS_LIST,
      payload: {}
    });
    return userListQuery.usersList((err, response) => {
      if (err) {
        dispatch({
          type: MORE_USERS_LIST_FAIL,
          payload: err
        });
      }
      dispatch({
        type: MORE_USERS_LIST_SUCCESS,
        payload: response
      });
    })
  };
};

export const searchFriends = (userListQuery) => {
  return dispatch => {
    dispatch({
      type: LOADING_SEARCH_FRIENDS,
      payload: {}
    });
    return userListQuery.friendsList((err, response) => {
      if (err) {
        dispatch({
          type: SEARCH_FRIENDS_FAIL,
          payload: err
        });
      }
      dispatch({
        type: SEARCH_FRIENDS_SUCCESS,
        payload: response
      });
    })
  };
};
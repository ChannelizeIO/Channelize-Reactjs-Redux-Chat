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
import { createReducer, uniqueList } from '../utils';

const INITIAL_STATE = {
  friendslist: [],
  loadingFriendsList: false,
  error: null,
  loadingMoreFriends: false,
  allFriendsLoaded: false,

  moreUsersList: [],
  loadingMoreUsersList: false,

  searchFriends: [],
  loadingSearchFriends: false
};

export const loadingFriendsList = (state, action) => {
  state.loadingFriendsList = true;
  state.allFriendsLoaded = false;
  state.friendslist= [];
};

export const friendsListSuccess = (state, action) => {
  state.loadingFriendsList = false;
  state.friendslist = action.payload;
};

export const friendsListFail = (state, action) => {
  state.loadingFriendsList = false;
  state.error = action.payload;
};

export const loadingLoadMoreFriends = (state, action) => {
  state.loadingMoreFriends = true;
};

export const loadMoreFriendsFail = (state, action) => {
  state.loadingMoreFriends = false;
  state.error = action.payload;
};

export const loadMoreFriendsSuccess = (state, action) => {
  state.loadingMoreFriends = false;
  if (!action.payload.length) {
    state.allFriendsLoaded = true;
  } else {
    state.friendslist = [...state.friendslist, ...action.payload];
    state.friendslist = uniqueList(state.friendslist);
  }
};

export const loadingMoreUsersList = (state, action) => {
  state.loadingMoreUsersList = true;
  state.moreUsersList = [];
};

export const moreUsersListSuccess = (state, action) => {
  state.loadingMoreUsersList = false;
  state.moreUsersList = action.payload;
};

export const moreUsersListFail = (state, action) => {
  state.loadingMoreUsersList = false;
  state.error = action.payload;
};

export const loadingSearchFriends = (state, action) => {
  state.loadingSearchFriends = true;
  state.searchFriends = [];
};

export const searchFriendsSuccess = (state, action) => {
  state.loadingSearchFriends = false;
  state.searchFriends = action.payload;
};

export const searchFriendsFail = (state, action) => {
  state.loadingSearchFriends = false;
  state.error = action.payload;
};

export const handlers = {
  [LOADING_FRIENDS_LIST]: loadingFriendsList,
  [FRIENDS_LIST_SUCCESS]: friendsListSuccess,
  [FRIENDS_LIST_FAIL]: friendsListFail,
  [LOADING_LOAD_MORE_FRIENDS]: loadingLoadMoreFriends,
  [LOAD_MORE_FRIENDS_SUCCESS]: loadMoreFriendsSuccess,
  [LOAD_MORE_FRIENDS_FAIL]: loadMoreFriendsFail,
  [LOADING_MORE_USERS_LIST]: loadingMoreUsersList,
  [MORE_USERS_LIST_SUCCESS]: moreUsersListSuccess,
  [MORE_USERS_LIST_FAIL]: moreUsersListFail,
  [LOADING_SEARCH_FRIENDS]: loadingSearchFriends,
  [SEARCH_FRIENDS_SUCCESS]: searchFriendsSuccess,
  [SEARCH_FRIENDS_FAIL]: searchFriendsFail,
};

export default createReducer(INITIAL_STATE, handlers);
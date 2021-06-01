import React, { PureComponent } from 'react';
import { Header } from "./Header";
import { Loader } from "./Loader";
import { connect } from 'react-redux';
import { LANGUAGE_PHRASES, IMAGES } from "../constants";
import { withChannelizeContext } from '../context';
import { 
  getFriendsList,
  loadMoreFriends,
  getMoreUsersList,
  searchFriends as searchFriendsAction,
  setActiveUserId,
} from '../actions';
import debounce from 'lodash/debounce';
import { Avatar } from './Avatar';

class SearchWindow extends PureComponent {

	constructor(props) {
    super(props);
    this.searchLimit = 10;
    this.friendsLimit = 50;

    this.state = {
      searchText: ''
    }

    this.handleChange = this.handleChange.bind(this);
    this._searchOnServer = debounce(this._searchOnServer, 800)
  }

  componentDidMount() {
    const { connected } = this.props;
    if (!connected) {
      return
    }

    this._init();
  }

  componentDidUpdate(prevProps) {
    const { client, connected } = this.props;
    if (!connected) {
      return
    }

    if (!prevProps.connected && connected) {
      this._init();
    }
  }

  _init = () => {
    const { client } = this.props;

    // Load friends
    let friendsListQuery = client.User.createUserListQuery();
    friendsListQuery.limit = this.friendsLimit;
    friendsListQuery.skip = 0;
    friendsListQuery.sort = 'isOnline DESC, displayName ASC ';
    this.props.getFriendsList(friendsListQuery);
  }

  handleChange(event) {
    let inputValue = event.target.value;
    this.setState({searchText: inputValue})

    if (!inputValue) {
      return
    }
    this._searchOnServer(inputValue);
  }

  _searchOnServer = (value) => {
    const { client } = this.props;

    // search friends
    let friendsListQuery = client.User.createUserListQuery();
    friendsListQuery.limit = this.searchLimit;
    friendsListQuery.skip = 0;
    friendsListQuery.search = value;
    friendsListQuery.sort = 'isOnline DESC, displayName ASC';
    this.props.searchFriendsAction(friendsListQuery);

    // Load more users
    let moreUsersListQuery = client.User.createUserListQuery();
    moreUsersListQuery.limit = this.searchLimit;
    moreUsersListQuery.skip = 0;
    moreUsersListQuery.search = value;
    moreUsersListQuery.sort = 'isOnline DESC, displayName ASC';
    this.props.getMoreUsersList(moreUsersListQuery);
  }

  clearSearch = () => {
    this.setState({searchText: ''})
  }

  onContactClick = (userId) => {
    const { onContactClick } = this.props;
    this.props.setActiveUserId(userId)

    if (onContactClick && typeof onContactClick == 'function') {
      onContactClick(userId)
    }
  }

  render() {
    let {
      connecting, 
      connected,
      loadingFriendsList,
      loadingSearchFriends,
      friendslist,
      moreUsersList,
      searchFriends,
      showArrowBack,
      onBack
    } = this.props;
    const { searchText } = this.state;

    let list = friendslist;
    if (searchText) {
      list = searchFriends;
    } else {
      moreUsersList = [];
    }

    const showMoreUsers = moreUsersList.length ? true : false;

  	return (
      <div id="ch_search_window" className="ch-search-window">
        <Header
          showArrowBack={showArrowBack}
          onBack={onBack}
          title={LANGUAGE_PHRASES.SEARCH} 
        />

        <div id="ch_search_box" className="ch-search-box">
          <input placeholder="Search" id="ch_search_input_box" className="ch-search-input-box" value={searchText} onChange={this.handleChange} />
          { searchText && <i id="ch_clear_search_icon" translate="no" className="material-icons ch-clear-search-icon" onClick={this.clearSearch}>close</i>}
        </div>

        <div id="ch_friends_box" className="ch-friends-box">
          { (connecting || loadingFriendsList) && <div className="center"><Loader /></div>}

          { loadingSearchFriends && <div><Loader /></div>}

          { connected && searchText && !list.length && !showMoreUsers && !loadingFriendsList && !loadingSearchFriends && <div className="center no-record-found">No Record Found</div>}

          <div id="ch_suggested_box">
            { !searchText && !loadingFriendsList && <div id="ch_suggested" className="ch-suggested">{LANGUAGE_PHRASES.SUGGESTED}</div>}

            {list.map(friend => {
              return (
                <li key={friend.id} id={friend.id} className="ch-friends-list" onClick={() => this.onContactClick(friend.id)}>
                  <Avatar 
                    src={friend.profileImageUrl}
                    initials={friend.displayName} 
                    className="ch-contact-img" 
                  >
                    {friend.isOnline && <span className="ch-online-icon ch-show-element"></span>}
                  </Avatar>
                  <div id="ch_friend_name" className="ch-friend-name">{friend.displayName}</div>
                </li>
              )})
            }
          </div>

          { showMoreUsers &&
            <div id="ch_users_box">
              <div id="ch_more_users" className="ch-more-users">{LANGUAGE_PHRASES.MORE_USERS}</div>
              { moreUsersList.map((user) => {
                return (
                  <li key={user.id} id={user.id} className="ch-friends-list" onClick={() => this.onContactClick(user.id)}>
                    <Avatar 
                      src={user.profileImageUrl}
                      initials={user.displayName} 
                      className="ch-contact-img"
                      >
                        {user.isOnline && <span className="ch-online-icon ch-show-element"></span>}
                      </Avatar>
                    <div id="ch_friend_name" className="ch-friend-name">{user.displayName}</div>
                  </li>
                )})
              }
            </div>
          }
        </div>
      </div>
		);
  }
}

SearchWindow = withChannelizeContext(SearchWindow);

const mapStateToProps = ({user, client}) => {
  return {...user, ...client}
}

SearchWindow = connect(
  mapStateToProps,
  { 
  getFriendsList,
  loadMoreFriends ,
  getMoreUsersList,
  searchFriendsAction,
  setActiveUserId }
)(SearchWindow)

export { SearchWindow };
import React, { PureComponent } from 'react';
import { Header } from "./Header";
import { ConversationItem} from "./ConversationItem";
import { Loader } from "./Loader";
import { LANGUAGE_PHRASES } from "../constants";
import { connect } from 'react-redux';
import { withChannelizeContext } from '../context';
import { 
  getConversationList,
  loadMoreConversations,
  setActiveConversation
} from "../actions";
import { modifyConversation } from "../utils";

class ConversationList extends PureComponent {
  constructor(props) {
    super(props);
    this.limit = 25;
    this.skip = 0;

    this.onScroll = this.onScroll.bind(this);
    this.chRecentListingRef = React.createRef();
  }

  componentDidMount() {
    const { connected } = this.props;
    if (!connected) {
      return
    }

    this._init();
  }

  componentDidUpdate(prevProps) {
    const { client, connected, activeConversation, list } = this.props;
    if (!connected) {
      return
    }

    // Find if need to refresh conversation
    const refresh = !prevProps.connected && this.props.connected;
    if (refresh) {
      this._init();
    }

    // Set a conversation active
    if (!activeConversation && list.length) {
      this.props.setActiveConversation(list[0]);
    }
  }

  _init = () => {
    const { client, list } = this.props;

    if (list.length) {
      return;
    }

    // Load conversations
    let conversationListQuery = client.Conversation.createConversationListQuery();
    conversationListQuery.limit = this.limit;
    conversationListQuery.skip = this.skip;
    conversationListQuery.include = 'members';
    this.props.getConversationList(conversationListQuery);
  }

  onCloseIconClick = () => {
    const { onCloseIconClick } = this.props;
    if (onCloseIconClick && typeof onCloseIconClick == 'function') {
      onCloseIconClick();
    }
  }

  onSearchIconClick = () => {
    const { onSearchIconClick } = this.props;
    if (onSearchIconClick && typeof onSearchIconClick == 'function') {
      onSearchIconClick();
    }
  }

  onScroll() {
    const { list, client, loadingMoreConversations, allConversationsLoaded } = this.props;
    const chRecentListingRef = this.chRecentListingRef.current;

    if (loadingMoreConversations || allConversationsLoaded || list.length < this.limit) {
      return
    }

    if(chRecentListingRef.scrollTop + chRecentListingRef.clientHeight == chRecentListingRef.scrollHeight) {
      // Set skip
      this.skip = list.length;

      let conversationListQuery = client.Conversation.createConversationListQuery();
      conversationListQuery.limit = this.limit;
      conversationListQuery.skip = this.skip;
      this.props.loadMoreConversations(conversationListQuery)
    }
  }

  render() {
    let { 
      client,
      list,
      connecting,
      connected,
      loading,
      error,
      loadingMoreConversations,
      showSearchIcon,
      onSearchIconClick,
      showCloseIcon,
      activeConversation,
      onSelect
    } = this.props;

    const user = client.getCurrentUser();

    list = list.map(conversation => modifyConversation(conversation));

    return (
      <div id="ch_recent_window" className="ch-recent-window">
        <Header 
          imageSrc={user && user.profileImageUrl}
          imageInitials={user && user.displayName}
          title={LANGUAGE_PHRASES.CHAT}
          renderRight={() => {
            return (
              <div>
                { showSearchIcon && <i title="Search" className="material-icons" onClick={this.onSearchIconClick}>search</i>}
                { showCloseIcon && <i title="Close" className="material-icons" onClick={this.onCloseIconClick}>close</i>}
              </div>
            )
          }}/>

        <div id="ch_recent_listing" className="ch-recent-listing"  ref={this.chRecentListingRef} onScroll={this.onScroll}>
          { (connecting || loading) &&  <div className="center"><Loader /></div>}

          { error && <div className="center error">{error}</div>}

          { connected && !list.length && !loading && <div className="center no-record-found">No record Found</div>}

          <ul id="ch_recent_ul" className="ch-recent-ul">
            {
              list.map((conversation) => {
                return <ConversationItem 
                  key={conversation.id} 
                  activeConversation={activeConversation} 
                  conversation={conversation}
                  onSelect={onSelect} />
              })
            }
          </ul>

          { loadingMoreConversations &&  <div> Loading... </div>}
        </div>
      </div>
    );
  }
}

ConversationList = withChannelizeContext(ConversationList);

const mapStateToProps = ({conversation, client, message}) => {
  return {...conversation, ...client, activeConversation: message.conversation};
}

ConversationList = connect(
  mapStateToProps,
  { 
    getConversationList,
    loadMoreConversations,
    setActiveConversation
 },
)(ConversationList);

export { ConversationList }

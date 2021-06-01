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
    const { client, connected, activeConversation, conversationlist } = this.props;
    if (!connected) {
      return
    }

    // Find if need to refresh conversation
    const refresh = !prevProps.connected && this.props.connected;
    if (refresh) {
      this._init();
    }

    // Set a conversation active
    if (!activeConversation && conversationlist.length) {
      this.props.setActiveConversation(conversationlist[0]);
    }
  }

  _init = () => {
    const { client, conversationlist } = this.props;

    if (conversationlist.length) {
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
    const { conversationlist, client, loadingMoreConversations, allConversationsLoaded } = this.props;
    const chRecentListingRef = this.chRecentListingRef.current;

    if (loadingMoreConversations || allConversationsLoaded || conversationlist.length < this.limit) {
      return
    }

    if(chRecentListingRef.scrollTop + chRecentListingRef.clientHeight == chRecentListingRef.scrollHeight) {
      // Set skip
      this.skip = conversationlist.length;

      let conversationListQuery = client.Conversation.createConversationListQuery();
      conversationListQuery.limit = this.limit;
      conversationListQuery.skip = this.skip;
      this.props.loadMoreConversations(conversationListQuery)
    }
  }

  render() {
    let { 
      client,
      conversationlist,
      connecting,
      connected,
      conversationLoading,
      conversationError,
      loadingMoreConversations,
      showSearchIcon,
      onSearchIconClick,
      showCloseIcon,
      activeConversation,
      onSelect
    } = this.props;

    const user = client.getCurrentUser();

    conversationlist = conversationlist.map(conversation => modifyConversation(conversation, user));

    return (
      <div id="ch_recent_window" className="ch-recent-window">
        <Header 
          imageSrc={user && user.profileImageUrl}
          imageInitials={user && user.displayName}
          title={LANGUAGE_PHRASES.CHAT}
          renderRight={() => {
            return (
              <div>
                { showSearchIcon && <i title="Search" translate="no" className="material-icons" onClick={this.onSearchIconClick}>search</i>}
                { showCloseIcon && <i title="Close" translate="no" className="material-icons" onClick={this.onCloseIconClick}>close</i>}
              </div>
            )
          }}/>

        <div id="ch_recent_listing" className="ch-recent-listing"  ref={this.chRecentListingRef} onScroll={this.onScroll}>
          { (connecting || conversationLoading) &&  <div className="center"><Loader /></div>}

          { conversationError && <div className="center error">{conversationError}</div>}

          { connected && !conversationlist.length && !conversationLoading && <div className="center no-record-found">No record Found</div>}

          <ul id="ch_recent_ul" className="ch-recent-ul">
            {
              conversationlist.map((conversation) => {
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

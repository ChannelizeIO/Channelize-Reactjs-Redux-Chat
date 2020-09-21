import React, { PureComponent } from 'react';
import { Header } from "./Header";
import { Loader } from "./Loader";
import { MessageSimple } from "./MessageSimple";
import { modifyConversation, modifyMessageList } from "../utils";
import { connect } from 'react-redux';
import { LANGUAGE_PHRASES, IMAGES } from "../constants";
import { withChannelizeContext } from '../context';
import { 
  getMessageList,
  sendMessageToConversation,
  sendMessageToUserId,
  sendFileToConversation,
  loadMoreMessages as loadMoreMessagesAction,
  setActiveConversation,
  setActiveUserId,
  registerConversationEventHandlers
} from '../actions';
import moment from 'moment';
import throttle from 'lodash/throttle';
import PropTypes from 'prop-types';

class ConversationWindow extends PureComponent {

	constructor(props) {
    super(props);
    this.limit = 25;
    this.skip = 0;

    this.handleChange = this.handleChange.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.onScroll = this.onScroll.bind(this);
    this._markAsRead = throttle(this._markAsRead, 500);
    this.sendMedia = this.sendMedia.bind(this);

    this.chMessageBoxRef = React.createRef();

    this.state = {
      text: '',
      dummyConversation: null,
      userId: null
    }
  }

  componentDidMount() {
    const { connected } = this.props;
    if (!connected) {
      return
    }

    this._init();
  }

  getSnapshotBeforeUpdate(prevProps) {
    if (prevProps.list.length < this.props.list.length) {
      if (!this.chMessageBoxRef) {
        return null;
      }

      const chMessageBoxRef = this.chMessageBoxRef.current;
      return {
        scrollHeight: chMessageBoxRef.scrollHeight,
        offsetTop: chMessageBoxRef.scrollTop,
        offsetBottom: chMessageBoxRef.scrollHeight - chMessageBoxRef.scrollTop,
      }
    }

    return null;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { 
      client,
      conversation,
      newMessage,
      userId,
      loadingMoreMessages } = this.props;

    // Find if need to refresh conversation
    const refresh = !prevProps.connected && this.props.connected;
    if (refresh) {
      this._init();
    }

    // if userId switches, re-intialize the conversation
    if (prevProps.userId != userId && userId) {
      this._init();
    }

    // Set the conversation after sending first mesage in dummy conversation
    if (!conversation && prevProps.sendingMessage && !this.props.sendingMessage) {
      this._scrollToTarget()

      let conversationListQuery = client.Conversation.createConversationListQuery();
      if (userId) {
        conversationListQuery.membersExactly = userId;
        conversationListQuery.isGroup = false;
      }

      conversationListQuery.list((err, conversations) => {
        if (conversations.length) {
          this.props.setActiveConversation(conversations[0])
          return
        }

        client.User.get(userId, (err, user) => {
          this.setState({
            dummyConversation: {isGroup: false, user}
          })
        })
      })
    }

    if (!conversation) {
      return
    }

    if ((!prevProps.conversation && conversation) || (prevProps.conversation.id != conversation.id)) {
      this._init();
    }

    // Scroll to bottom on initial message loading
    if (prevProps.loading && !this.props.loading) {
      this._scrollToTarget()
    }

    // Scroll to Bottom on new message received
    if((!prevProps.newMessage && newMessage) || (newMessage && prevProps.newMessage.id != newMessage.id) ) {
      this._scrollToTarget()

      const user = client.getCurrentUser();
      if (user.id != newMessage.ownerId) {
        this._markAsRead(conversation)
      }
    }

    // Scroll to target after load more mesages
    if(prevProps.list.length < this.props.list.length) {
      if (snapshot) {
        const chMessageBoxRef = this.chMessageBoxRef.current;
        const target = chMessageBoxRef.scrollHeight - snapshot.offsetBottom;
        this._scrollToTarget(target);
      }
    }
  }

  _markAsRead = (conversation) => {
    if (conversation && conversation.config.typing_events) {
      conversation.markAsRead();
    }
  }

  _scrollToTarget = (target) => {
    if (!this.chMessageBoxRef) {
      return
    }

    const chMessageBoxRef = this.chMessageBoxRef.current;
    if (Object.prototype.toString.call(target) === "[object Number]") {
      chMessageBoxRef.scrollTop = target;
      return
    }

    chMessageBoxRef.scrollTop = chMessageBoxRef.scrollHeight;
  }

  _init = () => {
    const { client, conversation, userId, ownProps } = this.props;

    if (!conversation && !userId) {
      // Handle ownProps
      if (Object.keys(ownProps).length) {
        if (ownProps.conversation) {
          let conversation = ownProps.conversation;

          if (conversation.type != 'open' || conversation.__isWatching) {
            this.props.setActiveConversation(conversation);
            return;
          }

          // Start watching open conversation
          conversation.startWatching((err, res) => {
            this.props.setActiveConversation(conversation);
          })
          return;
        }
        if (ownProps.userId) {
          this.props.setActiveUserId(ownProps.userId);
          return;
        }
      }
      return
    }

    // If conversation not exist, get the conversation from userId
    if (!conversation) {
      this.setState({
        dummyConversation: null
      })

      let conversationListQuery = client.Conversation.createConversationListQuery();
      if (userId) {
        conversationListQuery.membersExactly = userId;
        conversationListQuery.isGroup = false;
      }

      conversationListQuery.list((err, conversations) => {
        if (conversations.length) {
          this.props.setActiveConversation(conversations[0])
          return
        }

        client.User.get(userId, (err, user) => {
          this.setState({
            dummyConversation: {isGroup: false, user}
          })
        })
      })
    }

    if (!conversation) {
      return
    }

    // Register conversation event handlers
    this.props.registerConversationEventHandlers(conversation);

    // Load messages
    let messageListQuery = conversation.createMessageListQuery();
    messageListQuery.limit = this.limit;
    this.skip = 0;
    messageListQuery.skip = this.skip;
    this.props.getMessageList(messageListQuery);

    // Mark as read conversation
    if (conversation.unreadMessageCount > 0) {
      conversation.markAsRead();
    }
  }

  handleChange(event) {
    this.setState({text: event.target.value});
  }

  handleKeyUp(event) {
    if(event.keyCode === 13) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  sendFile(file) {
    const { client, conversation } = this.props;

    let fileType = file.type.split('/').shift();

    const body = {}
    this.props.sendFileToConversation(client, conversation, file, body, fileType);
  }
  
  sendMessage() {
    const { conversation, client, userId } = this.props;
    const { text } = this.state;
    let body = {
      body: text
    }
    this.setState({text: ''})

    if (conversation) {
      this.props.sendMessageToConversation(conversation, body)
    } else {
      body.userId = userId;
      this.props.sendMessageToUserId(client, body)
    }
  }

  onCloseIconClick = () => {
    this.props.setActiveConversation(null)

    const { onCloseIconClick } = this.props;
    if (onCloseIconClick && typeof onCloseIconClick == 'function') {
      onCloseIconClick();
    }
  }

  onScroll() {
    const { list, conversation, loadingMoreMessages, allMessagesLoaded } = this.props;
    if (!conversation) {
      return null
    }

    const chMessageBoxRef = this.chMessageBoxRef.current;
    if (loadingMoreMessages || allMessagesLoaded || list.length < this.limit) {
      return
    }

    if(chMessageBoxRef.scrollTop < chMessageBoxRef.clientHeight) {
      // Set skip
      this.skip = list.length;

      let messageListQuery = conversation.createMessageListQuery();
      messageListQuery.limit = this.limit;
      messageListQuery.skip = this.skip;
      this.props.loadMoreMessagesAction(messageListQuery)
    }
  }

  blockUser() {

  }

  unblockUser() {

  }

  sendMedia(event) {
    this.sendFile(event.target.files[0]);
  }

  render() {
    let { 
      client,
      connecting,
      connected,
      error,
      loading,
      loadingMoreMessages,
      list,
      conversation,
      showCloseIcon,
      showChevron,
      disableComposer,
      disableComposerMessage,
      Message,
      renderHeader
    } = this.props;
    const { text, dummyConversation } = this.state;

    // Set dummy conversation if conversation doesn't exist
    if (!conversation) {
      conversation = dummyConversation
      list = [];
    }

    // Modify message list
    list = modifyMessageList(client, conversation, list);

    // disable composer setting
    let composerDisabled = false;
    if (disableComposer && typeof disableComposer == 'function') {
      composerDisabled = disableComposer(conversation)
    }

    // Set header details
    let actionButton;
    let headerTitle;
    let headerImage;
    let headerSubtitle;
    if (conversation) {
      conversation = modifyConversation(conversation)
      headerTitle = conversation.title;
      headerImage = conversation.profileImageUrl;

      if (!conversation.isGroup && conversation.user) {
        headerSubtitle = conversation.user.isOnline ? 'Online' : 'Last Seen ' + moment(conversation.user.lastSeen).fromNow();
      }

      if (conversation.isGroup) {
        headerSubtitle = conversation.memberCount + ' Members';
      }

      // Action buttons
      if(!conversation.isActive) {
        actionButton = <div id="ch_conv_unblock" onClick={() => this.unblockUser()}>Unblock User</div>
      } else {
        actionButton = <div id="ch_conv_block" onClick={() => this.blockUser()}>Block User</div>
      }
    }

    const user = client.getCurrentUser();
		return (
  		<div id="ch_conv_window" className="ch-conv-window">
        { conversation && renderHeader && renderHeader(conversation) }
  			{ conversation && !renderHeader && <Header 
          profileImageUrl={headerImage}
          title={headerTitle}
          subtitle={headerSubtitle}
          showChevron={(showChevron && actionButton) ? true : false}
          renderDropDownList={() => {
            if (!actionButton) {
              return
            }

            return (
              <div className="ch-drop-down-list">
                {actionButton}
              </div>
            )
          }}
          renderRight={() => {
            return (
              <React.Fragment>
                { showCloseIcon && <i title="Close" className="material-icons" onClick={this.onCloseIconClick}>close</i>}
              </React.Fragment>
            )
          }}/>
        }

        <div id="ch_messages_box" ref={this.chMessageBoxRef} className="ch-messages-box" onScroll={this.onScroll}>
          { <div className="ch-conversation-padding"> </div>}
         
          { (connecting || loading) &&  <div className="center"><Loader /></div>}

          { error && <div className="center error">{error}</div>}

          <div className="ch-msg-list">
            { connected && !conversation && <div className="center no-record-found">No conversation seleted</div>}

            { loadingMoreMessages &&  <Loader />}

            { conversation && !list.length && !loading && <div className="center no-record-found">No record Found</div>}

    				{
    					list.map(message => {
                return <Message key={message.id} message={message}/>
              })
    				}
          </div>
        </div>

        { conversation &&
          <React.Fragment>
            { composerDisabled ?
              <div className="ch-composer-disabled-box">
                <div>{disableComposerMessage}</div>
              </div>
              :
        			<div id="ch_send_box" className="ch-send-box">

                <div className="ch-media-icon-box">
                  <i title="Image" className="material-icons ch-attachment-icon">insert_photo</i>
                  <input id="ch_gallary_input" className="ch-gallary-input" type="file" accept="image/*" onChange={this.sendMedia} />
                </div>

                <div className="ch-media-icon-box">
                  <i title="Document" className="material-icons ch-attachment-icon">description</i>
                  <input id="ch_document_input" className="ch-document-input" type="file" accept="application/*,.doc,.docx,.xls,.ppt" onChange={this.sendMedia} />
                </div>

        				<textarea 
                  id="ch_input_box"
                  className="ch-input-box"
                  type="text"
                  placeholder="Send a message"
                  value={text}
                  onChange={this.handleChange} 
                  onKeyUp={this.handleKeyUp}></textarea>

      					<button id="ch_send_button" className="ch-send-button" onClick={this.sendMessage}><i className="ch-send-icon material-icons">send</i></button>
        			</div>
            }
          </React.Fragment>
        }
  		</div>
		);
  }
}

ConversationWindow = withChannelizeContext(ConversationWindow);

ConversationWindow.propTypes = {
  Message: PropTypes.elementType,
}

ConversationWindow.defaultProps = {
  Message: MessageSimple
};

const mapStateToProps = ({message, client}, ownProps) => {
  return {...message, ...client, ownProps: ownProps}
}

ConversationWindow = connect(
  mapStateToProps,
   {
    getMessageList,
    sendMessageToConversation,
    sendMessageToUserId,
    sendFileToConversation,
    loadMoreMessagesAction,
    setActiveConversation,
    setActiveUserId,
    registerConversationEventHandlers
   }
)(ConversationWindow);

export { ConversationWindow }
import React, { PureComponent } from 'react';
import { Header } from "./Header";
import { Loader } from "./Loader";
import { MediaLightBox } from "./MediaLightBox";
import { GuestJoinForm } from "./GuestJoinForm";
import { MessageSimple } from "./MessageSimple";
import { SimpleList } from "./SimpleList";
import { modifyConversation, modifyMessageList, typingString } from "../utils";
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
  registerConversationEventHandlers,
  deleteMessagesForEveryone,
  deleteMessagesForMe,
  banConversationUsers,
  unbanConversationUsers,
  startWatchingAndSetActiveConversation,
  stopWatchingAndSetNullConversation,
  getConversationBanList,
  registerEventHandlers
} from '../actions';
import moment from 'moment';
import { v4 as uuid } from 'uuid';
import throttle from 'lodash/throttle';
import debounce from 'lodash/debounce';
import PropTypes from 'prop-types';

class ConversationWindow extends PureComponent {

  constructor(props) {
    super(props);
    this.limit = 25;
    this.skip = 0;
    this.showMediaLightBox = false;

    this.handleChange = this.handleChange.bind(this);
    this.handleTabChange = this.handleTabChange.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.onScroll = this.onScroll.bind(this);
    this._markAsRead = throttle(this._markAsRead, 500);
    this.sendMedia = this.sendMedia.bind(this);
    this._startTyping = throttle(this._startTyping, 3000);
    this._stopTyping = debounce(this._stopTyping, 3000);

    this.toggleGuestJoinForm = this.toggleGuestJoinForm.bind(this);
    this.onJoinedAsGuest = this.onJoinedAsGuest.bind(this);

    this.chMessageBoxRef = React.createRef();

    this.state = {
      text: '',
      dummyConversation: null,
      userId: null,
      guestJoinFormOpened: false,
      activeTab: 'chat'
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
    if (prevProps.messagelist.length < this.props.messagelist.length) {
      if (!this.chMessageBoxRef || !this.chMessageBoxRef.current) {
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
    if (prevProps.messageLoading && !this.props.messageLoading) {
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
    if(prevProps.messagelist.length < this.props.messagelist.length) {
      if (snapshot) {
        const chMessageBoxRef = this.chMessageBoxRef.current;
        const target = chMessageBoxRef.scrollHeight - snapshot.offsetBottom;
        this._scrollToTarget(target);
      }
    }
  }

  componentWillUnmount() {
    const { conversation } = this.props;

    if (!conversation || conversation.type != 'open' || !conversation.__isWatching) {
      this.props.setActiveConversation(null);
      return;
    }

    // Stop watching open conversation
    this.props.stopWatchingAndSetNullConversation(conversation)
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
    this.handleTabChange('chat');

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
          this.props.startWatchingAndSetActiveConversation(conversation)
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

    // Load Banned User Listing
    if (conversation.isGroup && conversation.isAdmin) {
      let banListQuery = conversation.createBanListQuery();
      banListQuery.limit = 100;
      this.props.getConversationBanList(banListQuery);
    }

    // Mark as read conversation
    if (conversation.unreadMessageCount > 0) {
      conversation.markAsRead();
    }
  }

  handleChange(event) {
    this.setState({text: event.target.value});
  }

  handleTabChange(type) {
    this.setState({activeTab: type});
  }

  handleKeyPress(event) {
    if(event.key === 'Enter') {
      event.preventDefault();
      this.sendMessage();
      return;
    }

    this._onTextMessageChanged(event.target.value);
  }

  toggleGuestJoinForm() {
    this.setState({guestJoinFormOpened: !this.state.guestJoinFormOpened})
  }
  
  async onJoinedAsGuest(guest) {
    this.props.registerEventHandlers(this.props.client)
    await this.props.onJoinedAsGuest(guest)
    await this.sendMessage();
  }

  _onTextMessageChanged = (textMessage) => {
    if (textMessage) {
      this._startTyping();
    }

    this._stopTyping();
  }

  _startTyping = () => {
    const { conversation } = this.props;
    if (conversation && conversation.type == "private") {
      conversation.startTyping();
    }
  }

  _stopTyping = () => {
    const { conversation } = this.props;
    if (conversation  && conversation.type == "private") {
      conversation.stopTyping();
    }
  }

  sendFile(file) {
    const { client, conversation } = this.props;
    const user = client.getCurrentUser();

    let fileType = file.type.split('/').shift();

    if(file.type.match('application')) {

      const body = {
        id: uuid(),
        pending: true,
        ownerId: user.id,
        attachments: [{
          type: fileType,
          name: file.name
        }],
      }
      
      this.props.sendFileToConversation(client, conversation, file, body, fileType);
      return;
    }

    this.getFileThumbnailUrl(file, (url) => {
      const body = {
        id: uuid(),
        pending: true,
        ownerId: user.id,
        attachments: [{
          type: fileType,
          thumbnailUrl: url
        }],
      }

      if(file.type.match('video')) {
        body.attachments[0].fileUrl = URL.createObjectURL(file);
      }
      
      this.props.sendFileToConversation(client, conversation, file, body, fileType);
    });
  }
  
  deleteMessagesForEveryone(msgId) {
    if (!msgId) return;
    const { client } = this.props;
    this.props.deleteMessagesForEveryone(client, [msgId]);
  }

  deleteMessagesForMe(msgId) {
    if (!msgId) return;
    const { client } = this.props;
    this.props.deleteMessagesForMe(client, [msgId]);
  }

  banConversationUsers(userId, displayName) {
    if (!userId) return;
    const { client, conversation } = this.props;
    if (!conversation) {
      return;
    }
    this.props.banConversationUsers(conversation, [userId], displayName);
  }

  unbanConversationUsers(userId) {
    if (!userId) return;
    const { client, conversation } = this.props;
    if (!conversation) {
      return;
    }
    this.props.unbanConversationUsers(conversation, [userId]);
  }
  
  sendMessage() {
    const { conversation, client, userId, allowGuestUsers } = this.props;

    if (allowGuestUsers && client.isAnonymousUser()) {
      return this.toggleGuestJoinForm();
    }
    
    const user = client.getCurrentUser();
    const { text } = this.state;

    if (!text) return;

    let body = {
      id: uuid(),
      body: text,
      ownerId: user.id,
      pending: true,
    }
    this.setState({text: ''})


    if (conversation) {
      this.props.sendMessageToConversation(conversation, body)
    } else {
      body.userId = userId;
      this.props.sendMessageToUserId(client, body)
    }
  }

  getFileThumbnailUrl(file, cb) {
    var fileReader = new FileReader();
    if (file.type.match('image')) {
      fileReader.onload = function() {
        var img = document.createElement('img');
        cb(fileReader.result);
      };
      fileReader.readAsDataURL(file);
    } else if(file.type.match('video')) {
      fileReader.onload = function() {
        var blob = new Blob([fileReader.result], {type: file.type});
        var url = URL.createObjectURL(blob);
        var video = document.createElement('video');
        var timeupdate = function() {
          if (snapImage()) {
            video.removeEventListener('timeupdate', timeupdate);
            video.pause();
          }
        };
        video.addEventListener('loadeddata', function() {
          if (snapImage()) {
            video.removeEventListener('timeupdate', timeupdate);
          }
        });
        var snapImage = function() {
          var canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
          var image = canvas.toDataURL();
          var success = image.length > 100000;
          if (success) {
            var img = document.createElement('img');
            img.src = image;
            cb(image);
            URL.revokeObjectURL(url);
          }
          return success;
        };
        video.addEventListener('timeupdate', timeupdate);
        video.preload = 'metadata';
        video.src = url;
        // Load video in Safari / IE11
        video.muted = true;
        video.playsInline = true;
        video.play();
      };
      fileReader.readAsArrayBuffer(file);
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
    const { messagelist, conversation, loadingMoreMessages, allMessagesLoaded } = this.props;
    if (!conversation) {
      return null
    }

    const chMessageBoxRef = this.chMessageBoxRef.current;
    if (loadingMoreMessages || allMessagesLoaded || messagelist.length < this.limit) {
      return
    }

    if(chMessageBoxRef.scrollTop < chMessageBoxRef.clientHeight) {
      // Set skip
      this.skip = messagelist.length;

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
    event.target.value = null;
  }

  viewMediaToggle(message) {
    let file = message ? message.attachments[0] : null
    this.setState({openMediaFile: file});
  }

  render() {
    let { 
      client,
      connecting,
      connected,
      messageError,
      messageLoading,
      loadingMoreMessages,
      messagelist,
      conversation,
      showCloseIcon,
      showChevron,
      disableComposer,
      disableComposerMessage,
      Message,
      showHeader = true,
      renderHeader,
      showComposerActions = true,
      typing,
      noConversationFoundMessage,
      allowGuestUsers,
      banList,
    } = this.props;

    const { text, dummyConversation, activeTab } = this.state;

    // Set dummy conversation if conversation doesn't exist
    if (!conversation) {
      conversation = dummyConversation
      messagelist = [];
    }

    // Modify message list
    messagelist = modifyMessageList(client, conversation, messagelist);

    // Disable composer setting
    let composerDisabled = false;
    if (disableComposer && typeof disableComposer == 'function') {
      composerDisabled = disableComposer(conversation)
    }

    // Set header details
    let headerActionButton;
    let headerTitle;
    let headerImage;
    let headerSubtitle;
    let conversationAdmins = [];
    let showTabs = false;

    const user = client.getCurrentUser();

    if (conversation) {
      conversation = modifyConversation(conversation, user);
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
        headerActionButton = <div id="ch_conv_unblock" onClick={() => this.unblockUser()}>Unblock User</div>
      } else {
        headerActionButton = <div id="ch_conv_block" onClick={() => this.blockUser()}>Block User</div>
      }

      if(conversation.ban && Object.keys(conversation.ban).length) {
        composerDisabled = true;
        disableComposerMessage = LANGUAGE_PHRASES.BAN_USER_MESSAGE
      }

      if(!allowGuestUsers && !conversation.canChat()) {
        composerDisabled = true;
        disableComposerMessage = LANGUAGE_PHRASES.NOT_ALLOWED_TO_CHAT
      }

      // Store conversation admins for easy comparision later
      if (conversation.members && conversation.members.length) {
        conversationAdmins = conversation.members
        .filter(member => member.isAdmin === true)
        .map(member => member.userId);
      }

      // Check show tabs in conversation window or not.
      showTabs = connected && !messageLoading && conversation.isAdmin && conversation.type && ["open", "public"].includes(conversation.type);
    }

    const typingStrings = typingString(typing);

    return (
      <div id="ch_conv_window" className="ch-conv-window">
        { conversation && showHeader && renderHeader && renderHeader(conversation) }
        { conversation && showHeader && !renderHeader && <Header
          imageSrc={headerImage}
          imageInitials={headerTitle}
          title={headerTitle}
          subtitle={headerSubtitle}
          showChevron={(showChevron && headerActionButton) ? true : false}
          renderDropDownList={() => {
            if (!headerActionButton) {
              return
            }

            return (
              <div className="ch-drop-down-list">
                {headerActionButton}
              </div>
            )
          }}

          renderRight={() => {
            return (
              <React.Fragment>
                { showCloseIcon && <i title="Close" translate="no" className="material-icons" onClick={this.onCloseIconClick}>close</i>}
              </React.Fragment>
            )
          }}/>
        }

        { showTabs && 
          <div className="conversation-window-tabs">
            <button onClick={()=>this.handleTabChange('chat')} className={"chat " + (activeTab == 'chat' ? 'active' : '')}>Chat</button>
            <button onClick={()=>this.handleTabChange('manage')} className={"manage " + (activeTab == 'manage' ? 'active' : '')}>Manage</button>
          </div>
        }
        
        <React.Fragment >
          <div style={{display: (activeTab == 'chat') ? 'block' : 'none'}} id="ch_messages_box" ref={this.chMessageBoxRef} className="ch-messages-box" onScroll={this.onScroll}>
            { <div className="ch-conversation-padding"> </div>}
           
            { (connecting || messageLoading) &&  <div className="center"><Loader /></div>}

            { messageError && <div className="center error">{messageError}</div>}

            <div className="ch-msg-list">
              { connected && !conversation && !messageLoading && noConversationFoundMessage && <div className="center no-record-found">{noConversationFoundMessage}</div>}

              { loadingMoreMessages && <Loader />}

              { conversation && !messagelist.length && !messageLoading && <div className="center no-record-found">Be the first one to post a message!</div>}


              {
                messagelist.map(message => {
                  return <Message 
                      key={message.id} 
                      message={message} 
                      isSentByAdmin={ conversationAdmins.includes(message.ownerId) }
                      onClickEvent={()=>this.viewMediaToggle(message)}
                      showMoreOptionsIcon={["open"].includes(conversation.type) && !conversation.isAdmin ? false : true}
                      renderMoreOptions={() => {
                      return (
                        <div className="ch-more-options-container">
                          { message.ownerId == user.id && !message.isDeleted && <p onClick={()=>this.deleteMessagesForEveryone(message.id)}>Delete for everyone</p>}
                          { !["open", "public"].includes(conversation.type) && <p onClick={()=>this.deleteMessagesForMe(message.id)}>Delete for me</p> }
                          { 
                            message.ownerId != user.id &&
                            conversation.isGroup && 
                            conversation.isAdmin && 
                            !banList.find(user => user.userId == message.ownerId) && 
                            <p onClick={()=> this.banConversationUsers(message.ownerId, message.owner.displayName)}>{LANGUAGE_PHRASES.BAN_USER}</p>
                          }
                          { 
                            message.ownerId != user.id &&
                            conversation.isGroup && 
                            conversation.isAdmin && 
                            banList.find(user => user.userId == message.ownerId) && 
                            <p onClick={()=> this.unbanConversationUsers(message.ownerId)}>{LANGUAGE_PHRASES.UNBAN_USER}</p>
                          }
                        </div>
                      )
                      }}
                    />
                })
              }

              <div className="ch-typing-strings">{typingStrings}</div>
            </div>
          </div>

          { conversation &&
            <div style={{display: (activeTab == 'chat') ? 'block' : 'none'}}>
              { composerDisabled ?
                <div className="ch-composer-disabled-box">
                  <div>{disableComposerMessage}</div>
                </div>
                :
                <div id="ch_send_box" className="ch-send-box">

                { showComposerActions &&
                  <>
                    <div className="ch-media-icon-box">
                      <i title={LANGUAGE_PHRASES.SHARE_GALLERY} translate="no" className="material-icons ch-attachment-icon">insert_photo</i>
                      <input id="ch_gallary_input" title={LANGUAGE_PHRASES.SHARE_GALLERY} className="ch-gallary-input" type="file" accept="image/*, video/*" onChange={this.sendMedia} />
                    </div>

                    <div className="ch-media-icon-box">
                      <i title={LANGUAGE_PHRASES.SHARE_DOCUMENT} translate="no" className="material-icons ch-attachment-icon">description</i>
                      <input id="ch_document_input" title={LANGUAGE_PHRASES.SHARE_DOCUMENT} className="ch-document-input" type="file" accept="application/*,.doc,.docx,.xls,.ppt" onChange={this.sendMedia} />
                    </div>
                  </>
                }
                  <textarea 
                    id="ch_input_box"
                    className="ch-input-box"
                    type="text"
                    placeholder={LANGUAGE_PHRASES.SEND_MESSAGE}
                    value={text}
                    onKeyPress={(e) => { this.handleKeyPress(e) }}
                    onChange={(e) => { this.handleChange(e) }} 
                    ></textarea>

                    <button
                      id="ch_send_button"
                      className="ch-send-button"
                      title={LANGUAGE_PHRASES.SEND}
                      onClick={this.sendMessage}
                    >
                      <i translate="no" className="ch-send-icon material-icons">send</i>
                    </button>

                </div>
              }
            </div>
          }

          { this.state.openMediaFile && <MediaLightBox file={this.state.openMediaFile} onCloseClick={()=> this.viewMediaToggle(null)} /> }

          { this.state.guestJoinFormOpened && <GuestJoinForm onCloseClick={this.toggleGuestJoinForm} onJoinedAsGuest={this.onJoinedAsGuest} /> }
        </React.Fragment>

        <React.Fragment>
          <div className="conversation-window-manage" style={{display: (activeTab == 'manage') ? 'block' : 'none'}}>
            { !banList.length && <div className="center no-record-found">Currently, no user is banned from sending messages to this Show</div>}
            <ul>
              {
                banList.map(user => {
                  return (
                    <SimpleList
                      key={user.userId}
                      title={user.user.displayName}
                      action={() => {
                        return (
                          <React.Fragment>
                            <span onClick={()=>this.unbanConversationUsers(user.userId)}>{LANGUAGE_PHRASES.UNBAN_USER}</span>
                          </React.Fragment>
                        )
                      }}
                    />
                  );
               })
              }
            </ul>
          </div>
        </React.Fragment>
      </div>
    );
  }
}

ConversationWindow = withChannelizeContext(ConversationWindow);

ConversationWindow.propTypes = {
  Message: PropTypes.elementType,
}

ConversationWindow.defaultProps = {
  Message: MessageSimple,
  showHeader: true,
  showComposerActions: true,
  noConversationFoundMessage: LANGUAGE_PHRASES.NO_CONVERSATION_SELECTED, 
  allowGuestUsers: false
};

const mapStateToProps = ({message, conversation, client}, ownProps) => {
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
    registerConversationEventHandlers,
    deleteMessagesForEveryone,
    deleteMessagesForMe,
    banConversationUsers,
    unbanConversationUsers,
    startWatchingAndSetActiveConversation,
    stopWatchingAndSetNullConversation,
    getConversationBanList,
    registerEventHandlers
   }
)(ConversationWindow);

export { ConversationWindow }
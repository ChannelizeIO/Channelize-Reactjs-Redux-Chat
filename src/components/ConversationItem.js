import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { lastMessageTimeParser, getLastMessageString } from "../utils";
import { withChannelizeContext } from '../context';
import { setActiveConversation } from "../actions";
import { Avatar } from "./Avatar";

class ConversationItem extends PureComponent {

  constructor(props) {
    super(props);
  }

  selectConversation = () => {
    const { conversation, onSelect } = this.props;
    this.props.setActiveConversation(conversation);

    if (onSelect && typeof onSelect == 'function') {
      onSelect(conversation);
    }
  }

  render() {
    const { client, activeConversation, conversation } = this.props;
    let message = { ...conversation.lastMessage };

    // Handle last message
    const lastMessageString = getLastMessageString(client, conversation);

    // Set Last Message time
    if(!message.createdAt) {
      message.time = lastMessageTimeParser(Date());
    } else {
      message.time = lastMessageTimeParser(message.updatedAt);
    }

    let style = {}
    if (activeConversation && activeConversation.id == conversation.id) {
      style = {'backgroundColor': '#fafafa'};
    }

    return (
      <li style={style} id={conversation.id} onClick={this.selectConversation}>

          <Avatar
            src={conversation.profileImageUrl}
            initials={conversation.title}
            className="ch-conversation-image">
              { conversation && conversation.user && conversation.user.isOnline && 
                <span className="ch-online-icon ch-show-element"></span> }
            </Avatar>

          <div className="ch-conversation-content">
          <div className="ch-conversation-content__upper">
            <div id="ch_title">{conversation.title}</div>
            <div id="ch_created_at" className="ch-created-at">{message.time}</div>
          </div>
          <div className="ch-conversation-content__lower">
            <div id="ch_last_msg_box" className="ch-last-msg-box">
              <div className="ch-last-message">{lastMessageString}</div>
            </div>
          </div>
          </div>
          
      </li>
    );
  }
}

ConversationItem = withChannelizeContext(ConversationItem);

const mapStateToProps = ({conversation}) => {
  return {...conversation};
}

ConversationItem = connect(
  mapStateToProps,
  { setActiveConversation },
)(ConversationItem);

export { ConversationItem }
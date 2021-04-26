import { 
  LOADING_MESSAGE_LIST,
  MESSAGE_LIST_FAIL,
  MESSAGE_LIST_SUCCESS,
  SENDING_MESSAGE,
  SEND_MESSAGE_FAIL,
  SEND_MESSAGE_SUCCESS,
  SENDING_FILE,
  SEND_FILE_FAIL,
  SEND_FILE_SUCCESS,
  LOADING_LOAD_MORE_MESSAGES,
  LOAD_MORE_MESSAGES_SUCCESS,
  LOAD_MORE_MESSAGES_FAIL,
  SET_ACTIVE_CONVERSATION,
  SET_ACTIVE_USERID,
  CONVERSATION_UPDATED_EVENT,
  MEMBERS_ADDED_EVENT,
  MEMBERS_REMOVED_EVENT,
  NEW_MESSAGE_RECEIVED_EVENT,
  USER_STATUS_UPDATED_EVENT,
  USER_UPDATED_EVENT,
  MARK_AS_READ_EVENT,
  TYPING_EVENT,
  DELETE_MESSAGE_EVENT,
  DELETE_MESSAGE_FOR_EVERYONE_EVENT,
  DELETING_MESSAGES_FOR_EVERYONE,
  DELETE_MESSAGES_FOR_EVERYONE_FAIL,
  DELETE_MESSAGES_FOR_EVERYONE_SUCCESS,
  DELETING_MESSAGES_FOR_ME,
  DELETE_MESSAGES_FOR_ME_FAIL,
  DELETE_MESSAGES_FOR_ME_SUCCESS,
  START_WATCHING_PROGRESS,
  START_WATCHING_FAIL,
  START_WATCHING_SUCCESS,
  STOP_WATCHING_PROGRESS,
  STOP_WATCHING_FAIL,
  STOP_WATCHING_SUCCESS,
  CONVERSATION_BAN_UPDATED_EVENT,
  CONVERSATION_BAN_LIST_SUCCESS,
  BAN_CONVERSATION_USERS_SUCCESS,
  UNBAN_CONVERSATION_USERS_SUCCESS,
} from '../constants';
import { createReducer, uniqueList } from '../utils';

const Channelize = window.Channelize;

const INITIAL_STATE = {
  messagelist: [],
  messageLoading: false,
  messageError: null,
  loadingMoreMessages: false,
  allMessagesLoaded: false,
  sendingMessage: false,

  //typing event
  typing: [],

  // Active conversation and userId
  conversation: null,
  userId: null,

  newMessage: null,
  sendingFile: false,

  // Conversation ban user list
  banList: [],
};

export const loadingMessageList = (state, action) => {
  state.messageLoading = true;
  state.messagelist = [];
  state.allMessagesLoaded = false;
};

export const messageListSuccess = (state, action) => {
  state.messageLoading = false;
  state.messagelist = action.payload;
};

export const messageListFail = (state, action) => {
  state.messageLoading = false;
  state.messageError = action.payload;
};

export const loadingLoadMoreMessages = (state, action) => {
  state.loadingMoreMessages = true;
};

export const loadMoreMessagesFail = (state, action) => {
  state.loadingMoreMessages = false;
  state.messageError = action.payload;
};

export const loadMoreMessagesSuccess = (state, action) => {
  state.loadingMoreMessages = false;
  if (!action.payload.length) {
    state.allMessagesLoaded = true;
  } else {
    state.messagelist = [...action.payload, ...state.messagelist];
    state.messagelist = uniqueList(state.messagelist);
  }
};

export const sendingMessage = (state, action) => {
  state.sendingMessage = true;
  action.payload.status = "pending";
  state.messagelist = [...state.messagelist, ...[action.payload]];
  state.messagelist = uniqueList(state.messagelist);
};

export const sendMessageSuccess = (state, action) => {
  state.sendingMessage = false;
  state.messagelist = [...state.messagelist, ...[action.payload]];
  state.messagelist = uniqueList(state.messagelist);
};

export const sendMessageFail = (state, action) => {
  action.payload.status = "failed";
  // state.messagelist = [...state.messagelist, ...[action.payload]];
  // state.messagelist = uniqueList(state.messagelist);
};

export const sendingFile = (state, action) => {
  state.sendingFile = true;
  state.messagelist = [...state.messagelist, ...[action.payload]];
  state.messagelist = uniqueList(state.messagelist);
};

export const sendFileSuccess = (state, action) => {
  state.sendingFile = false;
  state.messagelist = [...state.messagelist, ...[action.payload]];
  state.messagelist = uniqueList(state.messagelist);
};

export const sendFileFail = (state, action) => {
  state.sendingFile = false;
  // state.messagelist = [...[action.payload], ...state.messagelist];
  // state.messagelist = uniqueList(state.messagelist);
};

export const setActiveConversation = (state, action) => {
  state.conversation = action.payload;
  state.userId = null;
};

export const setActiveUserId = (state, action) => {
  state.userId = action.payload;
  state.conversation = null;
};

export const newMessageReceived = (state, action) => {
  let message = action.payload.message;
  if (state.conversation && state.conversation.id == message.conversationId) {
    state.messagelist = [...state.messagelist, ...[message]];
    state.messagelist = uniqueList(state.messagelist);

    state.newMessage = message;
  }
};

export const deleteMessagesForEveryoneEvent = (state, action) => {
  let conversation = action.payload.conversation;
  let messages = action.payload.messages;
  if (state.conversation && state.conversation.id == conversation.id) {
    let deletedMessageIds = messages.map(msg => msg.id);
    const finalList = state.messagelist.map(msg => {
      if (deletedMessageIds.includes(msg.id)) {
        msg.isDeleted = true;
        msg.body = "";
        msg.attachments = [];
        return msg;
      } else {
        return msg;
      }
    });
    state.messagelist = finalList;
  }
};

export const deleteMessageEvent = (state, action) => {
  let conversation = action.payload.conversation;
  let messages = action.payload.messages;
  if (state.conversation && state.conversation.id == conversation.id) {
    let deletedMessageIds = messages.map(msg => msg.id);
    state.messagelist = [...state.messagelist.filter(msg => !deletedMessageIds.includes(msg.id))];
  }
};

export const deleteMessagesForEveryoneSuccess = (state, action) => {
  const deletedMessageIds = action.payload;
  const finalList = state.messagelist.map(msg => {
    if (deletedMessageIds.includes(msg.id)) {
      msg.isDeleted = true;
      msg.body = "";
      msg.attachments = [];
      return msg;
    } else {
      return msg;
    }
  });
  state.messagelist = finalList;
};

export const deleteMessageForMeSuccess = (state, action) => {
  const deletedMessageIds = action.payload;
  state.messagelist = [...state.messagelist.filter(msg => !deletedMessageIds.includes(msg.id))];
};

export const conversationUpdated = (state, action) => {
  let { id, title, profileImageUrl } = action.payload.conversation;
  if (state.conversation && state.conversation.id == id) {
    const jsonConversaton = state.conversation.toJSON();
    let conversation = {...jsonConversaton, title, profileImageUrl, updatedAt: action.payload.timestamp};

    //Convert in conversation model
    const client = Channelize.core.Client.getInstance();
    state.conversation = new Channelize.core.Conversation.Model(client, conversation);
  }
};

export const membersAdded = (state, action) => {
  let { conversation, members, timestamp } = action.payload;
  if (state.conversation && state.conversation.id == conversation.id) {
    let jsonConversaton = state.conversation.toJSON();
    jsonConversaton.members = jsonConversaton.members.concat(members)
    jsonConversaton.memberCount = conversation.memberCount;
    jsonConversaton.updatedAt = timestamp;

    //Convert in conversation model
    const client = Channelize.core.Client.getInstance();
    state.conversation = new Channelize.core.Conversation.Model(client, jsonConversaton);
  }
}

export const membersRemoved = (state, action) => {
  let { conversation, members, timestamp } = action.payload;
  if (state.conversation && state.conversation.id == conversation.id) {
    let jsonConversaton = state.conversation.toJSON();
    jsonConversaton.memberCount = conversation.memberCount;
    jsonConversaton.updatedAt = timestamp;

    // Remove members
    members.forEach(removedMember => {
      const index = jsonConversaton.members.findIndex(member => member.userId == removedMember.id)
      if (index >=0) {
        jsonConversaton.members.splice(index, 1);
      }
    })

    //Convert in conversation model
    const client = Channelize.core.Client.getInstance();
    state.conversation = new Channelize.core.Conversation.Model(client, jsonConversaton);
  }
}

export const userStatusUpdated = (state, action) => {
  const user = action.payload.user;
  if (state.conversation && !state.conversation.isGroup && state.conversation.user.id == user.id) {
    let jsonConversaton = state.conversation.toJSON();
    jsonConversaton.user.isOnline = user.isOnline;
    jsonConversaton.user.lastSeen = user.lastSeen;

    //Convert in conversation model
    const client = Channelize.core.Client.getInstance();
    state.conversation = new Channelize.core.Conversation.Model(client, jsonConversaton);
  }
};

export const userUpdated = (state, action) => {
  const user = action.payload.user;
  if (state.conversation && !state.conversation.isGroup && state.conversation.user.id == user.id) {
    let jsonConversaton = state.conversation.toJSON();
    jsonConversaton.user.isOnline = user.isOnline;
    jsonConversaton.user.lastSeen = user.lastSeen;
    jsonConversaton.user.displayName = user.displayName;
    jsonConversaton.user.profileImageUrl = user.profileImageUrl;

    //Convert in conversation model
    const client = Channelize.core.Client.getInstance();
    state.conversation = new Channelize.core.Conversation.Model(client, jsonConversaton);
  }
};

export const markAsRead = (state, action) => {
  let { conversation, user, timestamp } = action.payload;

  if (state.conversation && state.conversation.id == conversation.id) {
    let jsonConversaton = state.conversation.toJSON();
    if (jsonConversaton.lastReadAt[user.id]) {
      jsonConversaton.lastReadAt[user.id] = timestamp;
    }

    //Convert in conversation model
    const client = Channelize.core.Client.getInstance();
    state.conversation = new Channelize.core.Conversation.Model(client, jsonConversaton);
  }
}

export const typingEvent = (state, action) => {
  const { conversation, isTyping, user} = action.payload;
  const activeConversation = state.conversation;
  if (!activeConversation || activeConversation.id != conversation.id) {
    return
  }

  const index = state.typing.findIndex(item => item.id == user.id);
  // If isTyping true, push user in  typing array
  if (isTyping && index < 0) {
    state.typing.push(user);
    return
  }

  // If isTyping false, remove user from typing array
  if (!isTyping && index >= 0) {
    state.typing.splice(index, 1);
  }
};

export const startWatchingProgress = (state, action) => {
  state.messageLoading = true;
}

export const startWatchingFail = (state, action) => {
  state.messageLoading = false;
  state.messageError = action.payload;
}

export const startWatchingSuccess = (state, action) => {
  state.messageLoading = false;
}

export const stopWatchingProgress = (state, action) => {
  state.messageLoading = true;
}

export const stopWatchingFail = (state, action) => {
  state.messageLoading = false;
  state.messageError = action.payload;
}

export const stopWatchingSuccess = (state, action) => {
  state.messageLoading = false;
}

export const conversationBanUpdatedEvent = (state, action) => {
  const { ban } = action.payload;
  const client = Channelize.core.Client.getInstance();

  const jsonConversaton = state.conversation.toJSON();;
  jsonConversaton.ban = ban
  
  state.conversation = new Channelize.core.Conversation.Model(client, jsonConversaton);
}

export const conversationBanListSuccess = (state, action) => {
  state.banList = action.payload;
}

export const banConversationUserSuccess = (state, action) => {
  const { conversation, userIds, displayName } = action.payload;

  const banUserList = userIds.map(userId => {
    return {userId, user: {displayName}};
  });

  const finalList = [...state.banList, ...banUserList];
  state.banList = finalList;
}

export const unbanConversationUserSuccess = (state, action) => {
  const { conversation, userIds } = action.payload;

  const finalList = state.banList.filter(user => !userIds.includes(user.userId));
  state.banList = finalList;
}

export const handlers = {
  [LOADING_MESSAGE_LIST]: loadingMessageList,
  [MESSAGE_LIST_SUCCESS]: messageListSuccess,
  [MESSAGE_LIST_FAIL]: messageListFail,
  [SENDING_MESSAGE]: sendingMessage,
  [SEND_MESSAGE_SUCCESS]: sendMessageSuccess,
  [SEND_MESSAGE_FAIL]: sendMessageFail,
  [SENDING_FILE]: sendingFile,
  [SEND_FILE_FAIL]: sendFileFail,
  [SEND_FILE_SUCCESS]: sendFileSuccess,
  [LOADING_LOAD_MORE_MESSAGES]: loadingLoadMoreMessages,
  [LOAD_MORE_MESSAGES_SUCCESS]: loadMoreMessagesSuccess,
  [LOAD_MORE_MESSAGES_FAIL]: loadMoreMessagesFail,
  [SET_ACTIVE_CONVERSATION]: setActiveConversation,
  [SET_ACTIVE_USERID]: setActiveUserId,
  [CONVERSATION_UPDATED_EVENT]: conversationUpdated,
  [MEMBERS_ADDED_EVENT]: membersAdded,
  [MEMBERS_REMOVED_EVENT]: membersRemoved,
  [NEW_MESSAGE_RECEIVED_EVENT]: newMessageReceived,
  [USER_STATUS_UPDATED_EVENT]: userStatusUpdated,
  [USER_UPDATED_EVENT]: userUpdated,
  [MARK_AS_READ_EVENT]: markAsRead,
  [TYPING_EVENT]: typingEvent,
  [DELETE_MESSAGE_FOR_EVERYONE_EVENT]: deleteMessagesForEveryoneEvent,
  [DELETE_MESSAGE_EVENT]: deleteMessageEvent,
  [DELETE_MESSAGES_FOR_EVERYONE_SUCCESS]: deleteMessagesForEveryoneSuccess,
  [DELETE_MESSAGES_FOR_ME_SUCCESS]: deleteMessageForMeSuccess,
  [START_WATCHING_PROGRESS]: startWatchingProgress,
  [START_WATCHING_FAIL]: startWatchingFail,
  [START_WATCHING_SUCCESS]: startWatchingSuccess,
  [STOP_WATCHING_PROGRESS]: stopWatchingProgress,
  [STOP_WATCHING_FAIL]: stopWatchingFail,
  [STOP_WATCHING_SUCCESS]: stopWatchingSuccess,
  [CONVERSATION_BAN_UPDATED_EVENT]: conversationBanUpdatedEvent,
  [CONVERSATION_BAN_LIST_SUCCESS]: conversationBanListSuccess,
  [BAN_CONVERSATION_USERS_SUCCESS]: banConversationUserSuccess,
  [UNBAN_CONVERSATION_USERS_SUCCESS]: unbanConversationUserSuccess,
};

export default createReducer(INITIAL_STATE, handlers);
import {
  LOADING_CONVERSATION_LIST,
  CONVERSATION_LIST_FAIL,
  CONVERSATION_LIST_SUCCESS,
  LOADING_LOAD_MORE_CONVERSATIONS,
  LOAD_MORE_CONVERSATIONS_FAIL,
  LOAD_MORE_CONVERSATIONS_SUCCESS,
  USER_STATUS_UPDATED_EVENT,
  NEW_MESSAGE_RECEIVED_EVENT,
  USER_JOINED_EVENT,
  MEMBERS_ADDED_EVENT,
  MEMBERS_REMOVED_EVENT,
  CONVERSATION_UPDATED_EVENT,
  USER_UPDATED_EVENT,
  MARK_AS_READ_EVENT,
  DELETE_MESSAGE_FOR_EVERYONE_EVENT,
  DELETE_MESSAGE_EVENT,
} from '../constants';
import { createReducer, uniqueList } from '../utils';

const INITIAL_STATE = {
  conversationlist: [],
  conversationLoading: false,
  loadingMoreConversations: false,
  allConversationsLoaded: false,
  conversationError: null,

};

export const loadingConversationList = (state, action) => {
  state.conversationLoading = true;
};

export const listConversationSuccess = (state, action) => {
  state.conversationLoading = false;
  state.conversationlist = action.payload;
};

export const listConversationFail = (state, action) => {
  state.conversationLoading = false;
  state.conversationError = action.payload;
};

export const loadingLoadMoreConversations = (state, action) => {
  state.loadingMoreConversations = true;
};

export const loadMoreConversationsSuccess = (state, action) => {
  state.loadingMoreConversations = false;
  if (!action.payload.length) {
    state.allConversationsLoaded = true;
  } else {
    state.conversationlist = [...state.conversationlist, ...action.payload];
    state.conversationlist = uniqueList(state.conversationlist);
  }
};

export const loadMoreConversationsFail = (state, action) => {
  state.loadingMoreConversations = false;
  state.conversationError = action.payload;
};

export const userStatusUpdated = (state, action) => {
  let user = action.payload.user;
  const finalList = state.conversationlist.map((conversation, index) => {
    if (!conversation.isGroup && conversation.user.id == user.id) {
      conversation.user.isOnline = user.isOnline;
      conversation.user.lastSeen = user.lastSeen;

      return conversation;
    } else {
      return conversation;
    }
  })

  state.conversationlist = finalList;
};

export const userUpdated = (state, action) => {
  let user = action.payload.user;
  const finalList = state.conversationlist.map((conversation, index) => {
    if (!conversation.isGroup && conversation.user.id == user.id) {
      conversation.user.isOnline = user.isOnline;
      conversation.user.lastSeen = user.lastSeen;
      conversation.user.displayName = user.displayName;
      conversation.user.profileImageUrl = user.profileImageUrl;

      return conversation;
    } else {
      return conversation;
    }
  })

  state.conversationlist = finalList;
};

export const newMessageReceived = (state, action) => {
  let message = action.payload.message;

  let conversationIndex;
  let latestConversation;

  const finalList = state.conversationlist.map((conversation, index) => {
    if (conversation.id == message.conversationId) {
      conversation.lastMessage = message;
      conversation.updatedAt = action.payload.timestamp;

      conversationIndex = index;
      latestConversation = conversation;

      return conversation;
    } else {
      return conversation;
    }
  })

  // Move up the latest conversation
  if (conversationIndex > 0) {
    finalList.splice(conversationIndex, 1);
    finalList.unshift(latestConversation);
  }

  state.conversationlist = finalList;
};

export const deleteMessagesForEveryoneEvent = (state, action) => {
  let messages = action.payload.messages;
  const finalList = state.conversationlist.map((conversation) => {
    if (conversation.id == action.payload.conversation.id && conversation.lastMessage) {
      let deletedMessageIds = messages.map(msg => msg.id);
      if (deletedMessageIds.includes(conversation.lastMessage.id)) {
        conversation.lastMessage.isDeleted = true;
        conversation.lastMessage.body = "";
        conversation.lastMessage.attachments = [];
        conversation.updatedAt = action.payload.timestamp;
        return conversation;
      } else {
        return conversation;
      }
    } else {
      return conversation;
    }
  });
  
  state.conversationlist = finalList;
};

export const deleteMessageEvent = (state, action) => {
  let messages = action.payload.messages;
  state.conversationlist.map((conversation, index) => {
    if (conversation.id != action.payload.conversation.id || !conversation.lastMessage) {
      return;
    }
    let deletedMessageIds = messages.map(msg => msg.id);
    if (!deletedMessageIds.includes(conversation.lastMessage.id)) {
      return;
    }
    state.conversationlist[index] = action.payload.conversation;
  });
};

export const conversationUpdated = (state, action) => {
  let conversation = action.payload.conversation;

  let conversationIndex;
  let latestConversation;

  const finalList = state.conversationlist.map((item, index) => {
    if (item.id == conversation.id) {
      item.title = conversation.title;
      item.profileImageUrl = conversation.profileImageUrl;
      item.updatedAt = action.payload.timestamp;

      conversationIndex = index;
      latestConversation = item;

      return item;
    } else {
      return item;
    }
  })

  // Move up the latest conversation
  if (conversationIndex > 0) {
    finalList.splice(conversationIndex, 1);
    finalList.unshift(latestConversation);
  }

  state.conversationlist = finalList;
};

export const userJoined = (state, action) => {
  const { conversation } = action.payload;
  state.conversationlist = [...[conversation], ...state.conversationlist];
  state.conversationlist = uniqueList(state.conversationlist);
};

export const membersAdded = (state, action) => {
  let { conversation, members, timestamp } = action.payload;

  let conversationIndex;
  let latestConversation;

  const finalList = state.conversationlist.map((item, index) => {
    if (item.id == conversation.id) {
      item.memberCount = conversation.memberCount;
      item.updatedAt = timestamp;
      item.members = item.members.concat(members)

      conversationIndex = index;
      latestConversation = item;

      return item;
    } else {
      return item;
    }
  })

  // Move up the latest conversation
  if (conversationIndex > 0) {
    finalList.splice(conversationIndex, 1);
    finalList.unshift(latestConversation);
  }

  state.conversationlist = finalList;
};

export const membersRemoved = (state, action) => {
  let { conversation, members, timestamp } = action.payload;

  let conversationIndex;
  let latestConversation;

  const finalList = state.conversationlist.map((item, index) => {
    if (item.id == conversation.id) {
      item.memberCount = conversation.memberCount;
      item.updatedAt = timestamp;

      // Remove members
      members.forEach(removedMember => {
        const index = item.members.findIndex(member => member.userId == removedMember.id)
        if (index >=0) {
          item.members.splice(index, 1);
        }
      })

      conversationIndex = index;
      latestConversation = item;

      return item;
    } else {
      return item;
    }
  })

  // Move up the latest conversation
  if (conversationIndex > 0) {
    finalList.splice(conversationIndex, 1);
    finalList.unshift(latestConversation);
  }

  state.conversationlist = finalList;
};

export const markAsRead = (state, action) => {
  let { conversation, user, timestamp } = action.payload;

  const finalList = state.conversationlist.map((item, index) => {
    if (item.id == conversation.id) {
      if (item.lastReadAt[user.id]) {
        item.lastReadAt[user.id] = timestamp;
      }

      return item;
    } else {
      return item;
    }
  })

  state.conversationlist = finalList;
}

export const handlers = {
  [LOADING_CONVERSATION_LIST]: loadingConversationList,
  [CONVERSATION_LIST_FAIL]: listConversationFail,
  [CONVERSATION_LIST_SUCCESS]: listConversationSuccess,
  [LOADING_LOAD_MORE_CONVERSATIONS]: loadingLoadMoreConversations,
  [LOAD_MORE_CONVERSATIONS_FAIL]: loadMoreConversationsFail,
  [LOAD_MORE_CONVERSATIONS_SUCCESS]: loadMoreConversationsSuccess,
  [USER_STATUS_UPDATED_EVENT]: userStatusUpdated,
  [NEW_MESSAGE_RECEIVED_EVENT]: newMessageReceived,
  [USER_JOINED_EVENT]: userJoined,
  [MEMBERS_ADDED_EVENT]: membersAdded,
  [MEMBERS_REMOVED_EVENT]: membersRemoved,
  [CONVERSATION_UPDATED_EVENT]: conversationUpdated,
  [USER_UPDATED_EVENT]: userUpdated,
  [MARK_AS_READ_EVENT]: markAsRead,
  [DELETE_MESSAGE_FOR_EVERYONE_EVENT]: deleteMessagesForEveryoneEvent,
  [DELETE_MESSAGE_EVENT]: deleteMessageEvent,

};

export default createReducer(INITIAL_STATE, handlers);
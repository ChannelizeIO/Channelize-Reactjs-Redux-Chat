import { LANGUAGE_PHRASES } from "../constants";
import {produce, setAutoFreeze} from "immer"
import moment from 'moment';
import { IMAGES } from "../constants";
setAutoFreeze(false);

export function createReducer(initialState, actionsMap) {
  return (state = initialState, action) => {
    return produce(state, draft => {
      const caseReducer = actionsMap[action.type];
      return caseReducer ? caseReducer(draft, action) : undefined;
    });
  };
}

export function uniqueList(list) {
  return list.reduce((uniqList, currentValue) => {
    let ids = uniqList.map(item => {
      return item.id;
    });
    if (ids.indexOf(currentValue.id) < 0) {
      uniqList.push(currentValue);
    }
    return uniqList;
  }, []);
};

export const modifyConversation = (conversation) => {
  if (!conversation) {
    return
  }

  if (!conversation.isGroup) {
    if (conversation.user) {
      conversation.title = conversation.user.displayName;
      if (conversation.user.profileImageUrl) {
        conversation.profileImageUrl = conversation.user.profileImageUrl;
      } else {
        conversation.profileImageUrl = IMAGES.AVTAR;
      }
    } else {
      conversation.title = "Deleted User";
      conversation.profileImageUrl = IMAGES.AVTAR;
    }
  } else {
    conversation.profileImageUrl = conversation.profileImageUrl ? conversation.profileImageUrl : IMAGES.GROUP;
  }

  return conversation;
}

export const modifyMessageList = (client, conversation, list) => {
  const user = client.getCurrentUser();

  // Find last message of logged-in user
  let lastMessage;
  list.forEach(message => {
    if (user.id == message.ownerId) {
      lastMessage = message;
    }
  })

  return list.map((message, i) => {
    // Determine if show read status
    message.readByAll = null;
    message.showReadStatus = false;
    if (lastMessage && lastMessage.id == message.id) {
      message.showReadStatus = true;
      message.readByAll = conversation.readByAllMembers(message);
    }

    // Handle created At
    if(!('createdAt' in message)) {
      message.createdAt = Date.now();
    }
    message['time'] = AMorPMTimeParser(message.createdAt);

    // Handle message owner
    if(!message.owner) {
      message.owner = {
        id: user.id,
        displayName: user.displayName,
        profileImageUrl: user.profileImageUrl
      };
    }
    if (!('profileImageUrl' in message.owner)) {
      message.owner.profileImageUrl = IMAGES.AVTAR
    }

    // Determine if message owner is self or other?
    message['isUser'] = false;
    if (user.id == message.ownerId) {
      message.isUser = true;
    }

    // Replace body of deleted message
    if(message.isDeleted) {
      message.body = "<i>" + LANGUAGE_PHRASES.MESSAGE_DELETED + '</i>';
    }

    // Set showOwnerAvatar & showDateSeparator props
    if (i < list.length) {
      let nextMessage = list[i + 1];

      message.showOwnerAvatar = false;
      const isUserLastMessage = (i == list.length -1 && user.id == message.owner.id);
      message.showOwnerAvatar = !(isSameUser(message, nextMessage, user) || isUserLastMessage)

      let prevMessage = list[i - 1];
      message.showDateSeparator = !isSameDay(message, prevMessage)
    }

    return message;
  });
};

export const getLastMessageString = (client, conversation) => {
  const user = client.getCurrentUser();
  let message = conversation.lastMessage;

  if (!message) {
    return "";
  }

  let lastMessageString;
  if (!Object.keys(message).length) {
    lastMessageString = '';
    return lastMessageString;
  }

  // Handle admin message
  if (message.type == 'admin') {
    lastMessageString = 'Admin message';

    return lastMessageString
  }

  // Handle attachment
  const attachments = message.attachments;
  if (attachments && attachments.length) {
    const attachment = attachments[0];

    if (message.owner.id == user.id) {
      lastMessageString = `You sent a ${attachment.type}`
    } else {
      const displayName = capitalize(message.owner.displayName);
      lastMessageString = `${displayName} sent a ${attachment.type}`
    }

    return lastMessageString;
  }

  // Set messageOwnerName
  let messageOwnerName;
  if (message.owner) {
    if (message.owner.id == user.id) {
      messageOwnerName = 'You: '
    } else {
      if (conversation.isGroup) {
        const displayName = capitalize(message.owner.displayName);
        messageOwnerName = `${displayName}: `;
      }
    }
  }

  if (message.isDeleted) {
    message.body = "This message was deleted."
  }

  if (!messageOwnerName) {
    lastMessageString = `${message.body}`
  } else {
    lastMessageString = `${messageOwnerName}${message.body}`
  }

  return lastMessageString;
}

export function lastMessageTimeParser(time) {
  const today = new Date();
  const todayDate = today.getDate();
  const todayMonth = today.getMonth() + 1;
  const todayYear = today.getFullYear();

  const inputDate = new Date(time);
  const inputTimeDate = inputDate.getDate();
  const inputTimeMonth = inputDate.getMonth() + 1;
  const inputTimeYear = inputDate.getFullYear();

  const showWeekDay = inputTimeYear == todayYear && inputTimeMonth == todayMonth && todayDate - inputTimeDate <= 7;
  const showTime = inputTimeYear == todayYear && inputTimeMonth == todayMonth && inputTimeDate == todayDate;
  if (showTime) {
    return AMorPMTimeParser(inputDate);
  } else if (showWeekDay) {
    const weeks = [
     'Sun',
     'Mon',
     'Tue',
     'Wed',
     'Thu',
     'Fri',
     'Sat'
    ]
    return weeks[inputDate.getDay()];
  } else {
    return inputTimeMonth + '/' + inputTimeDate + '/' + inputTimeYear;
  }
}

export function AMorPMTimeParser(time) {
  const inputDate = new Date(time);
  let hours = inputDate.getHours();
  var AmOrPm = hours >= 12 ? 'PM' : 'AM';
  hours = (hours % 12) || 12;
  var minutes = '0' + inputDate.getMinutes() ;
  return hours + ":" + minutes.substr(-2) + " " + AmOrPm;
}

export function dateSeparatorParser(time) {
  const today = new Date();
  const todayDate = today.getDate();
  const todayMonth = today.getMonth() + 1;
  const todayYear = today.getFullYear();

  const inputDate = new Date(time);
  const inputTimeDate = inputDate.getDate();
  const inputTimeMonth = inputDate.getMonth() + 1;
  const inputTimeYear = inputDate.getFullYear();

  const showToday = inputTimeYear == todayYear && inputTimeMonth == todayMonth && todayDate == inputTimeDate;
  const showYesterday = inputTimeYear == todayYear && inputTimeMonth == todayMonth && (todayDate - inputTimeDate) == 1;
  if(showToday) {
    return 'Today';
  } else if (showYesterday) {
    return 'Yesterday';
  } else {
    return inputTimeMonth + '/' + inputTimeDate + '/' + inputTimeYear;
  }
}

export function isSameDay(currentMessage, diffMessage) {
  if (!currentMessage || !currentMessage.createdAt || !diffMessage || !diffMessage.createdAt) {
    return false;
  }

  let currentCreatedAt = new Date(currentMessage.createdAt);
  let diffCreatedAt = new Date(diffMessage.createdAt);
  return currentCreatedAt.getDate() == diffCreatedAt.getDate();
}

export function isSameUser(currentMessage, diffMessage, user) {
  return !!(diffMessage &&
    diffMessage.owner &&
    currentMessage.owner && (
    user.id === currentMessage.owner.id ||
    diffMessage.owner.id === currentMessage.owner.id));
}

export const capitalize = (s) => {
  if (!s) return
  s = s.split(" ");

  for (var i = 0, x = s.length; i < x; i++) {
      if (!s[i]) {
        s[i] = s[i];
      } else {
        s[i] = s[i][0].toUpperCase() + s[i].substr(1);
      }
  }

  return s.join(" ");
}
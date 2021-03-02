import {produce, setAutoFreeze} from "immer"
import moment from 'moment';
import { LANGUAGE_PHRASES, ADMIN_MSG_FORMATS, CALL_FORMATS, IMAGES } from "../constants";
var sprintf = require('sprintf-js').sprintf
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
    }else {
      uniqList.splice(ids.indexOf(currentValue.id), 1, currentValue);
    }
    return uniqList;
  }, []);
};

export const modifyConversation = (conversation, loginUser) => {
  if (!conversation) {
    return
  }

  if (!conversation.isGroup) {
    if (conversation.user) {
      conversation.title = conversation.user.displayName;
      if (conversation.user.profileImageUrl) {
        conversation.profileImageUrl = conversation.user.profileImageUrl;
      }
    } else {
      conversation.title = "Deleted User";
    }
  }

  // Set conversation members
  conversation.otherMemberIds = [];
  if (conversation.members) {
    conversation.members.map((member) => {
      if(member.userId != loginUser.id) {
        conversation.otherMemberIds.push(member.userId);
      }
    });
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
      message.readByAll = !message.pending && conversation.readByAllMembers(message);
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
    if (('displayName' in message.owner)) {
      message.owner.displayName = capitalize(message.owner.displayName)
    }

    // Determine if message owner is self or other?
    message['isUser'] = false;
    if (user.id == message.ownerId) {
      message.isUser = true;
    }

    // Replace body of deleted message
    if(message.isDeleted) {
      message.body = LANGUAGE_PHRASES.MESSAGE_DELETED;
    }

    // Set showOwnerAvatar & showDateSeparator props
    if (i < list.length) {
      let nextMessage = list[i + 1];

      message.showOwnerAvatar = false;
      const isUserLastMessage = (i == list.length -1 && user.id == message.owner.id);
      message.showOwnerAvatar = !(isSameUser(message, nextMessage, user) || isUserLastMessage || message.isUser);

      let prevMessage = list[i - 1];
      message.showDateSeparator = !isSameDay(message, prevMessage)
    }

    // Handle admin message
    if (message.type == 'admin') {
      message.system = true;
      message = _modifyAdminMessage(user, message);
    }

    return message;
  });
};

export const getLastMessageString = (client, conversation) => {
  const user = client.getCurrentUser();
  let message = conversation.lastMessage;

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

export const typingString = (typing) => {
  if (!typing.length) {
    return null;
  }

  typing = typing.map(user => capitalize(user.displayName.trim().split(' ')[0]));
  if (typing.length == 1) {
    return `${typing[0]} is typing...`;
  } else if(typing.length == 2) {
    const firstUser = typing[0];
    const secondUser = typing[1];
    return `${firstUser} and {secondUser} are typing...`;
  } else if(typing.length > 2) {
    const commaSeparatedUsers = typing.slice(0, -1).join(', ')
    const lastuser = typing.slice(-1);
    return `${commaSeparatedUsers} and {lastuser} are typing...`;
  }
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

const _modifyAdminMessage = (user, message) => {
  if (message.type != 'admin') {
    return message;
  }

  const attachments = message.attachments;
  if (!attachments.length) {
    return message;
  }

  let attachment = attachments[0];
  let metaData = attachment.metaData;

  if(metaData.type == "voice" || metaData.type == "video") {
    let duration = metaData.duration ? " " + secondsToHms(metaData.duration) : "";
    message.text = CALL_FORMATS[attachment.adminMessageType] + duration;
    return message;
  }

  // Manipulate subject
  let subName;
  if (metaData.subType == 'user') {
    if (user.id == metaData.subId) {
      subName = LANGUAGE_PHRASES.YOU;
    } else {
      if (metaData.subUser) {
        subName = capitalize(metaData.subUser.displayName);
      } else {
        subName = LANGUAGE_PHRASES.DELETED_MEMBER;
      }
    }
  }

  // Manipulate object
  let objNames;
  const objType = metaData.objType;
  const objValues = metaData.objValues;
  if (metaData.objType == 'user') {
    if (metaData.objUsers) {
      if (user.id == metaData.objUsers.id) {
        objNames = LANGUAGE_PHRASES.YOU;
      } else {
        objNames = capitalize(metaData.objUsers.displayName);
      }
    } else {
      objNames = LANGUAGE_PHRASES.DELETED_MEMBER;
    }
  } else if(metaData.objType == 'users' && Array.isArray(objValues)) {
    let names = [];
    objValues.forEach(value => {
      const objUser = metaData.objUsers.find(objUser => objUser && objUser.id == value);
      let name;
      if (objUser) {
        name = capitalize(objUser.displayName);
      } else {
        name = LANGUAGE_PHRASES.DELETED_MEMBER;
      }
      names.push(name);
    });
    objNames = names.join(', ');
  } else if(metaData.objType == 'group') {
    if(typeof objValues == 'string') {
      objNames = capitalize(objValues);
    } else {
      objNames = objValues;
    }
  }

  const format = ADMIN_MSG_FORMATS[attachment.adminMessageType];
  if (format) {
    message.text = sprintf(format, subName, objNames);
  }

  return message
}

function secondsToHms(second) {
  second = Number(second);
  var h = Math.floor(second / 3600);
  var m = Math.floor(second % 3600 / 60);
  var s = Math.floor(second % 3600 % 60);

  var hDisplay = h > 0 ? h + "h " : "";
  var mDisplay = m > 0 ? m + "m " : "";
  var sDisplay = s > 0 ? s + "s ": "";
  return hDisplay + mDisplay + sDisplay; 
}

export const getCookie = (cname) => {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

export const setCookie = (cname, cvalue, exdays) => {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
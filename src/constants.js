export const LANGUAGE_PHRASES = {
	CHAT : "Chat",
	CLOSE : "Close",
	ONLINE : "Online",
	NO_CONV_FOUND : "No conversations found!",
	NO_MESSAGES_FOUND : "No messages found!",
	DELETED_MEMBER : "Deleted Member",
	MESSAGE_DELETED : "This message was deleted",
	LAST_SEEN : "Last Seen ",
	MUTE_CONV : "Mute Conversation",
	CLEAR_CONV : "Clear Conversation",
	DELETE_CONV : "Delete Conversation",
	BLOCK_USER : "Block User",
	UNBLOCK_USER : "Unblock User",
	SEND_MESSAGE : "Send a message",
	DELETE : "Delete",
	IMAGE : "Image",
	AUDIO : "Audio",
	VIDEO : "Video",
	LOCATION : "Location",
	STICKER : "Sticker",
	GIF : "GIF",
	SHARE_GALLERY : "Share photo & video",
	SHARE_DOCUMENT : "Share a document",
	SEND_ATTACHMENTS : "Send Attachments",
	MEMBERS : "Members",
	FILE_SIZE_WARNING : "File size should be less then 25mb",
	SEARCH : "Search",
	SUGGESTED : "Suggested",
	MORE_USERS : "More Users",
	LOGIN : "Login",
	LOGOUT : "Logout",
	NAME : "Name",
	START : "Start",
	LOGIN_WITH_TEST_USERS : "OR Login with Test users",
	ENTER_NAME : "Please enter a name",
	USER_EXIST : "User already exist with this username",
	DELETE_FOR_ME : "Delete for me",
	DELETE_FOR_EVERYONE : "Delete for everyone",
	DOWNLOAD_FILE_NAME : "File",
	YOU : "You",
	SEND : "Send",
	HOST : "Host",
	NO_CONVERSATION_SELECTED: 'No conversation seleted',
	GUEST_JOIN_HEADING: 'Enter your name to join the Chat',
	GUEST_JOIN_ERROR_DISPLAY_NAME: 'Please enter a valid name',
	GUEST_JOIN_LABEL_DISPLAY_NAME: 'Enter your name here',
}

export const ADMIN_MSG_FORMATS = {
	admin_group_create: "%s created group %s",
	admin_group_join: "%s joined",
	admin_group_add_members: "%s added %s",
	admin_group_remove_members: "%s removed %s",
	admin_group_leave: "%s left",
	admin_group_make_admin: "%s are now an admin",
	admin_group_change_title: "%s changed the title to %s",
	admin_group_change_photo: "%s changed group photo",
	admin_call_video_missed: "%s missed a video call from %s",
	admin_call_voice_missed: "%s missed a voice call from %s",
	admin_custom_auction_winner: "Winner: %s",
	admin_custom_auction_backup: "Backup: %s",
}

export const CALL_FORMATS = {
	admin_call_rejected : "Call Rejected",
	admin_call_completed : "Call Completed",
	admin_call_not_answered : "Call Not Answered",
	admin_call_missed : "Missed Call"
}

export const IMAGES = {
	LAUNCHER_ICON : "https://cdn.channelize.io/apps/web-widget/1.0.0/images/launcher-icon.svg",
	ANNA_SMITH : "https://cdn.channelize.io/apps/web-widget/1.0.0/images/anna-smith.jpg",
	KATRINA_CHARLEY : "https://cdn.channelize.io/apps/web-widget/1.0.0/images/katrina-charley.png",
	NATALIE_IVANOVIC : "https://cdn.channelize.io/apps/web-widget/1.0.0/images/natalie-ivanovic.jpeg",
	ERIC_ANDREWS : "https://cdn.channelize.io/apps/web-widget/1.0.0/images/eric-andrews.jpeg",
	GALLERY_ICON : "https:/cdn.channelize.io/apps/web-widget/1.0.0/images/gallery.png",
	AUDIO_ICON : "https://cdn.channelize.io/apps/web-widget/1.0.0/images/audio.png",
	VIDEO_ICON : "https://cdn.channelize.io/apps/web-widget/1.0.0/images/video.svg",
	LOCATION_ICON : "https://cdn.channelize.io/apps/web-widget/1.0.0/images/location.svg",
	STICKER_ICON : "https://cdn.channelize.io/apps/web-widget/1.0.0/images/sticker.png",
	GIF_ICON : "https://cdn.channelize.io/apps/web-widget/1.0.0/images/gif.png",
	// AVTAR : "https://cdn.channelize.io/apps/web-widget/1.0.0/images/avtar.png",
	// GROUP : "https://cdn.channelize.io/apps/web-widget/1.0.0/images/group.png",
}

export const SETTINGS = {
	LOCATION_API_KEY : "AIzaSyBzrL8FaUvmYPIxEUd_VTPpqcACtPdniik",
	LOCATION_IMG_URL : "https://maps.googleapis.com/maps/api/staticmap"
}

export const CONNECTING = 'CONNECTING'
export const CONNECT_SUCCESS = 'CONNECT_SUCCESS'
export const CONNECT_FAIL = 'CONNECT_FAIL'
export const DISCONNECT_SUCCESS = 'DISCONNECT_SUCCESS'
export const DISCONNECT_FAIL = 'DISCONNECT_FAIL'

export const NEW_MESSAGE_RECEIVED_EVENT = 'NEW_MESSAGE_RECEIVED_EVENT'
export const USER_STATUS_UPDATED_EVENT = 'USER_STATUS_UPDATED'
export const MARK_AS_READ_EVENT = 'MARK_AS_READ_EVENT'
export const USER_BLOCKED_EVENT = 'USER_BLOCKED_EVENT'
export const USER_UNBLOCKED_EVENT = 'USER_UNBLOCKED_EVENT'
export const USER_JOINED_EVENT = 'USER_JOINED_EVENT'
export const MEMBERS_ADDED_EVENT = 'MEMBERS_ADDED_EVENT'
export const MEMBERS_REMOVED_EVENT = 'MEMBERS_REMOVED_EVENT'
export const CONVERSATION_UPDATED_EVENT = 'CONVERSATION_UPDATED_EVENT'
export const USER_UPDATED_EVENT = 'USER_UPDATED_EVENT'

export const LOADING_FRIENDS_LIST = 'LOADING_FRIENDS_LIST'
export const FRIENDS_LIST_FAIL = 'FRIENDS_LIST_FAIL'
export const FRIENDS_LIST_SUCCESS = 'FRIENDS_LIST_SUCCESS'
export const LOADING_LOAD_MORE_FRIENDS = 'LOADING_LOAD_MORE_FRIENDS'
export const LOAD_MORE_FRIENDS_SUCCESS = 'LOAD_MORE_FRIENDS_SUCCESS'
export const LOAD_MORE_FRIENDS_FAIL = 'LOAD_MORE_FRIENDS_FAIL'
export const LOADING_MORE_USERS_LIST = 'LOADING_MORE_USERS_LIST'
export const MORE_USERS_LIST_FAIL = 'MORE_USERS_LIST_FAIL'
export const MORE_USERS_LIST_SUCCESS = 'MORE_USERS_LIST_SUCCESS'
export const LOADING_SEARCH_FRIENDS = 'LOADING_SEARCH_FRIENDS'
export const SEARCH_FRIENDS_SUCCESS = 'SEARCH_FRIENDS_SUCCESS'
export const SEARCH_FRIENDS_FAIL = 'SEARCH_FRIENDS_FAIL'

export const LOADING_CONVERSATION_LIST = 'LOADING_CONVERSATION_LIST'
export const CONVERSATION_LIST_FAIL = 'CONVERSATION_LIST_FAIL'
export const CONVERSATION_LIST_SUCCESS = 'CONVERSATION_LIST_SUCCESS'
export const LOADING_LOAD_MORE_CONVERSATIONS = 'LOADING_LOAD_MORE_CONVERSATIONS'
export const LOAD_MORE_CONVERSATIONS_FAIL = 'LOAD_MORE_CONVERSATIONS_FAIL'
export const LOAD_MORE_CONVERSATIONS_SUCCESS = 'LOAD_MORE_CONVERSATIONS_SUCCESS'

export const LOADING_MESSAGE_LIST = 'LOADING_MESSAGE_LIST'
export const MESSAGE_LIST_FAIL = 'MESSAGE_LIST_FAIL'
export const MESSAGE_LIST_SUCCESS = 'MESSAGE_LIST_SUCCESS'
export const SENDING_MESSAGE = 'SENDING_MESSAGE'
export const SEND_MESSAGE_FAIL = 'SEND_MESSAGE_FAIL'
export const SEND_MESSAGE_SUCCESS = 'SEND_MESSAGE_SUCCESS'
export const SENDING_FILE = 'SENDING_FILE'
export const SEND_FILE_FAIL = 'SEND_FILE_FAIL'
export const SEND_FILE_SUCCESS = 'SEND_FILE_SUCCESS'
export const LOADING_LOAD_MORE_MESSAGES = 'LOADING_LOAD_MORE_MESSAGES'
export const LOAD_MORE_MESSAGES_SUCCESS = 'LOAD_MORE_MESSAGES_SUCCESS'
export const LOAD_MORE_MESSAGES_FAIL = 'LOAD_MORE_MESSAGES_FAIL'
export const SET_ACTIVE_CONVERSATION = 'SET_ACTIVE_CONVERSATION'
export const SET_ACTIVE_USERID = 'SET_ACTIVE_USERID'
export const TYPING_EVENT = 'TYPING_EVENT'
export const DELETE_MESSAGE_FOR_EVERYONE_EVENT = 'DELETE_MESSAGE_FOR_EVERYONE_EVENT'
export const DELETE_MESSAGE_EVENT = 'DELETE_MESSAGE_EVENT'
export const DELETING_MESSAGES_FOR_EVERYONE = 'DELETING_MESSAGES_FOR_EVERYONE'
export const DELETE_MESSAGES_FOR_EVERYONE_FAIL = 'DELETE_MESSAGES_FOR_EVERYONE_FAIL'
export const DELETE_MESSAGES_FOR_EVERYONE_SUCCESS = 'DELETE_MESSAGES_FOR_EVERYONE_SUCCESS'
export const DELETING_MESSAGES_FOR_ME = 'DELETING_MESSAGES_FOR_ME'
export const DELETE_MESSAGES_FOR_ME_FAIL = 'DELETE_MESSAGES_FOR_ME_FAIL'
export const DELETE_MESSAGES_FOR_ME_SUCCESS = 'DELETE_MESSAGES_FOR_ME_SUCCESS'
export const START_WATCHING_PROGRESS = 'START_WATCHING_PROGRESS'
export const START_WATCHING_FAIL = 'START_WATCHING_FAIL'
export const START_WATCHING_SUCCESS = 'START_WATCHING_SUCCESS'
export const STOP_WATCHING_PROGRESS = 'STOP_WATCHING_PROGRESS'
export const STOP_WATCHING_FAIL = 'STOP_WATCHING_FAIL'
export const STOP_WATCHING_SUCCESS = 'STOP_WATCHING_SUCCESS'
import React, { Component } from 'react';
import { withChannelizeContext } from '../context';
import { dateSeparatorParser } from '../utils'

class MessageSimple extends Component {
	constructor(props) {
  	super(props);
	}

	showImage(url) {
		var link = document.createElement("a");
	  link.href = url;
	  link.target = "_blank";
	  document.body.appendChild(link);
	  link.click();
	  document.body.removeChild(link);

	}

	downloadFile(url, name) {
	  var link = document.createElement("a");
	  link.href = url;
	  link.target = "_blank";
	  link.download = name;
	  document.body.appendChild(link);
	  link.click();
	  document.body.removeChild(link);
	}

	render() {
		const { client, message } = this.props;
		const user = client.getCurrentUser();

		// Set class for user/owner message
		let msgContainerPos = message.isUser ? "right" : "left";  

		let fileMessage = message.attachments.map(attachment => {
		  switch(attachment.type) {
			case "image":
			  return <img className="ch-image-message" src={attachment.thumbnailUrl ? attachment.thumbnailUrl : attachment.fileUr} onClick={()=>this.showImage(attachment.fileUrl)}/>
			  break;
			case "video":
			  return (
				<div className="ch-video-container">
				  <img className="ch-image-message" src={attachment.thumbnailUrl} onClick={()=>this.showImage(attachment.fileUrl)}/>
				  <i className="material-icons ch-video-play-icon">play_circle_outline</i>
				</div>
			  );
			  break;
		  	case "application":
			  return (
				<div className="ch-text-message">
				  <div className="ch-message-body">
				  	<div className="ch-docs-data">
					  <i className="material-icons ch-attachment-icon">description</i>
					  <span className="ch-docs-name">{attachment.name}</span>
					  <i className="material-icons ch-docs-download-icon" onClick={() =>this.downloadFile(attachment.fileUrl, attachment.name)}>arrow_downward</i>
					</div>
					<div className="ch-docs-details">
					  <hr></hr>
					  <span>{attachment.extension}</span>
					</div>
				  </div>
				</div>
			  )
			  break;
			default:
			  return null;
			  break;
		  }
		});

		const ownerProfileImageUrl = message.owner.profileImageUrl; 
		return (
			<React.Fragment>
				{ message.showDateSeparator && 
					<div key={`${message.id}-date`} className="ch-msg-padding">
						<div className="ch-message-date-separator">
							<div className="message-date-separator_left"></div>
							<div className="message-date-separator_text">{dateSeparatorParser(message.createdAt)}</div>
							<div className="message-date-separator_right"></div>
						</div>
					</div>
				}

				<div key={message.id} className={`ch-msg-padding ${msgContainerPos}`}>
					<div className={`ch-msg-container`}>
						{ message.showOwnerAvatar && 
							<div title={message.owner.displayName} className="ch-message-owner-avatar" style={{backgroundImage:`url(${ownerProfileImageUrl})`}}></div>
					 	}
						<div className={`ch-msg-content ${msgContainerPos == 'left' && !message.showOwnerAvatar ? 'padding-left': ''}`}>
								{ message.body && <div className={`ch-text-message`}>{message.body}</div> }

								{fileMessage}

								<div className={`message-info`}>
									<span id="ch_msg_time" className="ch-msg-time">{message.time}</span>
									{ message.showReadStatus && message.readByAll &&
										<i id="ch_msg_status" className="material-icons ch-msg-status ch-msg-read-status">done_all</i>
									}
									{ message.showReadStatus && !message.readByAll &&
										<i id="ch_msg_status" className="material-icons ch-msg-status">done_all</i>
									}
								</div>
							</div>
						</div>
					</div>
			</React.Fragment>
		);
	}
}

MessageSimple = withChannelizeContext(MessageSimple);

export { MessageSimple };
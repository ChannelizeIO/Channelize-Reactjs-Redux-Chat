import React, { Component } from 'react';
import { withChannelizeContext } from '../context';
import { dateSeparatorParser } from '../utils'
import { Avatar } from "./Avatar";
import { LANGUAGE_PHRASES } from "../constants";
import { OutsideClickHandler } from './OutsideClickHandler';

class MessageLivestream extends Component {
	constructor(props) {
  	super(props);
  	this.state = {
  		showMoreOptions: false
		}
	}

	toggleMoreOptions = () => {
    this.setState((state) => ({
    		showMoreOptions: !state.showMoreOptions
    }));
	}

	hideMoreOptions = () => {
		if (!this.state.showMoreOptions) return;
		this.setState((state) => ({
			showMoreOptions: false
		}));
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
		const { client, message, isSentByAdmin, renderMoreOptions } = this.props;
		const { showMoreOptions } = this.state;

		// Set class for user/owner message
		let msgContainerPos = "left";  

		let adminMsg = message.type === "admin" ? true : false;

		let fileMessage;
		if (message.attachments && message.attachments.length) {
			fileMessage = message.attachments.map(attachment => {
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
		}

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

				{ adminMsg ?
					<div className="ch-admin-msg-container">
						<span className="ch-admin-msg">{message.text}</span>
					</div>
					:
					<div key={message.id} className={`ch-msg-padding ${msgContainerPos}`}>
						<div className={`ch-msg-container ch-msg-container-livestream`}>
							<Avatar src={message.owner.profileImageUrl} initials={message.owner.displayName} className="ch-message-owner-avatar"></Avatar>
							<div className={`ch-msg-content ch-msg-content__livestream`}>
								{ message.body && 
									<div className={`ch-text-message`}>
										<div className="ch-message-owner-name">{message.owner.displayName}
											{isSentByAdmin && <span> ({LANGUAGE_PHRASES.HOST})</span>}
										</div>
										{message.body}
									</div> 
								}

								{fileMessage}
							</div>
							<div className="ch-msg-more-icon">
								<i className="material-icons" onClick={()=>this.toggleMoreOptions()}>more_vert</i>
							</div>
							<OutsideClickHandler onOutsideClick={()=>this.hideMoreOptions()}>
								<div onClick={()=>this.toggleMoreOptions()}>
									{ showMoreOptions && renderMoreOptions && renderMoreOptions()}
								</div>
							</OutsideClickHandler>
						</div>
					</div>
				}
			</React.Fragment>
		);
	}
}

MessageLivestream = withChannelizeContext(MessageLivestream);

export { MessageLivestream };
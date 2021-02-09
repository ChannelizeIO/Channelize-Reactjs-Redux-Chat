import React, { Component } from 'react';
import { withChannelizeContext } from '../context';
import { dateSeparatorParser, modifyAdminMessage } from '../utils';
import { LANGUAGE_PHRASES } from "../constants";
import { OutsideClickHandler } from './OutsideClickHandler';
import { UserIcon } from "./UserIcon";

class MessageSimple extends Component {
	constructor(props) {
	  	super(props);
	  	this.state = {
	  		showMoreOptions: false
  		}
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

	render() {
		const {
			client,
			message,
			renderMoreOptions
		} = this.props;
		const { showMoreOptions } = this.state;

		const user = client.getCurrentUser();

		// Set class for user/owner message
		let msgContainerPos = message.isUser ? "right" : "left";

		let adminMsg = message.type === "admin" ? true : false;

		let fileMessage;

		if(message.attachments && message.attachments.length) {
			fileMessage = message.attachments.map(attachment => {
				switch(attachment.type) {
					case "image":
						return <img key={message.id} className="ch-image-message" src={attachment.thumbnailUrl ? attachment.thumbnailUrl : attachment.fileUr} onClick={this.props.onClickEvent}/>
						break;

					case "video":
						return (
							<div key={message.id} className="ch-video-container">
								<img className="ch-image-message" src={attachment.thumbnailUrl} onClick={this.props.onClickEvent}/>
								<i className="material-icons ch-video-play-icon" onClick={this.props.onClickEvent}>play_circle_outline</i>
							</div>
						);
						break;

					case "application":
						let extension = message.attachments[0].extension ? message.attachments[0].extension : message.attachments[0].name.split(".").pop();
						return (
							<div key={message.id} className="ch-text-message">
								<div className="ch-message">
									<div className="ch-message-body">
										<div className="ch-docs-data">
											<i className="material-icons ch-attachment-icon">description</i>
											<span className="ch-docs-name">{attachment.name}</span>
											{ attachment.fileUrl && <i className="material-icons ch-docs-download-icon" onClick={() =>this.downloadFile(attachment.fileUrl, attachment.name)}>arrow_downward</i>}
										</div>
										<div className="ch-docs-details">
											<hr></hr>
											<span>{extension}</span>
										</div>
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
						<div className={`ch-msg-container ch-msg-container-simple`}>

							{ message.showOwnerAvatar && <UserIcon user={message.owner} className="ch-message-owner-avatar"></UserIcon> }

							<div className={`ch-msg-content ${msgContainerPos == 'left' && !message.showOwnerAvatar ? 'padding-left': ''}`}>
								{ message.body && <div className={`ch-text-message ${message.isDeleted ? "deleted" : ""}`}>{message.body}</div> }

								{ fileMessage }

								<div className={`message-info`}>
									<span id="ch_msg_time" className="ch-msg-time">{message.time}</span>
									{ message.showReadStatus && message.readByAll &&
										<i id="ch_msg_status" className="material-icons ch-msg-status ch-msg-read-status">done_all</i>
									}
									{ message.showReadStatus && !message.pending && !message.readByAll &&
										<i id="ch_msg_status" className="material-icons ch-msg-status">done</i>
									}
									{ message.showReadStatus && message.pending &&
										<i id="ch_msg_status" className="material-icons ch-msg-status">schedule</i>
									}
								</div>
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

MessageSimple = withChannelizeContext(MessageSimple);

export { MessageSimple };
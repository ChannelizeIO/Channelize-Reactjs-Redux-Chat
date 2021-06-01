import React, { PureComponent } from 'react';
import { LANGUAGE_PHRASES } from "../constants";

class MediaLightBox extends PureComponent {

	downloadFile(url, name) {
		name = name ? name : LANGUAGE_PHRASES.DOWNLOAD_FILE_NAME;
	  var link = document.createElement("a");
	  link.href = url;
	  link.target = "_blank";
	  link.download = name;
	  document.body.appendChild(link);
	  link.click();
	  document.body.removeChild(link);
	}

	render() {
		const { file } = this.props;
		const fileUrl = file.fileUrl ? file.fileUrl : file.thumbnailUrl;

		return (
			<div className="ch-light-box-container">

				<div>
					<i title="Close" translate="no" className="material-icons ch-close-light-box-icon" onClick={this.props.onCloseClick}>close</i>
					<i title="Download" translate="no" className="material-icons ch-close-light-box-icon" onClick={()=> this.downloadFile(fileUrl, file.name)}>arrow_downward</i>
				</div>

				{ file.type == "image" &&
					<img className="ch-light-box-file" src={fileUrl} />
				}
				{ file.type == "video" &&
					<video controls id="videoPlayer" className="ch-light-box-file" preload="auto" loop="loop" autoPlay="autoplay">
				    <source src={fileUrl} />
					</video>
				}
			</div>
		);
	}
}

export { MediaLightBox };
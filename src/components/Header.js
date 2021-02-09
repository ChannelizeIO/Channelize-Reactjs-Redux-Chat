import React, { PureComponent } from 'react';
import { UserIcon } from './UserIcon';
import Avatar from 'react-avatar';
class Header extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      showDropDownList: false
    };
  }

  toggleDropDownList = () => {
    this.setState((state) => ({
      showDropDownList: !state.showDropDownList
    }))
  }

  render() {
    const { 
      title,
      subtitle,
      profileImageUrl,
      profileImageAlt,
      showArrowBack,
      onBack,
      showChevron,
      renderDropDownList,
      renderRight,
      callButtons
    } = this.props;
    const { showDropDownList } = this.state;
    const hasProfileImage = profileImageUrl && profileImageUrl.trim();

    return (
    <div id="ch_header" className="ch-header">
      { showArrowBack && <i className="material-icons arrow-back" onClick={onBack}>arrow_back</i>}

      { hasProfileImage && <div className="ch-header-image" title={profileImageAlt} style={{backgroundImage:`url(${profileImageUrl})`}}></div>}
      { !hasProfileImage && profileImageAlt && <Avatar name={profileImageAlt} className="ch-header-image" maxInitials={2} size={40} round={true} /> }

      <div className="ch-header_details">
        <div className="ch-header_content">
          { title && 
            <div className="ch-header-title">
              <div>{title}</div>
              { showChevron && <i className="material-icons ch-chevron-icon" onClick={this.toggleDropDownList}>keyboard_arrow_down</i>}
            </div>
          }
          { subtitle && <div className="ch-header-subtitle">{subtitle}</div>}
          { showDropDownList && renderDropDownList && renderDropDownList()}
        </div>
        {callButtons}
        <div className="ch-header_right-icons">
          {renderRight && this.props.renderRight()}
        </div>
      </div>
    </div>
   );
  }
}

export { Header }
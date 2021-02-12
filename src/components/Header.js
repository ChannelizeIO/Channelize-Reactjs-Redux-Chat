import React, { PureComponent } from 'react';
import { Avatar } from './Avatar';
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
      imageSrc,
      imageInitials,
      showArrowBack,
      onBack,
      showChevron,
      renderDropDownList,
      renderRight,
      callButtons
    } = this.props;
    const { showDropDownList } = this.state;

    return (
    <div id="ch_header" className="ch-header">
      { showArrowBack && <i className="material-icons arrow-back" onClick={onBack}>arrow_back</i>}

      { (imageSrc || imageInitials) && <Avatar src={imageSrc} initials={imageInitials} className="ch-header-image"></Avatar> }

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
import React, { PureComponent } from 'react';

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
      showArrowBack,
      onBack,
  	  showChevron,
  	  renderDropDownList,
  	  renderRight
    } = this.props;
    const { showDropDownList } = this.state;

    return (
	  <div id="ch_header" className="ch-header">
			{ showArrowBack && <i className="material-icons arrow-back" onClick={onBack}>arrow_back</i>}
      { profileImageUrl && <div className="ch-header-image" style={{backgroundImage:`url(${profileImageUrl})`}}></div>}
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
        <div className="ch-header_right-icons">
          {renderRight && this.props.renderRight()}
        </div>
			</div>
	  </div>
   );
  }
}

export { Header }
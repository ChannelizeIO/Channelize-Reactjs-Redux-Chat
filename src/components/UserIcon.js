import React, { PureComponent } from 'react';
import Avatar from 'react-avatar';
import PropTypes from 'prop-types';
class UserIcon extends PureComponent {

  constructor(props) {
    super(props);
  }

  render() {
    const {
      user,
      className,
      extraContent,
      extraContentArguments,
      reactAvatarProps
    } = this.props;
    
    const { displayName, profileImageUrl } = user;
    const hasProfileImage = profileImageUrl && profileImageUrl.trim();

    const defaultAvatarProps = {
      maxInitials: 2,
      size: 30,
      round: true
    }
    const finalReactAvatarProps = { ...defaultAvatarProps, ...reactAvatarProps };

    return (
      <React.Fragment>
        {
          !hasProfileImage &&
          <div title={displayName} className= {className}>
            <Avatar name={displayName} {...finalReactAvatarProps} />
            {extraContent && extraContent(...extraContentArguments)}          
          </div>
        }
        {
          hasProfileImage &&
          <div title={displayName} className= {className} style={{ backgroundImage: `url(${profileImageUrl})` }}>
            {extraContent && extraContent(...extraContentArguments)}
          </div>
        }
      </React.Fragment>
    );
  }
}

UserIcon.propTypes = {
  user: PropTypes.object.isRequired,
  className: PropTypes.string,
  extraContent: PropTypes.func,
  extraContentArguments: PropTypes.array,
  reactAvatarProps: PropTypes.object
}

UserIcon.defaultProps = {
  extraContent: null,
  extraContentArguments: [],
  reactAvatarProps: {}
};

export { UserIcon }
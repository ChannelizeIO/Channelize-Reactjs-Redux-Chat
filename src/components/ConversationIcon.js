import React, { PureComponent } from 'react';
import Avatar from 'react-avatar';
import PropTypes from 'prop-types';
class ConversationIcon extends PureComponent {

  constructor(props) {
    super(props);
  }

  render() {
    const {
      conversation,
      className,
      extraContent,
      extraContentArguments,
      reactAvatarProps
    } = this.props;
    
    const { title, profileImageUrl } = conversation;
    const hasProfileImage = profileImageUrl && profileImageUrl.trim();
    const defaultAvatarProps = {
      maxInitials: 2,
      size: 40,
      round: true
    }

    const finalReactAvatarProps = { ...defaultAvatarProps, ...reactAvatarProps };

    return (
      <React.Fragment>
        {
          !hasProfileImage &&
          <div title={title} className= {className} style={{ backgroundImage: `url(${profileImageUrl})` }}>
            <Avatar name={title} {...finalReactAvatarProps} />
            {extraContent && extraContent(...extraContentArguments)}          
          </div>
        }
        {
          hasProfileImage &&
          <div title={title} className= {className} style={{ backgroundImage: `url(${profileImageUrl})` }}>
            {extraContent && extraContent(...extraContentArguments)}
          </div>
        }
      </React.Fragment>
    );
  }
}

ConversationIcon.propTypes = {
  conversation: PropTypes.object.isRequired,
  className: PropTypes.string,
  extraContent: PropTypes.func,
  extraContentArguments: PropTypes.array,
  reactAvatarProps: PropTypes.object
}

ConversationIcon.defaultProps = {
  extraContent: null,
  extraContentArguments: [],
  reactAvatarProps: {}
};

export { ConversationIcon }
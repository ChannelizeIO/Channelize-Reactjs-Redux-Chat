import React, { PureComponent } from 'react';
import ReactAvatar from 'react-avatar';
import PropTypes from 'prop-types';
class Avatar extends PureComponent {

  constructor(props) {
    super(props);
  }

  render() {
    const {
      initials,
      src,
      className,
      avatarProps
    } = this.props;
    
    const isValidSrc = src && src.trim();
    const defaultAvatarProps = {
      maxInitials: 2,
      size: 30,
      round: true
    }
    const finalAvatarProps = { ...defaultAvatarProps, ...avatarProps };

    return (
      <React.Fragment>
        {
          isValidSrc ?
          <div title={initials} className= {className} style={{ backgroundImage: `url(${src})` }}>
            {this.props.children}
          </div> :
          <div title={initials} className= {className}>
            <ReactAvatar name={initials} {...finalAvatarProps}/>
            {this.props.children}
          </div>
        }
      </React.Fragment>
    );
  }
}

Avatar.propTypes = {
  src: PropTypes.string,
  initials: PropTypes.string,
  className: PropTypes.string,
  avatarProps: PropTypes.object
}

Avatar.defaultProps = {
  avatarProps: {}
};

export { Avatar }
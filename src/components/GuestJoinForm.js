import React, { PureComponent } from 'react';
import { LANGUAGE_PHRASES } from "../constants";
import { withChannelizeContext } from '../context';
import PropTypes from 'prop-types';
import { setCookie } from '../utils';
class GuestJoinForm extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      displayName: '',
      errors: {},
      joining: false,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value, errors: {} });
  }

  validateForm() {
    const displayName = this.state.displayName.trim();
    const errors = {}
    const MAX_LENGTH = 30;
    if (!displayName || displayName.length > MAX_LENGTH) {
      errors.displayName = LANGUAGE_PHRASES.GUEST_JOIN_ERROR_DISPLAY_NAME;
    }
    this.setState({ errors });
    return !Object.keys(errors).length;
  }

  async handleSubmit(event) {
    const { client, onJoinedAsGuest, onCloseClick } = this.props;
    const displayName = this.state.displayName.trim();
    event.preventDefault();
    if (!this.validateForm()) {
      return false;
    }
    this.setState({ joining: true });
    await client.switchToGuest(displayName);
    setCookie('ch_guest_display_name', displayName, 1000)
    if (onJoinedAsGuest) await onJoinedAsGuest(displayName);
    this.setState({ joining: false });
    onCloseClick();
  }

  render() {
    const { onCloseClick } = this.props;
    const { joining, errors } = this.state;
    return (
      <div className="ch-light-box-container ch-guest-light-box-container">
        <div className="ch-guest-light-box">
          <div className="ch-guest-light-box-close-container">
            <i title="Close" translate="no" className="material-icons ch-guest-light-box-close" onClick={onCloseClick}>close</i>
          </div>
          <form onSubmit={this.handleSubmit}>
            <div className="form-element-wrapper">
              <div className="form-heading">{LANGUAGE_PHRASES.GUEST_JOIN_HEADING}</div>
            </div>
            <div className="form-element-wrapper">
              <input id="displayName" className="form-element" name="displayName" type="text" placeholder={LANGUAGE_PHRASES.GUEST_JOIN_LABEL_DISPLAY_NAME} value={this.state.displayName} onChange={this.handleChange} />
              {errors.displayName && <div className="form-error">{errors.displayName}</div>}
            </div>
            <div className="form-element-wrapper">
              <input type="submit" value="Join" disabled={joining} />
            </div>
          </form>
        </div>
      </div>
    );
  }
}

GuestJoinForm = withChannelizeContext(GuestJoinForm);

GuestJoinForm.propTypes = {
  onJoinedAsGuest: PropTypes.func,
  onCloseClick: PropTypes.func,
}

export { GuestJoinForm }
import React, { PureComponent } from 'react';
import { Loader } from "./Loader";
import { MessageSimple } from "./MessageSimple";
import { connect } from 'react-redux';
import { withChannelizeContext } from '../context';
import PropTypes from 'prop-types';

class PinnedMessageList extends PureComponent {

	constructor(props) {
    super(props);
    this.limit = 25;
    this.skip = 0;

    this.state = {
      text: '',
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { userId } = this.props;

    // if userId switches, re-intialize the conversation
    if (prevProps.userId != userId && userId) {
      this._init();
    }
  }

  // viewMediaToggle(message) {
  //   let file = message ? message.attachments[0] : null
  //   this.setState({openMediaFile: file});
  // }

  render() {
    let { 
      pinnedList,
      pinnedLoading,
      error,
      Message,
    } = this.props;

    return (


      <div id="ch_pinned_messages_box" ref={this.chPinnedMessageBoxRef} className="ch-messages-box ch-pinned-messages-box">
      { <div className="ch-conversation-padding"> </div>}
     

      { error && <div className="center error">{error}</div>}

      <div className="ch-msg-list">

        { pinnedLoading &&  <Loader />}

        { !pinnedList.length && !pinnedLoading && <div className="center no-record-found">No Pinned Messages !</div>}

        { pinnedList.length &&
          pinnedList.map(message => {
            return <Message 
                key={message.id} 
                message={message} 
                showMoreOptions={false}
                // onClickEvent={()=>this.viewMediaToggle(message)} 
              />
          })
        }

      </div>
    </div>


      );
  }
}

PinnedMessageList = withChannelizeContext(PinnedMessageList);

PinnedMessageList.propTypes = {
  Message: PropTypes.elementType,
  pinnedList: PropTypes.array,
}

PinnedMessageList.defaultProps = {
  Message: MessageSimple,
  pinnedList: [],
};

const mapStateToProps = ({message, client}, ownProps) => {
  return {...message }
}

PinnedMessageList = connect(
  mapStateToProps,
  { }
)(PinnedMessageList);

export { PinnedMessageList }
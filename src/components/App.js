import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { 
  chConnect,
  registerEventHandlers
} from "../actions";
import { IMAGES } from "../constants";
import { ChannelizeProvider } from '../context';

class App extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      conversation: null,
      userId: null
    }
  }

  componentDidMount() {
    const { client, userId, accessToken } = this.props;
    this.props.chConnect(client, userId, accessToken);
  }

  componentDidUpdate(prevProps) {
    if (!this.props.connected) {
      return;
    }

    // Register real time events after successful connection
    if (!prevProps.connected && this.props.connected) {
      this.props.registerEventHandlers(this.props.client)
    }
  }

  getContext = () => ({
    client: this.props.client
  });

  render() {
    const { connected } = this.props;

    return (
      <ChannelizeProvider value={this.getContext()}>
        { this.props.children }
      </ChannelizeProvider>
    );
  }
}

const mapStateToProps = ({client}) => {
  return {...client}
}

App = connect(
  mapStateToProps,
  { chConnect, registerEventHandlers }
)(App);

export { App };
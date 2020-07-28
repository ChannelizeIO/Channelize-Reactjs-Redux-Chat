import React, { Component } from 'react';
import {
  Launcher,
  App as Chat,
  ConversationList,
  ConversationWindow,
  SearchWindow
} from './channelize-chat-react/dist';
import { Channelize } from 'channelize-chat';

// Import style
import './channelize-chat-react/dist/css/compactLayout.css'

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showLauncher: true,
      showConversationWindow: false,
      showConversationList: false,
      showSearchWindow: false
    }
  }

  onContactClick = (userId) => {
    this.setState({ showConversationWindow: true })
  }

  closeConversationList = () => {
    this.setState({
      showConversationList: false,
      showLauncher: true
    })
  }

  closeConversationWindow = () => {
    this.setState({showConversationWindow: false})
  }

  onConversationSelect = () => {
    this.setState({showConversationWindow: true})
  }

  toggleLauncher = (e) => {
    this.setState((state) => ({
      showLauncher: !state.showLauncher,
      showConversationList: !state.showConversationList
    }));
  };

  toggleSearchWindow = () => {
    this.setState((state) => ({
      showSearchWindow: !state.showSearchWindow,
      showConversationList: !state.showConversationList
    }))
  }

  render() {
    const { 
      showLauncher,
      showConversationList,
      showConversationWindow,
      showSearchWindow
    } = this.state;

    let publicKey;
    let userId;
    let accessToken;

    const client = new Channelize.client({publicKey: publicKey});

    return (
      <Chat client={client} userId={userId} accessToken={accessToken}>
          <div style={{position: 'fixed', bottom: '0', right: '1%' }}>
            { showLauncher && <Launcher onClick={this.toggleLauncher}/> }

            { !showLauncher && showSearchWindow &&
              <div style={{
                height: '484px',
                width: '330px',
                position: 'absolute',
                bottom: 0,
                right: '1%' }}>
                <SearchWindow 
                  showArrowBack={true}
                  onContactClick={this.onContactClick}
                  onBack={this.toggleSearchWindow}
                />
              </div>
            }
            
            { !showLauncher && showConversationList &&
              <div style={{
                height: '484px',
                width: '330px',
                position: 'absolute',
                bottom: 0,
                right: '1%' }}>
                <ConversationList 
                  onSelect={this.onConversationSelect}
                  showCloseIcon={true}
                  onCloseIconClick={this.closeConversationList}
                  showSearchIcon={true}
                  onSearchIconClick={this.toggleSearchWindow}
                />
              </div>
            }

            { showConversationWindow &&
              <div style={{
                height: '484px',
                width: '330px',
                position: 'absolute',
                bottom: 0,
                right: showLauncher ? '85px' : '350px',
              }}>
                <ConversationWindow 
                  showChevron={true}
                  showCloseIcon={true}
                  onCloseIconClick={this.closeConversationWindow}
                  disableComposerMessage="This conversation is closed now."
                  disableComposer={(conversation) => {
                    if (!conversation) {
                      return false;
                    }

                    const hasStatusField = 'metaData' in conversation && 'status' in conversation.metaData;
                    if (hasStatusField) {
                      return conversation.metaData.status === 'closed';
                    }
                    return false;
                  }}
                />
              </div>
            }
          </div>
      </Chat>
    )
  }
}

export default App;

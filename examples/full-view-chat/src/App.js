import React, { Component } from 'react';
import { 
  App as Chat,
  ConversationList,
  ConversationWindow,
  SearchWindow
 } from './channelize-chat-react/dist';
import { Channelize } from 'channelize-chat';

// Import style 
import './channelize-chat-react/dist/css/fullViewLayout.css'


class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showSearchWindow: false,
    }
  }

  onContactClick = (userId) => {
    
  }

  toggleSearchWindow = () => {
    this.setState((state) => ({
      showSearchWindow: !state.showSearchWindow
    }))
  }

  render() {
    const { showSearchWindow } = this.state;
    let publicKey;
    let userId;
    let accessToken;

    const client = new Channelize.client({publicKey: publicKey});

    return (
      <Chat client={client} userId={userId} accessToken={accessToken}>
        <div style={{width: '100%', height: '100vh', display: 'flex', overflow: 'hidden'}}>
          <div style={{ height: '100%', width: '24%'}}>
            { showSearchWindow ?
              <SearchWindow 
                showArrowBack={true}
                onContactClick={this.onContactClick}
                onBack={this.toggleSearchWindow}
              /> 
              :
              <ConversationList 
                showSearchIcon={true}
                onSearchIconClick={this.toggleSearchWindow}
              /> 
            }
          </div>
          <div style={{ height: '100%', width: '75%'}}>
            <ConversationWindow
            showSearchIcon={true} 
            showChevron={false}
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
            }}/>
          </div>
        </div>
      </Chat>
    )
  }
}

export default App;

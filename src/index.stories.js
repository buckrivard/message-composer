import React, {useMemo, useState, useRef} from 'react';
import uuid from 'uuid';

import MessageComposer from './index.js';

import './styles.scss';

const users = [
  {
    id: 'all',
    displayName: 'All',
    objectType: 'groupMention',
  },
  {
    id: 'here',
    displayName: 'Here',
    objectType: 'groupMention',
  },
  {
    id: 'moderators',
    displayName: 'Moderators',
    objectType: 'groupMention',
  },
  {
    displayName: 'Philip Fry',
  },
  {
    displayName: 'Turanga Leela',
  },
  {
    displayName: 'Hubert Farnsworth',
  },
  {
    displayName: 'Zapp Brannigan',
  },
  {
    displayName: 'John Zoidberg',
  },
  {
    displayName: 'Amy Wang',
  },
  {
    displayName: 'Bender Rodriguez',
  },
  {
    displayName: 'Hermes Conrad',
  },
  {
    displayName: 'Kif Kroker',
  },
  {
    displayName: 'Barbados Slim',
  },
  {
    displayName: 'Bill McNeal',
  },
];

const sanitizeUser = (user) => {
  if (!user.id) {
    // eslint-disable-next-line no-param-reassign
    user.id = uuid.v4();
  }
  if (!user.objectType) {
    // eslint-disable-next-line no-param-reassign
    user.objectType = 'person';
  }
};

for (const user of users) {
  sanitizeUser(user);
  if (user.items) {
    for (const person of user.items) {
      sanitizeUser(person);
    }
  }
}

let mentions = {
  filter: (query) =>
    Promise.resolve(
      query === '' ? users : users.filter((user) => user.displayName.toLowerCase().startsWith(query.toLowerCase()))
    ),
  renderSuggestion: (user, {active}) => {
    const activeStyle = active ? {backgroundColor: 'lightblue'} : null;
    const style = {
      ...activeStyle,
      height: '30px',
      width: '200px',
    };

    return {
      key: user.id,
      render: <div style={style}>{user.displayName}</div>,
    };
  },
  renderInsert: (user) => {
    const style = {background: 'lightblue'};
    const text = user.objectType === 'person' ? user.displayName.split(' ')[0] : user.displayName;

    return <b style={style}>{text}</b>;
  },
  getDisplay: (user) => (user.objectType === 'person' ? user.displayName.split(' ')[0] : user.displayName),
};
// insert presence items
let items = [users[3], users[4], users[5]];

users[1].items = JSON.stringify(items);
// insert moderators
items = [users[5], users[6], users[7]];
users[2].items = JSON.stringify(items);

const spaces = [];
const setValue = (v, num) => {
  spaces[num] = v;
};

export default {
  component: MessageComposer,
  title: 'MessageComposer',
};

const Example = (composerType) => {
  const [message, setMessage] = useState('');
  const [number, setNumber] = useState(1);
  const [failSend, setFailSend] = useState(false);
  const participantsRef = useRef();
  const toggleFailSend = () => {
    setFailSend(!failSend);
  };

  const show = (num) => {
    setMessage('');
    setNumber(num);
  };

  const other = number === 1 ? 2 : 1;

  const draft = {
    id: number,
    value: spaces[number],
    save: setValue,
  };

  const emitter = useRef();
  const setEmitter = (e) => {
    emitter.current = e;
  };

  const focus = (e) => {
    e.preventDefault();
    emitter.current.emit('FOCUS');
  };

  const insertText = (t) => (e) => {
    e.preventDefault();
    emitter.current.emit('INSERT_TEXT', t);
  };

  const send = (e) => {
    e.preventDefault();
    emitter.current.emit('SEND');
  };

  const clear = (e) => {
    e.preventDefault();
    emitter.current.emit('CLEAR');
  };

  const onSend = (val) => {
    setMessage(val);

    return !failSend;
  };

  const notifyKeyDown = (event) => {
    // eslint-disable-next-line no-console
    console.log('Key pressed', event);
  };

  const [disabled, setDisabled] = useState(false);
  const toggleDisabled = () => {
    setDisabled(!disabled);
  };

  const [isMarkdownDisabled, setMarkdownDisabled] = useState(false);
  const toggleMarkdownDisabled = () => {
    setMarkdownDisabled(!isMarkdownDisabled);
  };

  const [placeholder, setPlaceholder] = useState('Write your message in this space.');
  const changePlaceholder = () => {
    setPlaceholder('This is a new placeholder');
  };

  const markdown = useMemo(
    () => ({
      disabled: isMarkdownDisabled,
    }),
    [isMarkdownDisabled]
  );

  if (composerType === 'quill') {
    participantsRef.current = users;

    mentions = {participants: participantsRef};
  }

  return (
    <div className="container">
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div className="content" onClick={focus} />
      <div className="mc">
        <MessageComposer
          disabled={disabled}
          draft={draft}
          markdown={markdown}
          mentions={mentions}
          send={onSend}
          notifyKeyDown={notifyKeyDown}
          placeholder={placeholder}
          setEmitter={setEmitter}
          composerType={composerType}
        />
        <br />
        <div>Sending: {JSON.stringify(message)}</div>
        <button onClick={() => show(other)}>Show Space {other}</button>
        <button onClick={insertText('🎉')}>Insert Emoji</button>
        <button onClick={insertText('@')}>@Mention</button>
        <button onClick={toggleDisabled}>{disabled ? 'enable' : 'disable'}</button>
        <button onClick={toggleMarkdownDisabled}>{isMarkdownDisabled ? 'enable markdown' : 'disable markdown'}</button>
        <button onClick={toggleFailSend}>{failSend ? 'send message successfully' : 'make send message fail'}</button>
        <button onClick={send}>SEND</button>
        <button onClick={clear}>CLEAR</button>
        <button onClick={changePlaceholder}>Change placeholder</button>
      </div>
    </div>
  );
};

export const Slate = () => Example('slate');
export const Quill = () => Example('quill');

import * as React from 'react';
import logo from './logo.svg';
import './App.css';
import iff from 'iff'


function App(): JSX.Element {
  const feature = iff('featureflagging.in.cib.enable');
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        {
          feature && <p>Feature Flagging is enabled for you</p>
        }
      </header>
    </div>
  );
}

export default App;

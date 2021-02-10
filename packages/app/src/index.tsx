import * as React from 'react';
import * as ReactDOM from 'react-dom';

import App from './App';
import './index.css';

// just an example, populating the __iff_VALUES__ should be done in a dynamic way.
window.__iff_VALUES__ = {
  'featureflagging.in.cib.enable': true
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
);

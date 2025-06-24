import React from 'react';
import ReactDOM from 'react-dom/client'; // Import the new 'react-dom/client'
import { Provider } from 'react-redux';
import { store } from './app/store';

import './index.css';
import App from './App';
import axios from 'axios';
import { ContextProvider } from './contexts/ContextProvider';

axios.defaults.withCredentials = true;

// Create a root element using ReactDOM.createRoot
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <Provider store={store}>
        <ContextProvider>
            <App />
        </ContextProvider>
    </Provider>
);
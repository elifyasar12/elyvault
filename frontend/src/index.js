import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Amplify } from 'aws-amplify';
import awsConfig from './aws-exports';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: awsConfig.Cognito.userPoolId,
      userPoolClientId: awsConfig.Cognito.userPoolClientId,
      region: awsConfig.Cognito.region,
    }
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
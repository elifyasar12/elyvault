const express = require('express');
const router = express.Router();
const { CognitoIdentityProviderClient, AdminConfirmSignUpCommand } = require('@aws-sdk/client-cognito-identity-provider');

const client = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

router.post('/confirm', async (req, res) => {
  try {
    const { username } = req.body;
    await client.send(new AdminConfirmSignUpCommand({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Username: username,
    }));
    res.json({ message: 'User confirmed!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
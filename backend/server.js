const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');

const fileRoutes = require('./routes/files');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/files', fileRoutes);

app.get('/', (req, res) => res.send('Server is running!'));

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
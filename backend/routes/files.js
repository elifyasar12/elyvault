const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Configure AWS
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const upload = multer({ storage: multer.memoryStorage() });

// Upload a file
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const key = `${uuidv4()}-${file.originalname}`;
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };
    await s3.upload(params).promise();
    res.json({ message: 'File uploaded successfully!', key });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List all files
router.get('/list', async (req, res) => {
  try {
    const params = { Bucket: process.env.S3_BUCKET_NAME };
    const data = await s3.listObjectsV2(params).promise();
    const files = data.Contents.map(f => ({
      key: f.Key,
      size: f.Size,
      lastModified: f.LastModified
    }));
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Download / share a file 
router.get('/download/:key', async (req, res) => {
  try {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: req.params.key,
      Expires: 3600,
    };
    const url = s3.getSignedUrl('getObject', params);
    res.json({ url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a file
router.delete('/delete/:key', async (req, res) => {
  try {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: req.params.key,
    };
    await s3.deleteObject(params).promise();
    res.json({ message: 'File deleted successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

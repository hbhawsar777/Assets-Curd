const aws = require('aws-sdk');
const fs = require('fs')
const mongoose = require('mongoose');
const db = mongoose.connection;

exports.assetsCreate = assetsCreate;
exports.getAssets = getAssets;
exports.updateAssets = updateAssets;
exports.deleteAssets = deleteAssets;

aws.config.update({
  accessKeyId: 'AKIASAZXFKZTRULRKDFI',
  secretAccessKey: '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',
  region: 'eu-north-1',
});
const s3 = new aws.S3();

const assetSchema = new mongoose.Schema({
  images: [String],
  title: String 
});
const Asset = mongoose.model('Asset', assetSchema);


async function assetsCreate(req, res) {

  let body = req.body;
  let title = body.title;
  const folderPath = `assets/${Date.now()}/`;

  // Upload images to S3
  const s3UploadPromises = req.files.map((file) => {
    const params = {
      Bucket: 'assetscontainer',
      Key: folderPath + file.originalname,
      Body: fs.readFileSync(file.path),
    };
    return s3.upload(params).promise();
  });
  const uploadedFiles = await Promise.all(s3UploadPromises);

  const assetDocument = new Asset({
    images: uploadedFiles.map((file) => file.Location),
    title: title
  });
  const result = await assetDocument.save();

  return res.send(result);
}

async function getAssets(req, res) {
  try {
    const assets = await Asset.find();
    res.json(assets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
}

async function updateAssets(req, res) {
  try {
    let body = req.body;
    let assetId = body.asset_id;
    let updateKeys = {};
    updateKeys = body.update_keys;

    try {
      updateKeys = JSON.parse(updateKeys);
    } catch{}

    if (req.files && req.files.length > 0) {
      const s3UploadPromises = req.files.map((file) => {
        const params = {
          Bucket: 'assetscontainer',
          Key: `assets/${Date.now()}/${file.originalname}`,
          Body: fs.readFileSync(file.path),
        };
        return s3.upload(params).promise();
      });
      const uploadedFiles = await Promise.all(s3UploadPromises);


      let newImages = uploadedFiles.map((file) => file.Location);
      updateKeys.images = newImages;
    }
    const result = await Asset.findByIdAndUpdate(assetId, updateKeys, { new: true });
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ error: 'Asset not found' });
    }
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
}

async function deleteAssets(req, res) {
  try {
    const assetId = req.query.asset_id;
    const result = await Asset.findByIdAndUpdate(assetId, { deleted: true });
    let response = {};
    if (result) {
      response = {
        status : 200,
        message : "Asset Deleted"
      }
      res.send(response);
    }
    else {
      res.status(404).json({ error: 'Asset not found' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
}
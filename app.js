const express   = require('express');
const app       = express();
const morgan    = require('morgan');
const bodyParser = require('body-parser');
const multer = require('multer');
const aws      = require('aws-sdk');
const dbHandler = require('./database_handler')
const assets = require('./routes/assets');
const config = require('config');

const port = 3000;
const upload = multer({ dest: 'uploads/' });

app.use(morgan('dev'));
app.use(bodyParser.json());


aws.config.update(config.get('aws_creds'));
app.post('/create_assets', upload.array('images'), assets.assetsCreate);

app.get('/get_assets', assets.getAssets);

app.post('/update_assets', upload.array('images'), assets.updateAssets);

app.delete('/delete_assets', assets.deleteAssets);

dbHandler.connectToDb();
app.listen(port, (req, res) => {
    console.log("************************************************************************");
    console.log("**********              INITIALIZING THE SERVER              ***********");
    console.log("************************************************************************");
    console.log('Express server listening on port ' + port);
})
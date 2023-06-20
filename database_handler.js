const mongoose = require('mongoose');

exports.connectToDb = connectToDb;



function connectToDb() {

    mongoose.connect('mongodb+srv://Admin:Admin@apis.nji9bvl.mongodb.net/api_live', { useNewUrlParser: true });

    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function () {
        // we're connected!
        console.log("************************************************************************");
        console.log("************            Database Connected              ****************");
        console.log("************************************************************************");
    });
}

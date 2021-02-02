const path = require('path');
const express = require("express");
const bodyParser = require("body-parser");
const router = express.Router();
const app = express();
const ConfigExtents = require('config-extends');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/", router); 
app.use(express.static('public'));

(async () => { 
    try {
        let host =   process.env.APP_HOST || 'http://localhost';
        let port = process.env.APP_PORT || '8000';
        let config = await ConfigExtents.apply(path.join(__dirname,'config'));
        app.get('/health', function (req, res) {
            res.send(new Date().toTimeString());
        });
        app.get('/age/:age/level/:level/config', function (req, res) {
            let age   = req.params.age!='null'?parseInt(req.params.age):15;
            let level = req.params.level!='null'?parseInt(req.params.level):1;
            let data = config.versions.find(p=> p.age.from <= age && p.age.to >= age && p.level ==level);
            //console.log(data);
            res.send(data);
        });        

        app.listen(port);
        console.log('Server running at: '+host+':'+port); 
        process.exitCode = 0;
        return 0;
    }
    catch (error) {     
        console.error(error);  
        process.exitCode = -1;
        return -1;
    }    
})();
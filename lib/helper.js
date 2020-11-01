const fs = require('fs');

module.exports = class Helper
{
    static loadConfiguration(envFilePath){

         //si existe el archivo .env levanta las variables de entorno desde este archivo
        if(envFilePath && fs.existsSync(envFilePath)){
            require('dotenv').config({ path: envFilePath });
        }
        let config = {};
        for(let p in process.env)config[p] =process.env[p]; 
        return config;
    }
}
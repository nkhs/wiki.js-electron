const fs = require('fs')
module.exports = {
    RESOURCES_PATH: fs.existsSync('./resources') ? './resources' : './',
    RESOURCES_SERVER_PATH: fs.existsSync('./resources') ? './resources/server' : './server_config',
}
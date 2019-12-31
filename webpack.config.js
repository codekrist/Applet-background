let path = require('path')

module.exports = {
    mode: 'development',
    entry: 'routes/type.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    }
}
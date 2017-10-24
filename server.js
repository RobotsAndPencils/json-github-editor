require('dotenv').config();
var url     = require('url'),
    http    = require('http'),
    https   = require('https'),
    fs      = require('fs'),
    qs      = require('querystring'),
    express = require('express'),
    path    = require('path'),
    app     = express();

function authenticate(code, cb) {
    var data = qs.stringify({
        client_id: process.env.OAUTH_CLIENT_ID,
        client_secret: process.env.OAUTH_CLIENT_SECRET,
        code: code
    });

    var reqOptions = {
        host: process.env.AUTH_HOST || 'github.com',
        path: '/login/oauth/access_token',
        method: 'POST',
        headers: { 'content-length': data.length }
    };

    var body = "";
    var req = https.request(reqOptions, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) { body += chunk; });
        res.on('end', function() {
            cb(null, qs.parse(body).access_token);
        });
    });

    req.write(data);
    req.end();
    req.on('error', function(e) { cb(e.message); });
}

app.use(express.static(path.join(__dirname, 'static')));

// Convenience for allowing CORS on routes - GET only
app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});


app.get('/authenticate/:code', function(req, res) {
    authenticate(req.params.code, function(err, token) {
        var result
        if ( err || !token ) {
            result = {"error": err || "bad_code"};
        } else {
            result = {
                "token": token,
                "owner": process.env.OWNER,
                "repo": process.env.REPO,
                "branch": process.env.BRANCH || 'master',
                "jsonFile": process.env.JSON_FILE,
                "schemaFile": process.env.SCHEMA_FILE
            };
        }
        res.json(result);
    });
});

app.get('/', function(req, res) {
    res.sendFile('index.html');
});

var port = process.env.PORT || 9999;

app.listen(port, null, function (err) {
    console.log('Gatekeeper, at your service: http://localhost:' + port);
});

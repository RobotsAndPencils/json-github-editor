require('dotenv').config();
const url             = require('url'),
      http            = require('http'),
      https           = require('https'),
      fs              = require('fs'),
      qs              = require('querystring'),
      express         = require('express'),
      path            = require('path'),
      mustacheExpress = require('mustache-express'),
      app             = express(),
      uid             = require('uid-promise');

const states = [];
const githubHost = process.env.AUTH_HOST || 'github.com';

function authenticate(code, cb) {
    var data = qs.stringify({
        client_id: process.env.OAUTH_CLIENT_ID,
        client_secret: process.env.OAUTH_CLIENT_SECRET,
        code: code
    });

    var reqOptions = {
        host: githubHost,
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
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

// Convenience for allowing CORS on routes - GET only
app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});


app.get('/authenticate/:code', function(req, res) {
    const code = req.params.code;
    const state = req.query.state;

    if (!code || !state || !states.includes(state)) {
        res.status(400).end();
        return;
    }

    states.splice(states.indexOf(state), 1);

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
    res.render('index', {
        title: process.env.TITLE || 'JSON Github Editor',
        commitMessage: process.env.COMMIT_MESSAGE || 'Update config'
    });
});

app.get('/login', async function(req, res) {
    const state = await uid(20);
    states.push(state);
    res.redirect(302, `https://${githubHost}/login/oauth/authorize?client_id=${process.env.OAUTH_CLIENT_ID}&scope=repo&state=${state}`)
});

var port = process.env.PORT || 9999;

app.listen(port, null, function (err) {
    console.log('json-github-editor started: http://localhost:' + port);
});

const qs = require('querystring');
const fs = require('fs');
const url = require('url');
const http = require('http');
const path = require('path');
const config = require('config');
const busboy = require('busboy');
const noblox = require('noblox.js');

const PORT = config.get("port"); // Server port.
const UPLOAD_SECRET = config.get("upload_secret"); // Upload secret for "Upload-Secret" header. Simplifies things... 
const ROBLOSECURITY = config.get("roblox_cookie"); // Roblox cookie.

async function uploadAsset (filename, assetId) {
    console.log("PERFORM UPLOAD", filename);
    console.log("LOGGING IN...");

    const currentUser = await noblox.setCookie(ROBLOSECURITY);
    console.log(`CUR USER ${currentUser.UserName} [${currentUser.UserID}]`);

    console.log("UPLOADING", filename, assetId);
    await noblox.uploadModel(fs.createReadStream(filename), null, assetId);

    console.log("DELETING FILE...");
    fs.unlink(filename, (err) => {
        if (err) {
            throw err;
        }

        console.log("COMPLETE");
    });
}

async function requestListener (req, res) {
    try {
        var urlParts = url.parse(req.url, true);
        var query = urlParts.query;

        console.log("INBOUND", req.method, req.url, req.headers, req.body);

        if (req.method === 'POST') {
            console.log("IS POST");
            if (req.headers['upload-secret'] === UPLOAD_SECRET) {
                console.log("UPLOAD INBOUND");
                const bb = busboy({ headers: req.headers });
                var filename = '';

                bb.on('file', (name, file, info) => {
                    filename = Math.floor(Math.random() * 999999) + "_" + info.filename;
                    const saveTo = path.join(__dirname, filename);
                    file.pipe(fs.createWriteStream(saveTo));
                });

                bb.on('close', () => {
                    uploadAsset(filename, query.assetId).then(() => {
                        console.log("CLOSE");
                        res.writeHead(200, { 'Content-Type': 'text/plain' });
                        res.end('SUCCESS');
                    });
                });

                req.pipe(bb);
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('NOT FOUND');
            }
        } else {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('GET SUCCESS');
        }
    } catch (e) {
        console.error(e);
    }
}

const server = http.createServer(requestListener);
server.listen(PORT);
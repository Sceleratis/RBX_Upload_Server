Roblox model upload server intended to be used in combination with GitHub actions.

To use: In config/ folder; rename default.json.example to default.json, set your desired port and upload secret, and add your Roblox account ROBLOSECURITY cookie.

When sending a file to the server, upload-secret header must be set to configured secret.

To run:

node server.js

Ensure desired port is open and appropriately forwarded. 

PM2 highly recommended.

Requires:
querystring
fs
url
http
path
config
busboy
noblox.js
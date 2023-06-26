const { google } = require("googleapis");
const dotenv = require("dotenv");
const fs = require("fs");
dotenv.config();

/**
 * To use OAuth2 authentication, we need access to a CLIENT_ID, CLIENT_SECRET, AND REDIRECT_URI
 * from the client_secret.json file. To get these credentials for your application, visit
 * https://console.cloud.google.com/apis/credentials.
 */
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URL
);

// Access scopes for read-only Drive activity.
const scopes = [
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/yt-analytics.readonly",
];

exports.getAuthUrl = (req, res, next) => {
  try {
    // Generate a url that asks permissions for the Drive activity scope
    const authorizationUrl = oauth2Client.generateAuthUrl({
      // 'online' (default) or 'offline' (gets refresh_token)
      access_type: "offline",
      /** Pass in the scopes array defined above.
       * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
      scope: scopes,
      // Enable incremental authorization. Recommended as a best practice.
      include_granted_scopes: true,
    });

    res.status(200).json({
      status: true,
      msg: "",
      data: authorizationUrl,
    });
  } catch (err) {
    console.error(err);
    res.status(501).json({
      status: false,
      msg: "Error",
    });
  }
};

exports.googleCallback = async (req, res, next) => {
  const { code } = req.query;

  try {
    if (code) {
      let resp = await oauth2Client.getToken(code);
      fs.writeFileSync("secret.json", JSON.stringify(resp.tokens), "utf-8");
    }

    res.status(200).json({
      status: true,
    });
  } catch (error) {
    res.status(501).json({
      status: false,
      msg: error.message,
    });
  }
};

exports.getInfo = async (req, res, next) => {
  const service = google.youtube("v3");
  const credentials = fs.readFileSync("secret.json");
  oauth2Client.setCredentials(JSON.parse(credentials));
  service.channels.list(
    {
      auth: oauth2Client,
      part: "snippet,contentDetails,statistics",
      mine: true,
    },
    function (err, response) {
      if (err) {
        return res.status(501).json({
          status: false,
          msg: "The API returned an error: " + err,
        });
      }
      const channels = response.data.items;
      console.log(JSON.stringify(channels));
      if (channels?.length == 0) {
        res.status(404).json({
          status: false,
          msg: "No channel found",
        });
      } else {
        const statsText = `This channel's ID is ${channels[0].id}. Its title is '${channels[0].snippet.title}', and it has ${channels[0].statistics.viewCount} views.`;
        res.status(200).json({
          status: true,
          data: statsText,
        });
      }
    }
  );
};

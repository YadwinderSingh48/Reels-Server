const { BadRequestError, NotFoundError } = require("../../errors");
const Reel = require("../../models/Reel");
const User = require("../../models/User");

const share = async (req, res) => {
  const { type, id } = req.params;

  if ((type != "user" && type != "reel") || !id) {
    throw new BadRequestError("Invalid Body");
  }

  let title, description, imageUrl, url;

  try {
    if (type === "user") {
      // Fetch user details from your database
      const user = await User.findOne({ username: id });
      if (!user) {
        return res.status(404).send("User not found");
      }
      title = `Check out ${user.username}'s profile on Reels`;
      description = user.bio
        ? user.bio
        : `${user.username} shares amazing reels on Reels.`;
      imageUrl = user.userImage
        ? user.userImage
        : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";
      url = `https://reels-server-ot2h.onrender.com/user/@${user.username}`;
    } else if (type === "reel") {
      const reel = await Reel.findById(id).populate("user");
      var ReelToSend=reel;
      if (!reel) {
        return res.status(404).send("Reel not found");
      }
      title = `Watch this amazing reel by ${reel.user.username} on Reels`;
      description = reel.caption
        ? reel.caption
        : `Check out this cool reel on Reels.`;
      imageUrl = reel.thumbUri
        ? reel.thumbUri
        : "https://static-00.iconduck.com/assets.00/video-x-generic-icon-512x388-1u3h7equ.png";
      url = `https://reels-server-ot2h.onrender.com/reel/${reel._id}`;
    }

    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>

  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:url" content="${url}">
  <meta property="og:type" content="video.other">

  ${ReelToSend?.videoUri ? `
    <meta property="og:video" content="${ReelToSend.videoUri}">
    <meta property="og:video:type" content="video/mp4">
  ` : ''}
  
  <style>
    body {
      background-color: #121212;
      color: #fff;
      font-family: Arial;
      display:flex;
      justify-content:center;
      align-items:center;
      height:100vh;
      margin:0;
    }

    .container {
      text-align:center;
      background:#1e1e1e;
      padding:20px;
      border-radius:10px;
      max-width:350px;
    }

    img, video {
      width:100%;
      border-radius:10px;
      object-fit:cover;
    }

    a { color:#1e90ff; }
  </style>
</head>

<body>
  <div class="container">

    <img src="https://res.cloudinary.com/dponzgerb/image/upload/v1720080478/qlkp7z3muc2qw3dhfism.png" style="width:80px;margin-bottom:10px;">

    <h2>${title}</h2>
    <p>${description}</p>

    ${
      ReelToSend?.videoUri
        ? `<video controls autoplay muted playsinline loop controlsList="nodownload noremoteplayback"
          disablePictureInPicture
>
             <source src="${ReelToSend.videoUri}" type="video/mp4">
           </video>`
        : `<img src="${imageUrl}" alt="preview">`
    }

    <p style="margin-top:15px;">
      <a href="${url}">Open App</a>
    </p>

  </div>
</body>
</html>
`);
  } catch (error) {
    throw new NotFoundError("Resource not found");
  }
};

module.exports = { share };

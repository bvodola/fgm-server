const cloudinary = require("cloudinary").v2;
const env = require("./env");

cloudinary.config({
  cloud_name: env.CLOUDINARY_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
});

const upload = file => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(file, { resource_type: "auto" }, function(
      error,
      result
    ) {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        console.log(result);
        resolve(result);
      }
    });
  });
};

module.exports = {
  upload
};

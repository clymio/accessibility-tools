const BUCKET_BASE_URL = 'https://accessibility-tools-cdn.clym.io';
const FOLDER_PATH = process.env.NODE_ENV === 'development' ? 'develop' : 'release';
module.exports = {
  BUCKET_URL: `${BUCKET_BASE_URL}/${FOLDER_PATH}`
};

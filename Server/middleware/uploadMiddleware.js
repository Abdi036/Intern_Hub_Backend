const multer = require('multer');
const sharp = require('sharp');
const path = require('path');

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

// Configure multer upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Process and save image
const processImage = async (file, userId) => {
  const filename = `user-${userId}-${Date.now()}.jpeg`;
  const filepath = path.join('public', 'images', 'users', filename);

  await sharp(file.buffer)
    .resize(500, 500, {
      fit: 'cover',
      position: 'center'
    })
    .jpeg({ quality: 90 })
    .toFile(filepath);

  return filename;
};

module.exports = {
  upload,
  processImage
}; 
const fs = require('fs');
const path = require('path');

const setupDefaultImage = () => {
  const defaultImageDir = path.join(__dirname, '../public/images/users');
  const possibleFormats = ['default-user.jpg', 'default-user.png'];

  // Create directories if they don't exist
  if (!fs.existsSync(defaultImageDir)) {
    fs.mkdirSync(defaultImageDir, { recursive: true });
  }

  // Check for default image in any supported format
  const defaultImage = possibleFormats.find(format => 
    fs.existsSync(path.join(defaultImageDir, format))
  );

  if (!defaultImage) {
    console.error('Warning: No default user image found in supported formats:', possibleFormats);
    console.error('Please add a default-user.jpg or default-user.png file to the directory');
  }  
};

module.exports = setupDefaultImage; 
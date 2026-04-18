const Jimp = require('jimp');

async function processImage() {
  try {
    const image = await Jimp.read('D:\\SADBHAVNATEA\\logo2-0.png');
    
    // We want to replace the orange background with transparency
    // Example target orange color #f7941d -> RGB(247, 148, 29)
    // We will use a color distance formula to allow for slight variations (compression artifacts)
    
    const targetR = 247;
    const targetG = 148;
    const targetB = 29;
    const threshold = 60; // adjust depending on the image

    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];
      
      // If the color is close to orange, set alpha to 0
      // Calculate simple Euclidean distance
      const distance = Math.sqrt(
        Math.pow(r - targetR, 2) + Math.pow(g - targetG, 2) + Math.pow(b - targetB, 2)
      );

      // Also handle solid orange blocks ignoring exact shades (high red, decent green, low blue)
      const isOrangeish = (r > 200 && g > 100 && g < 200 && b < 100);

      if (distance < threshold || isOrangeish) {
        this.bitmap.data[idx + 3] = 0; // Alpha channel to 0
      }
    });

    await image.writeAsync('D:\\SADBHAVNATEA\\client\\public\\logo2-0-transparent.png');
    console.log('Image processed successfully!');
  } catch (err) {
    console.error('Error processing image:', err);
  }
}

processImage();

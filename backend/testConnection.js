const fs = require('fs');
const path = require('path');
const aiService = require('./src/services/aiService');

const test = async () => {
  console.log('--- NAGAR-X AI Connection Test ---');
  
  // Ensure directories exist
  const uploadsIssuesDir = path.join(__dirname, 'uploads/issues');
  if (!fs.existsSync(uploadsIssuesDir)) {
    fs.mkdirSync(uploadsIssuesDir, { recursive: true });
  }

  const testImagePath = path.join(__dirname, '../assets/images/icon.png');
  const localTestImage = path.join(uploadsIssuesDir, 'test.png');
  
  // Copy test image to backend uploads
  fs.copyFileSync(testImagePath, localTestImage);
  console.log(`Copied test image to: ${localTestImage}`);

  // Create mock Multer file object
  const mockFile = {
    path: localTestImage,
    mimetype: 'image/png',
    originalname: 'test.png'
  };

  try {
    console.log('\n1. Testing analyzeIssue (Image classification / severity)...');
    const analyzeResult = await aiService.analyzeIssue(
      mockFile,
      'There is garbage piled up on the street near the school',
      18.5204,
      73.8567
    );
    console.log('Result:', JSON.stringify(analyzeResult, null, 2));

    console.log('\n2. Testing getImageSimilarity...');
    const similarityScore = await aiService.getImageSimilarity(
      '/uploads/issues/test.png',
      mockFile
    );
    console.log('Similarity score:', similarityScore);

    console.log('\n3. Testing verifyResolution...');
    const resolutionResult = await aiService.verifyResolution(
      '/uploads/issues/test.png',
      mockFile
    );
    console.log('Resolution verification result:', JSON.stringify(resolutionResult, null, 2));

    console.log('\n✔ Connection test finished successfully!');
    if (analyzeResult.source === 'RULE_BASED_FALLBACK') {
      console.log('⚠ WARNING: Node fell back to local rules because the Python service was not contacted.');
      process.exit(1);
    } else {
      console.log('✔ Python AI Service connection successfully verified.');
      process.exit(0);
    }
  } catch (error) {
    console.error('✘ Test failed with error:', error);
    process.exit(1);
  }
};

test();

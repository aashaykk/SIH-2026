const axios = require('axios');
require('dotenv').config();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL;

const analyzeIssue = async (imageFile, description, latitude, longitude) => {
  if (!AI_SERVICE_URL || AI_SERVICE_URL.trim() === '') {
    console.log('AI service URL not configured. Using Mock AI Fallback...');
    return getFallbackClassification(description);
  }

  try {
    console.log(`Attempting to call AI service at: ${AI_SERVICE_URL}/predict`);
    
    // In the future, this can be expanded to upload the actual image file stream as multipart/form-data.
    const response = await axios.post(`${AI_SERVICE_URL}/predict`, {
      description,
      latitude,
      longitude,
      imageName: imageFile ? imageFile.filename : null,
    }, {
      timeout: 3000, // 3 seconds timeout for fast fallback response
    });

    if (response.data && response.data.category) {
      console.log('AI Service analysis received:', response.data);
      return {
        category: response.data.category,
        severity: response.data.severity || 'MEDIUM',
        confidence: response.data.confidence || 0.85,
        source: 'AI_SERVICE',
      };
    }
    
    throw new Error('Invalid response structure from AI Service');
  } catch (error) {
    console.warn(`[AI SERVICE WARNING] Connection to AI Service failed (${error.message}).`);
    console.log('Executing rule-based Mock AI Fallback...');
    return {
      ...getFallbackClassification(description),
      source: 'MOCK_FALLBACK',
    };
  }
};

const getFallbackClassification = (description = '') => {
  const desc = description.toLowerCase();
  
  if (
    desc.includes('garbage') || 
    desc.includes('trash') || 
    desc.includes('waste') || 
    desc.includes('litter') || 
    desc.includes('dump') || 
    desc.includes('bin')
  ) {
    return {
      category: 'GARBAGE',
      severity: 'MEDIUM',
      confidence: 0.92,
    };
  }
  
  if (
    desc.includes('light') || 
    desc.includes('dark') || 
    desc.includes('lamp') || 
    desc.includes('bulb') || 
    desc.includes('streetlight') ||
    desc.includes('electricity')
  ) {
    return {
      category: 'STREETLIGHT',
      severity: 'LOW',
      confidence: 0.90,
    };
  }
  
  if (
    desc.includes('water') || 
    desc.includes('leak') || 
    desc.includes('pipe') || 
    desc.includes('burst') || 
    desc.includes('sewage') ||
    desc.includes('overflow')
  ) {
    return {
      category: 'WATER_LEAKAGE',
      severity: 'HIGH',
      confidence: 0.95,
    };
  }

  // Default fallback is ROAD_DAMAGE (e.g. potholes, broken pavements)
  return {
    category: 'ROAD_DAMAGE',
    severity: 'HIGH',
    confidence: 0.90,
  };
};

module.exports = {
  analyzeIssue,
};

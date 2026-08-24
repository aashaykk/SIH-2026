const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5000';

/**
 * Sends the reported image and description to the Python AI service
 * for category classification, severity estimation, and explanations.
 */
const analyzeIssue = async (imageFile, description, latitude, longitude) => {
  try {
    console.log(`[AI SERVICE] Routing to Python FastAPI: ${AI_SERVICE_URL}/ai/analyze-image`);

    if (!imageFile || !fs.existsSync(imageFile.path)) {
      throw new Error('Image file not found on disk');
    }

    const formData = new FormData();
    const fileBuffer = fs.readFileSync(imageFile.path);
    const blob = new Blob([fileBuffer], { type: imageFile.mimetype });

    formData.append('image', blob, imageFile.originalname);
    formData.append('description', description || '');

    const response = await axios.post(`${AI_SERVICE_URL}/ai/analyze-image`, formData, {
      headers: {
        // Axios handles content-type automatically when receiving native FormData
      },
      timeout: 10000, // 10 seconds timeout for processing
    });

    if (response.data && response.data.success && response.data.data) {
      const result = response.data.data;
      console.log('[AI SERVICE] Analysis received:', result);
      return {
        category: result.category,
        severity: result.severity,
        severityScore: result.severity_score,
        confidence: result.confidence,
        reasons: result.reasons || [],
        detectedFeatures: result.detected_features || {},
        source: 'AI_SERVICE_PYTHON',
      };
    }

    throw new Error('Invalid response structure from Python AI service');
  } catch (error) {
    console.warn(`[AI SERVICE WARNING] Python service call failed (${error.message}). Executing Node fallback...`);

    const fallback = getFallbackClassification(description);
    return {
      category: fallback.category,
      severity: fallback.severity,
      severityScore: fallback.severityScore,
      confidence: fallback.confidence,
      reasons: [
        'Python AI microservice offline. Active rule-based Node fallback triggered.',
        `Classification based on description text matching.`
      ],
      detectedFeatures: {},
        source: 'RULE_BASED_FALLBACK',
    };
  }
};

/**
 * Verifies if the issue has been resolved by comparing the original (before) image
 * with the worker's submitted resolution (after) image.
 */
const verifyResolution = async (beforeImageUrl, afterImageFile) => {
  try {
    console.log(`[AI SERVICE] Routing to Python FastAPI for resolution verification: ${AI_SERVICE_URL}/ai/verify-resolution`);

    if (!afterImageFile || !fs.existsSync(afterImageFile.path)) {
      throw new Error('After image file not found on disk');
    }

    // Resolve local path for before image
    // If it's a full URL, strip the host, or resolve relative path
    let cleanBeforePath = beforeImageUrl;
    if (beforeImageUrl.startsWith('http')) {
      const urlParts = beforeImageUrl.split('/uploads/');
      if (urlParts.length > 1) {
        cleanBeforePath = '/uploads/' + urlParts[1];
      }
    }

    const beforeLocalPath = path.join(__dirname, '../../../backend', cleanBeforePath);
    if (!fs.existsSync(beforeLocalPath)) {
      throw new Error(`Before image not found at path: ${beforeLocalPath}`);
    }

    const formData = new FormData();

    const beforeBuffer = fs.readFileSync(beforeLocalPath);
    const beforeBlob = new Blob([beforeBuffer], { type: 'image/jpeg' }); // default fallback mimetype
    formData.append('before_image', beforeBlob, 'before.jpg');

    const afterBuffer = fs.readFileSync(afterImageFile.path);
    const afterBlob = new Blob([afterBuffer], { type: afterImageFile.mimetype });
    formData.append('after_image', afterBlob, afterImageFile.originalname);

    const response = await axios.post(`${AI_SERVICE_URL}/ai/verify-resolution`, formData, {
      timeout: 12000,
    });

    if (response.data && response.data.success && response.data.data) {
      const result = response.data.data;
      console.log('[AI SERVICE] Resolution comparison received:', result);
      return {
        resolved: result.resolved,
        confidence: result.confidence,
        locationMatch: result.location_match,
        evidenceValid: result.evidence_valid,
        reasons: result.reasons || [],
        metrics: result.metrics || {},
        source: 'AI_SERVICE_PYTHON'
      };
    }

    throw new Error('Invalid response structure from Python AI service');
  } catch (error) {
    console.warn(`[AI SERVICE WARNING] Resolution comparison failed (${error.message}). Executing Node fallback...`);

    return {
      resolved: false,
      confidence: 0,
      locationMatch: null,
      evidenceValid: false,
      reasons: [
        'Python AI microservice is unavailable; resolution cannot be AI-verified.',
      ],
      metrics: { ssim: 0.5, hist_similarity: 0.5 },
      source: 'UNVERIFIED_FALLBACK'
    };
  }
};

/**
 * Calculates dynamic duplicate similarity metrics between images.
 */
const getImageSimilarity = async (beforeImageUrl, afterImageFile) => {
  try {
    let relativePath = beforeImageUrl;
    if (relativePath.startsWith('http')) relativePath = '/uploads/' + relativePath.split('/uploads/')[1];
    const beforePath = path.join(__dirname, '../..', relativePath);
    if (!fs.existsSync(beforePath) || !afterImageFile || !fs.existsSync(afterImageFile.path)) return 0;
    const formData = new FormData();
    formData.append('reference_image', new Blob([fs.readFileSync(beforePath)], { type: 'image/jpeg' }), 'reference.jpg');
    formData.append('candidate_image', new Blob([fs.readFileSync(afterImageFile.path)], { type: afterImageFile.mimetype }), afterImageFile.originalname);
    const response = await axios.post(`${AI_SERVICE_URL}/ai/image-similarity`, formData, { timeout: 12000 });
    return response.data?.success ? Number(response.data.data.similarity || 0) : 0;
  } catch {
    return 0.0;
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
    desc.includes('bin') ||
    desc.includes('kachra')
  ) {
    return {
      category: 'GARBAGE',
      severity: 'MEDIUM',
      severityScore: 50,
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
      severityScore: 25,
      confidence: 0.90,
    };
  }

  if (
    desc.includes('water') ||
    desc.includes('leak') ||
    desc.includes('pipe') ||
    desc.includes('burst') ||
    desc.includes('overflow')
  ) {
    return {
      category: 'WATER_LEAKAGE',
      severity: 'HIGH',
      severityScore: 80,
      confidence: 0.95,
    };
  }

  if (
    desc.includes('sewage') ||
    desc.includes('gutter') ||
    desc.includes('drain')
  ) {
    return {
      category: 'SEWAGE',
      severity: 'HIGH',
      severityScore: 85,
      confidence: 0.90,
    };
  }

  return {
    category: 'ROAD_DAMAGE',
    severity: 'HIGH',
    severityScore: 75,
    confidence: 0.90,
  };
};

module.exports = {
  analyzeIssue,
  verifyResolution,
  getImageSimilarity
};

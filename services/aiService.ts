import { FaceAnalysis, HairstyleRecommendation } from '../types';
import { HAIRSTYLES, BEARDS } from '../constants';

export class AIService {

  async analyzeFace(imageData: string): Promise<FaceAnalysis> {
    console.log('Starting sequential face analysis...');
    return this.processImage(imageData);
  }

  private async processImage(imageData: string): Promise<FaceAnalysis> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(this.getDefaultAnalysis());
          return;
        }

        // Resize for consistent processing
        const MAX_WIDTH = 500;
        const scale = Math.min(1, MAX_WIDTH / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

        // STEP 1: DETECT FACE (Find Bounding Box)
        const faceBox = this.detectFace(pixels, canvas.width, canvas.height);

        if (!faceBox) {
          console.warn('No face detected');
          resolve(this.getDefaultAnalysis());
          return;
        }

        // STEP 2: ANALYZE FACE FEATURES (Shape)
        const faceShape = this.analyzeFaceShape(pixels, canvas.width, faceBox);

        // STEP 3: ANALYZE HAIR (Type & Length)
        const { hairType, hairLength } = this.analyzeHair(pixels, canvas.width, canvas.height, faceBox);

        // STEP 4: ANALYZE SKIN (Tone)
        const skinTone = this.analyzeSkinTone(pixels, canvas.width, faceBox);

        console.log('Sequential Analysis Complete:', { faceShape, hairType, hairLength, skinTone });

        resolve({
          faceShape,
          hairType,
          hairLength,
          skinTone,
          confidence: 0.95,
          faceCoordinates: {
            x: faceBox.x / canvas.width,
            y: faceBox.y / canvas.height,
            width: faceBox.width / canvas.width,
            height: faceBox.height / canvas.height
          }
        });
      };

      img.onerror = () => resolve(this.getDefaultAnalysis());
      img.src = imageData;
    });
  }

  // --- STEP 1: FACE DETECTION ---
  private detectFace(pixels: Uint8ClampedArray, width: number, height: number) {
    let minX = width, minY = height, maxX = 0, maxY = 0;
    let foundSkin = false;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (this.isSkinPixel(pixels, (y * width + x) * 4)) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
          foundSkin = true;
        }
      }
    }

    if (!foundSkin) return null;

    // Add padding to bounding box
    const w = maxX - minX;
    const h = maxY - minY;

    return {
      x: minX,
      y: minY,
      width: w,
      height: h,
      centerX: minX + w / 2,
      centerY: minY + h / 2
    };
  }

  private isSkinPixel(pixels: Uint8ClampedArray, i: number): boolean {
    const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
    // Standard RGB skin detection formula
    return (r > 95) && (g > 40) && (b > 20) &&
      (Math.max(r, g, b) - Math.min(r, g, b) > 15) &&
      (Math.abs(r - g) > 15) &&
      (r > g) && (r > b);
  }

  // --- STEP 2: FACE FEATURES ANALYSIS ---
  private analyzeFaceShape(pixels: Uint8ClampedArray, width: number, faceBox: any): FaceAnalysis['faceShape'] {
    // Measure widths at 3 key levels relative to the face box
    const foreheadY = Math.floor(faceBox.y + faceBox.height * 0.25);
    const cheekY = Math.floor(faceBox.y + faceBox.height * 0.5);
    const jawY = Math.floor(faceBox.y + faceBox.height * 0.85);

    const foreheadWidth = this.getSkinWidthAtY(pixels, width, foreheadY, faceBox.x, faceBox.x + faceBox.width);
    const cheekWidth = this.getSkinWidthAtY(pixels, width, cheekY, faceBox.x, faceBox.x + faceBox.width);
    const jawWidth = this.getSkinWidthAtY(pixels, width, jawY, faceBox.x, faceBox.x + faceBox.width);

    const faceHeight = faceBox.height;
    const faceWidth = faceBox.width;

    // Geometric Logic
    if (Math.abs(faceWidth - faceHeight) < faceWidth * 0.2) {
      // Compact face (Round/Square)
      if (jawWidth > cheekWidth * 0.9) return 'square';
      return 'round';
    } else {
      // Long face (Oval/Heart/Diamond)
      if (jawWidth > cheekWidth * 0.9) return 'square'; // Rectangular
      if (cheekWidth > foreheadWidth && cheekWidth > jawWidth) {
        if (jawWidth < foreheadWidth * 0.8) return 'diamond';
        return 'oval';
      }
      if (foreheadWidth > cheekWidth && foreheadWidth > jawWidth) return 'heart';
    }

    return 'oval'; // Default
  }

  private getSkinWidthAtY(pixels: Uint8ClampedArray, width: number, y: number, minX: number, maxX: number): number {
    let start = -1, end = -1;
    for (let x = minX; x <= maxX; x++) {
      if (this.isSkinPixel(pixels, (y * width + x) * 4)) {
        if (start === -1) start = x;
        end = x;
      }
    }
    return (start !== -1 && end !== -1) ? (end - start) : 0;
  }

  // --- STEP 3: HAIR ANALYSIS ---
  private analyzeHair(pixels: Uint8ClampedArray, width: number, height: number, faceBox: any) {
    // Look at a wider region ABOVE and to the SIDES of the face
    // Curly hair often has more volume, so we need to look wider
    const hairStartY = Math.max(0, faceBox.y - Math.floor(faceBox.height * 0.5)); // Look higher up
    const hairEndY = faceBox.y + Math.floor(faceBox.height * 0.2); // Overlap slightly with forehead
    const hairStartX = Math.max(0, faceBox.x - Math.floor(faceBox.width * 0.2)); // Look wider left
    const hairEndX = Math.min(width, faceBox.x + faceBox.width + Math.floor(faceBox.width * 0.2)); // Look wider right

    let edgeScore = 0;
    let colorVarianceScore = 0;
    let pixelCount = 0;

    for (let y = hairStartY; y < hairEndY; y += 2) { // Skip every other pixel for speed
      for (let x = hairStartX; x < hairEndX; x += 2) {
        const i = (y * width + x) * 4;

        // Skip skin pixels (we want to analyze hair, not forehead)
        if (this.isSkinPixel(pixels, i)) continue;

        const iNext = i + 4;
        const iBelow = i + (width * 4);

        if (x < width - 1 && y < height - 1) {
          // 1. Edge Detection (Texture)
          // Compare with neighbor to right AND below
          const diffH = Math.abs(pixels[i] - pixels[iNext]);
          const diffV = Math.abs(pixels[i] - pixels[iBelow]);

          if (diffH > 10 || diffV > 10) edgeScore++;

          // 2. Micro-Contrast (Shadows in curls)
          // Curly hair has high variance between light and dark spots
          const brightness = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
          const brightnessNext = (pixels[iNext] + pixels[iNext + 1] + pixels[iNext + 2]) / 3;
          if (Math.abs(brightness - brightnessNext) > 15) colorVarianceScore++;
        }
        pixelCount++;
      }
    }

    // Normalize scores
    const textureDensity = pixelCount > 0 ? edgeScore / pixelCount : 0;
    const varianceDensity = pixelCount > 0 ? colorVarianceScore / pixelCount : 0;

    // Combined score: Texture + Variance
    // Curly hair has high texture AND high variance (shadows)
    const curlScore = (textureDensity * 0.6) + (varianceDensity * 0.4);

    console.log('Hair Analysis:', { textureDensity, varianceDensity, curlScore });

    let hairType: FaceAnalysis['hairType'] = 'straight';

    // Tuned thresholds
    if (curlScore > 0.25) hairType = 'coily';
    else if (curlScore > 0.15) hairType = 'curly';
    else if (curlScore > 0.08) hairType = 'wavy';
    else hairType = 'straight';

    // Length estimation
    let hairLength: FaceAnalysis['hairLength'] = 'short';
    // If bounding box extends significantly below typical chin level relative to width
    // Or if the hair region we analyzed had a lot of hair pixels
    if (faceBox.height > faceBox.width * 1.5) hairLength = 'long';
    else if (faceBox.height > faceBox.width * 1.25) hairLength = 'medium';

    return { hairType, hairLength };
  }

  // --- STEP 4: SKIN ANALYSIS ---
  private analyzeSkinTone(pixels: Uint8ClampedArray, width: number, faceBox: any): FaceAnalysis['skinTone'] {
    // Sample center of face to avoid hair/background shadows
    const sampleX = Math.floor(faceBox.centerX);
    const sampleY = Math.floor(faceBox.centerY);
    const radius = Math.floor(faceBox.width * 0.1); // 10% of face width

    let rTotal = 0, gTotal = 0, bTotal = 0, count = 0;

    for (let y = sampleY - radius; y < sampleY + radius; y++) {
      for (let x = sampleX - radius; x < sampleX + radius; x++) {
        const i = (y * width + x) * 4;
        if (this.isSkinPixel(pixels, i)) {
          rTotal += pixels[i];
          gTotal += pixels[i + 1];
          bTotal += pixels[i + 2];
          count++;
        }
      }
    }

    if (count === 0) return 'medium';

    const avgR = rTotal / count;
    const avgG = gTotal / count;
    const avgB = bTotal / count;

    // Calculate Lightness (HSL)
    const max = Math.max(avgR, avgG, avgB);
    const min = Math.min(avgR, avgG, avgB);
    const l = (max + min) / 2 / 255 * 100;

    if (l > 70) return 'fair';
    if (l > 50) return 'medium';
    if (l > 35) return 'tan';
    return 'dark';
  }

  // --- RECOMMENDATION LOGIC ---
  async getHairstyleRecommendations(analysis: FaceAnalysis, preferences?: any): Promise<HairstyleRecommendation[]> {
    console.log('Generating recommendations for:', { analysis, preferences });

    let filteredStyles = HAIRSTYLES;
    let filteredBeards = BEARDS;

    if (preferences?.maintenance) {
      filteredStyles = filteredStyles.filter(s => s.maintenance === preferences.maintenance);
      filteredBeards = filteredBeards.filter(b => b.maintenance === preferences.maintenance);
    }

    if (preferences?.occasion) {
      filteredStyles = filteredStyles.filter(s => s.occasions.includes(preferences.occasion!));
    }

    if (filteredStyles.length < 3) filteredStyles = HAIRSTYLES;
    if (filteredBeards.length < 3) filteredBeards = BEARDS;

    const scoredStyles = filteredStyles.map(style => {
      const faceShapeScore = style.faceShapeCompatibility[analysis.faceShape] || 70;
      const hairTypeScore = style.hairTypeCompatibility[analysis.hairType] || 70;
      const overallScore = Math.round((faceShapeScore * 0.6) + (hairTypeScore * 0.4));

      return {
        id: style.id,
        name: style.name,
        description: this.generateDescription(style, analysis),
        faceShapeMatch: faceShapeScore,
        hairTypeMatch: hairTypeScore,
        overallScore: overallScore,
        maintenance: style.maintenance,
        occasion: style.occasions[0],
        image: style.image,
        scale: style.scale,
        yOffset: style.yOffset,
        tags: style.tags,
        type: 'hair' as const
      };
    });

    const scoredBeards = filteredBeards.map(beard => {
      const faceShapeScore = beard.faceShapeCompatibility[analysis.faceShape] || 70;
      return {
        id: beard.id,
        name: beard.name,
        description: this.generateBeardDescription(beard, analysis),
        faceShapeMatch: faceShapeScore,
        hairTypeMatch: 0,
        overallScore: faceShapeScore,
        maintenance: beard.maintenance,
        occasion: 'casual',
        image: beard.image,
        beardImage: beard.image,
        scale: 1,
        yOffset: 0,
        tags: beard.tags,
        type: 'beard' as const
      };
    });

    const topStyles = scoredStyles.sort((a, b) => b.overallScore - a.overallScore).slice(0, 3);
    const topBeards = scoredBeards.sort((a, b) => b.overallScore - a.overallScore).slice(0, 3);

    const comboHair = topStyles[0];
    const comboBeard = topBeards[0];
    const combo = {
      id: `${comboHair.id}-${comboBeard.id}`,
      name: `${comboHair.name} & ${comboBeard.name}`,
      description: `The perfect combination for your ${analysis.faceShape} face shape.`,
      faceShapeMatch: Math.round((comboHair.faceShapeMatch + comboBeard.faceShapeMatch) / 2),
      hairTypeMatch: comboHair.hairTypeMatch,
      overallScore: Math.round((comboHair.overallScore + comboBeard.overallScore) / 2),
      maintenance: 'medium' as const,
      occasion: comboHair.occasion,
      image: comboHair.image,
      beardImage: comboBeard.image,
      scale: comboHair.scale,
      yOffset: comboHair.yOffset,
      tags: ['combo'],
      type: 'combo' as const
    };

    return [...topStyles, ...topBeards, combo] as HairstyleRecommendation[];
  }

  private generateDescription(style: any, analysis: FaceAnalysis): string {
    return `${style.description} Perfect for your ${analysis.faceShape} face and ${analysis.hairType} hair.`;
  }

  private generateBeardDescription(beard: any, analysis: FaceAnalysis): string {
    return `${beard.description} Complements your ${analysis.faceShape} face shape perfectly.`;
  }

  private getDefaultAnalysis(): FaceAnalysis {
    return {
      faceShape: 'oval',
      hairType: 'straight',
      hairLength: 'short',
      skinTone: 'medium',
      confidence: 0.70,
      faceCoordinates: { x: 0.5, y: 0.45, width: 0.35, height: 0.45 }
    };
  }
}

export const aiService = new AIService();
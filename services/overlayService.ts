import React from 'react';
import { FaceAnalysis } from '../types';

export class OverlayService {
  /**
   * Calculate optimal hair overlay position based on face analysis
   */
  static calculateOverlayPosition(
    faceAnalysis: FaceAnalysis,
    baseScale: number,
    baseOffset: number
  ): { scale: number; yOffset: number; xOffset: number } {
    let scale = baseScale;
    let yOffset = baseOffset;
    let xOffset = 0; // Center by default

    // Adjust based on face shape
    switch (faceAnalysis.faceShape) {
      case 'round':
        // Round faces benefit from height, so increase vertical offset
        yOffset -= 5;
        scale *= 1.05;
        break;
      case 'square':
        // Square faces need softening, keep more proportional
        scale *= 0.98;
        break;
      case 'heart':
        // Heart-shaped faces work well with volume at crown
        yOffset -= 3;
        scale *= 1.02;
        break;
      case 'diamond':
        // Diamond faces need width at sides, height at top
        yOffset -= 4;
        scale *= 1.03;
        break;
      case 'oval':
      default:
        // Oval faces are ideal, use base values
        break;
    }

    // Adjust based on hair type
    switch (faceAnalysis.hairType) {
      case 'straight':
        // Straight hair lies flatter, may need less height
        yOffset += 2;
        break;
      case 'wavy':
        // Wavy hair has natural volume
        yOffset -= 1;
        scale *= 1.02;
        break;
      case 'curly':
        // Curly hair has lots of volume
        yOffset -= 2;
        scale *= 1.05;
        break;
      case 'coily':
        // Coily hair has maximum volume
        yOffset -= 3;
        scale *= 1.08;
        break;
    }

    // Adjust based on hair length
    switch (faceAnalysis.hairLength) {
      case 'short':
        // Short hair needs more relative scale
        scale *= 1.1;
        yOffset += 2;
        break;
      case 'medium':
        // Medium hair is ideal baseline
        break;
      case 'long':
        // Long hair may need less scale
        scale *= 0.95;
        yOffset -= 1;
        break;
    }

    return {
      scale: Math.max(0.8, Math.min(2.0, scale)), // Clamp between 0.8-2.0
      yOffset: Math.max(-30, Math.min(10, yOffset)), // Clamp between -30 to 10
      xOffset: Math.max(-20, Math.min(20, xOffset)) // Clamp between -20 to 20
    };
  }

  /**
   * Get hairstyle-specific adjustments
   */
  static getHairstyleAdjustments(hairstyleId: string): {
    faceShapeMultipliers: Record<string, number>;
    hairTypeMultipliers: Record<string, number>;
  } {
    const adjustments: Record<string, any> = {
      'pompadour': {
        faceShapeMultipliers: { round: 1.1, square: 0.95, heart: 1.05, diamond: 1.02, oval: 1.0 },
        hairTypeMultipliers: { straight: 1.0, wavy: 1.05, curly: 1.1, coily: 1.15 }
      },
      'faux-hawk': {
        faceShapeMultipliers: { round: 1.05, square: 0.98, heart: 1.08, diamond: 0.95, oval: 1.0 },
        hairTypeMultipliers: { straight: 1.0, wavy: 1.02, curly: 1.08, coily: 1.12 }
      },
      'side-part': {
        faceShapeMultipliers: { round: 0.98, square: 1.02, heart: 0.97, diamond: 1.0, oval: 1.0 },
        hairTypeMultipliers: { straight: 1.0, wavy: 0.98, curly: 0.95, coily: 0.9 }
      },
      'textured-crop': {
        faceShapeMultipliers: { round: 0.97, square: 1.03, heart: 0.98, diamond: 1.01, oval: 1.0 },
        hairTypeMultipliers: { straight: 0.95, wavy: 1.05, curly: 1.08, coily: 1.1 }
      }
    };

    return adjustments[hairstyleId] || {
      faceShapeMultipliers: { round: 1.0, square: 1.0, heart: 1.0, diamond: 1.0, oval: 1.0 },
      hairTypeMultipliers: { straight: 1.0, wavy: 1.0, curly: 1.0, coily: 1.0 }
    };
  }

  /**
   * Calculate final overlay parameters with all adjustments
   */
  static getFinalOverlayParams(
    faceAnalysis: FaceAnalysis,
    hairstyleId: string,
    baseScale: number,
    baseOffset: number
  ): { scale: number; yOffset: number; xOffset: number } {
    const basePosition = this.calculateOverlayPosition(faceAnalysis, baseScale, baseOffset);
    const adjustments = this.getHairstyleAdjustments(hairstyleId);

    const faceShapeMultiplier = adjustments.faceShapeMultipliers[faceAnalysis.faceShape] || 1.0;
    const hairTypeMultiplier = adjustments.hairTypeMultipliers[faceAnalysis.hairType] || 1.0;

    return {
      scale: basePosition.scale * faceShapeMultiplier * hairTypeMultiplier,
      yOffset: basePosition.yOffset,
      xOffset: basePosition.xOffset
    };
  }

  /**
   * Get overlay CSS transform styles
   */
  static getOverlayStyles(
    faceAnalysis: FaceAnalysis,
    hairstyleId: string,
    baseScale: number,
    baseOffset: number
  ): React.CSSProperties {
    const params = this.getFinalOverlayParams(faceAnalysis, hairstyleId, baseScale, baseOffset);

    if (faceAnalysis.faceCoordinates) {
      const { x, y, width, height } = faceAnalysis.faceCoordinates;

      // Calculate dimensions relative to face size
      // We assume baseScale is relative to face width (e.g. 1.2 = 1.2x face width)
      // If the original data was tuned for full-screen selfies (face ~80% width), 
      // we might need to adjust. Let's assume the data is reasonable.
      const finalWidth = width * params.scale;

      // Calculate top position
      // y is center of face. Top of face is y - height/2.
      // yOffset is percentage. We'll treat it as percentage of IMAGE height for consistency with old logic,
      // or we could treat it as percentage of FACE height. 
      // Given the values are small (-10, -5), they are likely % of image or small % of face.
      // Let's try treating it as % of image first, but anchored to face top.
      const faceTop = y - (height / 2);
      const finalTop = (faceTop * 100) + params.yOffset;

      return {
        top: `${finalTop}%`,
        left: `${x * 100}%`,
        transform: 'translateX(-50%)',
        width: `${finalWidth * 100}%`,
      };
    }

    return {
      top: `${params.yOffset}%`,
      left: `calc(50% + ${params.xOffset}px)`,
      transform: 'translateX(-50%)',
      width: `${params.scale * 100}%`,
    };
  }
}
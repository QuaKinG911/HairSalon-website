# AI Face Analysis & Hairstyle Recommendation System

## Overview
The AI system analyzes customer photos to detect facial features and recommends the most suitable hairstyles and beard styles based on compatibility scores defined in the dataset.

## How It Works

### 1. Face Analysis
When a customer uploads their photo, the system:

**With API Key (Gemini AI):**
- Sends the image to Google's Gemini AI
- Receives detailed face analysis including:
  - Face shape (oval, round, square, heart, diamond)
  - Hair type (straight, wavy, curly, coily)
  - Hair length (short, medium, long)
  - Skin tone (fair, medium, tan, dark)

**Without API Key (Intelligent Fallback):**
- Analyzes the image directly in the browser
- Examines pixel data to determine:
  - **Skin tone**: Based on average brightness
  - **Hair type**: Based on color variance
  - **Face shape**: Based on aspect ratio and features
  - **Hair length**: Based on image composition

### 2. Compatibility Matching
Each hairstyle and beard in the dataset has compatibility scores:

```typescript
faceShapeCompatibility: {
  oval: 95,    // 95% match for oval faces
  round: 85,   // 85% match for round faces
  square: 95,  // 95% match for square faces
  heart: 80,   // 80% match for heart faces
  diamond: 90  // 90% match for diamond faces
}

hairTypeCompatibility: {
  straight: 95,  // 95% match for straight hair
  wavy: 90,      // 90% match for wavy hair
  curly: 85,     // 85% match for curly hair
  coily: 80      // 80% match for coily hair
}
```

### 3. Recommendation Algorithm

The system calculates an overall match score using:
- **60% weight** on face shape compatibility
- **40% weight** on hair type compatibility

Formula:
```
Overall Score = (Face Shape Score × 0.6) + (Hair Type Score × 0.4)
```

### 4. Filtering by Preferences

The system respects user preferences:
- **Maintenance level**: low, medium, high
- **Occasion**: casual, business, formal, special

Only styles matching these preferences are considered.

### 5. Final Recommendations

The system returns:
- **Top 3 Haircuts**: Highest scoring hairstyles
- **Top 3 Beard Styles**: Highest scoring beards
- **Best Combo**: Perfect hair + beard combination

## Dataset Structure

### Hairstyles (`constants.ts`)
Each hairstyle includes:
- `id`: Unique identifier
- `name`: Style name
- `description`: What makes it special
- `category`: Classic, Modern, Professional, Edgy, Retro
- `faceShapeCompatibility`: Scores for each face shape
- `hairTypeCompatibility`: Scores for each hair type
- `maintenance`: low, medium, or high
- `occasions`: Array of suitable occasions
- `image`: Path to style image
- `tags`: Descriptive tags

### Beards (`constants.ts`)
Each beard style includes:
- `id`: Unique identifier
- `name`: Style name
- `description`: What makes it special
- `faceShapeCompatibility`: Scores for each face shape
- `maintenance`: low, medium, or high
- `image`: Path to style image
- `tags`: Descriptive tags

## Example Flow

1. **Customer uploads selfie**
2. **System detects**: Oval face, wavy hair
3. **System filters**: Business occasion, medium maintenance
4. **System scores** all matching styles:
   - Quiff: (95 × 0.6) + (95 × 0.4) = **95%**
   - Pompadour: (90 × 0.6) + (90 × 0.4) = **90%**
   - Side Part: (95 × 0.6) + (90 × 0.4) = **93%**
5. **System recommends**: Top 3 based on scores
6. **Personalized descriptions** explain why each style suits them

## Advantages

✅ **Data-Driven**: Uses real compatibility scores, not random
✅ **Personalized**: Considers face shape, hair type, and preferences
✅ **Works Offline**: Intelligent fallback when API unavailable
✅ **Explainable**: Clear reasons for each recommendation
✅ **Customizable**: Easy to adjust compatibility scores in dataset

## Customization

To adjust recommendations, edit `constants.ts`:

1. **Change compatibility scores** for any style
2. **Add new hairstyles** with their compatibility data
3. **Modify weighting** in `aiService.ts` (currently 60/40)
4. **Add new face shapes** or hair types

## Future Enhancements

- Real-time virtual try-on with face overlay
- Learn from user feedback to improve scores
- Consider additional factors (age, profession, lifestyle)
- Integration with booking system for seamless appointments

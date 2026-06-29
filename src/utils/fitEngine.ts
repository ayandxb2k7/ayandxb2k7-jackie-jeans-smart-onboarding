export interface FitProfile {
  height?: string;
  weight?: string | null;
  waist?: number;
  hips?: number;
  waist_fit?: string;
  rise?: string;
  thigh_fit?: string;
  brands?: string[];
  brand_sizes?: Record<string, string>;
  frustration?: string[];
  completedAt?: string;
  flow?: 'manual' | 'voice';
}

export interface FitRecommendation {
  recommendedSize: string;
  inseam: string;
  riseType: string;
  fitStyle: string;
  confidenceScore: number;
  matchedBrands: string[];
  tips: string[];
  fitLabel: string;
  fitColor: string;
}

function heightToInches(h: string): number {
  const match = h.match(/(\d+)'(\d+)"/);
  if (!match) return 66;
  return parseInt(match[1]) * 12 + parseInt(match[2]);
}

export function generateFitRecommendation(profile: FitProfile): FitRecommendation {
  const waist = profile.waist ?? 32;
  const heightInch = profile.height ? heightToInches(profile.height) : 66;
  
  // Inseam based on height
  let inseam = '30"';
  if (heightInch <= 62) inseam = '28"';
  else if (heightInch <= 64) inseam = '29"';
  else if (heightInch <= 67) inseam = '30"';
  else if (heightInch <= 70) inseam = '32"';
  else inseam = '34"';

  // Recommended jeans size
  const recommendedSize = `${waist}×${inseam.replace('"', '')}`;

  // Rise
  const riseType = profile.rise ?? 'Mid Rise';

  // Fit style based on thigh preference
  const fitStyles: Record<string, string> = {
    'Fitted': 'Slim Fit',
    'Relaxed': 'Regular Fit',
    'Loose': 'Relaxed Fit',
  };
  const fitStyle = fitStyles[profile.thigh_fit ?? 'Relaxed'] ?? 'Regular Fit';

  // Confidence score
  let score = 60;
  if (profile.waist) score += 15;
  if (profile.hips) score += 10;
  if (profile.height) score += 8;
  if (profile.brands?.length) score += 5;
  if (profile.brand_sizes && Object.keys(profile.brand_sizes).length > 0) score += 7;
  score = Math.min(score, 98);

  // Matched brands
  const brandFitMap: Record<string, string> = {
    "Levi's": '30-34',
    'Madewell': '28-32',
    'Agolde': '26-32',
    'Good American': '24-32',
    'Paige': '26-32',
    'American Eagle': '28-36',
    'Zara': '28-34',
    'Gap': '28-36',
  };
  const matchedBrands = Object.entries(brandFitMap)
    .filter(([brand]) => profile.brands?.includes(brand) || true)
    .slice(0, 3)
    .map(([brand]) => brand);

  // Tips
  const tips: string[] = [];
  if (profile.frustration?.includes('Waist Gap')) {
    tips.push('Look for brands with elastic waistbands or belt loops to reduce waist gap.');
  }
  if (profile.frustration?.includes('Hip Tightness')) {
    tips.push('Try bootcut or wide-leg styles that have more room through the hips.');
  }
  if (profile.frustration?.includes('Wrong Length')) {
    tips.push('Always check the inseam length — your ideal is ' + inseam + '.');
  }
  if (profile.frustration?.includes('Thigh Fit')) {
    tips.push('Look for "curvy fit" or "athletic fit" styles that are cut wider in the thigh.');
  }
  if (tips.length === 0) {
    tips.push('Your measurements look great — you should have an easy time finding the right fit.');
    tips.push(`A ${fitStyle} cut in your size should feel comfortable and flattering.`);
  }

  // Confidence label
  let fitLabel = 'Good Match';
  let fitColor = '#a78bfa';
  if (score >= 90) { fitLabel = 'Excellent Match'; fitColor = '#34d399'; }
  else if (score >= 80) { fitLabel = 'Strong Match'; fitColor = '#818cf8'; }
  else if (score >= 70) { fitLabel = 'Good Match'; fitColor = '#a78bfa'; }
  else { fitLabel = 'Decent Match'; fitColor = '#f59e0b'; }

  return {
    recommendedSize,
    inseam,
    riseType,
    fitStyle,
    confidenceScore: score,
    matchedBrands,
    tips,
    fitLabel,
    fitColor,
  };
}

export function encodeFitProfile(profile: FitProfile): string {
  try {
    return btoa(encodeURIComponent(JSON.stringify(profile)));
  } catch {
    return '';
  }
}

export function parseSpeechHeight(text: string): string | null {
  const t = text.toLowerCase().trim();
  
  // "five foot six", "five feet six", "5'6"
  const feetInchWords: Record<string, number> = {
    'four': 4, 'five': 5, 'six': 6,
    'zero': 0, 'one': 1, 'two': 2, 'three': 3,
    'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
    'eleven': 11, 'twelve': 12,
  };
  
  // Numeric pattern: 5'6", 5'6, 5-6
  const numMatch = t.match(/(\d+)['''`](\d+)["""]?/);
  if (numMatch) {
    const feet = parseInt(numMatch[1]);
    const inches = parseInt(numMatch[2]);
    if (feet >= 4 && feet <= 6 && inches >= 0 && inches <= 11) {
      return `${feet}'${inches}"`;
    }
  }

  // Word pattern
  const wordPattern = /(\w+)\s+(?:foot|feet|ft\.?)\s+(\w+)/i;
  const wordMatch = t.match(wordPattern);
  if (wordMatch) {
    const feet = feetInchWords[wordMatch[1]] ?? parseInt(wordMatch[1]);
    const inches = feetInchWords[wordMatch[2]] ?? parseInt(wordMatch[2]);
    if (!isNaN(feet) && !isNaN(inches)) {
      return `${feet}'${inches}"`;
    }
  }

  // "five six" pattern  
  const twoWordMatch = t.match(/^(\w+)\s+(\w+)$/);
  if (twoWordMatch) {
    const feet = feetInchWords[twoWordMatch[1]] ?? parseInt(twoWordMatch[1]);
    const inches = feetInchWords[twoWordMatch[2]] ?? parseInt(twoWordMatch[2]);
    if (!isNaN(feet) && !isNaN(inches) && feet >= 4 && feet <= 6) {
      return `${feet}'${inches}"`;
    }
  }
  
  return null;
}

export function parseSpeechNumber(text: string): number | null {
  const t = text.toLowerCase().trim();
  
  // Direct number
  const directNum = t.match(/\d+/);
  if (directNum) return parseInt(directNum[0]);
  
  // Word to number
  const wordNums: Record<string, number> = {
    'twenty': 20, 'twenty-one': 21, 'twenty-two': 22, 'twenty-three': 23,
    'twenty-four': 24, 'twenty-five': 25, 'twenty-six': 26, 'twenty-seven': 27,
    'twenty-eight': 28, 'twenty-nine': 29, 'thirty': 30, 'thirty-one': 31,
    'thirty-two': 32, 'thirty-three': 33, 'thirty-four': 34, 'thirty-five': 35,
    'thirty-six': 36, 'forty': 40, 'forty-two': 42, 'forty-four': 44,
    'fifty': 50, 'sixty': 60,
  };
  
  for (const [word, num] of Object.entries(wordNums)) {
    if (t.includes(word)) return num;
  }
  
  return null;
}

export function parseSpeechBrands(text: string, availableBrands: string[]): string[] {
  const t = text.toLowerCase();
  const found: string[] = [];
  
  for (const brand of availableBrands) {
    const brandLower = brand.toLowerCase().replace("'", '').replace('&', 'and');
    const textClean = t.replace(/'/g, '').replace('&', 'and').replace('h and m', 'hm').replace('h&m', 'hm');
    
    if (textClean.includes(brandLower) || 
        t.includes(brand.toLowerCase()) ||
        (brand === 'H&M' && (t.includes('h&m') || t.includes('h and m') || t.includes('hm'))) ||
        (brand === "Levi's" && (t.includes('levi') || t.includes("levi's"))) ||
        (brand === 'American Eagle' && (t.includes('american eagle') || t.includes('ae'))) ||
        (brand === 'Good American' && t.includes('good american')) ||
        (brand === 'Calvin Klein' && (t.includes('calvin klein') || t.includes('ck')))
    ) {
      if (!found.includes(brand)) found.push(brand);
    }
  }
  
  return found;
}

export function parseSpeechBrandSizes(text: string, brands: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  const t = text.toLowerCase();
  
  const sizeWords: Record<string, string> = {
    'extra small': 'XS', 'xs': 'XS', 'x small': 'XS',
    'small': 'S', 'medium': 'M', 'large': 'L',
    'extra large': 'XL', 'xl': 'XL', 'xxl': 'XXL',
  };
  
  for (const brand of brands) {
    const brandLower = brand.toLowerCase().replace("'", '');
    if (!t.includes(brandLower) && !t.includes(brand.toLowerCase())) continue;
    
    // Try to find a size after the brand name
    const afterBrand = t.split(brand.toLowerCase())[1] ?? '';
    const numMatch = afterBrand.match(/\d+/);
    if (numMatch) {
      result[brand] = numMatch[0];
      continue;
    }
    
    for (const [word, size] of Object.entries(sizeWords)) {
      if (afterBrand.includes(word)) {
        result[brand] = size;
        break;
      }
    }
  }
  
  return result;
}

export function parseSpeechChoice(text: string, options: string[]): string | null {
  const t = text.toLowerCase().trim();
  
  for (const opt of options) {
    if (t.includes(opt.toLowerCase())) return opt;
  }
  
  // Fuzzy matching
  const fuzzyMap: Record<string, string> = {
    'snug': 'Snug', 'tight': 'Snug',
    'slightly relaxed': 'Slightly Relaxed', 'little relaxed': 'Slightly Relaxed', 'bit relaxed': 'Slightly Relaxed',
    'relaxed': 'Relaxed', 'loose': 'Loose',
    'high': 'High Rise', 'high rise': 'High Rise',
    'mid': 'Mid Rise', 'middle': 'Mid Rise', 'mid rise': 'Mid Rise',
    'low': 'Low Rise', 'low rise': 'Low Rise',
    'fitted': 'Fitted', 'slim': 'Fitted', 'skinny': 'Fitted',
  };
  
  for (const [key, val] of Object.entries(fuzzyMap)) {
    if (t.includes(key)) {
      const found = options.find(o => o === val);
      if (found) return found;
    }
  }
  
  return null;
}

export function parseSpeechFrustrations(text: string, options: string[]): string[] {
  const t = text.toLowerCase();
  const found: string[] = [];
  
  const fuzzy: Record<string, string> = {
    'waist gap': 'Waist Gap', 'gap at waist': 'Waist Gap', 'gap in waist': 'Waist Gap',
    'hip': 'Hip Tightness', 'tight hips': 'Hip Tightness',
    'length': 'Wrong Length', 'too long': 'Wrong Length', 'too short': 'Wrong Length',
    'thigh': 'Thigh Fit', 'thighs': 'Thigh Fit',
    'rise': 'Rise',
    'other': 'Other',
  };
  
  for (const [key, val] of Object.entries(fuzzy)) {
    if (t.includes(key) && options.includes(val) && !found.includes(val)) {
      found.push(val);
    }
  }
  
  return found;
}

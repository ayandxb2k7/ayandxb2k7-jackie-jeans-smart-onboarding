export interface Question {
  id: string;
  step: number;
  title: string;
  subtitle: string;
  voicePrompt: string;
  voiceConfirm?: string;
  type: 'height' | 'weight' | 'number' | 'single-choice' | 'multi-choice' | 'brand-sizes';
  options?: string[];
  min?: number;
  max?: number;
  unit?: string;
  optional?: boolean;
  conditionalOn?: string;
}

export const QUESTIONS: Question[] = [
  {
    id: 'height',
    step: 1,
    title: 'What is your height?',
    subtitle: 'This helps us find your perfect inseam length',
    voicePrompt: "Let's start with your height. You can say something like five foot six, or five feet ten inches.",
    voiceConfirm: "Got it, height noted!",
    type: 'height',
    options: generateHeights(),
    unit: '',
  },
  {
    id: 'weight',
    step: 2,
    title: 'What is your weight?',
    subtitle: 'Optional — helps calibrate proportional fit',
    voicePrompt: "Next, what's your weight? Feel free to say skip if you'd prefer not to share.",
    voiceConfirm: "Perfect, noted!",
    type: 'weight',
    unit: 'lbs',
    optional: true,
  },
  {
    id: 'waist',
    step: 3,
    title: 'Waist measurement',
    subtitle: 'Your waist in inches — the most direct sizing input',
    voicePrompt: "What's your waist measurement in inches? For example, you could say thirty two.",
    voiceConfirm: "Great, waist measurement saved!",
    type: 'number',
    min: 24,
    max: 52,
    unit: '"',
  },
  {
    id: 'hips',
    step: 4,
    title: 'Hip measurement',
    subtitle: 'Your hips in inches — critical for denim fit',
    voicePrompt: "What's your hip measurement in inches? This is usually the widest part.",
    voiceConfirm: "Excellent, hip measurement saved!",
    type: 'number',
    min: 32,
    max: 60,
    unit: '"',
  },
  {
    id: 'waist_fit',
    step: 5,
    title: 'Waist fit preference',
    subtitle: 'How do you like jeans to feel at the waist?',
    voicePrompt: "How do you like your jeans to fit at the waist? Snug, slightly relaxed, or relaxed?",
    voiceConfirm: "Love it, that's noted!",
    type: 'single-choice',
    options: ['Snug', 'Slightly Relaxed', 'Relaxed'],
  },
  {
    id: 'rise',
    step: 6,
    title: 'Where should the waistband sit?',
    subtitle: 'Your preferred rise style',
    voicePrompt: "Where do you like your waistband to sit? High rise, mid rise, or low rise?",
    voiceConfirm: "Perfect choice!",
    type: 'single-choice',
    options: ['High Rise', 'Mid Rise', 'Low Rise'],
  },
  {
    id: 'thigh_fit',
    step: 7,
    title: 'Thigh fit preference',
    subtitle: 'How should jeans fit through the thighs?',
    voicePrompt: "How would you like your jeans to fit through the thighs? Fitted, relaxed, or loose?",
    voiceConfirm: "Got it!",
    type: 'single-choice',
    options: ['Fitted', 'Relaxed', 'Loose'],
  },
  {
    id: 'brands',
    step: 8,
    title: 'Brands you\'ve worn',
    subtitle: 'Select all denim brands you\'ve purchased before',
    voicePrompt: "Which denim brands have you bought before? You can name as many as you like — for example, Levi's, Zara, Madewell.",
    voiceConfirm: "Awesome, brands noted!",
    type: 'multi-choice',
    options: [
      "Levi's", 'Wrangler', 'Lee', 'Gap', 'American Eagle',
      'Madewell', 'Abercrombie', 'Zara', 'H&M', 'Uniqlo',
      'Old Navy', 'Everlane', 'Good American', 'Agolde', 'Paige',
      'Topshop', 'Diesel', 'Calvin Klein',
    ],
  },
  {
    id: 'brand_sizes',
    step: 9,
    title: 'Your size in each brand',
    subtitle: 'What size did you buy in each brand?',
    voicePrompt: "For each brand you selected, tell me the size you usually buy. For example — Levi's thirty two, Zara medium.",
    voiceConfirm: "Perfect, all sizes noted!",
    type: 'brand-sizes',
    conditionalOn: 'brands',
  },
  {
    id: 'frustration',
    step: 10,
    title: 'Biggest fit frustration',
    subtitle: 'What frustrates you most when buying jeans?',
    voicePrompt: "What's your biggest frustration when buying jeans? Things like waist gap, hip tightness, wrong length, thigh fit, or rise issues.",
    voiceConfirm: "Totally understand, I've got that noted!",
    type: 'multi-choice',
    options: ['Waist Gap', 'Hip Tightness', 'Wrong Length', 'Thigh Fit', 'Rise', 'Other'],
  },
];

function generateHeights(): string[] {
  const heights: string[] = [];
  // 4'10" to 6'2"
  const ranges = [
    { feet: 4, minInch: 10, maxInch: 11 },
    { feet: 5, minInch: 0, maxInch: 11 },
    { feet: 6, minInch: 0, maxInch: 2 },
  ];
  for (const r of ranges) {
    for (let i = r.minInch; i <= r.maxInch; i++) {
      heights.push(`${r.feet}'${i}"`);
    }
  }
  return heights;
}

export const TOTAL_STEPS = QUESTIONS.length;

export const DENIM_BRANDS = [
  "Levi's", 'Wrangler', 'Lee', 'Gap', 'American Eagle',
  'Madewell', 'Abercrombie', 'Zara', 'H&M', 'Uniqlo',
  'Old Navy', 'Everlane', 'Good American', 'Agolde', 'Paige',
  'Topshop', 'Diesel', 'Calvin Klein',
];

export const COMMON_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '36', '38', '40'];

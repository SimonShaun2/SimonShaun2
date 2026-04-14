export type PlanStory = {
  name: 'Launch' | 'Momentum' | 'Engine';
  price: string;
  cadence: string;
  badge: string;
  bestFor: string;
  summary: string;
  detail: string;
  highlights: string[];
};

export type AddOnStory = {
  name: string;
  price: string;
  cadence: string;
  badge: string;
  summary: string;
  detail: string;
  highlights: string[];
};

export const plans: PlanStory[] = [
  {
    name: 'Launch',
    price: '$29',
    cadence: '/month',
    badge: 'Get live',
    bestFor: 'Restaurants ready to own direct catering',
    summary: 'A branded storefront that gets the first direct orders moving.',
    detail: 'Launch gives you the storefront, intake, and guardrails to bring catering demand direct.',
    highlights: [
      'Branded catering storefront',
      'Delivery and pickup selection',
      'Lead times, minimums, and deposits',
      'Future scheduling',
      'Basic reporting and order history',
    ],
  },
  {
    name: 'Momentum',
    price: '$99',
    cadence: '/month',
    badge: 'Repeat revenue',
    bestFor: 'Teams that want recurring orders and bigger baskets',
    summary: 'Recurring scheduling, upsells, and reorder flows that keep accounts warm.',
    detail: 'Momentum turns one off catering into repeat business with scheduling, incentives, and reorder tools.',
    highlights: [
      'Recurring scheduling',
      'Booking incentives and reorder flows',
      'Basic upsells and extra item prompts',
      'Saved event templates',
      'Basic customer insights',
    ],
  },
  {
    name: 'Engine',
    price: '$149',
    cadence: '/month',
    badge: 'AI growth',
    bestFor: 'Operators who want automation and retention working together',
    summary: 'AI campaigns, customer intelligence, and growth automation in one stack.',
    detail: 'Engine adds AI on top of direct catering so the system can recommend, re-engage, and prioritize work.',
    highlights: [
      'AI upsells and campaign generation',
      'Reactivation and follow up workflows',
      'Lead scoring and segmentation',
      'Advanced analytics and churn risk',
      'Corporate growth intelligence',
    ],
  },
];

export const growthAdvisor: AddOnStory = {
  name: 'Growth Advisor',
  price: '$99',
  cadence: '/month',
  badge: 'Premium addition',
  summary: 'A strategic layer for pricing, launch coaching, menu decisions, and repeat revenue planning.',
  detail: 'Growth Advisor turns live storefront signals into a clear 30-day plan the team can act on.',
  highlights: [
    'Launch readiness coaching',
    'Pricing and menu guidance',
    'Repeat revenue recommendations',
    'Operator playbooks and insights',
  ],
};

export const revenuePillars = [
  {
    title: 'Sell direct',
    summary: 'Launch gives restaurants a branded storefront, deposit collection, and a direct ordering flow.',
  },
  {
    title: 'Grow repeat revenue',
    summary: 'Momentum schedules the next order, suggests extras, and makes repeat business easier.',
  },
  {
    title: 'Compound with AI',
    summary: 'Engine adds campaign generation, lead scoring, and customer intelligence so the business keeps learning.',
  },
];

export const howItWorksSteps = [
  {
    number: '01',
    title: 'Choose the right tier',
    summary: 'Launch gets you live, Momentum adds repeat revenue tools, and Engine layers in AI.',
    bullets: [
      'Every tier starts with a branded direct catering channel.',
      'Momentum and Engine are the repeat revenue layers.',
      'Growth Advisor can be added when strategy matters as much as execution.',
    ],
  },
  {
    number: '02',
    title: 'Set the storefront rules',
    summary: 'Brand, menu, lead times, minimums, deposits, and locations are set before the first order.',
    bullets: [
      'The customer sees one clean storefront, not a patchwork of tools.',
      'Order guardrails protect margin and keep the kitchen prepared.',
      'The merchant dashboard receives the full order record immediately.',
    ],
  },
  {
    number: '03',
    title: 'Capture the order and ticket the kitchen',
    summary: 'The order flows through the storefront, lands in the dashboard, and the team can act quickly.',
    bullets: [
      'Customer and merchant emails show the same order details.',
      'The kitchen can use a standard kitchen ticket order summary.',
      'Deposit and fulfillment state stay visible in one workflow.',
    ],
  },
  {
    number: '04',
    title: 'Keep the next order in motion',
    summary: 'Momentum schedules repeats, Engine handles reactivation, and the account keeps compounding.',
    bullets: [
      'Recurring scheduling creates a new order path without starting over.',
      'Upsells and reorder nudges lift basket size and frequency.',
      'AI surfaces who to follow up with and when to act.',
    ],
  },
];

export const featureAtlas = [
  {
    title: 'Storefront and intake',
    items: [
      'Branded catering storefront',
      'Delivery and pickup selection',
      'Lead times and order minimums',
      'Deposit collection',
    ],
  },
  {
    title: 'Repeat revenue',
    items: [
      'Recurring scheduling',
      'Order templates and rebook flows',
      'Booking incentives',
      'Upsells and extra item prompts',
    ],
  },
  {
    title: 'AI and retention',
    items: [
      'AI upsells',
      'Email and campaign generation',
      'Reactivation flows',
      'Lead scoring and segmentation',
    ],
  },
  {
    title: 'Growth support',
    items: [
      'Growth Advisor',
      'Pricing guidance',
      'Launch coaching',
      'Repeat revenue planning',
    ],
  },
];

export const pricingRows = [
  {
    feature: 'Branded storefront',
    launch: true,
    momentum: true,
    engine: true,
  },
  {
    feature: 'Future scheduling',
    launch: true,
    momentum: true,
    engine: true,
  },
  {
    feature: 'Recurring scheduling',
    launch: false,
    momentum: true,
    engine: true,
  },
  {
    feature: 'Upsells and reorder flows',
    launch: false,
    momentum: true,
    engine: true,
  },
  {
    feature: 'AI upsells and campaigns',
    launch: false,
    momentum: false,
    engine: true,
  },
  {
    feature: 'Lead scoring and segmentation',
    launch: false,
    momentum: false,
    engine: true,
  },
  {
    feature: 'Advanced analytics and churn risk',
    launch: false,
    momentum: false,
    engine: true,
  },
];

export const pricingFaqs = [
  {
    q: 'Which plan should most restaurants start with?',
    a: 'Launch is the right entry point for a branded storefront. Momentum is the better fit when repeat revenue and upsells matter. Engine is for teams that want AI and automation working together.',
  },
  {
    q: 'Can I add Growth Advisor to any tier?',
    a: 'Yes. Growth Advisor is a premium addition that can be paired with any base plan when you want strategy and launch guidance.',
  },
  {
    q: 'What is the difference between Momentum and Engine?',
    a: 'Momentum focuses on recurring scheduling, booking incentives, upsells, and rebook flows. Engine adds AI campaign generation, reactivation, lead scoring, segmentation, and advanced analytics.',
  },
  {
    q: 'Can I upgrade later?',
    a: 'Yes. You can start with Launch and move up once recurring orders and automation become the next priority.',
  },
];

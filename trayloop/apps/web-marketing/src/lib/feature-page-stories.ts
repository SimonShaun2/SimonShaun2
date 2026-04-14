export type FeatureStoryKey =
  | 'recurring-orders'
  | 'merchant-portal'
  | 'smart-pricing'
  | 'smart-upsell'
  | 'capacity-management'
  | 'revenue-dashboard'
  | 'direct-ordering'
  | 'automated-follow-up'
  | 'ai-reengagement'
  | 'smart-upsells'
  | 'deposit-collection';

export type FeatureStory = {
  key: FeatureStoryKey;
  href: string;
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  heroTitle: string;
  heroSummary: string;
  heroMetrics: Array<{ label: string; value: string }>;
  spotlight: {
    eyebrow: string;
    title: string;
    summary: string;
    chips: string[];
    rail: Array<{ label: string; value: string }>;
  };
  leversEyebrow: string;
  leversTitle: string;
  leversSummary: string;
  levers: Array<{ title: string; summary: string }>;
  workflowEyebrow: string;
  workflowTitle: string;
  workflowSummary: string;
  workflowSteps: string[];
  workflowPanelTitle: string;
  workflowPanelRows: Array<{ label: string; value: string }>;
  workflowPanelNote: string;
  includedIn: 'Launch' | 'Momentum' | 'Engine';
  planReason: string;
  nextUnlock: string;
  closingTitle: string;
  closingSummary: string;
};

export const featurePageStories: Record<FeatureStoryKey, FeatureStory> = {
  'recurring-orders': {
    key: 'recurring-orders',
    href: '/product/recurring-orders',
    metaTitle: 'Recurring Orders | TrayLoop',
    metaDescription:
      'Recurring order automation for restaurants that want repeat catering revenue without chasing the next booking by hand.',
    eyebrow: 'Product · Repeat revenue',
    heroTitle: 'Recurring orders that turn one booking into the next one.',
    heroSummary:
      'TrayLoop makes repeat catering feel operational instead of accidental. Schedule the next order, preserve the event details, and keep accounts moving without rebuilding the order from scratch.',
    heroMetrics: [
      { label: 'Best tier', value: 'Momentum' },
      { label: 'Core result', value: 'More repeat revenue' },
      { label: 'Operator lift', value: 'Less manual follow up' },
    ],
    spotlight: {
      eyebrow: 'Recurring engine',
      title: 'The next event is already in motion.',
      summary:
        'Cadence, delivery day, time, and event details stay in one workflow so recurring catering feels like a real program.',
      chips: ['Weekly cadence', 'Saved event profile', 'Projected savings'],
      rail: [
        { label: 'Repeat starting', value: 'Tue, Apr 14 · 11:30 AM' },
        { label: 'Cadence', value: 'Every week' },
        { label: 'Projected savings', value: '$6 over 3 months' },
      ],
    },
    leversEyebrow: 'Why it matters',
    leversTitle: 'Three revenue levers sit inside one recurring flow.',
    leversSummary:
      'Recurring scheduling is not just a convenience feature. It is a repeat-rate, retention, and planning advantage.',
    levers: [
      {
        title: 'Preserve the buying momentum',
        summary:
          'Customers decide once, save the pattern, and keep the next order moving without opening a new planning thread every time.',
      },
      {
        title: 'Create predictable demand',
        summary:
          'Operators can see the recurring schedule early, prepare staffing, and plan purchasing around demand that is already booked.',
      },
      {
        title: 'Give higher tiers a reason to exist',
        summary:
          'Recurring is the clearest bridge from Launch into Momentum because it immediately translates into repeat revenue.',
      },
    ],
    workflowEyebrow: 'Inside the workflow',
    workflowTitle: 'The recurring setup reads like a plan, not a settings panel.',
    workflowSummary:
      'Customers choose cadence, date, and time on the second page of checkout, while the merchant gets the same structure inside the workspace.',
    workflowSteps: [
      'Set the repeat cadence directly inside the checkout review lane.',
      'Choose the recurring start date and service time without leaving the order.',
      'Preview the next deliveries before submitting so the plan feels concrete.',
      'Push the same schedule into the merchant dashboard for follow up and confirmation.',
    ],
    workflowPanelTitle: 'Recurring schedule preview',
    workflowPanelRows: [
      { label: 'Cadence', value: 'Every week' },
      { label: 'Delivery day', value: 'Tuesday' },
      { label: 'Start date', value: 'Apr 14, 2026' },
      { label: 'Projected savings', value: '$6 over 3 months' },
    ],
    workflowPanelNote: 'Customers see the future schedule before submitting. Operators receive the same plan in the order record.',
    includedIn: 'Momentum',
    planReason: 'Momentum is where repeat revenue starts becoming a system instead of a one off success.',
    nextUnlock: 'Engine layers AI campaigns and reactivation on top of the recurring base.',
    closingTitle: 'Make repeat catering part of the operating model.',
    closingSummary:
      'Recurring orders give the team a cleaner forecast, a better repeat rate, and a stronger reason for customers to stay in your direct channel.',
  },
  'merchant-portal': {
    key: 'merchant-portal',
    href: '/product/merchant-portal',
    metaTitle: 'Merchant Portal | TrayLoop',
    metaDescription:
      'A merchant portal built for catering operators who need one place to review orders, deposits, follow up, and growth signals.',
    eyebrow: 'Product · Operator workspace',
    heroTitle: 'A merchant portal built like an operating system for catering.',
    heroSummary:
      'TrayLoop keeps storefront, orders, billing, launch, follow up, and revenue signals in one merchant workspace so operators do not lose the thread between booking and growth.',
    heroMetrics: [
      { label: 'Best tier', value: 'Launch' },
      { label: 'Core result', value: 'Faster operator action' },
      { label: 'Operator lift', value: 'One workspace' },
    ],
    spotlight: {
      eyebrow: 'Mission control',
      title: 'The operator sees what matters now and what drives the next revenue move.',
      summary:
        'The merchant dashboard connects launch state, live orders, deposit blockers, and growth surfaces instead of scattering them across tabs.',
      chips: ['Order board', 'Billing lane', 'Launch center'],
      rail: [
        { label: 'Review now', value: '2 orders' },
        { label: 'Due soon', value: '2 orders' },
        { label: 'Plan lane', value: 'Launch active' },
      ],
    },
    leversEyebrow: 'Why it matters',
    leversTitle: 'The portal keeps operations and revenue in the same frame.',
    leversSummary:
      'A catering team moves faster when pricing, fulfillment, follow up, and billing are not stitched together from separate tools.',
    levers: [
      {
        title: 'Clear daily priorities',
        summary:
          'Operators can see urgent orders, deposit blockers, and launch tasks before they dig into the full queue.',
      },
      {
        title: 'A stronger billing story',
        summary:
          'Plan state, upgrades, and extras live inside the same workspace where the merchant feels the value of the product.',
      },
      {
        title: 'A better upgrade path',
        summary:
          'The portal is where Launch, Momentum, Engine, and Growth Advisor become tangible instead of abstract pricing rows.',
      },
    ],
    workflowEyebrow: 'Inside the workflow',
    workflowTitle: 'Orders, launch, follow up, and growth all stay in one operator rhythm.',
    workflowSummary:
      'The merchant portal is less about dashboards and more about preserving context so nothing gets lost between the first order and the next.',
    workflowSteps: [
      'Review incoming orders and deposit status from the same board.',
      'Open billing, offerings, and storefront settings without leaving the workflow.',
      'See locked or unlocked growth surfaces based on the active plan.',
      'Use launch, customers, and revenue views as part of one operating system.',
    ],
    workflowPanelTitle: 'Operator shelf',
    workflowPanelRows: [
      { label: 'Live orders', value: '0' },
      { label: 'Repeat customers', value: '0' },
      { label: 'Last refresh', value: '10:52 PM' },
      { label: 'Plan lane', value: 'Launch' },
    ],
    workflowPanelNote: 'The merchant portal keeps the operational thread intact instead of forcing the team to jump between tools.',
    includedIn: 'Launch',
    planReason: 'Launch includes the full operator workspace because getting live still needs a strong system of record.',
    nextUnlock: 'Momentum adds recurring, upsells, and repeat-revenue surfaces inside the same portal.',
    closingTitle: 'Give the operator one place to run the catering business.',
    closingSummary:
      'The merchant portal is where direct orders stop feeling fragmented and start feeling like a real operating system.',
  },
  'smart-pricing': {
    key: 'smart-pricing',
    href: '/product/smart-pricing',
    metaTitle: 'Smart Pricing | TrayLoop',
    metaDescription:
      'Smart pricing for catering menus, order minimums, deposits, and service rules so operators protect margin without slowing down orders.',
    eyebrow: 'Product · Margin control',
    heroTitle: 'Pricing controls that protect margin without slowing the order.',
    heroSummary:
      'TrayLoop gives merchants one place to set minimums, deposits, lead times, and menu structure so the storefront feels premium while the kitchen stays protected.',
    heroMetrics: [
      { label: 'Best tier', value: 'Launch' },
      { label: 'Core result', value: 'Protected margin' },
      { label: 'Operator lift', value: 'Fewer manual exceptions' },
    ],
    spotlight: {
      eyebrow: 'Pricing layer',
      title: 'The storefront shows one clean offer. The merchant keeps the guardrails.',
      summary:
        'Customers see a simple ordering flow while the business keeps control over deposits, lead times, minimums, and premium extras.',
      chips: ['Order minimums', 'Deposits', 'Lead times'],
      rail: [
        { label: 'Minimum order', value: '$200' },
        { label: 'Deposit', value: '25% required' },
        { label: 'Lead time', value: '48 hours' },
      ],
    },
    leversEyebrow: 'Why it matters',
    leversTitle: 'Smart pricing protects margin before the order becomes a problem.',
    leversSummary:
      'Restaurants lose revenue when the storefront accepts the wrong orders or leaves money on the table. Smart pricing fixes both sides.',
    levers: [
      {
        title: 'Hold the floor on order quality',
        summary:
          'Minimums and lead times keep low-value or operationally risky orders from slipping through the front door.',
      },
      {
        title: 'Collect commitment early',
        summary:
          'Deposit rules reduce cancellation risk and make the kitchen more confident saying yes to larger catering jobs.',
      },
      {
        title: 'Set up better upgrade moments',
        summary:
          'Once the pricing lane is clear, Momentum and Engine have a stronger base for upsells, recurring, and AI growth.',
      },
    ],
    workflowEyebrow: 'Inside the workflow',
    workflowTitle: 'Pricing lives inside the operator setup, not in a spreadsheet on the side.',
    workflowSummary:
      'The merchant adjusts the storefront rules once, and the customer sees a cleaner, more credible offer every time they order.',
    workflowSteps: [
      'Set order minimums and lead times by service mode.',
      'Require a deposit before the event is confirmed.',
      'Keep the storefront message aligned with what the kitchen can fulfill profitably.',
      'Use the same pricing logic in launch setup, the storefront, and the order record.',
    ],
    workflowPanelTitle: 'Pricing rule lane',
    workflowPanelRows: [
      { label: 'Minimum order', value: '$200' },
      { label: 'Deposit requirement', value: 'Required' },
      { label: 'Delivery threshold', value: 'Free over $300' },
      { label: 'Lead time', value: '48 hours' },
    ],
    workflowPanelNote: 'Operators keep one pricing source of truth while the storefront stays simple for the customer.',
    includedIn: 'Launch',
    planReason: 'Launch needs strong pricing controls because direct orders only work when the storefront promise and kitchen economics agree.',
    nextUnlock: 'Momentum adds incentives, recurring discounts, and smarter offer shaping on top of the pricing base.',
    closingTitle: 'Make every order fit the business before it reaches the kitchen.',
    closingSummary:
      'Smart pricing gives restaurants the confidence to sell direct without opening the door to low-margin catering work.',
  },
  'smart-upsell': {
    key: 'smart-upsell',
    href: '/product/smart-upsell',
    metaTitle: 'Smart Upsell | TrayLoop',
    metaDescription:
      'Smart upsells increase catering order size with contextual extras, package upgrades, and merchandising that is ready for AI inside checkout.',
    eyebrow: 'Product · Bigger baskets',
    heroTitle: 'Upsells that feel useful to the customer and profitable to the merchant.',
    heroSummary:
      'TrayLoop places extras and package upgrades at the right moment in the checkout flow so average order value grows without turning the experience into clutter.',
    heroMetrics: [
      { label: 'Best tier', value: 'Momentum' },
      { label: 'Core result', value: 'Higher order value' },
      { label: 'Operator lift', value: 'Better upsell placement' },
    ],
    spotlight: {
      eyebrow: 'Upsell lane',
      title: 'The second page of checkout becomes a revenue moment.',
      summary:
        'The customer reviews the order, then sees extras that fit the event instead of a generic pile of extras.',
      chips: ['Suggested extras', 'Package upgrade', 'Placement ready for AI'],
      rail: [
        { label: 'Dessert tray', value: '+$85' },
        { label: 'Coffee service', value: '+$120' },
        { label: 'Premium upgrade', value: '+$5 per guest' },
      ],
    },
    leversEyebrow: 'Why it matters',
    leversTitle: 'The best upsells feel like part of the event plan.',
    leversSummary:
      'Smart upsell is not about adding noise. It is about putting the right higher-value option in front of the customer when intent is strongest.',
    levers: [
      {
        title: 'Lift the basket without adding friction',
        summary:
          'Relevant extras increase total spend while keeping the checkout flow short and clear.',
      },
      {
        title: 'Turn common extras into a repeatable system',
        summary:
          'Operators do not have to manually suggest beverages, desserts, or service upgrades on every order.',
      },
      {
        title: 'Prepare the stack for AI',
        summary:
          'Momentum introduces the placement. Engine later adds AI powered recommendations and more intelligent sequencing.',
      },
    ],
    workflowEyebrow: 'Inside the workflow',
    workflowTitle: 'Upsells sit in the review step where they make sense.',
    workflowSummary:
      'The same checkout page that handles recurring schedules and event details can also carry high converting extra prompts.',
    workflowSteps: [
      'Show package aware extras on the second page of checkout.',
      'Keep the order summary visible while customers decide.',
      'Use event context to make the upsell feel like planning help, not pressure.',
      'Push accepted extras into the merchant ticket and email automatically.',
    ],
    workflowPanelTitle: 'Upsell snapshot',
    workflowPanelRows: [
      { label: 'Primary suggestion', value: 'Dessert tray' },
      { label: 'Secondary suggestion', value: 'Coffee service' },
      { label: 'Package upgrade', value: 'Executive buffet' },
      { label: 'Placement', value: 'Checkout step 2' },
    ],
    workflowPanelNote: 'The order review step stays centered on conversion while upsells sit naturally beside the cart.',
    includedIn: 'Momentum',
    planReason: 'Momentum is where order growth starts to matter as much as simple order capture.',
    nextUnlock: 'Engine adds AI powered recommendations and more adaptive merchandising logic.',
    closingTitle: 'Use the checkout page to increase order size with intention.',
    closingSummary:
      'Smart upsells give merchants a clean way to grow basket size without asking the team to push extras by hand.',
  },
  'capacity-management': {
    key: 'capacity-management',
    href: '/product/capacity-management',
    metaTitle: 'Capacity Management | TrayLoop',
    metaDescription:
      'Capacity management for catering operators who need cleaner pacing, fewer fulfillment surprises, and stronger control over event load.',
    eyebrow: 'Product · Fulfillment control',
    heroTitle: 'Capacity management that keeps the kitchen in control while orders scale.',
    heroSummary:
      'TrayLoop helps merchants pace demand with lead times, service windows, and operational rules so the storefront sells confidently without overpromising the team.',
    heroMetrics: [
      { label: 'Best tier', value: 'Momentum' },
      { label: 'Core result', value: 'Cleaner fulfillment' },
      { label: 'Operator lift', value: 'Fewer overload days' },
    ],
    spotlight: {
      eyebrow: 'Service pacing',
      title: 'Capacity rules keep the busiest days from becoming the most chaotic.',
      summary:
        'The storefront surfaces clear availability while the merchant keeps control of event timing, service types, and load management.',
      chips: ['Service windows', 'Load pacing', 'Location rules'],
      rail: [
        { label: 'Pickup only', value: '72h lead time' },
        { label: 'Delivery', value: '10 guest minimum' },
        { label: 'Food truck', value: 'Restricted dates' },
      ],
    },
    leversEyebrow: 'Why it matters',
    leversTitle: 'Scale orders without breaking the operation.',
    leversSummary:
      'A stronger storefront is only valuable if the kitchen can actually fulfill what the page accepts.',
    levers: [
      {
        title: 'Protect the peak periods',
        summary:
          'Operators can shape service availability so the business does not accept high-risk work at the busiest times.',
      },
      {
        title: 'Match the promise to the team',
        summary:
          'Capacity management keeps the customer schedule and the kitchen reality aligned.',
      },
      {
        title: 'Create cleaner repeat demand',
        summary:
          'Recurring and reorder flows work better when operators trust the system to pace the load.',
      },
    ],
    workflowEyebrow: 'Inside the workflow',
    workflowTitle: 'Availability, lead time, and service mode all move together.',
    workflowSummary:
      'TrayLoop treats capacity as an operator control layer, not an afterthought bolted onto checkout.',
    workflowSteps: [
      'Shape service options by location and order type.',
      'Keep lead times visible at the top of the storefront experience.',
      'Use guardrails to filter out orders the team should not accept.',
      'Carry the same rules into order review and fulfillment planning.',
    ],
    workflowPanelTitle: 'Capacity controls',
    workflowPanelRows: [
      { label: 'Delivery lead time', value: '72h' },
      { label: 'Pickup lead time', value: '48h' },
      { label: 'Service mode', value: 'Pickup only today' },
      { label: 'Load note', value: 'High-volume event week' },
    ],
    workflowPanelNote: 'The storefront shows the right promise because the operator already set the safe boundaries.',
    includedIn: 'Momentum',
    planReason: 'Momentum is where repeat demand and larger events start stressing operations enough that capacity controls become strategic.',
    nextUnlock: 'Engine layers predictive signals and AI prioritization on top of the operational rules.',
    closingTitle: 'Scale the order flow without letting the kitchen absorb the risk.',
    closingSummary:
      'Capacity management gives restaurants a safer path to bigger catering volume and cleaner service execution.',
  },
  'revenue-dashboard': {
    key: 'revenue-dashboard',
    href: '/product/revenue-dashboard',
    metaTitle: 'Revenue Dashboard | TrayLoop',
    metaDescription:
      'Revenue dashboard and intelligence views for restaurants that want to see repeat rate, churn risk, order mix, and next actions in one place.',
    eyebrow: 'Product · Revenue intelligence',
    heroTitle: 'A revenue dashboard that shows what happened and what to do next.',
    heroSummary:
      'TrayLoop turns order history into operator-readable signals: repeat revenue, churn risk, upsell lift, and the next accounts worth acting on.',
    heroMetrics: [
      { label: 'Best tier', value: 'Engine' },
      { label: 'Core result', value: 'Better next actions' },
      { label: 'Operator lift', value: 'Deeper intelligence' },
    ],
    spotlight: {
      eyebrow: 'Revenue intelligence',
      title: 'Not just numbers. A read on the business and what to do about it.',
      summary:
        'The dashboard connects repeat customers, plan state, at risk accounts, and campaign outcomes so the operator sees the business clearly.',
      chips: ['Repeat mix', 'At risk accounts', 'AI next steps'],
      rail: [
        { label: 'Last 30 days', value: '$0' },
        { label: 'Repeat customers', value: '0' },
        { label: 'Customer health', value: 'No location data yet' },
      ],
    },
    leversEyebrow: 'Why it matters',
    leversTitle: 'Revenue dashboards become useful when they answer the next-action question.',
    leversSummary:
      'Engine turns reporting into a decision layer instead of a passive charting surface.',
    levers: [
      {
        title: 'See where revenue is really coming from',
        summary:
          'Operators can compare new versus repeat behavior, understand order mix, and spot concentration risk.',
      },
      {
        title: 'Catch churn before it lands',
        summary:
          'At risk signals give the team a chance to follow up before a valuable account disappears.',
      },
      {
        title: 'Connect analytics to action',
        summary:
          'The dashboard points back into campaigns, follow up, and pricing decisions instead of ending at a graph.',
      },
    ],
    workflowEyebrow: 'Inside the workflow',
    workflowTitle: 'The revenue view is built for operators, not analysts.',
    workflowSummary:
      'The team can read the trend, identify the account, and move directly into the next action without losing context.',
    workflowSteps: [
      'Track repeat rate, order mix, and average order value in one surface.',
      'See at risk and dormant customers as part of the revenue narrative.',
      'Use AI surfaces to translate the signal into a suggested next move.',
      'Keep the plan ladder visible so upgrade value stays obvious.',
    ],
    workflowPanelTitle: 'Revenue pulse',
    workflowPanelRows: [
      { label: 'Last 30 days', value: '$0' },
      { label: 'Upsell lift', value: 'No data yet' },
      { label: 'Top location', value: 'No location data' },
      { label: 'At risk accounts', value: 'Locked on Engine' },
    ],
    workflowPanelNote: 'Engine makes the revenue page useful by tying signals to follow up, campaigns, and customer health.',
    includedIn: 'Engine',
    planReason: 'Advanced revenue intelligence is the layer that turns the product from operational software into a growth engine.',
    nextUnlock: 'Growth Advisor can sit beside the dashboard when the team wants strategy on top of the data.',
    closingTitle: 'Use the revenue view to decide, not just to look.',
    closingSummary:
      'A strong revenue dashboard gives merchants the confidence to act on the right accounts, the right offers, and the right time.',
  },
  'direct-ordering': {
    key: 'direct-ordering',
    href: '/solutions/direct-ordering',
    metaTitle: 'Direct Ordering | TrayLoop',
    metaDescription:
      'Direct ordering gives restaurants a branded catering storefront so they own the customer, the data, and the margin.',
    eyebrow: 'Grow catering revenue',
    heroTitle: 'Direct ordering gives restaurants the revenue they are currently giving away.',
    heroSummary:
      'TrayLoop puts the storefront on your own brand, your own domain, and your own workflow so every catering customer starts in your channel instead of a marketplace.',
    heroMetrics: [
      { label: 'Best tier', value: 'Launch' },
      { label: 'Core result', value: 'Owned revenue' },
      { label: 'Operator lift', value: 'Direct customer data' },
    ],
    spotlight: {
      eyebrow: 'Owned channel',
      title: 'The ordering experience belongs to the restaurant, not the marketplace.',
      summary:
        'The customer sees your brand, your menu, your service rules, and your deposit terms while the business keeps the customer relationship.',
      chips: ['Branded storefront', 'Deposit collection', 'Customer ownership'],
      rail: [
        { label: 'Domain', value: 'order.trayloophq.com/merchant' },
        { label: 'Customer data', value: 'Owned' },
        { label: 'Commission', value: '$0' },
      ],
    },
    leversEyebrow: 'Why it matters',
    leversTitle: 'Direct ordering fixes the first leak in the revenue system.',
    leversSummary:
      'Before repeat revenue, AI, or follow up can matter, the restaurant has to own the transaction and the customer relationship.',
    levers: [
      {
        title: 'Keep the margin',
        summary:
          'Flat software pricing beats paying a large commission every time the customer reorders.',
      },
      {
        title: 'Keep the customer',
        summary:
          'Direct ordering means the restaurant owns the order history, contact details, and future follow up opportunity.',
      },
      {
        title: 'Build the next layer on top',
        summary:
          'Launch gives the business the direct channel; Momentum and Engine turn that channel into a repeat and retention machine.',
      },
    ],
    workflowEyebrow: 'Inside the workflow',
    workflowTitle: 'A better storefront gives the business a better starting point.',
    workflowSummary:
      'Direct ordering is not just a branded page. It is the first layer of the entire TrayLoop system.',
    workflowSteps: [
      'Publish a branded storefront with clear delivery, pickup, and deposit rules.',
      'Capture the order directly into the merchant workspace and email flow.',
      'Use the direct channel to seed reorders, recurring plans, and follow up.',
      'Upgrade into higher tiers without making the customer relearn the ordering flow.',
    ],
    workflowPanelTitle: 'Storefront snapshot',
    workflowPanelRows: [
      { label: 'Brand', value: 'Merchant owned' },
      { label: 'Deposit', value: 'Collected direct' },
      { label: 'Order channel', value: 'No marketplace' },
      { label: 'Customer record', value: 'Saved to workspace' },
    ],
    workflowPanelNote: 'The direct storefront is the first step in building a real catering revenue engine.',
    includedIn: 'Launch',
    planReason: 'Launch is built to get restaurants live with a direct ordering channel immediately.',
    nextUnlock: 'Momentum adds recurring, upsells, and repeat-revenue workflows on top of the storefront.',
    closingTitle: 'Own the order first. Then grow what happens after it.',
    closingSummary:
      'Direct ordering is the foundation of the whole TrayLoop story because it is where the restaurant starts owning the customer relationship.',
  },
  'automated-follow-up': {
    key: 'automated-follow-up',
    href: '/solutions/automated-follow-up',
    metaTitle: 'Automated Follow Up | TrayLoop',
    metaDescription:
      'Automated follow up helps restaurants keep catering customers warm after fulfillment, deposits, and completed events.',
    eyebrow: 'Grow catering revenue',
    heroTitle: 'Automated follow up keeps the relationship moving after the order is done.',
    heroSummary:
      'TrayLoop helps restaurants send the right reminder, reorder nudge, or event follow up at the right moment so completed catering jobs can turn into repeat demand.',
    heroMetrics: [
      { label: 'Best tier', value: 'Momentum' },
      { label: 'Core result', value: 'Warmer accounts' },
      { label: 'Operator lift', value: 'Less chasing by hand' },
    ],
    spotlight: {
      eyebrow: 'Follow up engine',
      title: 'The order closes, but the system keeps the account open.',
      summary:
        'Post order reminders, reorder prompts, and event follow up keep the next conversation from depending on memory or manual hustle.',
      chips: ['Deposit reminders', 'Reorder prompts', 'No-response visibility'],
      rail: [
        { label: 'Deposit reminder', value: 'Scheduled' },
        { label: 'Day before note', value: 'Ready' },
        { label: 'Post order nudge', value: 'Queued' },
      ],
    },
    leversEyebrow: 'Why it matters',
    leversTitle: 'Follow up is where catering relationships are either nurtured or lost.',
    leversSummary:
      'Restaurants often deliver a great order and then go silent. Automated follow up keeps momentum alive after the event.',
    levers: [
      {
        title: 'Protect the active order',
        summary:
          'Deposit reminders and event communications reduce risk before the catering order is fulfilled.',
      },
      {
        title: 'Create a repeat habit',
        summary:
          'Post order follow up gives happy customers a clean path back into the storefront before they forget the experience.',
      },
      {
        title: 'Prepare for full retention automation',
        summary:
          'Momentum introduces the cadence. Engine turns it into AI assisted reactivation and campaign logic.',
      },
    ],
    workflowEyebrow: 'Inside the workflow',
    workflowTitle: 'Follow up belongs in the order lifecycle, not in a manual side process.',
    workflowSummary:
      'TrayLoop lets the operator manage fulfillment and the next-touch program from the same system.',
    workflowSteps: [
      'Send reminders before the event when payment or confirmation matters.',
      'Follow up after completion with reorder or rebook prompts.',
      'Keep the order, the merchant dashboard, and the email flow in sync.',
      'Use the resulting data to decide who should move into recurring or reactivation.',
    ],
    workflowPanelTitle: 'Follow up cadence',
    workflowPanelRows: [
      { label: 'Deposit reminder', value: '24h before due' },
      { label: 'Event reminder', value: 'Day before service' },
      { label: 'Completion email', value: 'Sent after order closes' },
      { label: 'Reorder nudge', value: 'Timed to account pattern' },
    ],
    workflowPanelNote: 'Operators keep the next conversation alive without turning follow up into a manual task list.',
    includedIn: 'Momentum',
    planReason: 'Momentum is designed to help restaurants turn fulfilled orders into repeat revenue through better follow up.',
    nextUnlock: 'Engine adds AI-generated outreach, segmentation, and reactivation workflows.',
    closingTitle: 'Keep the account warm after the event, not just during it.',
    closingSummary:
      'Automated follow up helps merchants stop losing customers in the quiet period after a successful order.',
  },
  'ai-reengagement': {
    key: 'ai-reengagement',
    href: '/solutions/ai-reengagement',
    metaTitle: 'AI Reengagement | TrayLoop',
    metaDescription:
      'AI reengagement helps restaurants find dormant catering customers, generate outreach, and win back repeat revenue.',
    eyebrow: 'Grow catering revenue',
    heroTitle: 'AI reengagement brings dormant catering customers back into the loop.',
    heroSummary:
      'TrayLoop spots the accounts that used to order, estimates their recovery value, and gives the operator AI-generated outreach ready to send.',
    heroMetrics: [
      { label: 'Best tier', value: 'Engine' },
      { label: 'Core result', value: 'Recovered revenue' },
      { label: 'Operator lift', value: 'Sharper reactivation' },
    ],
    spotlight: {
      eyebrow: 'Retention moat',
      title: 'At risk and dormant customers stop being invisible.',
      summary:
        'Engine surfaces the right customers, recommends the angle, and turns reactivation into a repeatable motion.',
      chips: ['Dormant accounts', 'AI campaigns', 'Recovery value'],
      rail: [
        { label: 'Dormant window', value: '45+ days' },
        { label: 'Recovery value', value: '$1,840 / month' },
        { label: 'Recommended action', value: 'Re-engage now' },
      ],
    },
    leversEyebrow: 'Why it matters',
    leversTitle: 'Reactivation is one of the highest-leverage growth motions in catering.',
    leversSummary:
      'Winning back a past customer is often faster and cheaper than finding a new one. AI reengagement helps restaurants act before the account is fully gone.',
    levers: [
      {
        title: 'Find the right customers faster',
        summary:
          'The system ranks dormant and at risk accounts instead of forcing the team to guess who might be worth contacting.',
      },
      {
        title: 'Generate the first draft automatically',
        summary:
          'AI provides operator-ready email and campaign copy so the team can move from analysis to outreach immediately.',
      },
      {
        title: 'Turn retention into a real product edge',
        summary:
          'This is one of the clearest reasons Engine feels like the revenue engine of the future instead of just another dashboard.',
      },
    ],
    workflowEyebrow: 'Inside the workflow',
    workflowTitle: 'The system identifies the account, suggests the message, and points to the value.',
    workflowSummary:
      'AI reengagement connects customer intelligence, campaign generation, and revenue scoring in one surface.',
    workflowSteps: [
      'Rank dormant accounts by likely value and recency.',
      'Draft the reactivation message in the merchant workspace.',
      'Keep the campaign outcome tied to the customer and order history.',
      'Use the results to sharpen future follow up and retention logic.',
    ],
    workflowPanelTitle: 'Reactivation view',
    workflowPanelRows: [
      { label: 'Dormant accounts', value: '12' },
      { label: 'Likely recovery', value: '$1,840' },
      { label: 'Suggested timing', value: 'This week' },
      { label: 'Draft status', value: 'Operator ready' },
    ],
    workflowPanelNote: 'Engine ties customer health, AI outreach, and expected revenue into one retention surface.',
    includedIn: 'Engine',
    planReason: 'AI reengagement is a true Engine capability because it relies on AI, segmentation, and customer intelligence together.',
    nextUnlock: 'Growth Advisor can sit beside reengagement when the team wants more strategic guidance on which offers to push.',
    closingTitle: 'Use AI to bring back revenue that already knows your brand.',
    closingSummary:
      'AI reengagement gives restaurants a stronger retention moat by turning dormant customers into actionable growth targets.',
  },
  'smart-upsells': {
    key: 'smart-upsells',
    href: '/solutions/smart-upsells',
    metaTitle: 'Smart Upsells | TrayLoop',
    metaDescription:
      'Smart upsells help restaurants increase catering order size with cleaner upsell placement and stronger package merchandising.',
    eyebrow: 'Grow catering revenue',
    heroTitle: 'Smart upsells help every direct order do more work.',
    heroSummary:
      'TrayLoop uses better package placement, upsell sequencing, and checkout context to increase catering order value without making the customer fight the order flow.',
    heroMetrics: [
      { label: 'Best tier', value: 'Momentum' },
      { label: 'Core result', value: 'Bigger baskets' },
      { label: 'Operator lift', value: 'Smarter placement' },
    ],
    spotlight: {
      eyebrow: 'Order value',
      title: 'Upsells look like planning help, not a random extras dump.',
      summary:
        'Customers see the extras that fit the event while the merchant gets a cleaner path to higher average order value.',
      chips: ['Featured packages', 'Upsell logic', 'Checkout placement'],
      rail: [
        { label: 'Primary upsell', value: 'Dessert tray' },
        { label: 'Order size impact', value: '+$85' },
        { label: 'Placement', value: 'Menu + checkout' },
      ],
    },
    leversEyebrow: 'Why it matters',
    leversTitle: 'AOV growth is one of the easiest wins in direct catering.',
    leversSummary:
      'Restaurants do not always need more orders first. Sometimes they need stronger order size from the customers they already have.',
    levers: [
      {
        title: 'Increase spend inside the existing order',
        summary:
          'Well placed extras and package upgrades increase revenue without requiring new customer acquisition.',
      },
      {
        title: 'Merchandise like a stronger storefront',
        summary:
          'Better category ordering and featured items make the menu feel more intentional and premium.',
      },
      {
        title: 'Build toward AI powered personalization',
        summary:
          'Momentum starts the upsell system. Engine makes it more dynamic and behavior-aware.',
      },
    ],
    workflowEyebrow: 'Inside the workflow',
    workflowTitle: 'Upsells should show up in the moments where intent is highest.',
    workflowSummary:
      'TrayLoop uses menu presentation and checkout review to create two strong moments for order-value growth.',
    workflowSteps: [
      'Feature the strongest packages at the right point in the menu.',
      'Use checkout step 2 for final extra recommendations.',
      'Keep the order summary visible so the customer understands the tradeoff.',
      'Send the same extra detail into the merchant ticket for preparation.',
    ],
    workflowPanelTitle: 'Upsell sequence',
    workflowPanelRows: [
      { label: 'Menu feature', value: 'Executive lunch buffet' },
      { label: 'Checkout extra', value: 'Coffee service' },
      { label: 'Dessert prompt', value: 'Visible' },
      { label: 'Average lift', value: 'Per order value up' },
    ],
    workflowPanelNote: 'The upsell flow works best when the experience stays simple and the choices feel event-aware.',
    includedIn: 'Momentum',
    planReason: 'Momentum is where the product starts actively improving order value, not just capturing demand.',
    nextUnlock: 'Engine adds AI powered recommendation logic on top of the merchandising layer.',
    closingTitle: 'Use your direct ordering flow to increase order value, not just capture demand.',
    closingSummary:
      'Smart upsells are one of the fastest ways to make the storefront feel more profitable without making it feel heavier.',
  },
  'deposit-collection': {
    key: 'deposit-collection',
    href: '/solutions/deposit-collection',
    metaTitle: 'Deposit Collection | TrayLoop',
    metaDescription:
      'Deposit collection helps restaurants protect large catering orders with Stripe-backed payment requests and clearer confirmation workflows.',
    eyebrow: 'Grow catering revenue',
    heroTitle: 'Deposit collection protects the order before the kitchen commits the work.',
    heroSummary:
      'TrayLoop lets restaurants collect deposits directly in the storefront flow so higher-value catering jobs are more secure, more serious, and easier to confirm.',
    heroMetrics: [
      { label: 'Best tier', value: 'Launch' },
      { label: 'Core result', value: 'Lower cancellation risk' },
      { label: 'Operator lift', value: 'Safer confirmations' },
    ],
    spotlight: {
      eyebrow: 'Commitment layer',
      title: 'The order feels real because the deposit is part of the workflow.',
      summary:
        'Instead of handling commitment later, the business can require a deposit inside the direct ordering flow and track the result in the workspace.',
      chips: ['Stripe-backed', 'Order confirmation', 'Reminder-ready'],
      rail: [
        { label: 'Deposit rule', value: '25% required' },
        { label: 'Collection point', value: 'Checkout flow' },
        { label: 'Follow up', value: 'Reminder ready' },
      ],
    },
    leversEyebrow: 'Why it matters',
    leversTitle: 'Deposits do more than secure payment. They improve order quality.',
    leversSummary:
      'Restaurants can move faster on serious catering work when the order already carries commitment.',
    levers: [
      {
        title: 'Reduce cancellation risk',
        summary:
          'Deposits create a stronger confirmation threshold for large or high-effort catering events.',
      },
      {
        title: 'Give operators a clean review lane',
        summary:
          'Deposit state is visible in the dashboard so the team knows what needs attention and what is truly ready.',
      },
      {
        title: 'Support follow up and reminders later',
        summary:
          'Once deposit state is structured, the system can power reminder emails and operational follow up more cleanly.',
      },
    ],
    workflowEyebrow: 'Inside the workflow',
    workflowTitle: 'Deposit logic is built into the storefront, the order, and the merchant email flow.',
    workflowSummary:
      'TrayLoop keeps the deposit state visible from the moment the customer checks out through the operator’s preparation process.',
    workflowSteps: [
      'Require a deposit on the storefront based on the merchant rules.',
      'Collect the payment through the checkout flow instead of a manual invoice chase.',
      'Track deposit status in the merchant workspace and order board.',
      'Send reminders when the order needs attention before the event.',
    ],
    workflowPanelTitle: 'Deposit status',
    workflowPanelRows: [
      { label: 'Required', value: '25% at checkout' },
      { label: 'Collected', value: 'Yes' },
      { label: 'Workspace status', value: 'Confirmed' },
      { label: 'Reminder path', value: 'Available' },
    ],
    workflowPanelNote: 'Deposit collection creates a cleaner path from checkout to real operator confidence.',
    includedIn: 'Launch',
    planReason: 'Launch includes deposit collection because direct catering needs a serious commitment layer from day one.',
    nextUnlock: 'Momentum and Engine use the structured deposit state as part of richer follow up and growth workflows.',
    closingTitle: 'Protect the order before the kitchen starts absorbing the cost.',
    closingSummary:
      'Deposit collection helps merchants feel safer saying yes to valuable catering work while keeping the storefront flow professional for the customer.',
  },
};

export function getFeatureStory(key: FeatureStoryKey) {
  return featurePageStories[key];
}

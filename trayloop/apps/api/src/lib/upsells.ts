import { generateUpsellCopy, isOpenAIEnabled } from './openai.js';

export interface UpsellCandidateAddOn {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  upsellEligible?: boolean;
  upsellFeatured?: boolean;
  upsellPriority?: number;
}

export interface UpsellSelectedPackage {
  id: string;
  name: string;
}

export interface UpsellRecommendation {
  addOnId: string;
  name: string;
  headline: string;
  reason: string;
  recommendationType: string;
  suggestedQuantity: number;
  unitPrice: number;
  totalPrice: number;
  score: number;
}

interface BuildUpsellRecommendationsInput {
  merchantName: string;
  serviceType: 'delivery' | 'pickup' | 'full_service' | 'on_site' | 'food_truck';
  headcount: number;
  subtotalCents: number;
  selectedPackages: UpsellSelectedPackage[];
  selectedAddOnIds: string[];
  candidateAddOns: UpsellCandidateAddOn[];
}

const BEVERAGE_KEYWORDS = ['drink', 'beverage', 'coffee', 'tea', 'soda', 'juice', 'water'];
const DESSERT_KEYWORDS = ['dessert', 'cookie', 'brownie', 'cake', 'sweet', 'pastry'];
const SERVICE_KEYWORDS = ['setup', 'service', 'staff', 'attendant', 'chafing', 'utensils', 'plates', 'napkins'];
const PREMIUM_KEYWORDS = ['premium', 'platter', 'bundle', 'upgrade', 'chef', 'signature'];

function keywordMatch(addOn: UpsellCandidateAddOn, keywords: string[]) {
  const haystack = `${addOn.name} ${addOn.description ?? ''}`.toLowerCase();
  return keywords.some((keyword) => haystack.includes(keyword));
}

function fallbackHeadline(addOn: UpsellCandidateAddOn, type: string) {
  if (type === 'beverage') return `Add ${addOn.name} for the group`;
  if (type === 'dessert') return `Finish with ${addOn.name}`;
  if (type === 'service') return `Round this out with ${addOn.name}`;
  if (type === 'premium') return `Upgrade this order with ${addOn.name}`;
  return `Add ${addOn.name}`;
}

function fallbackReason(type: string, headcount: number, subtotalCents: number) {
  if (type === 'beverage') {
    return `Group orders for ${headcount} guests usually add drinks to keep service easy.`;
  }
  if (type === 'dessert') {
    return 'Dessert is an easy add-on when the main meal is already covered.';
  }
  if (type === 'service') {
    return 'This helps the order land cleanly on-site without extra back-and-forth.';
  }
  if (type === 'premium') {
    return subtotalCents >= 30000
      ? 'Larger catering orders often convert better with one premium finishing add-on.'
      : 'This pairs well with the current package mix.';
  }
  return 'A simple way to round out the order before checkout.';
}

function pickSuggestedQuantity(type: string, headcount: number) {
  if (type === 'beverage') return Math.max(1, Math.ceil(headcount / 10));
  if (type === 'dessert') return Math.max(1, Math.ceil(headcount / 12));
  if (type === 'service') return Math.max(1, Math.ceil(headcount / 50));
  return 1;
}

function baseScore(addOn: UpsellCandidateAddOn) {
  return (addOn.upsellPriority ?? 0) * 10 + (addOn.upsellFeatured ? 15 : 0);
}

function buildRuleRecommendation(
  addOn: UpsellCandidateAddOn,
  recommendationType: string,
  headcount: number,
  subtotalCents: number,
  bonusScore: number,
): UpsellRecommendation {
  const suggestedQuantity = pickSuggestedQuantity(recommendationType, headcount);

  return {
    addOnId: addOn.id,
    name: addOn.name,
    headline: fallbackHeadline(addOn, recommendationType),
    reason: fallbackReason(recommendationType, headcount, subtotalCents),
    recommendationType,
    suggestedQuantity,
    unitPrice: addOn.price,
    totalPrice: addOn.price * suggestedQuantity,
    score: baseScore(addOn) + bonusScore,
  };
}

function chooseBest(
  addOns: UpsellCandidateAddOn[],
  selectedIds: Set<string>,
  usedIds: Set<string>,
  predicate: (addOn: UpsellCandidateAddOn) => boolean,
): UpsellCandidateAddOn | null {
  const matches = addOns
    .filter((addOn) => !selectedIds.has(addOn.id) && !usedIds.has(addOn.id))
    .filter((addOn) => (addOn.upsellEligible ?? true))
    .filter(predicate)
    .sort((left, right) => {
      const rightScore = baseScore(right);
      const leftScore = baseScore(left);
      if (rightScore !== leftScore) return rightScore - leftScore;
      return left.price - right.price;
    });

  return matches[0] ?? null;
}

async function applyAiCopy(
  merchantName: string,
  serviceType: BuildUpsellRecommendationsInput['serviceType'],
  headcount: number,
  subtotalCents: number,
  selectedPackages: UpsellSelectedPackage[],
  recommendations: UpsellRecommendation[],
): Promise<UpsellRecommendation[]> {
  if (!isOpenAIEnabled() || recommendations.length === 0) {
    return recommendations;
  }

  const next = [...recommendations];
  const recommendation = next[0];

  try {
    const generated = await generateUpsellCopy({
      merchantName,
      addOnName: recommendation.name,
      recommendationType: recommendation.recommendationType,
      headcount,
      serviceType,
      suggestedQuantity: recommendation.suggestedQuantity,
      unitPriceCents: recommendation.unitPrice,
      orderSubtotalCents: subtotalCents,
      selectedPackageNames: selectedPackages.map((pkg) => pkg.name),
    });

    next[0] = {
      ...recommendation,
      headline: generated.headline || recommendation.headline,
      reason: generated.reason || recommendation.reason,
    };
  } catch {
    // Keep safe rule-based copy if AI enhancement fails.
  }

  return next;
}

export async function buildUpsellRecommendations(
  input: BuildUpsellRecommendationsInput,
): Promise<UpsellRecommendation[]> {
  const selectedIds = new Set(input.selectedAddOnIds);
  const usedIds = new Set<string>();
  const recommendations: UpsellRecommendation[] = [];
  const addOns = input.candidateAddOns;

  if (input.headcount >= 15) {
    const beverage = chooseBest(addOns, selectedIds, usedIds, (addOn) => keywordMatch(addOn, BEVERAGE_KEYWORDS));
    if (beverage) {
      recommendations.push(buildRuleRecommendation(beverage, 'beverage', input.headcount, input.subtotalCents, 90));
      usedIds.add(beverage.id);
    }
  }

  const dessert = chooseBest(addOns, selectedIds, usedIds, (addOn) => keywordMatch(addOn, DESSERT_KEYWORDS));
  if (dessert) {
    recommendations.push(buildRuleRecommendation(dessert, 'dessert', input.headcount, input.subtotalCents, 80));
    usedIds.add(dessert.id);
  }

  if (['delivery', 'full_service', 'on_site', 'food_truck'].includes(input.serviceType)) {
    const service = chooseBest(addOns, selectedIds, usedIds, (addOn) => keywordMatch(addOn, SERVICE_KEYWORDS));
    if (service) {
      recommendations.push(buildRuleRecommendation(service, 'service', input.headcount, input.subtotalCents, 70));
      usedIds.add(service.id);
    }
  }

  if (input.subtotalCents >= 30000) {
    const premium = chooseBest(addOns, selectedIds, usedIds, (addOn) => keywordMatch(addOn, PREMIUM_KEYWORDS));
    if (premium) {
      recommendations.push(buildRuleRecommendation(premium, 'premium', input.headcount, input.subtotalCents, 60));
      usedIds.add(premium.id);
    }
  }

  if (recommendations.length < 3) {
    const fallbackPool = addOns
      .filter((addOn) => !selectedIds.has(addOn.id) && !usedIds.has(addOn.id))
      .filter((addOn) => (addOn.upsellEligible ?? true))
      .sort((left, right) => {
        const rightScore = baseScore(right);
        const leftScore = baseScore(left);
        if (rightScore !== leftScore) return rightScore - leftScore;
        return left.price - right.price;
      });

    for (const addOn of fallbackPool) {
      recommendations.push(buildRuleRecommendation(addOn, 'featured', input.headcount, input.subtotalCents, 40));
      usedIds.add(addOn.id);
      if (recommendations.length >= 3) {
        break;
      }
    }
  }

  const sorted = recommendations
    .sort((left, right) => right.score - left.score)
    .slice(0, 3);

  return applyAiCopy(
    input.merchantName,
    input.serviceType,
    input.headcount,
    input.subtotalCents,
    input.selectedPackages,
    sorted,
  );
}

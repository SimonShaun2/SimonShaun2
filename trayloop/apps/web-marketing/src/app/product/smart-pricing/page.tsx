import FeatureStoryPage from '@/components/feature-story-page';
import { getFeatureStory } from '@/lib/feature-page-stories';

const story = getFeatureStory('smart-pricing');

export const metadata = {
  title: story.metaTitle,
  description: story.metaDescription,
};

export default function SmartPricingPage() {
  return <FeatureStoryPage story={story} />;
}

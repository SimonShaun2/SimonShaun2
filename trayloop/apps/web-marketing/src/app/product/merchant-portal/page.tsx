import FeatureStoryPage from '@/components/feature-story-page';
import { getFeatureStory } from '@/lib/feature-page-stories';

const story = getFeatureStory('merchant-portal');

export const metadata = {
  title: story.metaTitle,
  description: story.metaDescription,
};

export default function MerchantPortalPage() {
  return <FeatureStoryPage story={story} />;
}

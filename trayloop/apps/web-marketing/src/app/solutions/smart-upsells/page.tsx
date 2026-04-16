import FeatureStoryPage from '@/components/feature-story-page';
import { getFeatureStory } from '@/lib/feature-page-stories';

const story = getFeatureStory('smart-upsells');

export const metadata = {
  title: story.metaTitle,
  description: story.metaDescription,
};

export default function SmartUpsellsPage() {
  return <FeatureStoryPage story={story} />;
}

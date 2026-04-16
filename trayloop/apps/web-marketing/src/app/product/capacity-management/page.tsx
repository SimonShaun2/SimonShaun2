import FeatureStoryPage from '@/components/feature-story-page';
import { getFeatureStory } from '@/lib/feature-page-stories';

const story = getFeatureStory('capacity-management');

export const metadata = {
  title: story.metaTitle,
  description: story.metaDescription,
};

export default function CapacityManagementPage() {
  return <FeatureStoryPage story={story} />;
}

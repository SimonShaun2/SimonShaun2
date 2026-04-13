import FeatureStoryPage from '@/components/feature-story-page';
import { getFeatureStory } from '@/lib/feature-page-stories';

const story = getFeatureStory('revenue-dashboard');

export const metadata = {
  title: story.metaTitle,
  description: story.metaDescription,
};

export default function RevenueDashboardPage() {
  return <FeatureStoryPage story={story} />;
}

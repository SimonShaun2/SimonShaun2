import FeatureStoryPage from '@/components/feature-story-page';
import { getFeatureStory } from '@/lib/feature-page-stories';

const story = getFeatureStory('recurring-orders');

export const metadata = {
  title: story.metaTitle,
  description: story.metaDescription,
};

export default function RecurringOrdersPage() {
  return <FeatureStoryPage story={story} />;
}

import FeatureStoryPage from '@/components/feature-story-page';
import { getFeatureStory } from '@/lib/feature-page-stories';

const story = getFeatureStory('direct-ordering');

export const metadata = {
  title: story.metaTitle,
  description: story.metaDescription,
};

export default function DirectOrderingPage() {
  return <FeatureStoryPage story={story} />;
}

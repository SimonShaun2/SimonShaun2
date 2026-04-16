import FeatureStoryPage from '@/components/feature-story-page';
import { getFeatureStory } from '@/lib/feature-page-stories';

const story = getFeatureStory('ai-reengagement');

export const metadata = {
  title: story.metaTitle,
  description: story.metaDescription,
};

export default function AiReengagementPage() {
  return <FeatureStoryPage story={story} />;
}

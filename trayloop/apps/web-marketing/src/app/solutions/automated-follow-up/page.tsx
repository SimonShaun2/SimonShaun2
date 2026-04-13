import FeatureStoryPage from '@/components/feature-story-page';
import { getFeatureStory } from '@/lib/feature-page-stories';

const story = getFeatureStory('automated-follow-up');

export const metadata = {
  title: story.metaTitle,
  description: story.metaDescription,
};

export default function AutomatedFollowUpPage() {
  return <FeatureStoryPage story={story} />;
}

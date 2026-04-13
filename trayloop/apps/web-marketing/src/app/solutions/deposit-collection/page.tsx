import FeatureStoryPage from '@/components/feature-story-page';
import { getFeatureStory } from '@/lib/feature-page-stories';

const story = getFeatureStory('deposit-collection');

export const metadata = {
  title: story.metaTitle,
  description: story.metaDescription,
};

export default function DepositCollectionPage() {
  return <FeatureStoryPage story={story} />;
}

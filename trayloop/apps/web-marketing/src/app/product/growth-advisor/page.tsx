import type { Metadata } from 'next';
import FeatureStoryPage from '@/components/feature-story-page';
import { getFeatureStory } from '@/lib/feature-page-stories';

const story = getFeatureStory('growth-advisor');

export const metadata: Metadata = {
  title: story.metaTitle,
  description: story.metaDescription,
};

export default function GrowthAdvisorPage() {
  return <FeatureStoryPage story={story} />;
}

import type { CSSProperties } from 'react';
import type { Article } from '@/lib/sanity-types';
import { client } from '@/lib/sanity';
import PillButton from '@/components/pill-button';
import Link from 'next/link';

/* ── Design tokens ── */
const color = {
  cream: '#F9F5EF',
  creamDark: '#F0EBE1',
  ink: '#1A1612',
  orange: '#E85618',
  teal: '#42D9A0',
  muted: '#7B6F65',
  white: '#FEFCFA',
};

/* ── Placeholder content ── */
const placeholderArticles: Record<string, Article & { bodyText: string[] }> = {
  'marketplace-costs': {
    title: 'How Much Are Marketplaces Really Costing Your Restaurant?',
    slug: 'marketplace-costs',
    excerpt:
      'Most restaurants assume marketplace commissions are just the cost of doing business. But when you add up the 15-30% fees on every order, the math tells a very different story.',
    author: { name: 'Sarah Chen' },
    categories: [{ title: 'Revenue Growth', slug: 'revenue-growth' }],
    publishedAt: '2026-03-28',
    readTime: 7,
    coverImageUrl:
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=600&fit=crop',
    bodyText: [
      'If you run a restaurant with a catering program, chances are you rely on at least one third-party marketplace to bring in orders. Platforms like ezCater, CaterCow, or even Uber Eats for Business promise exposure and convenience. And they deliver on that promise -- to a point.',
      'The problem is what they take in return. Most marketplaces charge between 15% and 30% commission on every order. On a $500 catering order, that means $75 to $150 goes straight to the platform. Multiply that across 20 orders a month and you are looking at $1,500 to $3,000 in commissions -- every single month.',
      'Let us put that in perspective. Over a year, a restaurant doing $10,000/month in catering through marketplaces could be paying $18,000 to $36,000 in commissions. That is enough to hire a part-time catering coordinator, invest in better packaging, or simply take home as profit.',
      'But commissions are only part of the story. When customers order through a marketplace, the marketplace owns that customer relationship. You do not get their email address. You cannot send them a follow-up offer. You cannot build the kind of direct relationship that turns a one-time order into a recurring weekly account.',
      'We analyzed data from 200+ restaurants and found that those who transitioned even 50% of their catering volume to direct ordering saw an average increase of $14,400 in annual profit. Not revenue -- profit. Because when you remove the middleman, every dollar of that commission drops straight to your bottom line.',
      'The shift does not happen overnight, and marketplaces still have a role to play for discovery. But the restaurants that are winning at catering have a clear strategy: use marketplaces to get found, then move customers to direct ordering for repeat business.',
      'Ready to see what your restaurant could save? Try our free savings calculator to get a personalized breakdown based on your actual order volume.',
    ],
  },
  'repeat-catering-orders': {
    title: '5 Ways to Increase Repeat Catering Orders',
    slug: 'repeat-catering-orders',
    excerpt:
      'Acquiring a new catering customer costs 5x more than keeping an existing one. Here are five proven strategies that top-performing restaurants use to turn one-time orders into recurring weekly revenue.',
    author: { name: 'Marcus Rivera' },
    categories: [
      { title: 'Follow-Up & Retention', slug: 'follow-up-retention' },
    ],
    publishedAt: '2026-03-21',
    readTime: 5,
    coverImageUrl:
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=600&fit=crop',
    bodyText: [
      'Every restaurant owner knows that repeat customers are the lifeblood of the business. In catering, this is even more true. A single corporate client who orders lunch every Tuesday is worth more than a dozen one-off party orders.',
      'Yet most restaurants treat every catering order as a transaction rather than the beginning of a relationship. Here are five strategies to change that.',
      'First, follow up within 24 hours. A simple email or call asking how the food was received goes a long way. It shows you care, catches problems before they become bad reviews, and opens the door for the next order.',
      'Second, offer a recurring order discount. Give clients who commit to weekly or bi-weekly orders a 5-10% discount. The predictability of recurring orders is worth far more than the margin you give up.',
      'Third, remember their preferences. Keep detailed notes on each client -- their favorite items, dietary restrictions, delivery instructions, even the name of the office manager who places the orders. Personal touches create loyalty.',
      'Fourth, make reordering effortless. If a client has to call, email, or fill out a long form every time they want to reorder, friction will eventually win. A simple online portal where they can repeat a previous order in two clicks is a game-changer.',
      'Fifth, send proactive suggestions. If you know a client orders every Tuesday, send them a message on Friday with next week is special menu or a seasonal addition. Stay top of mind without being pushy.',
    ],
  },
  'catering-side-operation-cost': {
    title: 'The True Cost of Running Catering as a Side Operation',
    slug: 'catering-side-operation-cost',
    excerpt:
      'When catering orders come through piecemeal -- a call here, an email there -- mistakes multiply and margins shrink.',
    author: { name: 'Sarah Chen' },
    categories: [{ title: 'Operations', slug: 'operations' }],
    publishedAt: '2026-03-14',
    readTime: 6,
    coverImageUrl:
      'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&h=600&fit=crop',
    bodyText: [
      'For many restaurants, catering starts as an afterthought. A regular customer asks if you can do a lunch spread for their office, and before you know it, you are juggling catering orders on top of your regular service.',
      'The problem is that "side operation" catering has hidden costs that most restaurants never properly account for. Phone tag with clients, handwritten order forms, manual invoicing, and last-minute changes that throw off prep -- these friction points add up.',
      'We surveyed 150 restaurant operators and found that the average catering manager spends 8 hours per week on tasks that could be automated: order entry, confirmation emails, payment follow-ups, and delivery logistics.',
      'At $25/hour (a conservative fully-loaded cost), that is $10,400 per year in labor just to manage the administrative side of catering. And that does not include the cost of errors -- wrong items, missed dietary requirements, or delivery mixups that lead to refunds and lost customers.',
      'Restaurants that centralize their catering operations with a dedicated ordering system see error rates drop by up to 60% and time spent on admin cut in half. The ROI is not just in time saved -- it is in customers retained and orders that grow because the experience is seamless.',
      'The takeaway: if your catering revenue has grown beyond $5,000/month, treating it as a side operation is costing you more than you think. It is time to give it the infrastructure it deserves.',
    ],
  },
  'smart-pricing-strategies': {
    title: 'Smart Pricing Strategies for Corporate Catering',
    slug: 'smart-pricing-strategies',
    excerpt:
      'Are you leaving money on the table with flat per-head pricing? Discover how tiered pricing, minimum order values, and delivery premiums can boost your average ticket.',
    author: { name: 'James Park' },
    categories: [{ title: 'Pricing Strategy', slug: 'pricing-strategy' }],
    publishedAt: '2026-03-07',
    readTime: 8,
    coverImageUrl:
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=600&fit=crop',
    bodyText: [
      'Pricing catering is fundamentally different from pricing your dine-in menu, yet many restaurants simply take their regular menu prices and add a small markup. This approach leaves significant revenue on the table.',
      'The most successful catering operations use a layered pricing strategy that accounts for the unique economics of large-format food preparation and delivery.',
      'Start with tiered per-person pricing. Instead of one flat rate, offer Good/Better/Best packages. A basic lunch might be $14/person, a premium spread $22/person, and an executive package $35/person. Most clients will choose the middle option, and having a premium tier makes the middle feel like a smart choice.',
      'Set strategic minimums. A $150 minimum order value ensures that small orders still cover your fixed costs of packaging, delivery, and setup. Do not be afraid of this -- corporate clients expect minimums and it signals professionalism.',
      'Add delivery and setup fees, then offer to waive them above certain thresholds. "Free delivery on orders over $300" is not a discount -- it is an incentive that increases average order value while making the customer feel like they are getting a deal.',
      'Consider day-of-week pricing. If Tuesdays and Thursdays are your busiest catering days, keep standard pricing. Offer a 5-10% incentive for Monday, Wednesday, or Friday orders to smooth out your production schedule.',
      'Finally, review your pricing quarterly. Food costs change, and your pricing should reflect that. The restaurants that update pricing regularly maintain healthier margins than those who set it and forget it.',
    ],
  },
  'direct-ordering-savings': {
    title: 'How Direct Ordering Saves Restaurants $12K+ Per Year',
    slug: 'direct-ordering-savings',
    excerpt:
      'We analyzed order data from 200+ restaurants that switched from marketplace-only to direct ordering. The average savings? Over $12,000 per year.',
    author: { name: 'Marcus Rivera' },
    categories: [{ title: 'Direct Ordering', slug: 'direct-ordering' }],
    publishedAt: '2026-02-28',
    readTime: 6,
    coverImageUrl:
      'https://images.unsplash.com/photo-1553729459-afe8f2e2d3b5?w=1200&h=600&fit=crop',
    bodyText: [
      'When we talk to restaurant owners about direct ordering, the first question is always the same: "How much will I actually save?" So we did the research.',
      'We analyzed 12 months of order data from 200+ restaurants that transitioned at least a portion of their catering orders from marketplace platforms to direct ordering through their own branded storefront.',
      'The headline number: the average restaurant saved $12,400 per year. But the distribution is what is really interesting. The bottom quartile saved around $4,000 -- still meaningful for a small operation. The top quartile? Over $30,000.',
      'The savings come from three sources. The biggest is commission elimination, which accounted for about 70% of total savings. When a $500 order comes through your own storefront instead of a marketplace, you keep that $75-$150 in commissions.',
      'The second source, about 20% of savings, comes from higher average order values. When customers order directly, they spend more. Our data shows a 15% higher AOV on direct orders versus marketplace orders. We believe this is because direct ordering allows for better upselling, custom packages, and the kind of personal service that makes clients comfortable spending more.',
      'The remaining 10% comes from operational efficiency. Direct orders have fewer errors, fewer disputes, and faster payment cycles. That translates to less time spent on customer service and less revenue lost to refunds.',
      'The transition does not have to be all-or-nothing. The most successful restaurants keep their marketplace listings for discovery but actively migrate repeat customers to their direct ordering storefront. Over 6-12 months, the shift compounds.',
    ],
  },
  'revenue-dashboard-guide': {
    title: 'Building a Revenue Dashboard That Tells You What to Do',
    slug: 'revenue-dashboard-guide',
    excerpt:
      'Data without action is just noise. Learn how to set up a catering revenue dashboard that surfaces the three metrics that actually matter.',
    author: { name: 'Sarah Chen' },
    categories: [{ title: 'Revenue Growth', slug: 'revenue-growth' }],
    publishedAt: '2026-02-21',
    readTime: 9,
    coverImageUrl:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop',
    bodyText: [
      'Most restaurant owners we talk to have some sense of their catering numbers. They know roughly how much revenue comes in each month. But "roughly" is not a strategy.',
      'A good revenue dashboard does not just show you numbers -- it tells you what to do. After working with hundreds of restaurants, we have narrowed it down to three metrics that drive the most actionable decisions.',
      'Metric one: Repeat Order Rate. What percentage of your catering customers order more than once in a 90-day window? If this number is below 30%, your biggest opportunity is not acquiring new customers -- it is retaining existing ones. Focus on follow-up workflows and reorder incentives.',
      'Metric two: Direct Order Percentage. Of your total catering revenue, what percentage comes through your own ordering channel versus marketplaces? If it is below 40%, you are paying too much in commissions. Prioritize migrating marketplace customers to direct ordering.',
      'Metric three: Average Order Value trend. Is your AOV going up, down, or flat month over month? A declining AOV often signals pricing issues or a shift in customer mix. Rising AOV means your upselling and packaging strategies are working.',
      'The power is not in any single metric but in how they connect. A restaurant with a high repeat rate but low direct percentage knows exactly what to focus on: take those loyal customers and move them to a direct channel. A restaurant with high AOV but low repeat rate needs to invest in follow-up.',
      'Set a weekly rhythm. Every Monday, spend 10 minutes reviewing these three numbers. Ask yourself: "Based on what I see, what is the one thing I should change this week?" That single practice is worth more than any fancy analytics platform.',
    ],
  },
};

const relatedSlugs: Record<string, string[]> = {
  'marketplace-costs': ['direct-ordering-savings', 'revenue-dashboard-guide'],
  'repeat-catering-orders': ['marketplace-costs', 'smart-pricing-strategies'],
  'catering-side-operation-cost': [
    'repeat-catering-orders',
    'revenue-dashboard-guide',
  ],
  'smart-pricing-strategies': [
    'marketplace-costs',
    'direct-ordering-savings',
  ],
  'direct-ordering-savings': [
    'marketplace-costs',
    'revenue-dashboard-guide',
  ],
  'revenue-dashboard-guide': [
    'direct-ordering-savings',
    'repeat-catering-orders',
  ],
};

async function getArticle(
  slug: string,
): Promise<(Article & { bodyText?: string[] }) | null> {
  if (!client) {
    return placeholderArticles[slug] || null;
  }
  try {
    const query = `*[_type == "article" && slug.current == $slug][0]{
      title,
      "slug": slug.current,
      excerpt,
      body,
      "coverImage": coverImage.asset->url,
      "author": author->{ name, "image": image.asset->url },
      "categories": categories[]->{ title, "slug": slug.current },
      publishedAt,
      readTime
    }`;
    return await client.fetch(query, { slug });
  } catch {
    return placeholderArticles[slug] || null;
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function Section({
  children,
  bg = 'transparent',
  style,
}: {
  children: React.ReactNode;
  bg?: string;
  style?: CSSProperties;
}) {
  return (
    <section style={{ backgroundColor: bg, padding: '80px 24px', ...style }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>{children}</div>
    </section>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) {
    return { title: 'Article Not Found | TrayLoop' };
  }
  return {
    title: `${article.title} | TrayLoop Blog`,
    description: article.excerpt,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return (
      <Section bg={color.cream}>
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: color.ink, marginBottom: 16 }}>
            Article not found
          </h1>
          <p style={{ color: color.muted, marginBottom: 24 }}>
            The article you are looking for does not exist.
          </p>
          <PillButton text="Back to Blog" href="/blog" variant="primary" />
        </div>
      </Section>
    );
  }

  const imageUrl = article.coverImageUrl || article.coverImage;
  const category = article.categories?.[0];
  const related = (relatedSlugs[slug] || [])
    .map((s) => placeholderArticles[s])
    .filter(Boolean);

  return (
    <>
      <Section bg={color.cream} style={{ paddingBottom: 0 }}>
        {/* Back link */}
        <Link
          href="/blog"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 14,
            fontWeight: 500,
            color: color.muted,
            marginBottom: 32,
            textDecoration: 'none',
          }}
        >
          &larr; Back to Blog
        </Link>

        {/* Category */}
        {category && (
          <span
            style={{
              display: 'inline-block',
              padding: '5px 14px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              backgroundColor: color.orange + '15',
              color: color.orange,
              marginBottom: 20,
            }}
          >
            {category.title}
          </span>
        )}

        {/* Title */}
        <h1
          style={{
            fontSize: 42,
            fontWeight: 800,
            lineHeight: 1.15,
            color: color.ink,
            maxWidth: 720,
            marginBottom: 20,
          }}
        >
          {article.title}
        </h1>

        {/* Author + date */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontSize: 15,
            color: color.muted,
            marginBottom: 40,
          }}
        >
          <span style={{ fontWeight: 600, color: color.ink }}>
            {article.author.name}
          </span>
          <span style={{ opacity: 0.4 }}>|</span>
          <span>{formatDate(article.publishedAt)}</span>
          <span style={{ opacity: 0.4 }}>|</span>
          <span>{article.readTime} min read</span>
        </div>

        {/* Cover image */}
        {imageUrl && (
          <div
            style={{
              width: '100%',
              height: 460,
              borderRadius: 16,
              background: `url(${imageUrl}) center/cover no-repeat`,
              marginBottom: 0,
            }}
          />
        )}
      </Section>

      {/* Article body */}
      <Section bg={color.cream} style={{ paddingTop: 48 }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          {article.bodyText ? (
            article.bodyText.map((paragraph, i) => (
              <p
                key={i}
                style={{
                  fontSize: 17,
                  lineHeight: 1.8,
                  color: color.ink,
                  marginBottom: 24,
                }}
              >
                {paragraph}
              </p>
            ))
          ) : article.body ? (
            /* Render Sanity portable text as simple paragraphs for now */
            article.body.map((block: any, i: number) => (
              <p
                key={i}
                style={{
                  fontSize: 17,
                  lineHeight: 1.8,
                  color: color.ink,
                  marginBottom: 24,
                }}
              >
                {block.children
                  ?.map((child: any) => child.text)
                  .join('') || ''}
              </p>
            ))
          ) : (
            <p
              style={{
                fontSize: 17,
                lineHeight: 1.8,
                color: color.ink,
              }}
            >
              {article.excerpt}
            </p>
          )}
        </div>
      </Section>

      {/* CTA */}
      <Section bg={color.ink}>
        <div style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: color.white,
              marginBottom: 12,
            }}
          >
            Start growing your catering revenue
          </h2>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.6,
              color: color.muted,
              marginBottom: 32,
            }}
          >
            See how much your restaurant could save by switching to direct
            catering orders. No commitment, no credit card required.
          </p>
          <div
            style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <PillButton
              text="See Your Savings"
              href="/pricing"
              variant="primary"
            />
            <PillButton
              text="Book a Demo"
              href="/signup"
              variant="ghost"
            />
          </div>
        </div>
      </Section>

      {/* Related articles */}
      {related.length > 0 && (
        <Section bg={color.cream}>
          <h2
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: color.ink,
              marginBottom: 32,
            }}
          >
            Related articles
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 28,
            }}
            className="responsive-grid"
          >
            {related.map((rel) => (
              <Link
                key={rel.slug}
                href={`/blog/${rel.slug}`}
                style={{
                  display: 'flex',
                  gap: 20,
                  backgroundColor: color.white,
                  borderRadius: 12,
                  overflow: 'hidden',
                  textDecoration: 'none',
                  color: 'inherit',
                  padding: 20,
                }}
              >
                <div
                  style={{
                    width: 120,
                    minHeight: 100,
                    borderRadius: 8,
                    flexShrink: 0,
                    background: `url(${rel.coverImageUrl}) center/cover no-repeat`,
                  }}
                />
                <div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: color.orange,
                    }}
                  >
                    {rel.categories[0]?.title}
                  </span>
                  <h3
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      lineHeight: 1.35,
                      color: color.ink,
                      marginTop: 4,
                      marginBottom: 6,
                    }}
                  >
                    {rel.title}
                  </h3>
                  <span
                    style={{
                      fontSize: 13,
                      color: color.muted,
                    }}
                  >
                    {rel.readTime} min read
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}

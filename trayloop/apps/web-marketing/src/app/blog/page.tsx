import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'TrayLoop Blog - Restaurant Catering Tips and Industry Insights',
    description: 'Expert guides on growing restaurant catering revenue, building direct ordering channels, reducing commissions, and using AI to retain catering accounts.',
    alternates: {
          canonical: 'https://trayloophq.com/blog',
    },
    openGraph: {
          title: 'TrayLoop Blog - Restaurant Catering Tips and Industry Insights',
          description: 'Expert guides on growing restaurant catering revenue, building direct ordering channels, and using AI to retain catering accounts.',
          url: 'https://trayloophq.com/blog',
          siteName: 'TrayLoop',
          type: 'website',
    },
    twitter: {
          card: 'summary_large_image',
          title: 'TrayLoop Blog - Restaurant Catering Tips and Industry Insights',
          description: 'Expert guides on growing restaurant catering revenue and using AI to retain catering accounts.',
    },
};

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

/* ── Placeholder data ── */
const placeholderArticles: Article[] = [
  {
    title: 'How Much Are Marketplaces Really Costing Your Restaurant?',
    slug: 'marketplace-costs',
    excerpt:
      'Most restaurants assume marketplace commissions are just the cost of doing business. But when you add up the 15-30% fees on every order, the math tells a very different story. We break down the real numbers and show you what you could be saving.',
    author: { name: 'Sarah Chen' },
    categories: [{ title: 'Revenue Growth', slug: 'revenue-growth' }],
    publishedAt: '2026-03-28',
    readTime: 7,
    coverImageUrl:
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=500&fit=crop',
  },
  {
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
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=500&fit=crop',
  },
  {
    title: 'The True Cost of Running Catering as a Side Operation',
    slug: 'catering-side-operation-cost',
    excerpt:
      'When catering orders come through piecemeal -- a call here, an email there -- mistakes multiply and margins shrink. Learn how centralizing your catering workflow can reclaim hours each week and reduce errors by up to 60%.',
    author: { name: 'Sarah Chen' },
    categories: [{ title: 'Operations', slug: 'operations' }],
    publishedAt: '2026-03-14',
    readTime: 6,
    coverImageUrl:
      'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=500&fit=crop',
  },
  {
    title: 'Smart Pricing Strategies for Corporate Catering',
    slug: 'smart-pricing-strategies',
    excerpt:
      'Are you leaving money on the table with flat per-head pricing? Discover how tiered pricing, minimum order values, and delivery premiums can boost your average catering ticket by 20% or more without losing customers.',
    author: { name: 'James Park' },
    categories: [{ title: 'Pricing Strategy', slug: 'pricing-strategy' }],
    publishedAt: '2026-03-07',
    readTime: 8,
    coverImageUrl:
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=500&fit=crop',
  },
  {
    title: 'How Direct Ordering Saves Restaurants $12K+ Per Year',
    slug: 'direct-ordering-savings',
    excerpt:
      'We analyzed order data from 200+ restaurants that switched from marketplace-only to direct ordering. The average savings? Over $12,000 per year -- and the top performers saved more than $30K. Here is how they did it.',
    author: { name: 'Marcus Rivera' },
    categories: [{ title: 'Direct Ordering', slug: 'direct-ordering' }],
    publishedAt: '2026-02-28',
    readTime: 6,
    coverImageUrl:
      'https://images.unsplash.com/photo-1553729459-afe8f2e2d3b5?w=800&h=500&fit=crop',
  },
  {
    title: 'Building a Revenue Dashboard That Tells You What to Do',
    slug: 'revenue-dashboard-guide',
    excerpt:
      'Data without action is just noise. Learn how to set up a catering revenue dashboard that surfaces the three metrics that actually matter and turns them into weekly action items for your team.',
    author: { name: 'Sarah Chen' },
    categories: [{ title: 'Revenue Growth', slug: 'revenue-growth' }],
    publishedAt: '2026-02-21',
    readTime: 9,
    coverImageUrl:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop',
  },
];

const allCategories = [
  'All',
  'Revenue Growth',
  'Follow-Up & Retention',
  'Operations',
  'Pricing Strategy',
  'Direct Ordering',
];

async function getArticles(): Promise<Article[]> {
  if (!client) {
    return placeholderArticles;
  }
  try {
    const query = `*[_type == "article"] | order(publishedAt desc) {
      title,
      "slug": slug.current,
      excerpt,
      "coverImage": coverImage.asset->url,
      "author": author->{ name, "image": image.asset->url },
      "categories": categories[]->{ title, "slug": slug.current },
      publishedAt,
      readTime
    }`;
    return await client.fetch(query);
  } catch {
    return placeholderArticles;
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/* ── Components ── */

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

function CategoryPill({ label, active }: { label: string; active?: boolean }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '6px 16px',
        borderRadius: 999,
        fontSize: 14,
        fontWeight: 500,
        backgroundColor: active ? color.ink : color.creamDark,
        color: active ? color.white : color.muted,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      {label}
    </span>
  );
}

function ArticleCard({
  article,
  featured,
}: {
  article: Article;
  featured?: boolean;
}) {
  const imageUrl = article.coverImageUrl || article.coverImage;
  const category = article.categories?.[0];

  if (featured) {
    return (
      <Link
        href={`/blog/${article.slug}`}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 40,
          backgroundColor: color.white,
          borderRadius: 16,
          overflow: 'hidden',
          textDecoration: 'none',
          color: 'inherit',
          transition: 'box-shadow 0.2s ease',
        }}
        className="responsive-grid"
      >
        <div
          style={{
            width: '100%',
            minHeight: 320,
            background: `url(${imageUrl}) center/cover no-repeat`,
            borderRadius: '16px 0 0 16px',
          }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '40px 40px 40px 0',
          }}
        >
          {category && (
            <span
              style={{
                display: 'inline-block',
                width: 'fit-content',
                padding: '4px 12px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                backgroundColor: color.orange + '15',
                color: color.orange,
                marginBottom: 16,
              }}
            >
              {category.title}
            </span>
          )}
          <h2
            style={{
              fontSize: 28,
              fontWeight: 700,
              lineHeight: 1.3,
              color: color.ink,
              marginBottom: 12,
            }}
          >
            {article.title}
          </h2>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.6,
              color: color.muted,
              marginBottom: 20,
            }}
          >
            {article.excerpt}
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              fontSize: 14,
              color: color.muted,
            }}
          >
            <span>{formatDate(article.publishedAt)}</span>
            <span style={{ opacity: 0.4 }}>|</span>
            <span>{article.readTime} min read</span>
          </div>
          <span
            style={{
              marginTop: 20,
              fontSize: 15,
              fontWeight: 600,
              color: color.orange,
            }}
          >
            Read more &rarr;
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/blog/${article.slug}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: color.white,
        borderRadius: 12,
        overflow: 'hidden',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'box-shadow 0.2s ease, transform 0.15s ease',
      }}
    >
      <div
        style={{
          width: '100%',
          height: 200,
          background: `url(${imageUrl}) center/cover no-repeat`,
        }}
      />
      <div style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {category && (
          <span
            style={{
              display: 'inline-block',
              width: 'fit-content',
              padding: '4px 10px',
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              backgroundColor: color.orange + '15',
              color: color.orange,
              marginBottom: 12,
            }}
          >
            {category.title}
          </span>
        )}
        <h3
          style={{
            fontSize: 18,
            fontWeight: 700,
            lineHeight: 1.35,
            color: color.ink,
            marginBottom: 8,
          }}
        >
          {article.title}
        </h3>
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.6,
            color: color.muted,
            marginBottom: 16,
            flex: 1,
          }}
        >
          {article.excerpt.length > 120
            ? article.excerpt.slice(0, 120) + '...'
            : article.excerpt}
        </p>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 13,
            color: color.muted,
          }}
        >
          <span>
            {formatDate(article.publishedAt)} &middot; {article.readTime} min
          </span>
          <span style={{ fontWeight: 600, color: color.orange, fontSize: 14 }}>
            Read more &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ── Page ── */

export const metadata = {
  title: 'Blog | TrayLoop - Catering Growth Insights',
  description:
    'Actionable tips, strategies, and data to help restaurants grow their catering revenue with direct ordering.',
};

export default async function BlogPage() {
  const articles = await getArticles();
  const [featured, ...rest] = articles;

  return (
    <>
      {/* Hero */}
      <Section bg={color.cream} style={{ paddingBottom: 48 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span
            style={{
              display: 'inline-block',
              padding: '6px 14px',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              backgroundColor: color.teal + '20',
              color: '#2A9D6E',
              marginBottom: 20,
            }}
          >
            Blog
          </span>
          <h1
            style={{
              fontSize: 48,
              fontWeight: 800,
              lineHeight: 1.15,
              color: color.ink,
              marginBottom: 16,
            }}
          >
            Catering Growth Insights
          </h1>
          <p
            style={{
              fontSize: 18,
              lineHeight: 1.6,
              color: color.muted,
              maxWidth: 560,
              margin: '0 auto',
            }}
          >
            Strategies, data, and real-world tips to help your restaurant grow
            catering revenue and ditch marketplace commissions.
          </p>
        </div>

        {/* Category pills */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            justifyContent: 'center',
          }}
        >
          {allCategories.map((cat, i) => (
            <CategoryPill key={cat} label={cat} active={i === 0} />
          ))}
        </div>
      </Section>

      {/* Featured article */}
      {featured && (
        <Section bg={color.cream} style={{ paddingTop: 0, paddingBottom: 48 }}>
          <ArticleCard article={featured} featured />
        </Section>
      )}

      {/* Article grid */}
      <Section bg={color.cream} style={{ paddingTop: 0 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 28,
          }}
          className="responsive-grid"
        >
          {rest.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </Section>

      {/* Newsletter signup */}
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
            Get catering insights in your inbox
          </h2>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.6,
              color: color.muted,
              marginBottom: 32,
            }}
          >
            Join 2,000+ restaurant operators who get our weekly breakdown of
            catering growth strategies. No spam, unsubscribe anytime.
          </p>
          <div
            style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <input
              type="email"
              placeholder="you@restaurant.com"
              style={{
                padding: '12px 20px',
                borderRadius: 999,
                border: '1.5px solid #3A3530',
                backgroundColor: '#2A2520',
                color: color.white,
                fontSize: 15,
                width: 280,
                outline: 'none',
              }}
            />
            <PillButton text="Subscribe" href="#" variant="primary" size="md" />
          </div>
        </div>
      </Section>
    </>
  );
}

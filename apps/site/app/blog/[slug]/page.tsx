import React from 'react';
import Link from 'next/link';
import { readFileSync } from 'fs';
import { join } from 'path';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import { 
  ArrowLeft, 
  Calendar, 
  Clock,
  CreditCard,
  Clock as ClockIcon,
  Users
} from 'lucide-react';
import ContentEngagementTracker from '../../../components/ContentEngagementTracker';

const blogPosts: Record<string, {
  title: string;
  filename: string;
  date: string;
  readTime: string;
  category: string;
  icon: React.ReactNode;
  metaDescription: string;
}> = {
  'square-great-payments-hookah-lounges-struggle': {
    title: 'Square Is Great at Payments. Why Hookah Lounges Still Struggle After Checkout.',
    filename: 'square-great-at-payments-why-hookah-lounges-still-struggle.md',
    date: '2025-01-25',
    readTime: '8 min read',
    category: 'Operations',
    icon: <CreditCard className="w-5 h-5" />,
    metaDescription: 'Square handles payments perfectly. But hookah lounges need session timing, customer memory, and shift handoff—capabilities Square doesn\'t provide. Here\'s why operations software sits above your POS.'
  },
  'session-timing-runs-hookah-lounge': {
    title: 'Why Session Timing, Not Transactions, Runs a Hookah Lounge',
    filename: 'why-session-timing-not-transactions-runs-hookah-lounge.md',
    date: '2025-01-25',
    readTime: '7 min read',
    category: 'Operations',
    icon: <ClockIcon className="w-5 h-5" />,
    metaDescription: 'Hookah lounges sell time, not products. Session timing—tracking duration, managing extensions, optimizing turnover—is what drives revenue. Here\'s why timing software matters more than transaction software.'
  },
  'loyalty-remembering-people-not-points': {
    title: 'Loyalty Isn\'t Points. It\'s Remembering People.',
    filename: 'loyalty-isnt-points-its-remembering-people.md',
    date: '2025-01-25',
    readTime: '9 min read',
    category: 'Customer Experience',
    icon: <Users className="w-5 h-5" />,
    metaDescription: 'Points-based loyalty programs are transactions. Real loyalty is remembering customer preferences, flavor mixes, and behavioral patterns across visits. Here\'s why customer memory matters more than points.'
  }
};

// Custom components for react-markdown
const markdownComponents: Partial<Components> = {
  h1: ({ children }) => (
    <h1 className="text-3xl font-bold mt-8 mb-4 text-white">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-2xl font-bold mt-6 mb-3 text-white">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-xl font-bold mt-4 mb-2 text-white">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="mb-4 text-zinc-300 leading-relaxed">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside mb-4 space-y-2 text-zinc-300">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside mb-4 space-y-2 text-zinc-300">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="ml-4">{children}</li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-teal-500 pl-4 my-4 italic text-zinc-300">{children}</blockquote>
  ),
  hr: () => (
    <hr className="my-8 border-zinc-700" />
  ),
  strong: ({ children }) => (
    <strong className="text-white font-semibold">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic">{children}</em>
  ),
  a: ({ href, children, ...props }) => (
    <Link 
      href={href || '#'} 
      className="text-teal-400 hover:text-teal-300 underline"
      {...props}
    >
      {children}
    </Link>
  ),
  code: ({ children, className, ...props }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="bg-zinc-800 text-teal-400 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
          {children}
        </code>
      );
    }
    return (
      <code className="block bg-zinc-800 text-zinc-300 p-4 rounded-lg overflow-x-auto text-sm font-mono mb-4" {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children, ...props }) => (
    <pre className="mb-4" {...props}>{children}</pre>
  ),
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts[slug];
  
  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: `${post.title} | Hookah+ Blog`,
    description: post.metaDescription,
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      type: 'article',
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts[slug];

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
          <Link href="/blog" className="text-teal-400 hover:text-teal-300">
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  // Read markdown file from filesystem
  let markdownContent = '';
  try {
    // Path from workspace root (content/ is at root level)
    // When Next.js runs, process.cwd() is the workspace root
    const contentPath = join(process.cwd(), 'content', 'blog', post.filename);
    markdownContent = readFileSync(contentPath, 'utf-8');
    
    // Remove frontmatter if present (lines starting with ---)
    const lines = markdownContent.split('\n');
    let startIndex = 0;
    if (lines[0]?.trim() === '---') {
      const endIndex = lines.findIndex((line, idx) => idx > 0 && line.trim() === '---');
      if (endIndex > 0) {
        startIndex = endIndex + 1;
      }
    }
    markdownContent = lines.slice(startIndex).join('\n');
  } catch (error) {
    console.error('Error reading markdown file:', error);
    markdownContent = `# ${post.title}\n\nContent could not be loaded.`;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <ContentEngagementTracker />
      {/* Header */}
      <div className="border-b border-zinc-800 sticky top-16 z-40 bg-zinc-950/80 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            href="/blog"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-teal-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Blog</span>
          </Link>
        </div>
      </div>

      {/* Article */}
      <article className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Meta */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-teal-400">
                {post.icon}
              </div>
              <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
                {post.category}
              </span>
              <span className="text-zinc-500">•</span>
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Calendar className="w-4 h-4" />
                <span>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <span className="text-zinc-500">•</span>
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Clock className="w-4 h-4" />
                <span>{post.readTime}</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {post.title}
            </h1>
          </div>

          {/* Content */}
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {markdownContent}
            </ReactMarkdown>
          </div>

          {/* CTA */}
          <div className="mt-12 p-6 bg-zinc-800/50 border border-zinc-700 rounded-lg">
            <h3 className="text-xl font-bold mb-4">Ready to Complete Your Operations Stack?</h3>
            <p className="text-zinc-300 mb-6">
              Square handles payments. Hookah+ handles sessions, customer memory, and loyalty.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/works-with-square"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-medium rounded-lg transition-all duration-300"
              >
                See How It Works With Square
              </Link>
              <Link
                href="/onboarding"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-zinc-700 hover:border-teal-500/50 text-white font-medium rounded-lg transition-all duration-300"
              >
                Book a Demo
              </Link>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import PageHero from '../../components/PageHero';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { 
  Users, 
  MessageCircle, 
  Search, 
  Filter, 
  Plus, 
  Star, 
  ThumbsUp, 
  Reply, 
  Clock,
  TrendingUp,
  Award,
  Bookmark,
  Share2,
  Instagram,
  ArrowRight,
  Calendar,
  BookOpen,
  Video,
  CheckCircle,
  Zap
} from 'lucide-react';

export default function CommunityPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Topics', count: 24 },
    { id: 'general', label: 'General Discussion', count: 8 },
    { id: 'technical', label: 'Technical Support', count: 6 },
    { id: 'features', label: 'Feature Requests', count: 5 },
    { id: 'integrations', label: 'Integrations', count: 3 },
    { id: 'announcements', label: 'Announcements', count: 2 }
  ];

  const posts = [
    {
      id: 1,
      title: 'Welcome to the Hookah+ Community!',
      author: 'Hookah+ Team',
      avatar: 'H+',
      category: 'announcements',
      replies: 12,
      likes: 24,
      time: '2 hours ago',
      isPinned: true,
      isNew: false,
      tags: ['welcome', 'community', 'getting-started']
    },
    {
      id: 2,
      title: 'Best practices for setting up QR codes in your lounge',
      author: 'Sarah M.',
      avatar: 'SM',
      category: 'technical',
      replies: 8,
      likes: 15,
      time: '4 hours ago',
      isPinned: false,
      isNew: true,
      tags: ['qr-codes', 'setup', 'tutorial']
    },
    {
      id: 3,
      title: 'Feature Request: Custom flavor wheel themes',
      author: 'Mike Chen',
      avatar: 'MC',
      category: 'features',
      replies: 15,
      likes: 32,
      time: '6 hours ago',
      isPinned: false,
      isNew: false,
      tags: ['feature-request', 'customization', 'ui']
    },
    {
      id: 4,
      title: 'Integration with Square POS - Success Story',
      author: 'Alex Rodriguez',
      avatar: 'AR',
      category: 'integrations',
      replies: 6,
      likes: 18,
      time: '1 day ago',
      isPinned: false,
      isNew: false,
      tags: ['square', 'pos', 'success-story']
    },
    {
      id: 5,
      title: 'Troubleshooting: Session not starting properly',
      author: 'Emma Wilson',
      avatar: 'EW',
      category: 'technical',
      replies: 4,
      likes: 7,
      time: '1 day ago',
      isPinned: false,
      isNew: false,
      tags: ['troubleshooting', 'sessions', 'help']
    }
  ];

  const getCategoryColor = (category: string) => {
    const colors = {
      announcements: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      technical: 'bg-green-500/20 text-green-400 border-green-500/30',
      features: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      integrations: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      general: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Hero Section */}
      <PageHero
        headline="Join Our Instagram Community"
        subheadline="Real conversations, real-time support, and community-driven content on Instagram"
        benefit={{
          value: "Daily tips, Q&A, and feature updates",
          description: "Follow @hookahplusnet for the latest"
        }}
        primaryCTA={{
          text: "Follow on Instagram",
          onClick: () => window.open('https://www.instagram.com/hookahplusnet/', '_blank')
        }}
        secondaryCTA={{
          text: "Send a DM",
          onClick: () => window.open('https://ig.me/m/hookahplusnet', '_blank')
        }}
        trustIndicators={[
          { icon: <Instagram className="w-4 h-4 text-pink-400" />, text: "Active daily" },
          { icon: <MessageCircle className="w-4 h-4 text-teal-400" />, text: "Real-time support" },
          { icon: <Users className="w-4 h-4 text-teal-400" />, text: "Growing community" }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Why Instagram */}
        <section className="mb-12">
          <Card className="p-8 bg-gradient-to-r from-pink-500/10 to-purple-500/10 border-pink-500/30">
            <div className="flex items-start gap-4">
              <Instagram className="w-8 h-8 text-pink-400 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold mb-4">Why Instagram?</h2>
                <p className="text-zinc-300 mb-4">
                  We've moved our community to Instagram to optimize for their algorithmic ecosystem and create a more engaging, visual experience. All conversations happen where you already are.
                </p>
                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                    <Zap className="w-5 h-5 text-pink-400 mb-2" />
                    <h3 className="font-semibold text-white mb-1">Real-Time Engagement</h3>
                    <p className="text-sm text-zinc-400">Get instant responses via DMs and comments</p>
                  </div>
                  <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                    <Video className="w-5 h-5 text-pink-400 mb-2" />
                    <h3 className="font-semibold text-white mb-1">Visual Content</h3>
                    <p className="text-sm text-zinc-400">Screenshots, demos, and tutorials in your feed</p>
                  </div>
                  <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                    <TrendingUp className="w-5 h-5 text-pink-400 mb-2" />
                    <h3 className="font-semibold text-white mb-1">Algorithm Optimization</h3>
                    <p className="text-sm text-zinc-400">Engagement stays on-platform for better reach</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Community Resources */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Community Resources</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6 bg-zinc-800/50 border-zinc-700 hover:border-pink-500/50 transition-colors cursor-pointer"
              onClick={() => window.open('https://www.instagram.com/hookahplusnet/', '_blank')}
            >
              <Instagram className="w-8 h-8 text-pink-400 mb-4" />
              <h3 className="font-semibold text-white mb-2">Instagram Feed</h3>
              <p className="text-sm text-zinc-400 mb-4">Daily updates, tips, and discussions</p>
              <Button variant="outline" size="sm" className="w-full border-pink-500/50 text-pink-400 hover:bg-pink-500/10">
                Follow @hookahplusnet
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>

            <Card className="p-6 bg-zinc-800/50 border-zinc-700 hover:border-pink-500/50 transition-colors cursor-pointer"
              onClick={() => window.open('https://ig.me/m/hookahplusnet', '_blank')}
            >
              <MessageCircle className="w-8 h-8 text-pink-400 mb-4" />
              <h3 className="font-semibold text-white mb-2">Instagram DMs</h3>
              <p className="text-sm text-zinc-400 mb-4">Get instant help and support</p>
              <Button variant="outline" size="sm" className="w-full border-pink-500/50 text-pink-400 hover:bg-pink-500/10">
                Send a DM
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>

            <Card className="p-6 bg-zinc-800/50 border-zinc-700 hover:border-pink-500/50 transition-colors">
              <BookOpen className="w-8 h-8 text-pink-400 mb-4" />
              <h3 className="font-semibold text-white mb-2">Instagram Guides</h3>
              <p className="text-sm text-zinc-400 mb-4">Curated resources and tutorials</p>
              <p className="text-xs text-zinc-500">Coming Soon</p>
            </Card>

            <Card className="p-6 bg-zinc-800/50 border-zinc-700 hover:border-pink-500/50 transition-colors">
              <Video className="w-8 h-8 text-pink-400 mb-4" />
              <h3 className="font-semibold text-white mb-2">Reels Tutorials</h3>
              <p className="text-sm text-zinc-400 mb-4">Quick video guides and demos</p>
              <p className="text-xs text-zinc-500">Coming Soon</p>
            </Card>
          </div>
        </section>

        {/* How to Engage */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">How to Engage</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 bg-zinc-800/50 border-zinc-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center text-pink-400 font-bold">1</div>
                <h3 className="font-semibold text-white">Follow @hookahplusnet</h3>
              </div>
              <p className="text-zinc-300 text-sm mb-4">
                Get daily tips, feature updates, and community discussions in your feed.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('https://www.instagram.com/hookahplusnet/', '_blank')}
                className="border-pink-500/50 text-pink-400 hover:bg-pink-500/10"
              >
                Follow Now
              </Button>
            </Card>

            <Card className="p-6 bg-zinc-800/50 border-zinc-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center text-pink-400 font-bold">2</div>
                <h3 className="font-semibold text-white">Join the Conversation</h3>
              </div>
              <p className="text-zinc-300 text-sm mb-4">
                Comment on posts, share your experiences, and ask questions. We respond to every comment.
              </p>
              <ul className="text-xs text-zinc-400 space-y-1">
                <li>• Share your setup tips</li>
                <li>• Ask integration questions</li>
                <li>• Request features via polls</li>
              </ul>
            </Card>

            <Card className="p-6 bg-zinc-800/50 border-zinc-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center text-pink-400 font-bold">3</div>
                <h3 className="font-semibold text-white">DM for Support</h3>
              </div>
              <p className="text-zinc-300 text-sm mb-4">
                Need help? Send us a DM for instant support. We typically respond within 2 hours.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('https://ig.me/m/hookahplusnet', '_blank')}
                className="border-pink-500/50 text-pink-400 hover:bg-pink-500/10"
              >
                Send DM
              </Button>
            </Card>
          </div>
        </section>

        {/* What to Expect */}
        <section className="mb-12">
          <Card className="p-8 bg-zinc-800/50 border-zinc-700">
            <h2 className="text-2xl font-bold mb-6">What to Expect on Instagram</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Daily Content
                </h3>
                <ul className="space-y-2 text-zinc-300 text-sm">
                  <li>• Instagram Stories with tips and Q&A</li>
                  <li>• Weekly Reels tutorials</li>
                  <li>• Feature announcements</li>
                  <li>• Community spotlights</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Community Features
                </h3>
                <ul className="space-y-2 text-zinc-300 text-sm">
                  <li>• Instagram Guides for documentation</li>
                  <li>• Poll stickers for feature requests</li>
                  <li>• Story highlights for FAQs</li>
                  <li>• User-generated content features</li>
                </ul>
              </div>
            </div>
          </Card>
        </section>

        {/* CTA Section */}
        <section>
          <Card className="p-8 bg-gradient-to-r from-pink-500/10 to-purple-500/10 border-pink-500/30 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Join?</h2>
            <p className="text-zinc-300 mb-8 max-w-2xl mx-auto">
              Follow @hookahplusnet on Instagram to join our growing community of lounge owners, get daily tips, and connect with other Hookah+ users.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="primary"
                size="lg"
                onClick={() => window.open('https://www.instagram.com/hookahplusnet/', '_blank')}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
              >
                <Instagram className="w-5 h-5 mr-2" />
                Follow on Instagram
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => window.open('https://ig.me/m/hookahplusnet', '_blank')}
                className="border-pink-500/50 text-pink-400 hover:bg-pink-500/10"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Send a DM
              </Button>
            </div>
          </Card>
        </section>

        {/* Search and Filter Bar */}
        <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-primary-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label} ({category.count})
                  </option>
                ))}
              </select>
              <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Post
              </button>
            </div>
          </div>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <MessageCircle className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">156</p>
                <p className="text-sm text-zinc-400">Total Posts</p>
              </div>
            </div>
          </div>
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">89</p>
                <p className="text-sm text-zinc-400">Active Members</p>
              </div>
            </div>
          </div>
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-white">12</p>
                <p className="text-sm text-zinc-400">Online Now</p>
              </div>
            </div>
          </div>
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Award className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-2xl font-bold text-white">5</p>
                <p className="text-sm text-zinc-400">Featured Topics</p>
              </div>
            </div>
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className={`bg-zinc-800/50 backdrop-blur-sm border rounded-lg p-4 hover:border-zinc-600 transition-colors ${
                post.isPinned ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-zinc-700'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {post.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    {post.isPinned && (
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30">
                        📌 Pinned
                      </span>
                    )}
                    {post.isNew && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
                        New
                      </span>
                    )}
                    <span className={`px-2 py-1 text-xs rounded-full border ${getCategoryColor(post.category)}`}>
                      {categories.find(c => c.id === post.category)?.label}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-2 hover:text-primary-400 transition-colors cursor-pointer">
                    {post.title}
                  </h3>
                  
                  <div className="flex items-center space-x-4 text-sm text-zinc-400 mb-3">
                    <span>by {post.author}</span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{post.time}</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-zinc-400">
                    <span className="flex items-center space-x-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>{post.replies} replies</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <ThumbsUp className="w-3 h-3" />
                      <span>{post.likes} likes</span>
                    </span>
                    <div className="flex items-center space-x-1">
                      <Bookmark className="w-3 h-3" />
                      <span>Save</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Share2 className="w-3 h-3" />
                      <span>Share</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-zinc-700 text-zinc-300 text-xs rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <button className="px-6 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors">
            Load More Posts
          </button>
        </div>
      </div>
    </div>
  );
}

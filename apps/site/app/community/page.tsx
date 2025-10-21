'use client';

import React, { useState } from 'react';
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
  Share2
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
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Community Forum</h1>
              <p className="text-zinc-400">Connect, share, and learn with the Hookah+ community</p>
            </div>
          </div>
        </div>

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

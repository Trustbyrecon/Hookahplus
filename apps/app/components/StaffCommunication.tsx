"use client";

import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Bell, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Reply,
  Forward,
  Archive,
  Trash2,
  Star,
  Pin
} from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  recipientId?: string;
  recipientName?: string;
  subject: string;
  content: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  type: 'announcement' | 'task' | 'question' | 'update' | 'emergency';
  status: 'sent' | 'delivered' | 'read' | 'archived';
  isPinned: boolean;
  attachments?: {
    name: string;
    type: string;
    size: number;
    url: string;
  }[];
  replies?: Message[];
}

interface Notification {
  id: string;
  type: 'message' | 'task' | 'shift' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'busy' | 'offline';
  lastSeen: Date;
}

interface StaffCommunicationProps {
  currentUserId: string;
  staffMembers: StaffMember[];
  onMessageSend: (message: Omit<Message, 'id' | 'timestamp' | 'status'>) => void;
  onNotificationMarkRead: (notificationId: string) => void;
}

export default function StaffCommunication({ 
  currentUserId, 
  staffMembers, 
  onMessageSend, 
  onNotificationMarkRead 
}: StaffCommunicationProps) {
  const [activeTab, setActiveTab] = useState<'messages' | 'notifications' | 'announcements'>('messages');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [newMessage, setNewMessage] = useState({
    recipientId: '',
    subject: '',
    content: '',
    priority: 'medium' as Message['priority'],
    type: 'question' as Message['type']
  });

  // Generate demo data
  useEffect(() => {
    const demoMessages: Message[] = [
      {
        id: 'msg-1',
        senderId: 'staff-003',
        senderName: 'Alex Johnson',
        senderRole: 'MANAGER',
        subject: 'New Table Setup Protocol',
        content: 'Hey team, we\'ve updated the table setup protocol for better efficiency. Please review the attached document and let me know if you have any questions.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        priority: 'high',
        type: 'announcement',
        status: 'read',
        isPinned: true,
        attachments: [
          {
            name: 'Table_Setup_Protocol_v2.pdf',
            type: 'pdf',
            size: 1024 * 1024 * 2.5,
            url: '#'
          }
        ]
      },
      {
        id: 'msg-2',
        senderId: 'staff-001',
        senderName: 'Mike Rodriguez',
        senderRole: 'BOH',
        recipientId: 'staff-003',
        recipientName: 'Alex Johnson',
        subject: 'Question about Table 5',
        content: 'Alex, Table 5 is requesting a flavor change but we\'re running low on that specific flavor. Should I offer alternatives or check inventory first?',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        priority: 'medium',
        type: 'question',
        status: 'delivered',
        isPinned: false
      },
      {
        id: 'msg-3',
        senderId: 'staff-002',
        senderName: 'Sarah Chen',
        senderRole: 'FOH',
        subject: 'Customer Complaint - Table 3',
        content: 'We had a customer complaint about service speed at Table 3. The customer mentioned waiting 20 minutes for their order. I\'ve already addressed it, but wanted to bring it to your attention.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        priority: 'high',
        type: 'update',
        status: 'read',
        isPinned: false
      }
    ];

    const demoNotifications: Notification[] = [
      {
        id: 'notif-1',
        type: 'message',
        title: 'New Message from Mike Rodriguez',
        message: 'Question about Table 5 - flavor change request',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        isRead: false,
        priority: 'medium',
        actionUrl: '#'
      },
      {
        id: 'notif-2',
        type: 'task',
        title: 'Task Assigned: Table Setup',
        message: 'You have been assigned to setup Table 8 for the 7 PM reservation',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        isRead: true,
        priority: 'high',
        actionUrl: '#'
      },
      {
        id: 'notif-3',
        type: 'shift',
        title: 'Shift Reminder',
        message: 'Your shift starts in 30 minutes',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        isRead: false,
        priority: 'urgent',
        actionUrl: '#'
      }
    ];

    setMessages(demoMessages);
    setNotifications(demoNotifications);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'announcement': return <Bell className="w-4 h-4" />;
      case 'task': return <CheckCircle className="w-4 h-4" />;
      case 'question': return <MessageSquare className="w-4 h-4" />;
      case 'update': return <AlertTriangle className="w-4 h-4" />;
      case 'emergency': return <AlertTriangle className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'read': return 'text-green-400';
      case 'delivered': return 'text-blue-400';
      case 'sent': return 'text-gray-400';
      case 'archived': return 'text-gray-500';
      default: return 'text-gray-400';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         message.senderName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === 'all' || message.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const unreadMessages = messages.filter(m => m.status === 'delivered' || m.status === 'sent').length;

  const handleSendMessage = () => {
    if (!newMessage.subject.trim() || !newMessage.content.trim()) return;

    const message: Omit<Message, 'id' | 'timestamp' | 'status'> = {
      senderId: currentUserId,
      senderName: staffMembers.find(s => s.id === currentUserId)?.name || 'You',
      senderRole: staffMembers.find(s => s.id === currentUserId)?.role || 'STAFF',
      recipientId: newMessage.recipientId || undefined,
      recipientName: newMessage.recipientId ? staffMembers.find(s => s.id === newMessage.recipientId)?.name : undefined,
      subject: newMessage.subject,
      content: newMessage.content,
      priority: newMessage.priority,
      type: newMessage.type,
      isPinned: false
    };

    onMessageSend(message);
    setNewMessage({
      recipientId: '',
      subject: '',
      content: '',
      priority: 'medium',
      type: 'question'
    });
    setShowComposeModal(false);
  };

  const handleMarkAsRead = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, status: 'read' as const } : msg
    ));
  };

  const handleMarkNotificationRead = (notificationId: string) => {
    onNotificationMarkRead(notificationId);
    setNotifications(prev => prev.map(notif => 
      notif.id === notificationId ? { ...notif, isRead: true } : notif
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-white">Staff Communication</h2>
          <p className="text-zinc-400">Stay connected with your team</p>
        </div>
        
        <button
          onClick={() => setShowComposeModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Message</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-zinc-800 rounded-lg p-1">
        {[
          { id: 'messages', label: 'Messages', icon: MessageSquare, count: unreadMessages },
          { id: 'notifications', label: 'Notifications', icon: Bell, count: unreadCount },
          { id: 'announcements', label: 'Announcements', icon: Bell, count: 0 }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors relative ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Message List */}
          <div className="lg:col-span-1 space-y-4">
            {/* Search and Filter */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400"
                />
              </div>
              
              <div className="flex space-x-2">
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
                >
                  <option value="all">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <button className="px-3 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors">
                  <Filter className="w-4 h-4 text-zinc-400" />
                </button>
              </div>
            </div>

            {/* Message List */}
            <div className="space-y-2">
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => {
                    setSelectedMessage(message);
                    handleMarkAsRead(message.id);
                  }}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedMessage?.id === message.id
                      ? 'bg-blue-600/20 border-blue-500/50'
                      : 'bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(message.type)}
                      <span className="font-medium text-white text-sm">{message.senderName}</span>
                      {message.isPinned && <Pin className="w-3 h-3 text-yellow-400" />}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(message.priority)}`}>
                        {message.priority.toUpperCase()}
                      </span>
                      <span className={`text-xs ${getStatusColor(message.status)}`}>
                        {message.status}
                      </span>
                    </div>
                  </div>
                  
                  <h4 className="font-medium text-white text-sm mb-1">{message.subject}</h4>
                  <p className="text-xs text-zinc-400 line-clamp-2">{message.content}</p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-zinc-500">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                    {message.attachments && message.attachments.length > 0 && (
                      <span className="text-xs text-blue-400">
                        {message.attachments.length} attachment{message.attachments.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <div className="bg-zinc-800/50 rounded-lg border border-zinc-700 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{selectedMessage.subject}</h3>
                    <div className="flex items-center space-x-4 text-sm text-zinc-400">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{selectedMessage.senderName} ({selectedMessage.senderRole})</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{selectedMessage.timestamp.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(selectedMessage.priority)}`}>
                      {selectedMessage.priority.toUpperCase()}
                    </span>
                    <button className="p-2 text-zinc-400 hover:text-white transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="prose prose-invert max-w-none">
                  <p className="text-zinc-300 leading-relaxed">{selectedMessage.content}</p>
                </div>

                {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-white mb-3">Attachments</h4>
                    <div className="space-y-2">
                      {selectedMessage.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-zinc-700/50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-zinc-600 rounded flex items-center justify-center">
                              <span className="text-xs font-medium text-white">
                                {attachment.type.toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">{attachment.name}</div>
                              <div className="text-xs text-zinc-400">{formatFileSize(attachment.size)}</div>
                            </div>
                          </div>
                          <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm text-white transition-colors">
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-3 mt-6 pt-4 border-t border-zinc-700">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white">
                    <Reply className="w-4 h-4" />
                    <span>Reply</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors text-white">
                    <Forward className="w-4 h-4" />
                    <span>Forward</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors text-white">
                    <Archive className="w-4 h-4" />
                    <span>Archive</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-zinc-800/50 rounded-lg border border-zinc-700 p-12 text-center">
                <MessageSquare className="w-16 h-16 text-zinc-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Select a Message</h3>
                <p className="text-zinc-400">Choose a message from the list to view its details</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border transition-colors ${
                notification.isRead
                  ? 'bg-zinc-800/50 border-zinc-700'
                  : 'bg-blue-600/10 border-blue-500/30'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    notification.priority === 'urgent' ? 'bg-red-500/20' :
                    notification.priority === 'high' ? 'bg-orange-500/20' :
                    notification.priority === 'medium' ? 'bg-yellow-500/20' :
                    'bg-blue-500/20'
                  }`}>
                    <Bell className={`w-4 h-4 ${
                      notification.priority === 'urgent' ? 'text-red-400' :
                      notification.priority === 'high' ? 'text-orange-400' :
                      notification.priority === 'medium' ? 'text-yellow-400' :
                      'text-blue-400'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white mb-1">{notification.title}</h4>
                    <p className="text-sm text-zinc-400 mb-2">{notification.message}</p>
                    <div className="flex items-center space-x-4 text-xs text-zinc-500">
                      <span>{notification.timestamp.toLocaleString()}</span>
                      <span className={`px-2 py-1 rounded ${
                        notification.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                        notification.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                        notification.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {notification.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!notification.isRead && (
                    <button
                      onClick={() => handleMarkNotificationRead(notification.id)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm text-white transition-colors"
                    >
                      Mark Read
                    </button>
                  )}
                  <button className="p-1 text-zinc-400 hover:text-white transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Compose Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Compose Message</h3>
              <button
                onClick={() => setShowComposeModal(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">To</label>
                  <select
                    value={newMessage.recipientId}
                    onChange={(e) => setNewMessage({ ...newMessage, recipientId: e.target.value })}
                    className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                  >
                    <option value="">All Staff (Announcement)</option>
                    {staffMembers.map((staff) => (
                      <option key={staff.id} value={staff.id}>{staff.name} ({staff.role})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Type</label>
                  <select
                    value={newMessage.type}
                    onChange={(e) => setNewMessage({ ...newMessage, type: e.target.value as Message['type'] })}
                    className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                  >
                    <option value="question">Question</option>
                    <option value="announcement">Announcement</option>
                    <option value="task">Task</option>
                    <option value="update">Update</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Subject</label>
                <input
                  type="text"
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                  placeholder="Enter message subject"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Priority</label>
                <select
                  value={newMessage.priority}
                  onChange={(e) => setNewMessage({ ...newMessage, priority: e.target.value as Message['priority'] })}
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Message</label>
                <textarea
                  value={newMessage.content}
                  onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white h-32 resize-none"
                  placeholder="Type your message here..."
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowComposeModal(false)}
                className="flex-1 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.subject.trim() || !newMessage.content.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-600 disabled:cursor-not-allowed rounded-lg transition-colors text-white flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Send Message</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

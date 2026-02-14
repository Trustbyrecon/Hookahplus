'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Image as ImageIcon, CheckCircle, X, Loader2, Eye, Download, Trash2, Save } from 'lucide-react';
import Button from './Button';

interface MenuFile {
  id: string;
  fileName: string;
  fileUrl: string;
  filePath?: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  status?: string;
}

interface ExtractedMenuData {
  basePrice?: number;
  refillPrice?: number;
  flavors: string[];
  sections: string[];
  menuItems?: Array<{
    name: string;
    price?: number;
    description?: string;
  }>;
  notes?: string;
}

interface MenuExtractorProps {
  leadId: string;
  menuFiles: MenuFile[];
  existingData?: ExtractedMenuData | null;
  onExtractComplete: (data: ExtractedMenuData) => Promise<void>;
  onFileDelete?: (fileId: string) => Promise<void>;
}

export default function MenuExtractor({
  leadId,
  menuFiles,
  existingData,
  onExtractComplete,
  onFileDelete
}: MenuExtractorProps) {
  const [extractedData, setExtractedData] = useState<ExtractedMenuData>({
    flavors: existingData?.flavors || [],
    sections: existingData?.sections || [],
    basePrice: existingData?.basePrice,
    refillPrice: existingData?.refillPrice,
    menuItems: existingData?.menuItems || [],
    notes: existingData?.notes || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [newFlavor, setNewFlavor] = useState('');
  const [newSection, setNewSection] = useState('');
  const [newMenuItem, setNewMenuItem] = useState({ name: '', price: '', description: '' });
  const [showAddMenuItem, setShowAddMenuItem] = useState(false);

  const handleAddFlavor = () => {
    if (newFlavor.trim() && !extractedData.flavors.includes(newFlavor.trim())) {
      setExtractedData(prev => ({
        ...prev,
        flavors: [...prev.flavors, newFlavor.trim()]
      }));
      setNewFlavor('');
    }
  };

  const handleRemoveFlavor = (flavor: string) => {
    setExtractedData(prev => ({
      ...prev,
      flavors: prev.flavors.filter(f => f !== flavor)
    }));
  };

  const handleAddSection = () => {
    if (newSection.trim() && !extractedData.sections.includes(newSection.trim())) {
      setExtractedData(prev => ({
        ...prev,
        sections: [...prev.sections, newSection.trim()]
      }));
      setNewSection('');
    }
  };

  const handleRemoveSection = (section: string) => {
    setExtractedData(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s !== section)
    }));
  };

  const handleAddMenuItem = () => {
    if (newMenuItem.name.trim()) {
      setExtractedData(prev => ({
        ...prev,
        menuItems: [
          ...(prev.menuItems || []),
          {
            name: newMenuItem.name.trim(),
            price: newMenuItem.price ? parseFloat(newMenuItem.price) : undefined,
            description: newMenuItem.description.trim() || undefined
          }
        ]
      }));
      setNewMenuItem({ name: '', price: '', description: '' });
      setShowAddMenuItem(false);
    }
  };

  const handleRemoveMenuItem = (index: number) => {
    setExtractedData(prev => ({
      ...prev,
      menuItems: prev.menuItems?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onExtractComplete(extractedData);
    } catch (error) {
      console.error('[MenuExtractor] Error saving extracted data:', error);
      alert('Failed to save extracted menu data. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteFile = async (fileId: string, filePath?: string) => {
    if (!confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
      return;
    }

    try {
      if (onFileDelete) {
        await onFileDelete(fileId);
      } else {
        // Fallback: call API directly
        const response = await fetch(`/api/menu-upload?path=${encodeURIComponent(filePath || '')}`, {
          method: 'DELETE'
        });
        if (!response.ok) {
          throw new Error('Failed to delete file');
        }
      }
    } catch (error) {
      console.error('[MenuExtractor] Error deleting file:', error);
      alert('Failed to delete file. Please try again.');
    }
  };

  if (menuFiles.length === 0) {
    return (
      <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
        <p className="text-sm text-zinc-400">No menu files uploaded yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* File List */}
      <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-700">
        <h3 className="text-lg font-semibold text-white mb-4">Uploaded Files</h3>
        <div className="space-y-2">
          {menuFiles.map((file) => (
            <div key={file.id} className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded border border-zinc-700">
              {file.fileType === 'application/pdf' ? (
                <FileText className="w-5 h-5 text-red-400 flex-shrink-0" />
              ) : (
                <ImageIcon className="w-5 h-5 text-blue-400 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{file.fileName}</p>
                <p className="text-xs text-zinc-500">
                  {(file.fileSize / 1024).toFixed(1)} KB • {file.fileType}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={file.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 text-teal-400 hover:text-teal-300 hover:bg-zinc-700 rounded transition-colors"
                  title="View file"
                >
                  <Eye className="w-4 h-4" />
                </a>
                <a
                  href={file.fileUrl}
                  download
                  className="p-2 text-zinc-400 hover:text-zinc-300 hover:bg-zinc-700 rounded transition-colors"
                  title="Download file"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={() => handleDeleteFile(file.id, file.filePath)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-zinc-700 rounded transition-colors"
                  title="Delete file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Extraction Form */}
      <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-700">
        <h3 className="text-lg font-semibold text-white mb-4">Extract Menu Data</h3>

        {/* Base Price */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Base Hookah Price (USD)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={extractedData.basePrice || ''}
            onChange={(e) => setExtractedData(prev => ({ ...prev, basePrice: e.target.value ? parseFloat(e.target.value) : undefined }))}
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:border-teal-500 focus:outline-none"
            placeholder="25.00"
          />
        </div>

        {/* Refill Price */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Refill Price (USD, optional)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={extractedData.refillPrice || ''}
            onChange={(e) => setExtractedData(prev => ({ ...prev, refillPrice: e.target.value ? parseFloat(e.target.value) : undefined }))}
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:border-teal-500 focus:outline-none"
            placeholder="10.00"
          />
        </div>

        {/* Flavors */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Flavors
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newFlavor}
              onChange={(e) => setNewFlavor(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddFlavor()}
              className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:border-teal-500 focus:outline-none"
              placeholder="Add flavor (e.g., Double Apple)"
            />
            <Button onClick={handleAddFlavor} variant="outline" size="sm">
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {extractedData.flavors.map((flavor) => (
              <span
                key={flavor}
                className="inline-flex items-center gap-1 px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-sm"
              >
                {flavor}
                <button
                  onClick={() => handleRemoveFlavor(flavor)}
                  className="text-teal-400 hover:text-red-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Sections (e.g., VIP, Patio, Main Floor)
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newSection}
              onChange={(e) => setNewSection(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSection()}
              className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:border-teal-500 focus:outline-none"
              placeholder="Add section"
            />
            <Button onClick={handleAddSection} variant="outline" size="sm">
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {extractedData.sections.map((section) => (
              <span
                key={section}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm"
              >
                {section}
                <button
                  onClick={() => handleRemoveSection(section)}
                  className="text-blue-400 hover:text-red-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-zinc-300">
              Menu Items (optional)
            </label>
            <Button
              onClick={() => setShowAddMenuItem(!showAddMenuItem)}
              variant="outline"
              size="sm"
            >
              {showAddMenuItem ? 'Cancel' : 'Add Item'}
            </Button>
          </div>
          {showAddMenuItem && (
            <div className="mb-3 p-3 bg-zinc-800/50 rounded border border-zinc-700">
              <input
                type="text"
                value={newMenuItem.name}
                onChange={(e) => setNewMenuItem(prev => ({ ...prev, name: e.target.value }))}
                className="w-full mb-2 px-3 py-2 bg-zinc-800 border border-zinc-600 rounded text-white text-sm focus:border-teal-500 focus:outline-none"
                placeholder="Item name"
              />
              <div className="flex gap-2 mb-2">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newMenuItem.price}
                  onChange={(e) => setNewMenuItem(prev => ({ ...prev, price: e.target.value }))}
                  className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-600 rounded text-white text-sm focus:border-teal-500 focus:outline-none"
                  placeholder="Price (optional)"
                />
                <Button onClick={handleAddMenuItem} variant="primary" size="sm">
                  Add
                </Button>
              </div>
              <textarea
                value={newMenuItem.description}
                onChange={(e) => setNewMenuItem(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded text-white text-sm focus:border-teal-500 focus:outline-none"
                placeholder="Description (optional)"
                rows={2}
              />
            </div>
          )}
          {extractedData.menuItems && extractedData.menuItems.length > 0 && (
            <div className="space-y-2">
              {extractedData.menuItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-zinc-800/50 rounded">
                  <div>
                    <span className="text-sm text-white">{item.name}</span>
                    {item.price && <span className="text-sm text-zinc-400 ml-2">${item.price}</span>}
                  </div>
                  <button
                    onClick={() => handleRemoveMenuItem(index)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Notes (optional)
          </label>
          <textarea
            value={extractedData.notes || ''}
            onChange={(e) => setExtractedData(prev => ({ ...prev, notes: e.target.value }))}
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:border-teal-500 focus:outline-none"
            placeholder="Any additional notes about the menu..."
            rows={3}
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSaving || (!extractedData.basePrice && extractedData.flavors.length === 0)}
            variant="primary"
            className="min-w-[120px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Extracted Data
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}


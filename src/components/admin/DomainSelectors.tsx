'use client';

import React from 'react';
import { HelpCircle, Plus, X } from 'lucide-react';
import { Domain } from '@/lib/admin/types';

interface DomainSelectorsProps {
  domains: Domain[];
  selectedDomainId: string;
  selectedSubTopicId: string;
  selectedConceptId: string;
  onChangeDomain: (id: string) => void;
  onChangeSubTopic: (id: string) => void;
  onChangeConcept: (id: string) => void;

  // Add functionality
  onAddDomain: (name: string) => void;
  onAddSubTopic: (domainId: string, name: string) => void;
  onAddConcept: (domainId: string, subTopicId: string, name: string) => void;
}

export default function DomainSelectors({
  domains,
  selectedDomainId,
  selectedSubTopicId,
  selectedConceptId,
  onChangeDomain,
  onChangeSubTopic,
  onChangeConcept,
  onAddDomain,
  onAddSubTopic,
  onAddConcept
}: DomainSelectorsProps) {
  // Resolve data dynamically
  const currentDomain = domains.find((d) => d.id === selectedDomainId) || domains[0];
  const subTopics = currentDomain?.subTopics || [];
  const currentSubTopic = subTopics.find((s) => s.id === selectedSubTopicId) || subTopics[0];
  const concepts = currentSubTopic?.concepts || [];

  // Inline dynamic inputs state
  const [isAddingDomain, setIsAddingDomain] = React.useState(false);
  const [newDomainName, setNewDomainName] = React.useState('');

  const [isAddingSubTopic, setIsAddingSubTopic] = React.useState(false);
  const [newSubTopicName, setNewSubTopicName] = React.useState('');

  const [isAddingConcept, setIsAddingConcept] = React.useState(false);
  const [newConceptName, setNewConceptName] = React.useState('');

  const handleSaveDomain = () => {
    if (newDomainName.trim()) {
      onAddDomain(newDomainName.trim());
      setNewDomainName('');
      setIsAddingDomain(false);
    }
  };

  const handleSaveSubTopic = () => {
    if (newSubTopicName.trim() && currentDomain) {
      onAddSubTopic(currentDomain.id, newSubTopicName.trim());
      setNewSubTopicName('');
      setIsAddingSubTopic(false);
    }
  };

  const handleSaveConcept = () => {
    if (newConceptName.trim() && currentDomain && currentSubTopic) {
      onAddConcept(currentDomain.id, currentSubTopic.id, newConceptName.trim());
      setNewConceptName('');
      setIsAddingConcept(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white dark:bg-slate-900 p-5 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm">
      {/* Domain Column */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
            Domain
          </label>
        </div>
        <select
          value={selectedDomainId}
          onChange={(e) => onChangeDomain(e.target.value)}
          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 hover:border-slate-300 dark:hover:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-100 transition-all focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
          {domains.map((domain) => (
            <option key={domain.id} value={domain.id} className="dark:bg-slate-900 dark:text-slate-100">
              {domain.name}
            </option>
          ))}
        </select>

        {/* Inline Add Domain Form */}
        <div className="mt-1">
          {isAddingDomain ? (
            <div className="flex items-center gap-1.5 animate-fadeIn">
              <input
                type="text"
                value={newDomainName}
                onChange={(e) => setNewDomainName(e.target.value)}
                placeholder="New Domain..."
                className="flex-1 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveDomain();
                  if (e.key === 'Escape') {
                    setIsAddingDomain(false);
                    setNewDomainName('');
                  }
                }}
              />
              <button
                type="button"
                onClick={handleSaveDomain}
                className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingDomain(false);
                  setNewDomainName('');
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-350 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddingDomain(true)}
              className="flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors py-1 px-2 rounded-md hover:bg-blue-50/50 dark:hover:bg-blue-900/20 w-fit"
            >
              <Plus className="w-3 h-3" />
              <span>Add Domain</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-Topic Column */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
            Sub-Topic
          </label>
        </div>
        <select
          value={selectedSubTopicId}
          onChange={(e) => onChangeSubTopic(e.target.value)}
          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 hover:border-slate-300 dark:hover:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-100 transition-all focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
          {subTopics.map((topic) => (
            <option key={topic.id} value={topic.id} className="dark:bg-slate-900 dark:text-slate-100">
              {topic.name}
            </option>
          ))}
        </select>

        {/* Inline Add Sub-Topic Form */}
        {currentDomain && (
          <div className="mt-1">
            {isAddingSubTopic ? (
              <div className="flex items-center gap-1.5 animate-fadeIn">
                <input
                  type="text"
                  value={newSubTopicName}
                  onChange={(e) => setNewSubTopicName(e.target.value)}
                  placeholder="New Sub-Topic..."
                  className="flex-1 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveSubTopic();
                    if (e.key === 'Escape') {
                      setIsAddingSubTopic(false);
                      setNewSubTopicName('');
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleSaveSubTopic}
                  className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingSubTopic(false);
                    setNewSubTopicName('');
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-350 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingSubTopic(true)}
                className="flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors py-1 px-2 rounded-md hover:bg-blue-50/50 dark:hover:bg-blue-900/20 w-fit"
              >
                <Plus className="w-3 h-3" />
                <span>Add Sub-Topic</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Concept Column */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
            Concept
          </label>
        </div>
        <select
          value={selectedConceptId}
          onChange={(e) => onChangeConcept(e.target.value)}
          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 hover:border-slate-300 dark:hover:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-100 transition-all focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
          {concepts.map((concept) => (
            <option key={concept.id} value={concept.id} className="dark:bg-slate-900 dark:text-slate-100">
              {concept.name}
            </option>
          ))}
        </select>

        {/* Inline Add Concept Form */}
        {currentDomain && currentSubTopic && (
          <div className="mt-1">
            {isAddingConcept ? (
              <div className="flex items-center gap-1.5 animate-fadeIn">
                <input
                  type="text"
                  value={newConceptName}
                  onChange={(e) => setNewConceptName(e.target.value)}
                  placeholder="New Concept..."
                  className="flex-1 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveConcept();
                    if (e.key === 'Escape') {
                      setIsAddingConcept(false);
                      setNewConceptName('');
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleSaveConcept}
                  className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingConcept(false);
                    setNewConceptName('');
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-350 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingConcept(true)}
                className="flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors py-1 px-2 rounded-md hover:bg-blue-50/50 dark:hover:bg-blue-900/20 w-fit"
              >
                <Plus className="w-3 h-3" />
                <span>Add Concept</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { Lock, Unlock, HelpCircle, Plus, X } from 'lucide-react';
import { Domain } from '@/lib/admin/types';

interface DomainSelectorsProps {
  domains: Domain[];
  selectedDomainId: string;
  selectedSubTopicId: string;
  selectedConceptId: string;
  onChangeDomain: (id: string) => void;
  onChangeSubTopic: (id: string) => void;
  onChangeConcept: (id: string) => void;

  // Batch lock toggles
  domainLocked: boolean;
  subTopicLocked: boolean;
  conceptLocked: boolean;
  onToggleDomainLock: () => void;
  onToggleSubTopicLock: () => void;
  onToggleConceptLock: () => void;

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
  domainLocked,
  subTopicLocked,
  conceptLocked,
  onToggleDomainLock,
  onToggleSubTopicLock,
  onToggleConceptLock,
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-5 border border-slate-200/80 rounded-xl shadow-sm">
      {/* Domain Column */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            Domain
            <HelpCircle className="w-3 h-3 text-slate-300 hover:text-slate-400 cursor-help" />
          </label>
          <button
            type="button"
            onClick={onToggleDomainLock}
            className={`flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded transition-all duration-100 ${
              domainLocked
                ? 'bg-blue-50 text-blue-600 border border-blue-200/50 font-bold'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            {domainLocked ? (
              <>
                <Lock className="w-2.5 h-2.5" /> Locked
              </>
            ) : (
              <>
                <Unlock className="w-2.5 h-2.5" /> Lock Batch
              </>
            )}
          </button>
        </div>
        <select
          value={selectedDomainId}
          disabled={domainLocked}
          onChange={(e) => onChangeDomain(e.target.value)}
          className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm text-slate-800 transition-all focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
            domainLocked ? 'opacity-60 cursor-not-allowed bg-slate-100 border-slate-200' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          {domains.map((domain) => (
            <option key={domain.id} value={domain.id}>
              {domain.name}
            </option>
          ))}
        </select>

        {/* Inline Add Domain Form */}
        {!domainLocked && (
          <div className="mt-1">
            {isAddingDomain ? (
              <div className="flex items-center gap-1.5 animate-fadeIn">
                <input
                  type="text"
                  value={newDomainName}
                  onChange={(e) => setNewDomainName(e.target.value)}
                  placeholder="New Domain..."
                  className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingDomain(true)}
                className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors py-1 px-2 rounded-md hover:bg-blue-50/50 w-fit"
              >
                <Plus className="w-3 h-3" />
                <span>Add Domain</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Sub-Topic Column */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            Sub-Topic
          </label>
          <button
            type="button"
            onClick={onToggleSubTopicLock}
            className={`flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded transition-all duration-100 ${
              subTopicLocked
                ? 'bg-blue-50 text-blue-600 border border-blue-200/50 font-bold'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            {subTopicLocked ? (
              <>
                <Lock className="w-2.5 h-2.5" /> Locked
              </>
            ) : (
              <>
                <Unlock className="w-2.5 h-2.5" /> Lock Batch
              </>
            )}
          </button>
        </div>
        <select
          value={selectedSubTopicId}
          disabled={subTopicLocked}
          onChange={(e) => onChangeSubTopic(e.target.value)}
          className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm text-slate-800 transition-all focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
            subTopicLocked ? 'opacity-60 cursor-not-allowed bg-slate-100 border-slate-200' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          {subTopics.map((topic) => (
            <option key={topic.id} value={topic.id}>
              {topic.name}
            </option>
          ))}
        </select>

        {/* Inline Add Sub-Topic Form */}
        {!subTopicLocked && currentDomain && (
          <div className="mt-1">
            {isAddingSubTopic ? (
              <div className="flex items-center gap-1.5 animate-fadeIn">
                <input
                  type="text"
                  value={newSubTopicName}
                  onChange={(e) => setNewSubTopicName(e.target.value)}
                  placeholder="New Sub-Topic..."
                  className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingSubTopic(true)}
                className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors py-1 px-2 rounded-md hover:bg-blue-50/50 w-fit"
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
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            Concept
          </label>
          <button
            type="button"
            onClick={onToggleConceptLock}
            className={`flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded transition-all duration-100 ${
              conceptLocked
                ? 'bg-blue-50 text-blue-600 border border-blue-200/50 font-bold'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            {conceptLocked ? (
              <>
                <Lock className="w-2.5 h-2.5" /> Locked
              </>
            ) : (
              <>
                <Unlock className="w-2.5 h-2.5" /> Lock Batch
              </>
            )}
          </button>
        </div>
        <select
          value={selectedConceptId}
          disabled={conceptLocked}
          onChange={(e) => onChangeConcept(e.target.value)}
          className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm text-slate-800 transition-all focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
            conceptLocked ? 'opacity-60 cursor-not-allowed bg-slate-100 border-slate-200' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          {concepts.map((concept) => (
            <option key={concept.id} value={concept.id}>
              {concept.name}
            </option>
          ))}
        </select>

        {/* Inline Add Concept Form */}
        {!conceptLocked && currentDomain && currentSubTopic && (
          <div className="mt-1">
            {isAddingConcept ? (
              <div className="flex items-center gap-1.5 animate-fadeIn">
                <input
                  type="text"
                  value={newConceptName}
                  onChange={(e) => setNewConceptName(e.target.value)}
                  placeholder="New Concept..."
                  className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingConcept(true)}
                className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors py-1 px-2 rounded-md hover:bg-blue-50/50 w-fit"
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

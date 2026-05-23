'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, XCircle, ArrowRight, Database, Eye, Award } from 'lucide-react';

// Import Custom Components
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import DomainSelectors from '@/components/admin/DomainSelectors';
import MetaSelectors from '@/components/admin/MetaSelectors';
import ResponseMatrix from '@/components/admin/ResponseMatrix';
import ContentEditor from '@/components/admin/ContentEditor';
import LivePreview from '@/components/admin/LivePreview';

// Import Static Stores & Types
import { DOMAINS_DATA, USER_ROLES, SAMPLE_QUESTIONS } from '@/lib/admin/store';
import { UserRole, Difficulty, ResponseOption, Question, Domain } from '@/lib/admin/types';

// Slugify helper for generating unique IDs for new domains, sub-topics, and concepts
const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

export default function AdminContentCreator() {
  // Navigation & Role states
  const [activeTab, setActiveTab] = useState<string>('content');
  const [currentRole, setCurrentRole] = useState<UserRole>(USER_ROLES[0]); // Default: Admin

  // Dynamic Domains Registry State
  const [domains, setDomains] = useState<Domain[]>(DOMAINS_DATA);

  // Question metadata selectors
  const [domainId, setDomainId] = useState<string>('quant');
  const [subTopicId, setSubTopicId] = useState<string>('arithmetic');
  const [conceptId, setConceptId] = useState<string>('percentages');

  // Selector lock states (Batch uploads)
  const [domainLocked, setDomainLocked] = useState<boolean>(false);
  const [subTopicLocked, setSubTopicLocked] = useState<boolean>(false);
  const [conceptLocked, setConceptLocked] = useState<boolean>(false);

  // Core metadata
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
  const [companyTags, setCompanyTags] = useState<string[]>(['TCS', 'Infosys', 'Amazon']);
  const [shuffleOptions, setShuffleOptions] = useState<boolean>(true);

  // Text inputs & walkthrough details
  const [questionStem, setQuestionStem] = useState<string>('');
  const [hintText, setHintText] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoTitle, setVideoTitle] = useState<string>('');
  const [videoDuration, setVideoDuration] = useState<string>('');
  const [videoThumbnail, setVideoThumbnail] = useState<string>('');
  
  // Option matrix states
  const [options, setOptions] = useState<ResponseOption[]>([
    { id: 'A', text: '', isCorrect: true, metadata: '' },
    { id: 'B', text: '', isCorrect: false, metadata: '' },
    { id: 'C', text: '', isCorrect: false, metadata: '' },
    { id: 'D', text: '', isCorrect: false, metadata: '' }
  ]);

  // AI Assist sample cycle state
  const [sampleIndex, setSampleIndex] = useState<number>(0);

  // Action notification banners & modal overlays
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [showPublishModal, setShowPublishModal] = useState<boolean>(false);

  // Initialize with the first sample question on initial load
  useEffect(() => {
    loadQuestionTemplate(SAMPLE_QUESTIONS[0]);
  }, []);

  // Timer to clear alert banners
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Load a complete Question schema template
  const loadQuestionTemplate = (q: Question) => {
    if (!domainLocked) setDomainId(q.domainId);
    if (!subTopicLocked) setSubTopicId(q.subTopicId);
    if (!conceptLocked) setConceptId(q.conceptId);
    
    setDifficulty(q.difficulty);
    setCompanyTags(q.companyTags);
    setShuffleOptions(q.shuffleOptions);
    setQuestionStem(q.questionStem);
    setHintText(q.hintText);
    setVideoUrl(q.videoUrl);
    setVideoTitle(q.videoTitle || 'Walkthrough Tutorial');
    setVideoDuration(q.videoDuration || '12:00');
    setVideoThumbnail(q.videoThumbnail || '');
    setOptions(JSON.parse(JSON.stringify(q.options))); // deep copy
  };

  // State synchronization handlers to keep active selections aligned
  const handleDomainChange = (newId: string) => {
    setDomainId(newId);
    const targetDomain = domains.find((d) => d.id === newId);
    if (targetDomain && targetDomain.subTopics.length > 0) {
      const firstSub = targetDomain.subTopics[0];
      setSubTopicId(firstSub.id);
      if (firstSub.concepts.length > 0) {
        setConceptId(firstSub.concepts[0].id);
      } else {
        setConceptId('');
      }
    } else {
      setSubTopicId('');
      setConceptId('');
    }
  };

  const handleSubTopicChange = (newId: string) => {
    setSubTopicId(newId);
    const targetDomain = domains.find((d) => d.id === domainId);
    const targetSub = targetDomain?.subTopics.find((s) => s.id === newId);
    if (targetSub && targetSub.concepts.length > 0) {
      setConceptId(targetSub.concepts[0].id);
    } else {
      setConceptId('');
    }
  };

  // Add custom Domain, Sub-Topic, and Concept creators
  const handleAddDomain = (name: string) => {
    const id = slugify(name);
    if (domains.some((d) => d.id === id)) {
      setNotification({
        message: `Validation Error: Domain "${name}" already exists.`,
        type: 'info'
      });
      return;
    }
    const newDomain: Domain = {
      id,
      name,
      subTopics: []
    };
    setDomains([...domains, newDomain]);
    setDomainId(id);
    setSubTopicId('');
    setConceptId('');
    setNotification({
      message: `Success: Added custom domain "${name}".`,
      type: 'success'
    });
  };

  const handleAddSubTopic = (dId: string, name: string) => {
    const id = slugify(name);
    let subTopicExists = false;
    
    const updatedDomains = domains.map((d) => {
      if (d.id === dId) {
        if (d.subTopics.some((s) => s.id === id)) {
          subTopicExists = true;
          return d;
        }
        return {
          ...d,
          subTopics: [...d.subTopics, { id, name, concepts: [] }]
        };
      }
      return d;
    });

    if (subTopicExists) {
      setNotification({
        message: `Validation Error: Sub-topic "${name}" already exists in this domain.`,
        type: 'info'
      });
      return;
    }

    setDomains(updatedDomains);
    setSubTopicId(id);
    setConceptId('');
    setNotification({
      message: `Success: Added custom sub-topic "${name}".`,
      type: 'success'
    });
  };

  const handleAddConcept = (dId: string, sId: string, name: string) => {
    const id = slugify(name);
    let conceptExists = false;

    const updatedDomains = domains.map((d) => {
      if (d.id === dId) {
        return {
          ...d,
          subTopics: d.subTopics.map((s) => {
            if (s.id === sId) {
              if (s.concepts.some((c) => c.id === id)) {
                conceptExists = true;
                return s;
              }
              return {
                ...s,
                concepts: [...s.concepts, { id, name }]
              };
            }
            return s;
          })
        };
      }
      return d;
    });

    if (conceptExists) {
      setNotification({
        message: `Validation Error: Concept "${name}" already exists in this sub-topic.`,
        type: 'info'
      });
      return;
    }

    setDomains(updatedDomains);
    setConceptId(id);
    setNotification({
      message: `Success: Added custom concept "${name}".`,
      type: 'success'
    });
  };

  // Tag list Handlers
  const handleAddTag = (tag: string) => {
    setCompanyTags([...companyTags, tag]);
  };

  const handleRemoveTag = (tag: string) => {
    setCompanyTags(companyTags.filter((t) => t !== tag));
  };

  // Option grid text updates
  const handleOptionTextChange = (id: string, text: string) => {
    setOptions(
      options.map((opt) => (opt.id === id ? { ...opt, text } : opt))
    );
  };

  // Option grid metadata updates
  const handleOptionMetadataChange = (id: string, metadata: string) => {
    setOptions(
      options.map((opt) => (opt.id === id ? { ...opt, metadata } : opt))
    );
  };

  // Option grid correct answer toggle
  const handleSetCorrectOption = (id: string) => {
    setOptions(
      options.map((opt) => ({
        ...opt,
        isCorrect: opt.id === id
      }))
    );
  };

  // Real-time Schema Validation (Rules resembling Zod schema validation)
  const getValidationErrors = (): string[] => {
    const errors: string[] = [];

    // Rule 1: Question Stem length
    if (questionStem.trim().length < 15) {
      errors.push('Question stem content must contain at least 15 characters.');
    }

    // Rule 2: Exactly one correct option
    const correctCount = options.filter((o) => o.isCorrect).length;
    if (correctCount !== 1) {
      errors.push('Exactly one response option must be designated as CORRECT.');
    }

    // Rule 3: Option text completeness
    const emptyOptions = options.filter((o) => o.text.trim().length === 0);
    if (emptyOptions.length > 0) {
      errors.push(`Response options (${emptyOptions.map((o) => o.id).join(', ')}) cannot be empty.`);
    }

    // Rule 4: Video reference validation
    if (videoUrl.trim() && !videoUrl.includes('youtube.com') && !videoUrl.includes('youtu.be')) {
      errors.push('Walkthrough video URL must be a valid YouTube link.');
    }

    // Role-based workflow warning
    if (currentRole.role === 'reviewer') {
      errors.push('Role limitation: Reviewers have read-only clearance. Publication is dry-run only.');
    }

    return errors;
  };

  const validationErrors = getValidationErrors();
  const isValid = validationErrors.length === 0;

  // Save Draft Action handler
  const handleSaveDraft = () => {
    setNotification({
      message: 'Draft Saved: Aptitude question schema cached in local sandbox storage.',
      type: 'info'
    });
  };

  // Publish Question Action handler
  const handlePublish = () => {
    if (!isValid) return;
    setShowPublishModal(true);
  };

  // Resolve active metadata descriptions
  const activeDomainName = domains.find((d) => d.id === domainId)?.name || 'Quantitative Aptitude';

  return (
    <div className="flex h-screen bg-slate-100 font-sans overflow-hidden antialiased">
      {/* 1. Left Navigation Sidebar */}
      <Sidebar activeId={activeTab} onSelectTab={setActiveTab} />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* 2. Top Utility & Role Selection Header */}
        <Header currentRole={currentRole} onRoleChange={setCurrentRole} />

        {/* Transient banner updates */}
        {notification && (
          <div className="absolute top-20 right-8 z-50 animate-slideIn">
            <div className={`px-4.5 py-3.5 rounded-xl border shadow-lg flex items-center gap-3 max-w-md ${
              notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}>
              <CheckCircle2 className={`w-5 h-5 shrink-0 ${notification.type === 'success' ? 'text-emerald-600' : 'text-blue-600'}`} />
              <span className="text-xs font-semibold tracking-tight leading-normal">
                {notification.message}
              </span>
            </div>
          </div>
        )}

        {/* Tab check to guarantee admin navigation workflow */}
        {activeTab !== 'content' ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50/50">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-4 border border-slate-200">
              <Database className="w-6 h-6 text-slate-400" />
            </div>
            <h2 className="text-base font-bold text-slate-800 tracking-tight">Enterprise Navigation Mock</h2>
            <p className="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed font-medium">
              You clicked the <strong>{activeTab.toUpperCase()}</strong> panel. The Aptitude Admin workspace contains fully isolated dashboards. Click <strong>Content Management</strong> on the sidebar to return to the interactive Dynamic Content Creator workspace.
            </p>
            <button
              onClick={() => setActiveTab('content')}
              className="mt-4 flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 underline"
            >
              Go to Content Creator <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* 3. The Interactive content creator layout space */
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            
            {/* Top Title Workspace Indicator */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dynamic Content Creator</h1>
                <p className="text-xs font-medium text-slate-500 mt-1">
                  Synthesize and validate mathematical stems, markdown solutions, and multi-choice response matrices.
                </p>
              </div>

              {/* Role Indicator badge */}
              <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 border border-slate-200 rounded-lg shadow-sm w-fit self-start">
                <Award className="w-4 h-4 text-blue-600 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                  Credentials:
                </span>
                <span className="text-xs font-bold text-slate-800 capitalize">
                  {currentRole.role} Access
                </span>
              </div>
            </div>

            {/* A. Domain Selection Grid */}
            <DomainSelectors
              domains={domains}
              selectedDomainId={domainId}
              selectedSubTopicId={subTopicId}
              selectedConceptId={conceptId}
              onChangeDomain={handleDomainChange}
              onChangeSubTopic={handleSubTopicChange}
              onChangeConcept={setConceptId}
              domainLocked={domainLocked}
              subTopicLocked={subTopicLocked}
              conceptLocked={conceptLocked}
              onToggleDomainLock={() => setDomainLocked(!domainLocked)}
              onToggleSubTopicLock={() => setSubTopicLocked(!subTopicLocked)}
              onToggleConceptLock={() => setConceptLocked(!conceptLocked)}
              onAddDomain={handleAddDomain}
              onAddSubTopic={handleAddSubTopic}
              onAddConcept={handleAddConcept}
            />

            {/* B. Two Column Layout Grid (Selectors, Editor, and Preview) */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
              
              {/* Left Column: Selectors, Matrix & Text Editor */}
              <div className="space-y-6 flex flex-col">
                <div className="grid grid-cols-1 gap-6">
                  {/* Metadata Filters (Difficulty & Tags) */}
                  <MetaSelectors
                    difficulty={difficulty}
                    onChangeDifficulty={setDifficulty}
                    selectedTags={companyTags}
                    onAddTag={handleAddTag}
                    onRemoveTag={handleRemoveTag}
                  />

                  {/* Choice Response Grid */}
                  <ResponseMatrix
                    options={options}
                    shuffleOptions={shuffleOptions}
                    onChangeOptionText={handleOptionTextChange}
                    onChangeOptionMetadata={handleOptionMetadataChange}
                    onSetCorrectOption={handleSetCorrectOption}
                    onToggleShuffle={() => setShuffleOptions(!shuffleOptions)}
                  />
                </div>

                {/* Form Input fields */}
                <ContentEditor
                  questionStem={questionStem}
                  hintText={hintText}
                  videoUrl={videoUrl}
                  onChangeQuestionStem={setQuestionStem}
                  onChangeHintText={setHintText}
                  onChangeVideoUrl={setVideoUrl}
                  onSaveDraft={handleSaveDraft}
                  onPublish={handlePublish}
                  isValid={isValid}
                  validationErrors={validationErrors}
                />
              </div>

              {/* Right Column: Dynamic Live Preview Render Panel */}
              <div className="xl:sticky xl:top-8 h-[calc(100vh-10rem)] min-h-[500px]">
                <LivePreview
                  questionStem={questionStem}
                  hintText={hintText}
                  options={options}
                  difficulty={difficulty}
                  domainName={activeDomainName}
                  questionId={SAMPLE_QUESTIONS[sampleIndex]?.id || 'Q-8829-X'}
                  videoUrl={videoUrl}
                  videoTitle={videoTitle}
                  videoDuration={videoDuration}
                  videoThumbnail={videoThumbnail}
                />
              </div>

            </div>
          </div>
        )}
      </div>

      {/* 4. Publication Detail Confirmation Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-scaleUp">
            
            {/* Modal Brand Banner */}
            <div className="p-6 bg-blue-600 text-white flex items-center gap-4.5">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-100">
                  Transaction Registry
                </span>
                <span className="text-lg font-black tracking-tight">Question Published Successfully</span>
              </div>
            </div>

            {/* Modal Body Info */}
            <div className="p-6 space-y-5">
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                The structured aptitude question has been thoroughly validated, compiled against the core schema, and uploaded to the production content registry database.
              </p>

              {/* Compiled Question Specs Checklist */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Compiled Question Schema
                </span>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex flex-col">
                    <span className="text-slate-400 font-semibold text-[10px]">REGISTRY ID</span>
                    <span className="text-slate-800 font-bold font-mono">
                      {SAMPLE_QUESTIONS[sampleIndex]?.id || 'Q-8829-X'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-400 font-semibold text-[10px]">DOMAIN</span>
                    <span className="text-slate-800 font-bold truncate">{activeDomainName}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-400 font-semibold text-[10px]">DIFFICULTY</span>
                    <span className="text-slate-800 font-bold">{difficulty}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-400 font-semibold text-[10px]">TARGET TARGETS</span>
                    <span className="text-slate-800 font-bold truncate">
                      {companyTags.join(', ') || 'General'}
                    </span>
                  </div>
                  <div className="flex flex-col col-span-2">
                    <span className="text-slate-400 font-semibold text-[10px]">RESPONSE MATRIX OPTIONS</span>
                    <span className="text-slate-800 font-bold">
                      {options.length} Choices / Correct Option: {options.find((o) => o.isCorrect)?.id}
                    </span>
                  </div>
                </div>
              </div>

              {/* Access notification */}
              {currentRole.role === 'reviewer' ? (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-start gap-2.5">
                  <ShieldAlert className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-amber-800 font-semibold leading-relaxed">
                    Dry Run: Since your credentials are set to **Reviewer**, this question has not written persistent database storage rows.
                  </span>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-start gap-2.5">
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-emerald-800 font-semibold leading-relaxed">
                    Production sync: Successfully distributed into institutional student cohorts.
                  </span>
                </div>
              )}
            </div>

            {/* Modal Close CTA */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-md active:scale-98 cursor-pointer"
              >
                Close Registry
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

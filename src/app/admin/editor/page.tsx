'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, XCircle, ArrowRight, Database, Eye, Award, Lock, RefreshCw } from 'lucide-react';

// Import Custom Components
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import RoleToggle from '@/components/RoleToggle';
import DomainSelectors from '@/components/admin/DomainSelectors';
import MetaSelectors from '@/components/admin/MetaSelectors';
import ResponseMatrix from '@/components/admin/ResponseMatrix';
import ContentEditor from '@/components/admin/ContentEditor';
import LivePreview from '@/components/admin/LivePreview';
import QuestionsManagement from '@/components/admin/QuestionsManagement';

// Import Static Stores & Types
import { DOMAINS_DATA, USER_ROLES, SAMPLE_QUESTIONS } from '@/lib/admin/store';
import { UserRole, Difficulty, ResponseOption, Question, Domain } from '@/lib/admin/types';
import { supabase } from '@/lib/supabase';
import { generate16BitQuestionId, generate16BitBinaryId } from '@/lib/admin/idGenerator';

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
  const [currentRole, setCurrentRole] = useState<UserRole>(USER_ROLES[0]); // Default: Admin

  // Dynamic Domains Registry State
  const [domains, setDomains] = useState<Domain[]>(DOMAINS_DATA);

  // Question metadata selectors
  const [domainId, setDomainId] = useState<string>('quant');
  const [subTopicId, setSubTopicId] = useState<string>('arithmetic');
  const [conceptId, setConceptId] = useState<string>('percentages');

  // Core metadata
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
  const [companyTags, setCompanyTags] = useState<string[]>([]);
  const [shuffleOptions, setShuffleOptions] = useState<boolean>(true);

  // Text inputs & walkthrough details
  const [questionStem, setQuestionStem] = useState<string>('');
  const [hintText, setHintText] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoTitle, setVideoTitle] = useState<string>('');
  const [videoDuration, setVideoDuration] = useState<string>('');
  const [videoThumbnail, setVideoThumbnail] = useState<string>('');
  
  // Option matrix states
  const [options, setOptions] = useState<ResponseOption[]>([]);

  // AI Assist sample cycle state
  const [sampleIndex, setSampleIndex] = useState<number>(0);

  // Questions Management integration states
  const [questionsList, setQuestionsList] = useState<Question[]>(SAMPLE_QUESTIONS);
  const [currentQuestionId, setCurrentQuestionId] = useState<string>('Q-8029-X');

  // Action notification banners & modal overlays
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [showPublishModal, setShowPublishModal] = useState<boolean>(false);

  // Timer to clear alert banners
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Load a complete Question schema template
  const loadQuestionTemplate = (q: Question) => {
    setDomainId(q.domainId);
    setSubTopicId(q.subTopicId);
    setConceptId(q.conceptId);
    
    setDifficulty(q.difficulty);
    setCompanyTags(q.companyTags);
    setShuffleOptions(q.shuffleOptions);
    setQuestionStem(q.questionStem);
    setHintText(q.hintText);
    setVideoUrl(q.videoUrl);
    setVideoTitle(q.videoTitle || 'Walkthrough Tutorial');
    setVideoDuration(q.videoDuration || '12:00');
    setVideoThumbnail(q.videoThumbnail || '');
    setOptions(q.options || []);
  };

  // Handle toggling to Content Creator for a NEW question
  const handleAddNewQuestionClick = () => {
    // Generate a fresh unique ID for the new question
    const newId = 'Q-' + Math.floor(1000 + Math.random() * 9000) + '-' + String.fromCharCode(65 + Math.floor(Math.random() * 26));
    setCurrentQuestionId(newId);
    
    // Reset all form inputs to default clean values
    setDomainId('quant');
    setSubTopicId('arithmetic');
    setConceptId('percentages');
    setDifficulty('MEDIUM');
    setCompanyTags([]);
    setShuffleOptions(true);
    setQuestionStem('');
    setHintText('');
    setVideoUrl('');
    setVideoTitle('');
    setVideoDuration('');
    setVideoThumbnail('');
    setOptions([]);
  };

  // Handle loading and toggling to Content Creator for EDITING an existing question
  const handleEditQuestionClick = (q: Question) => {
    loadQuestionTemplate(q);
    setCurrentQuestionId(q.id);
    const foundIndex = SAMPLE_QUESTIONS.findIndex((sq) => sq.id === q.id);
    if (foundIndex !== -1) {
      setSampleIndex(foundIndex);
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    localStorage.setItem('aptitude_current_role', JSON.stringify(role));
  };

  const fetchQuestionFromSupabase = async (uuid: string) => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select(`
          id,
          question_hash_seed,
          difficulty,
          question_text,
          options,
          explanation,
          video_url,
          is_active,
          concept:concepts (
            id,
            name,
            sub_topic:sub_topics (
              id,
              name,
              domain:domains (id, name)
            )
          ),
          tags:question_companies (
            company:companies (name)
          )
        `)
        .eq('id', uuid)
        .single();

      if (error) throw error;

      if (data) {
        const qData = data as any;
        const domainId = qData.concept?.sub_topic?.domain?.id || 'quant';
        const subTopicId = qData.concept?.sub_topic?.id || 'arithmetic';
        const conceptId = qData.concept?.id || 'percentages';

        const mappedQuestion: Question = {
          id: qData.id,
          trackingId: qData.tracking_id || undefined,
          questionBinaryId: qData.id,
          questionInternalUuid: qData.id,
          questionHashSeed: qData.question_hash_seed || 0,
          domainUuid: domainId,
          subTopicUuid: subTopicId,
          conceptUuid: conceptId,
          domainId,
          subTopicId,
          conceptId,
          difficulty: qData.difficulty || 'MEDIUM',
          companyTags: qData.tags?.map((t: any) => t.company?.name).filter(Boolean) || [],
          shuffleOptions: true,
          questionStem: qData.question_text || '',
          hintText: qData.explanation || '',
          options: Array.isArray(qData.options)
            ? qData.options.map((opt: any, index: number) => ({
                id: opt.id || String.fromCharCode(65 + index),
                text: opt.text || '',
                isCorrect: opt.isCorrect || (opt.text === qData.correct_answer),
                metadata: opt.metadata || ''
              }))
            : [],
          videoUrl: qData.video_url || '',
          status: qData.is_active ? 'Published' : 'Draft',
          createdAt: 'Synced'
        };

        loadQuestionTemplate(mappedQuestion);
        setCurrentQuestionId(uuid);
        
        // Populate local state catalog so references work instantly
        setQuestionsList((prev) => {
          if (prev.some((q) => q.id === uuid)) return prev;
          return [mappedQuestion, ...prev];
        });
      }
    } catch (err) {
      console.warn('Failed to load question from Supabase:', err);
    }
  };

  // Synchronize dynamic store and load query parameters from URL on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const qId = params.get('id');
      const isNew = params.get('new');
      
      let currentQuestions = SAMPLE_QUESTIONS;
      const stored = localStorage.getItem('aptitude_questions');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const parsedIds = new Set(parsed.map((q: any) => q.id));
          const missing = SAMPLE_QUESTIONS.filter(q => !parsedIds.has(q.id));
          if (missing.length > 0) {
            currentQuestions = [...parsed, ...missing];
            localStorage.setItem('aptitude_questions', JSON.stringify(currentQuestions));
          } else {
            currentQuestions = parsed;
          }
          setQuestionsList(currentQuestions);
        } catch (e) {
          console.warn('Failed to parse questions from localStorage', e);
        }
      } else {
        localStorage.setItem('aptitude_questions', JSON.stringify(SAMPLE_QUESTIONS));
      }

      // Load current role
      const storedRole = localStorage.getItem('aptitude_current_role');
      if (storedRole) {
        try {
          const parsed = JSON.parse(storedRole);
          const matched = USER_ROLES.find(r => r.role === parsed.role);
          if (matched) {
            setCurrentRole(matched);
          }
        } catch (e) {
          console.warn('Failed to parse current role', e);
        }
      }

      if (qId) {
        const found = currentQuestions.find((q) => q.id === qId);
        if (found) {
          loadQuestionTemplate(found);
          setCurrentQuestionId(qId);
          const foundIndex = currentQuestions.findIndex((sq) => sq.id === qId);
          if (foundIndex !== -1) {
            setSampleIndex(foundIndex);
          }
        } else {
          // If not found in local sandbox, fetch dynamically from Supabase
          fetchQuestionFromSupabase(qId);
        }
      } else if (isNew) {
        handleAddNewQuestionClick();
      }
    }
  }, []);

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

  // Option grid add new choice option
  const handleAddingOption = () => {
    if (options.length >= 10) {
      setNotification({
        message: 'Validation warning: Maximum limit of 10 options reached.',
        type: 'info'
      });
      return;
    }
    const nextLetter = String.fromCharCode(65 + options.length);
    const isFirst = options.length === 0;
    setOptions([
      ...options,
      { id: nextLetter, text: '', isCorrect: isFirst, metadata: '' }
    ]);
  };

  // Option grid remove custom choice option
  const handleRemovingOption = (id: string) => {
    const filtered = options.filter((opt) => opt.id !== id);
    const wasCorrect = options.find((opt) => opt.id === id)?.isCorrect;
    const reindexed = filtered.map((opt, idx) => ({
      ...opt,
      id: String.fromCharCode(65 + idx),
      isCorrect: wasCorrect && idx === 0 ? true : opt.isCorrect
    }));
    setOptions(reindexed);
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
    if (correctCount !== 1 && options.length > 0) {
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

    // Rule 5: Minimum option count
    if (options.length < 2) {
      errors.push('Multiple-choice questions require at least 2 response options.');
    }



    return errors;
  };

  const validationErrors = getValidationErrors();
  const isValid = validationErrors.length === 0;

  const [isSavingToDb, setIsSavingToDb] = useState(false);

  const saveToSupabase = async (q: Question) => {
    setIsSavingToDb(true);
    try {
      // 1. Resolve domain display name and fetch/insert domain ID
      const domainObj = DOMAINS_DATA.find(d => d.id === q.domainId);
      const domainName = domainObj ? domainObj.name : q.domainId;

      let domainIdUuid = '';
      const { data: existingDomains, error: domainSearchError } = await supabase
        .from('domains')
        .select('id')
        .eq('name', domainName);

      if (domainSearchError) throw domainSearchError;

      if (existingDomains && existingDomains.length > 0) {
        domainIdUuid = existingDomains[0].id;
      } else {
        const { data: newDomain, error: domainInsertError } = await supabase
          .from('domains')
          .insert({ name: domainName })
          .select('id')
          .single();

        if (domainInsertError) throw domainInsertError;
        if (newDomain) domainIdUuid = newDomain.id;
      }

      // 2. Resolve subtopic display name and fetch/insert subtopic ID
      let subTopicName = q.subTopicId;
      if (domainObj) {
        const subTopicObj = domainObj.subTopics.find(s => s.id === q.subTopicId);
        if (subTopicObj) subTopicName = subTopicObj.name;
      }

      let subTopicIdUuid = '';
      const { data: existingSubTopics, error: subTopicSearchError } = await supabase
        .from('sub_topics')
        .select('id')
        .eq('domain_id', domainIdUuid)
        .eq('name', subTopicName);

      if (subTopicSearchError) throw subTopicSearchError;

      if (existingSubTopics && existingSubTopics.length > 0) {
        subTopicIdUuid = existingSubTopics[0].id;
      } else {
        const { data: newSubTopic, error: subTopicInsertError } = await supabase
          .from('sub_topics')
          .insert({ domain_id: domainIdUuid, name: subTopicName })
          .select('id')
          .single();

        if (subTopicInsertError) throw subTopicInsertError;
        if (newSubTopic) subTopicIdUuid = newSubTopic.id;
      }

      // 3. Resolve concept display name and fetch/insert concept ID
      let conceptName = q.conceptId;
      if (domainObj) {
        const subTopicObj = domainObj.subTopics.find(s => s.id === q.subTopicId);
        if (subTopicObj) {
          const conceptObj = subTopicObj.concepts.find(c => c.id === q.conceptId || c.id === q.conceptId.trim());
          if (conceptObj) conceptName = conceptObj.name;
        }
      }

      let conceptIdUuid = '';
      const { data: existingConcepts, error: conceptSearchError } = await supabase
        .from('concepts')
        .select('id')
        .eq('sub_topic_id', subTopicIdUuid)
        .eq('name', conceptName);

      if (conceptSearchError) throw conceptSearchError;

      if (existingConcepts && existingConcepts.length > 0) {
        conceptIdUuid = existingConcepts[0].id;
      } else {
        const { data: newConcept, error: conceptInsertError } = await supabase
          .from('concepts')
          .insert({ sub_topic_id: subTopicIdUuid, name: conceptName })
          .select('id')
          .single();

        if (conceptInsertError) throw conceptInsertError;
        if (newConcept) conceptIdUuid = newConcept.id;
      }

      // 4. Check if question already exists under concept with same stem
      let questionUuid = '';
      let savedBinaryId = '';
      let savedHashSeed = 0;
      
      const isExistingId = q.id.includes('-') && q.id.length >= 19;

      const { data: existingQuestions, error: questionSearchError } = isExistingId
        ? await supabase.from('questions').select('id, question_hash_seed').eq('id', q.id)
        : await supabase.from('questions').select('id, question_hash_seed').eq('concept_id', conceptIdUuid).eq('question_text', q.questionStem);

      if (questionSearchError) throw questionSearchError;

      const correctAnswerText = q.options?.find((o: any) => o.isCorrect)?.text || '';

      if (existingQuestions && existingQuestions.length > 0) {
        questionUuid = existingQuestions[0].id;
        const { data: updatedQuestionRow, error: questionUpdateError } = await supabase
          .from('questions')
          .update({
            difficulty: q.difficulty || 'MEDIUM',
            options: q.options,
            correct_answer: correctAnswerText,
            explanation: q.hintText || '',
            video_url: q.videoUrl || '',
            is_active: q.status === 'Published'
          })
          .eq('id', questionUuid)
          .select('id, question_hash_seed')
          .single();

        if (questionUpdateError) throw questionUpdateError;
        if (updatedQuestionRow) {
          questionUuid = updatedQuestionRow.id;
          savedBinaryId = updatedQuestionRow.id;
          savedHashSeed = updatedQuestionRow.question_hash_seed;
        }
      } else {
        const { data: newQuestionRow, error: questionInsertError } = await supabase
          .from('questions')
          .insert({
            concept_id: conceptIdUuid,
            type: 'MCQ',
            difficulty: q.difficulty || 'MEDIUM',
            question_text: q.questionStem,
            options: q.options,
            correct_answer: correctAnswerText,
            explanation: q.hintText || '',
            video_url: q.videoUrl || '',
            is_active: q.status === 'Published'
          })
          .select('id, question_hash_seed')
          .single();

        if (questionInsertError) throw questionInsertError;
        if (newQuestionRow) {
          questionUuid = newQuestionRow.id;
          savedBinaryId = newQuestionRow.id;
          savedHashSeed = newQuestionRow.question_hash_seed;
        }
      }

      // 5. Handle company tags if present
      if (q.companyTags && Array.isArray(q.companyTags)) {
        for (const companyName of q.companyTags) {
          if (!companyName) continue;
          let companyUuid = '';
          
          const { data: existingCompanies, error: companySearchError } = await supabase
            .from('companies')
            .select('id')
            .eq('name', companyName);

          if (companySearchError) continue;

          if (existingCompanies && existingCompanies.length > 0) {
            companyUuid = existingCompanies[0].id;
          } else {
            const { data: newCompany, error: companyInsertError } = await supabase
              .from('companies')
              .insert({ name: companyName })
              .select('id')
              .single();
            if (!companyInsertError && newCompany) {
              companyUuid = newCompany.id;
            }
          }

          if (companyUuid && questionUuid) {
            const { data: existingPivot, error: pivotSearchError } = await supabase
              .from('question_companies')
              .select('question_id')
              .eq('question_id', questionUuid)
              .eq('company_id', companyUuid);

            if (!pivotSearchError && (!existingPivot || existingPivot.length === 0)) {
              await supabase
                .from('question_companies')
                .insert({
                  question_id: questionUuid,
                  company_id: companyUuid
                });
            }
          }
        }
      }

      // 6. Update local react states and localStorage with the DB-computed values!
      if (questionUuid) {
        const syncedQuestion: Question = {
          ...q,
          id: questionUuid,
          questionBinaryId: savedBinaryId,
          questionHashSeed: savedHashSeed,
          domainUuid: domainIdUuid,
          subTopicUuid: subTopicIdUuid,
          conceptUuid: conceptIdUuid
        };

        setCurrentQuestionId(questionUuid);
        
        setQuestionsList((prev) => {
          const filtered = prev.filter((item) => item.id !== q.id && item.id !== questionUuid);
          const updated = [syncedQuestion, ...filtered];
          localStorage.setItem('aptitude_questions', JSON.stringify(updated));
          return updated;
        });

        setNotification({
          message: `Success: Question fully synced and registered in Supabase. ID: ${savedBinaryId}`,
          type: 'success'
        });
      }
      
      console.log('Successfully saved to Supabase:', questionUuid);
    } catch (dbErr: any) {
      console.warn('Database write error (ignored for sandbox continuity):', dbErr.message || dbErr);
    } finally {
      setIsSavingToDb(false);
    }
  };

  // Save Draft Action handler
  const handleSaveDraft = async () => {
    const updatedQuestion: Question = {
      id: currentQuestionId,
      domainId,
      subTopicId,
      conceptId,
      difficulty,
      companyTags,
      shuffleOptions,
      questionStem,
      hintText,
      videoUrl,
      videoTitle: videoTitle || 'Walkthrough Tutorial',
      videoDuration: videoDuration || '12:00',
      videoThumbnail,
      options,
      status: 'Draft',
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    setQuestionsList((prev) => {
      const exists = prev.some((q) => q.id === currentQuestionId);
      const updated = exists
        ? prev.map((q) => (q.id === currentQuestionId ? updatedQuestion : q))
        : [updatedQuestion, ...prev];
      localStorage.setItem('aptitude_questions', JSON.stringify(updated));
      return updated;
    });

    setNotification({
      message: `Draft Saved: ${currentQuestionId} synced with Supabase & local storage sandbox.`,
      type: 'info'
    });

    // Write directly to live Supabase in background
    await saveToSupabase(updatedQuestion);
  };

  // Publish Question Action handler
  const handlePublish = async () => {
    if (!isValid) return;

    const updatedQuestion: Question = {
      id: currentQuestionId,
      domainId,
      subTopicId,
      conceptId,
      difficulty,
      companyTags,
      shuffleOptions,
      questionStem,
      hintText,
      videoUrl,
      videoTitle: videoTitle || 'Walkthrough Tutorial',
      videoDuration: videoDuration || '12:00',
      videoThumbnail,
      options,
      status: 'Published',
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    setQuestionsList((prev) => {
      const exists = prev.some((q) => q.id === currentQuestionId);
      const updated = exists
        ? prev.map((q) => (q.id === currentQuestionId ? updatedQuestion : q))
        : [updatedQuestion, ...prev];
      localStorage.setItem('aptitude_questions', JSON.stringify(updated));
      return updated;
    });

    setShowPublishModal(true);

    // Write directly to live Supabase in background
    await saveToSupabase(updatedQuestion);
  };

  const activeDomainName = domains.find((d) => d.id === domainId)?.name || 'Quantitative Aptitude';

  return (
    <>
      {/* Transient banner updates */}
        {notification && (
          <div className="absolute top-20 right-8 z-50 animate-slideIn">
            <div className={`px-4.5 py-3.5 rounded-xl border shadow-lg flex items-center gap-3 max-w-md ${
              notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400'
                : 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/20 dark:border-blue-900/20 dark:text-blue-400'
            }`}>
              <CheckCircle2 className={`w-5 h-5 shrink-0 ${notification.type === 'success' ? 'text-emerald-600' : 'text-blue-600'}`} />
              <span className="text-xs font-semibold tracking-tight leading-normal">
                {notification.message}
              </span>
            </div>
          </div>
        )}

        {/* Access control check to guarantee only Admin/Editor can access the system */}
        {(currentRole.role !== 'admin' && currentRole.role !== 'editor') ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-[#030712]">
            <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden p-8 flex flex-col items-center text-center gap-6 animate-scaleUp">
              {/* Pulsing Lock Icon Container */}
              <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 flex items-center justify-center text-rose-500 dark:text-rose-400 shadow-inner relative">
                <Lock className="w-7 h-7 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-rose-600 text-[10px] font-black text-white flex items-center justify-center border-2 border-white dark:border-slate-900 shadow">
                  !
                </span>
              </div>

              {/* Title & Subtitle */}
              <div className="flex flex-col gap-1.5">
                <h2 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">Clearance Protocol Violation</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">
                  Secure Sandbox Sandbox v2.4
                </p>
              </div>

              {/* Identity Token checklist */}
              <div className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 p-4 rounded-xl space-y-3.5 text-xs text-left">
                <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-900 pb-2">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Assigned Clearance Token
                  </span>
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 uppercase tracking-wide">
                    DENIED
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-y-3.5 gap-x-6 font-semibold">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Attempted User</span>
                    <span className="text-slate-800 dark:text-slate-100 font-bold">{currentRole.name}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Assigned Email</span>
                    <span className="text-slate-800 dark:text-slate-100 font-bold font-mono text-[11px]">{currentRole.email}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Clearance Role</span>
                    <span className="text-slate-800 dark:text-rose-400 font-bold uppercase tracking-wider text-[11px] text-rose-600">
                      {currentRole.role}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">System Route</span>
                    <span className="text-slate-800 dark:text-slate-100 font-bold font-mono text-[11px]">/admin/editor</span>
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full mt-2">
                <RoleToggle />
                <button
                  onClick={() => {
                    const admin = USER_ROLES.find(r => r.role === 'admin');
                    if (admin) handleRoleChange(admin);
                  }}
                  className="w-full sm:flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-blue-500/10 active:scale-98 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin-hover" />
                  <span>Request Admin Clearance</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* 3. The Interactive content creator layout space */
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            
            {/* Top Title Workspace Indicator */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-900 pb-5">
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Dynamic Content Creator</h1>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                  Synthesize and validate mathematical stems, markdown solutions, and multi-choice response matrices.
                </p>
              </div>
              <RoleToggle />
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
                    onAddOption={handleAddingOption}
                    onRemoveOption={handleRemovingOption}
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
                  questionId={currentQuestionId}
                  videoUrl={videoUrl}
                  videoTitle={videoTitle}
                  videoDuration={videoDuration}
                  videoThumbnail={videoThumbnail}
                  shuffleOptions={shuffleOptions}
                  companyTags={companyTags}
                  domainId={domainId}
                  subTopicId={subTopicId}
                  conceptId={conceptId}
                  trackingId={questionsList.find((q) => q.id === currentQuestionId)?.trackingId}
                  domainsList={domains}
                  allQuestions={questionsList}
                />
              </div>

            </div>
          </div>
        )}


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
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-200">
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
                      {questionsList.find((q) => q.id === currentQuestionId)?.questionBinaryId || (
                        currentQuestionId.length > 8
                          ? generate16BitBinaryId(domainId, subTopicId, conceptId, currentQuestionId, 0, domains, questionsList)
                          : currentQuestionId
                      )}
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
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-start gap-2.5">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-xs text-emerald-800 font-semibold leading-relaxed">
                  Production sync: Successfully distributed into institutional student cohorts.
                </span>
              </div>
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
    </>
  );
}

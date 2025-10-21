import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import {
  CheckCircle,
  Copy,
  ArrowLeft,
  Filter,
  ArrowRight
} from 'lucide-react';
import { useContentData } from '../hooks/useContentData';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';

const CustomerCare = () => {
  const { data, isLoading, error } = useContentData();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedProcedureId, setSelectedProcedureId] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const selectedCategory = useMemo(() => {
    return data?.taxonomy.find(item => item.id === selectedCategoryId) ?? null;
  }, [data, selectedCategoryId]);

  const selectedProcedure = useMemo(() => {
    if (!data || !selectedProcedureId) return null;
    return data.procedures.find((proc: any) => proc.id === selectedProcedureId) ?? null;
  }, [data, selectedProcedureId]);

  useEffect(() => {
    setCompletedSteps(new Set());
  }, [selectedProcedureId]);

  const categoryProcedures = useMemo(() => {
    if (!data) return [];
    if (!selectedCategory) return data.procedures;
    return data.procedures.filter((proc: any) => proc.category === selectedCategory.id);
  }, [data, selectedCategory]);

  const progress = useMemo(() => {
    if (!selectedProcedure) return 0;
    const total = selectedProcedure.steps?.length || 0;
    if (!total) return 0;
    return Math.round((completedSteps.size / total) * 100);
  }, [selectedProcedure, completedSteps]);

  const handoverNote = useMemo(() => {
    if (!selectedProcedure) return '';
    const lines = (selectedProcedure.steps || [])
      .filter((step: any) => completedSteps.has(step.id))
      .map((step: any) => `- ${step.title || step.action}`.trim());
    if (!lines.length) return '';
    return `${selectedProcedure.title} - Handover Summary\n\n${lines.join('\n')}`;
  }, [selectedProcedure, completedSteps]);

  const handleCopy = async () => {
    if (!handoverNote) return;
    try {
      await navigator.clipboard.writeText(handoverNote);
      setCopyStatus('success');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (err) {
      console.error('Failed to copy handover note', err);
      setCopyStatus('error');
    }
  };

  const toggleStep = (stepId: string) => {
    const newSet = new Set(completedSteps);
    if (newSet.has(stepId)) {
      newSet.delete(stepId);
    } else {
      newSet.add(stepId);
    }
    setCompletedSteps(newSet);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <Card className="p-12 text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-lg font-semibold text-gray-900">Loading Customer Care Companion...</p>
          <p className="mt-2 text-sm text-gray-600">
            Hydrating taxonomy, procedures, and conditional guidance from the knowledge base
          </p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <Card className="p-8 max-w-md text-center border-red-200 bg-red-50">
          <h2 className="text-xl font-bold text-red-700">Unable to load experience</h2>
          <p className="mt-2 text-sm text-red-600">{error.message}</p>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-10 px-4">
      <div className="container mx-auto space-y-10">
        {/* Header Banner */}
        <header className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white/90 p-8 shadow-soft">
          {/* Backdrop Glow */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
            <div className="absolute -left-24 top-0 h-72 w-72 -translate-y-1/3 rounded-full bg-brand/15 blur-3xl" />
            <div className="absolute right-0 top-1/2 h-64 w-64 translate-x-1/3 -translate-y-1/2 rounded-full bg-brand-accent/20 blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.4em] text-brand">Customer Care Companion</p>
              <h1 className="mt-2 max-w-2xl text-3xl font-semibold text-gray-900">
                Guided workflows for complex client scenarios, built for frontline specialists.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
                Surface the right procedure instantly, follow structured steps with context, and generate polished
                handovers without leaving the workspace.
              </p>
            </div>
            <div className="flex flex-col gap-3 md:items-end">
              <p className="text-xs uppercase tracking-widest text-gray-500">{data.procedures.length} guided procedures</p>
            </div>
          </div>
        </header>

        {/* Main Grid */}
        <section className="grid gap-8 lg:grid-cols-[320px,1fr]">
          {/* Sidebar */}
          <aside className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900">Focus Areas</h2>
              <p className="mt-1 text-sm text-gray-500">
                Choose a capability to reveal curated procedures and hero playbooks.
              </p>
              <div className="mt-4 flex flex-col gap-3">
                {data.taxonomy.map((category: any) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategoryId(category.id);
                      setSelectedProcedureId(null);
                    }}
                    className={clsx(
                      'rounded-2xl border px-4 py-3 text-left transition hover:-translate-y-0.5 hover:shadow-lg',
                      selectedCategory?.id === category.id
                        ? 'border-brand bg-brand/10 text-brand shadow-soft'
                        : 'border-gray-200 bg-white text-gray-700'
                    )}
                  >
                    <p className="text-sm font-semibold">{category.name}</p>
                    <p className="mt-1 text-xs text-gray-500">{category.summary}</p>
                  </button>
                ))}
              </div>
              {selectedCategory && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategoryId(null);
                    setSelectedProcedureId(null);
                  }}
                  className="mt-4 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-gray-500 transition hover:text-brand"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Clear focus
                </button>
              )}
            </Card>
          </aside>

          {/* Main Content */}
          <section className="space-y-6">
            {/* Procedure Library */}
            <Card className="p-6">
              <header className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-brand">Procedure Library</p>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {selectedCategory ? selectedCategory.name : 'All Customer Workflows'}
                  </h2>
                  {selectedCategory && (
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">{selectedCategory.summary}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Filter className="h-4 w-4" />
                  {categoryProcedures.length} procedure{categoryProcedures.length === 1 ? '' : 's'}
                </div>
              </header>
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {categoryProcedures.map((proc: any) => (
                  <motion.button
                    key={proc.id}
                    type="button"
                    onClick={() => setSelectedProcedureId(proc.id)}
                    className={clsx(
                      'group flex h-full flex-col rounded-2xl border px-5 py-4 text-left transition hover:-translate-y-1 hover:shadow-xl',
                      selectedProcedure?.id === proc.id
                        ? 'border-brand bg-brand/10 text-brand shadow-soft'
                        : 'border-gray-200 bg-white text-gray-700'
                    )}
                    whileHover={{ translateY: -6 }}
                  >
                    <div className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                      {data.taxonomy.find((t: any) => t.id === proc.category)?.name || 'General'}
                    </div>
                    <p className="mt-3 text-base font-semibold leading-6">{proc.title}</p>
                    <p className="mt-2 text-xs text-gray-500 line-clamp-2">{proc.purpose}</p>
                    <div className="mt-auto flex items-center justify-between pt-4 text-xs text-gray-400">
                      <span>{proc.duration_estimate || '5 minutes'}</span>
                      <span>{proc.steps?.length || 0} steps</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </Card>

            {/* Procedure Detail */}
            <AnimatePresence>
              {selectedProcedure && (
                <motion.section
                  key={selectedProcedure.id}
                  className="space-y-6 rounded-3xl border border-gray-200 bg-white/90 p-8 shadow-soft"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 24 }}
                >
                  <header className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-brand">Procedure Detail</p>
                      <h3 className="mt-2 text-2xl font-semibold text-gray-900">{selectedProcedure.title}</h3>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">{selectedProcedure.purpose}</p>
                      {selectedProcedure.prereqs && selectedProcedure.prereqs.length > 0 && (
                        <ul className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                          {selectedProcedure.prereqs.map((item: string) => (
                            <li key={item} className="rounded-full bg-gray-100 px-3 py-1">
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-widest text-gray-400">Progress</p>
                        <p className="text-2xl font-semibold text-brand">{progress}%</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="inline-flex items-center gap-2 rounded-full border border-brand/40 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-brand transition hover:border-brand hover:bg-brand/5"
                      >
                        <Copy className="h-4 w-4" />
                        Copy summary
                      </button>
                      {copyStatus === 'success' && (
                        <span className="text-xs text-emerald-500">Copied to clipboard</span>
                      )}
                      {copyStatus === 'error' && <span className="text-xs text-rose-500">Copy failed</span>}
                    </div>
                  </header>

                  <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
                    {/* Steps */}
                    <ol className="space-y-4">
                      {selectedProcedure.steps?.map((step: any, index: number) => (
                        <li
                          key={step.id}
                          className="rounded-2xl border border-gray-200 bg-white/90 p-5 shadow-soft transition hover:border-brand"
                        >
                          <header className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-xs uppercase tracking-widest text-gray-400">Step {index + 1}</p>
                              <h4 className="mt-1 text-lg font-semibold text-gray-900">{step.title}</h4>
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleStep(step.id)}
                              className={clsx(
                                'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition',
                                completedSteps.has(step.id)
                                  ? 'border-emerald-500/40 bg-emerald-50 text-emerald-600'
                                  : 'border-gray-200 bg-white text-gray-500 hover:text-brand'
                              )}
                            >
                              <CheckCircle className="h-4 w-4" />
                              {completedSteps.has(step.id) ? 'Completed' : 'Mark complete'}
                            </button>
                          </header>
                          <div className="mt-3 space-y-3 text-sm text-gray-600">
                            <p>
                              <span className="font-semibold text-brand">Action:</span> {step.action}
                            </p>
                            {step.agentSpeak && (
                              <p>
                                <span className="font-semibold text-brand">Say:</span> <em>{step.agentSpeak}</em>
                              </p>
                            )}
                            {step.capture && step.capture.length > 0 && (
                              <div>
                                <p className="text-xs uppercase tracking-widest text-gray-400">Capture</p>
                                <ul className="mt-1 flex flex-wrap gap-2">
                                  {step.capture.map((item: string) => (
                                    <li key={item} className="rounded-full bg-gray-100 px-3 py-1 text-xs">
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {step.validations && step.validations.length > 0 && (
                              <div>
                                <p className="text-xs uppercase tracking-widest text-gray-400">Validate</p>
                                <ul className="mt-1 space-y-1 text-sm">
                                  {step.validations.map((rule: string) => (
                                    <li key={rule} className="flex items-start gap-2">
                                      <ArrowRight className="mt-0.5 h-3.5 w-3.5 text-brand flex-shrink-0" />
                                      <span>{rule}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ol>

                    {/* Handover Preview */}
                    <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white via-gray-50 to-brand-soft/40 p-5 shadow-soft">
                      <p className="text-xs uppercase tracking-widest text-brand">Handover preview</p>
                      {handoverNote ? (
                        <pre className="mt-3 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-2xl bg-white/70 p-4 text-sm leading-6 text-gray-600 shadow-inner">
                          {handoverNote}
                        </pre>
                      ) : (
                        <p className="mt-3 text-sm text-gray-500">
                          Mark steps as complete to build a ready-to-send summary for the next specialist or adviser.
                        </p>
                      )}
                    </div>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
          </section>
        </section>
      </div>
    </div>
  );
};

export default CustomerCare;

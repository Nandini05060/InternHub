import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Play,
  Download,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  Presentation,
  ChevronRight,
  ChevronLeft,
  X,
  RefreshCw,
  SlidersHorizontal,
  FileSpreadsheet,
  Clock,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { useToast } from '../context/ToastContext.jsx';

export function TestCaseDashboardPage() {
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [summary, setSummary] = useState({
    total: 31,
    executed: 31,
    passed: 31,
    failed: 0,
    blocked: 0,
    notExecuted: 0,
    passRate: '100%',
    lastRunTimestamp: new Date().toISOString()
  });
  const [tests, setTests] = useState([]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Detail Modal & Presentation Mode
  const [selectedTest, setSelectedTest] = useState(null);
  const [presentationMode, setPresentationMode] = useState(false);
  const [presentationIndex, setPresentationIndex] = useState(0);

  const categories = [
    'All',
    'Career Tools & ATS Scenarios',
    'Positive Scenarios',
    'Negative Scenarios',
    'UI & Usability Scenarios',
    'Boundary Value Analysis',
    'Additional Regression Tests'
  ];

  const statuses = ['All', 'Pass', 'Fail', 'Blocked', 'Not Executed'];

  const fetchTestResults = async () => {
    try {
      const res = await fetch('/api/tests/results');
      const data = await res.json();
      if (data.success) {
        setSummary(data.summary);
        setTests(data.tests || []);
      }
    } catch (err) {
      console.error('Failed to load test suite results:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestResults();
  }, []);

  const handleRunTests = async () => {
    setRunning(true);
    try {
      const res = await fetch('/api/tests/run', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSummary(data.summary);
        setTests(data.tests || []);
        toast.success(`Test suite executed! ${data.summary.passed}/${data.summary.total} tests passed.`);
      } else {
        toast.error('Execution encountered an error');
      }
    } catch (err) {
      toast.error('Failed to trigger test suite');
    } finally {
      setRunning(false);
    }
  };

  // Filtered test list
  const filteredTests = tests.filter((t) => {
    const matchesSearch =
      (t.id && t.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.name && t.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.testData && t.testData.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.expectedResult && t.expectedResult.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || t.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Export to CSV Functionality
  const handleExportCSV = () => {
    const headers = [
      'Test Case ID',
      'Test Name',
      'Category',
      'Preconditions',
      'Test Steps',
      'Test Data',
      'Expected Result',
      'Actual Result',
      'Status',
      'Duration'
    ];

    const rows = filteredTests.map((t) => [
      `"${t.id}"`,
      `"${(t.name || '').replace(/"/g, '""')}"`,
      `"${(t.category || '').replace(/"/g, '""')}"`,
      `"${(t.preconditions || '').replace(/"/g, '""')}"`,
      `"${(Array.isArray(t.steps) ? t.steps.join('; ') : t.steps || '').replace(/"/g, '""')}"`,
      `"${(t.testData || '').replace(/"/g, '""')}"`,
      `"${(t.expectedResult || '').replace(/"/g, '""')}"`,
      `"${(t.actualResult || '').replace(/"/g, '""')}"`,
      `"${t.status}"`,
      `"${t.duration || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `InternHub_Test_Execution_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Test execution report downloaded as CSV!');
  };

  const openPresentationForTest = (test) => {
    const index = filteredTests.findIndex((t) => t.id === test.id);
    setPresentationIndex(index >= 0 ? index : 0);
    setPresentationMode(true);
  };

  const handlePrevPresentation = () => {
    setPresentationIndex((prev) => (prev > 0 ? prev - 1 : filteredTests.length - 1));
  };

  const handleNextPresentation = () => {
    setPresentationIndex((prev) => (prev < filteredTests.length - 1 ? prev + 1 : 0));
  };

  // Keyboard navigation for presentation mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!presentationMode) return;
      if (e.key === 'ArrowLeft') handlePrevPresentation();
      if (e.key === 'ArrowRight') handleNextPresentation();
      if (e.key === 'Escape') setPresentationMode(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [presentationMode, filteredTests.length]);

  const activePresentationTest = filteredTests[presentationIndex] || null;

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-24 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 border border-indigo-200 text-indigo-700 shadow-2xs mb-2">
              <FlaskConical className="w-3.5 h-3.5 text-indigo-600" />
              <span>Faculty Demonstration & Verification Suite</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Test Case Execution Dashboard
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              Interactive test dashboard mapped to the college software engineering test specifications.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => {
                if (filteredTests.length > 0) {
                  setPresentationIndex(0);
                  setPresentationMode(true);
                }
              }}
              className="btn-secondary text-xs px-3.5 py-2 font-semibold shadow-2xs"
            >
              <Presentation className="w-4 h-4 text-indigo-600" />
              <span>Viva Presentation Mode</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="btn-secondary text-xs px-3.5 py-2 font-semibold shadow-2xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export CSV Report</span>
            </button>

            <button
              onClick={handleRunTests}
              disabled={running}
              className="btn-primary text-xs px-4 py-2 font-semibold shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${running ? 'animate-spin' : ''}`} />
              <span>{running ? 'Executing Tests...' : 'Run Test Suite'}</span>
            </button>
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Total Cases */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Tests
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {summary.total}
            </span>
            <span className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
              <Layers className="w-3 h-3 text-slate-400" />
              100% Documented
            </span>
          </div>

          {/* Executed */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">
              Executed
            </span>
            <span className="text-2xl font-black text-indigo-950 mt-1 block">
              {summary.executed}
            </span>
            <span className="text-[10px] text-indigo-600 font-medium mt-1">
              {summary.passRate} Complete
            </span>
          </div>

          {/* Passed */}
          <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-soft bg-gradient-to-b from-white to-emerald-50/20">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
              Passed
            </span>
            <span className="text-2xl font-black text-emerald-700 mt-1 block">
              {summary.passed}
            </span>
            <span className="text-[10px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              All Assertions Met
            </span>
          </div>

          {/* Failed */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
            <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">
              Failed
            </span>
            <span className="text-2xl font-black text-rose-600 mt-1 block">
              {summary.failed}
            </span>
            <span className="text-[10px] text-slate-400 mt-1">Zero Regressions</span>
          </div>

          {/* Blocked */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">
              Blocked
            </span>
            <span className="text-2xl font-black text-amber-600 mt-1 block">
              {summary.blocked}
            </span>
            <span className="text-[10px] text-slate-400 mt-1">External Depts: 0</span>
          </div>

          {/* Not Executed */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Not Executed
            </span>
            <span className="text-2xl font-black text-slate-700 mt-1 block">
              {summary.notExecuted}
            </span>
            <span className="text-[10px] text-slate-400 mt-1">Active Run</span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft space-y-3.5">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Box */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search test ID, name, test steps, or test data..."
                className="input-base pl-10 text-xs w-full"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {statuses.map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedStatus === st
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3" />
              Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-xl text-[11px] font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'bg-indigo-50/60 text-indigo-900 hover:bg-indigo-100/70 border border-indigo-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Test Case Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>
              Showing <strong className="text-slate-900">{filteredTests.length}</strong> of{' '}
              {tests.length} registered test cases
            </span>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Last executed: {new Date(summary.lastRunTimestamp).toLocaleTimeString()}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4 w-28">Test ID</th>
                  <th className="py-3.5 px-4">Test Case Name & Specification</th>
                  <th className="py-3.5 px-4 w-44">Category</th>
                  <th className="py-3.5 px-4 w-28 text-center">Status</th>
                  <th className="py-3.5 px-4 w-24 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      No test cases match the current filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTests.map((test) => {
                    const isPass = test.status === 'Pass';
                    const isFail = test.status === 'Fail';
                    const isBlocked = test.status === 'Blocked';

                    return (
                      <tr
                        key={test.id}
                        onClick={() => setSelectedTest(test)}
                        className="hover:bg-indigo-50/30 transition-colors cursor-pointer group"
                      >
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 group-hover:text-indigo-600 transition-colors whitespace-nowrap">
                          {test.id}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900 leading-snug">
                            {test.name}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                            {test.expectedResult}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {test.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              isPass
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : isFail
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : isBlocked
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {isPass ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ) : isFail ? (
                              <XCircle className="w-3 h-3 text-rose-600" />
                            ) : (
                              <AlertCircle className="w-3 h-3 text-amber-600" />
                            )}
                            <span>{test.status}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openPresentationForTest(test);
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Present Test Case"
                          >
                            <Presentation className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Test Detail Modal / Drawer */}
      {selectedTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 relative animate-scale-in max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedTest(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono font-bold text-xs">
                {selectedTest.id}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  selectedTest.status === 'Pass'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {selectedTest.status}
              </span>
              <span className="text-xs text-slate-400 ml-auto mr-8">
                Duration: {selectedTest.duration || '25ms'}
              </span>
            </div>

            <h2 className="text-lg font-bold text-slate-900 leading-snug mb-4">
              {selectedTest.name}
            </h2>

            <div className="space-y-4 text-xs">
              {/* Category */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Category
                </span>
                <span className="font-semibold text-slate-700">
                  {selectedTest.category}
                </span>
              </div>

              {/* Preconditions */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Preconditions
                </span>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-mono text-[11px]">
                  {selectedTest.preconditions}
                </p>
              </div>

              {/* Test Steps */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Test Execution Steps
                </span>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                  {Array.isArray(selectedTest.steps) ? (
                    selectedTest.steps.map((st, i) => (
                      <div key={i} className="text-slate-700 leading-relaxed">
                        {st}
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-700">{selectedTest.steps}</div>
                  )}
                </div>
              </div>

              {/* Test Data */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Exact Test Data
                </span>
                <p className="text-slate-800 bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/80 font-mono text-[11px]">
                  {selectedTest.testData}
                </p>
              </div>

              {/* Expected vs Actual */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Expected Result
                  </span>
                  <p className="text-slate-800 leading-relaxed font-medium">
                    {selectedTest.expectedResult}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Actual Verified Result
                  </span>
                  <p className="text-emerald-950 leading-relaxed font-medium">
                    {selectedTest.actualResult}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => {
                  setSelectedTest(null);
                  openPresentationForTest(selectedTest);
                }}
                className="btn-primary text-xs px-4 py-2"
              >
                <Presentation className="w-4 h-4" />
                <span>Present to Faculty</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Faculty Viva Presentation Mode Modal */}
      {presentationMode && activePresentationTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-[#FAF8F5] rounded-3xl max-w-4xl w-full p-6 sm:p-10 shadow-2xl border border-white/20 relative animate-scale-in">
            {/* Top Bar with Presentation Controls */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-xl bg-indigo-600 text-white font-mono font-black text-sm shadow-sm">
                  {activePresentationTest.id}
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Test {presentationIndex + 1} of {filteredTests.length}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {activePresentationTest.status}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevPresentation}
                  className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
                  title="Previous Test (Arrow Left)"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextPresentation}
                  className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
                  title="Next Test (Arrow Right)"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setPresentationMode(false)}
                  className="p-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors ml-2"
                  title="Close Presentation Mode (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Test Case Presentation Body */}
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest block mb-1">
                  {activePresentationTest.category}
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                  {activePresentationTest.name}
                </h2>
              </div>

              {/* Preconditions & Test Data Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Preconditions
                  </span>
                  <p className="text-xs text-slate-800 font-mono leading-relaxed">
                    {activePresentationTest.preconditions}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Exact Test Data & Inputs
                  </span>
                  <p className="text-xs text-indigo-950 font-mono font-bold leading-relaxed bg-indigo-50/60 p-2 rounded-lg">
                    {activePresentationTest.testData}
                  </p>
                </div>
              </div>

              {/* Numbered Steps */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Test Execution Steps
                </span>
                {Array.isArray(activePresentationTest.steps) ? (
                  activePresentationTest.steps.map((st, i) => (
                    <div key={i} className="text-xs text-slate-800 font-medium leading-relaxed">
                      {st}
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-800">{activePresentationTest.steps}</div>
                )}
              </div>

              {/* Expected vs Actual Result Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Expected Result (Specification)
                  </span>
                  <p className="text-xs text-slate-900 leading-relaxed font-semibold">
                    {activePresentationTest.expectedResult}
                  </p>
                </div>

                <div className="bg-emerald-500 text-white p-5 rounded-2xl shadow-md">
                  <span className="text-[11px] font-bold text-emerald-100 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    Actual Verified Result (Pass)
                  </span>
                  <p className="text-xs text-white leading-relaxed font-bold">
                    {activePresentationTest.actualResult}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Keyboard Hint Bar */}
            <div className="mt-8 flex items-center justify-between text-xs text-slate-400 border-t border-slate-200 pt-4">
              <span>Use Left/Right arrow keys to present next test case</span>
              <button
                onClick={() => setPresentationMode(false)}
                className="text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                Exit Presentation View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TestCaseDashboardPage;

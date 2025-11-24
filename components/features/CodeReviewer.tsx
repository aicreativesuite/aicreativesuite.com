
import React, { useState, useEffect, useRef } from 'react';
import { reviewCode } from '../../services/geminiService';
import { Remarkable } from 'remarkable';

const md = new Remarkable({ html: true, breaks: true });

interface CodeReviewerProps {
    onShare: (options: { contentText: string; contentType: 'text' }) => void;
}

interface ReviewIssue {
    type: string;
    line: number;
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
    description: string;
    rootCause: string;
    fix: string;
}

interface ReviewResult {
    summary: string;
    bugScore: number;
    securityScore: number;
    issues: ReviewIssue[];
    fixedCode: string;
}

const CodeReviewer: React.FC<CodeReviewerProps> = ({ onShare }) => {
    const [code, setCode] = useState('');
    const [result, setResult] = useState<ReviewResult | null>(null);
    const [scanning, setScanning] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<'review' | 'fixed'>('review');
    
    const logIntervalRef = useRef<number | null>(null);
    const terminalBodyRef = useRef<HTMLDivElement>(null);

    const scanningMessages = [
        "Initializing static analysis...",
        "Parsing Abstract Syntax Tree (AST)...",
        "Checking for OWASP Top 10 vulnerabilities...",
        "Scanning for memory leaks...",
        "Evaluating cyclomatic complexity...",
        "Detecting race conditions...",
        "Verifying type safety...",
        "Analyzing dependency graph...",
        "Cross-referencing with CVE database...",
        "Optimizing runtime performance...",
    ];

    useEffect(() => {
        if (terminalBodyRef.current) {
            terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
        }
    }, [logs]);

    const startLogSimulation = () => {
        setLogs(["Starting review process..."]);
        let i = 0;
        logIntervalRef.current = window.setInterval(() => {
            if (i < scanningMessages.length) {
                setLogs(prev => [...prev, `> ${scanningMessages[i]}`]);
                i++;
            }
        }, 800);
    };

    const stopLogSimulation = () => {
        if (logIntervalRef.current) {
            clearInterval(logIntervalRef.current);
        }
        setLogs(prev => [...prev, "> Analysis Complete.", "> Rendering Report..."]);
    };

    const handleReview = async () => {
        if (!code.trim()) return;
        setScanning(true);
        setResult(null);
        startLogSimulation();

        try {
            const response = await reviewCode(code);
            const data = JSON.parse(response.text);
            setResult(data);
        } catch (error) {
            console.error(error);
            setLogs(prev => [...prev, "> ERROR: Analysis failed.", "> Check connection and try again."]);
        } finally {
            stopLogSimulation();
            setScanning(false);
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'Critical': return 'text-red-500 border-red-500/50 bg-red-900/10';
            case 'High': return 'text-orange-500 border-orange-500/50 bg-orange-900/10';
            case 'Medium': return 'text-yellow-500 border-yellow-500/50 bg-yellow-900/10';
            default: return 'text-blue-400 border-blue-500/50 bg-blue-900/10';
        }
    };

    const handleCopyFixed = () => {
        if (result) {
            navigator.clipboard.writeText(result.fixedCode);
            alert('Fixed code copied to clipboard.');
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-10rem)] gap-6 font-mono text-sm">
            {/* Input Area */}
            <div className={`flex-shrink-0 transition-all duration-500 ${result ? 'h-1/3' : 'h-2/3'}`}>
                <div className="h-full bg-slate-900 rounded-xl border border-slate-800 flex flex-col overflow-hidden shadow-2xl">
                    <div className="bg-slate-950 px-4 py-2 flex justify-between items-center border-b border-slate-800">
                        <div className="flex space-x-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                        </div>
                        <span className="text-slate-500 text-xs">source_code.js</span>
                        <button 
                            onClick={handleReview}
                            disabled={scanning || !code.trim()}
                            className="text-xs bg-green-700 hover:bg-green-600 text-white px-3 py-1 rounded transition disabled:opacity-50"
                        >
                            {scanning ? 'SCANNING...' : 'RUN AUDIT'}
                        </button>
                    </div>
                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="// Paste your code here for a deep security and logic audit..."
                        className="flex-grow bg-slate-900 text-slate-300 p-4 resize-none focus:outline-none font-mono text-xs md:text-sm leading-relaxed"
                        spellCheck={false}
                    />
                </div>
            </div>

            {/* Output Area */}
            <div className="flex-grow overflow-hidden relative">
                {scanning ? (
                    <div className="absolute inset-0 bg-black rounded-xl border border-green-900/50 p-4 font-mono text-green-500 overflow-y-auto flex flex-col shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                        <div className="flex-grow" ref={terminalBodyRef}>
                            {logs.map((log, i) => (
                                <div key={i} className="mb-1">{log}</div>
                            ))}
                            <div className="animate-pulse">_</div>
                        </div>
                    </div>
                ) : result ? (
                    <div className="h-full bg-slate-900 rounded-xl border border-slate-800 flex flex-col overflow-hidden">
                        {/* Tabs */}
                        <div className="flex border-b border-slate-800 bg-slate-950">
                            <button 
                                onClick={() => setActiveTab('review')}
                                className={`px-6 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'review' ? 'bg-slate-800 text-cyan-400 border-t-2 border-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Audit Report
                            </button>
                            <button 
                                onClick={() => setActiveTab('fixed')}
                                className={`px-6 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'fixed' ? 'bg-slate-800 text-green-400 border-t-2 border-green-400' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Refactored Code
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-grow overflow-y-auto p-6 custom-scrollbar">
                            {activeTab === 'review' ? (
                                <div className="space-y-6">
                                    {/* Summary & Scores */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="md:col-span-2 bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                            <h4 className="text-xs text-slate-400 uppercase mb-2 font-bold">Executive Summary</h4>
                                            <p className="text-slate-200">{result.summary}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                                                <span className="text-xs text-slate-400 uppercase font-bold">Bug Score</span>
                                                <span className={`text-xl font-bold ${result.bugScore > 80 ? 'text-green-400' : result.bugScore > 50 ? 'text-yellow-400' : 'text-red-400'}`}>{result.bugScore}/100</span>
                                            </div>
                                            <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                                                <span className="text-xs text-slate-400 uppercase font-bold">Sec Score</span>
                                                <span className={`text-xl font-bold ${result.securityScore > 80 ? 'text-green-400' : result.securityScore > 50 ? 'text-yellow-400' : 'text-red-400'}`}>{result.securityScore}/100</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Issues List */}
                                    <div className="space-y-3">
                                        <h4 className="text-xs text-slate-400 uppercase font-bold sticky top-0 bg-slate-900 py-2">Identified Issues</h4>
                                        {result.issues.length === 0 && <p className="text-green-500 italic">No critical issues found. Good job!</p>}
                                        {result.issues.map((issue, idx) => (
                                            <div key={idx} className={`p-4 rounded-lg border ${getSeverityColor(issue.severity)} transition-all hover:bg-slate-800`}>
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center space-x-2">
                                                        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getSeverityColor(issue.severity).split(' ')[1]}`}>{issue.severity}</span>
                                                        <span className="text-xs font-bold uppercase tracking-wide opacity-80">{issue.type}</span>
                                                        {issue.line > 0 && <span className="text-xs text-slate-500 font-mono">Line {issue.line}</span>}
                                                    </div>
                                                </div>
                                                <h5 className="font-bold mb-1">{issue.description}</h5>
                                                <p className="text-xs opacity-80 mb-2"><span className="font-bold">Root Cause:</span> {issue.rootCause}</p>
                                                <div className="text-xs bg-black/20 p-2 rounded mt-2 font-mono border-l-2 border-current opacity-70">
                                                    <span className="font-bold">Fix:</span> {issue.fix}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="relative h-full">
                                    <div className="absolute top-0 right-0 space-x-2">
                                        <button 
                                            onClick={handleCopyFixed}
                                            className="bg-slate-800 hover:bg-slate-700 text-white text-xs px-3 py-1 rounded border border-slate-600 transition"
                                        >
                                            Copy Code
                                        </button>
                                    </div>
                                    <pre className="text-xs md:text-sm text-green-300 font-mono whitespace-pre-wrap pt-8 pb-4">
                                        {result.fixedCode}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-xl">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        <p className="text-sm">Awaiting input stream...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CodeReviewer;

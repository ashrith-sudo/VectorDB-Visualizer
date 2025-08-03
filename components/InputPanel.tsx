import React, { useState, useEffect } from 'react';
import { Document, DocumentStatus, FlowStep } from '../types';
import { CodeIcon } from './icons/CodeIcon';
import VectorDisplay from './VectorDisplay';

interface InputPanelProps {
  onAddDocument: (text: string) => void;
  documents: Document[];
  isFlowRunning: boolean;
  currentStep: FlowStep;
  processingDoc: Document | null;
}

const TokenizerView: React.FC<{ text: string }> = ({ text }) => {
    const tokens = text.split(/\s+/);
    const [visibleTokens, setVisibleTokens] = useState<string[]>([]);

    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            if (i < tokens.length) {
                setVisibleTokens(prev => [...prev, tokens[i]]);
                i++;
            } else {
                clearInterval(interval);
            }
        }, 100);
        return () => clearInterval(interval);
    }, [text]);

    return (
        <div className="flex flex-wrap gap-2 p-2 bg-slate-900 border border-slate-700 rounded-md min-h-[4rem]">
            {visibleTokens.map((token, index) => (
                <span key={index} className="bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-md text-sm animate-fade-in">{token}</span>
            ))}
        </div>
    );
};

const InputPanel: React.FC<InputPanelProps> = ({ onAddDocument, documents, isFlowRunning, currentStep, processingDoc }) => {
  const [text, setText] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddDocument(text);
    setText('');
  };

  const getStatusIndicator = (status: DocumentStatus) => {
    switch (status) {
      case DocumentStatus.EMBEDDING:
        return <span className="text-xs text-yellow-400 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>Embedding...</span>;
      case DocumentStatus.STORED:
        return <span className="text-xs text-green-400 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-400"></div>Stored</span>;
      default:
        return null;
    }
  };
  
  const showProcessingView = currentStep >= FlowStep.TOKENIZING_INPUT && currentStep <= FlowStep.STORING_VECTOR && processingDoc;

  return (
    <div className="bg-slate-800/50 rounded-lg p-6 h-full shadow-lg border border-slate-700">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-cyan-500/10 p-2 rounded-lg">
          <CodeIcon className="w-6 h-6 text-cyan-400" />
        </div>
        <h2 className="text-xl font-bold text-white">1. Input & Embed</h2>
      </div>
      <p className="text-slate-400 mb-4 text-sm">Add text to convert into a numerical vector (embedding) that captures its semantic meaning.</p>
      
      {showProcessingView ? (
        <div className="space-y-4">
            <p className="text-slate-300 text-sm break-words bg-slate-900 p-3 rounded-md border border-slate-700">"{processingDoc.text}"</p>
            <div>
                <h4 className="text-sm font-semibold mb-2 text-slate-400">Tokenization:</h4>
                <TokenizerView text={processingDoc.text} />
            </div>
             <div>
                <h4 className="text-sm font-semibold mb-2 text-slate-400">Embedding:</h4>
                <div className="bg-slate-900 p-3 rounded-md border border-slate-700 min-h-[3rem] flex items-center">
                    {currentStep === FlowStep.EMBEDDING_INPUT && !processingDoc.vector && <div className="text-yellow-400 animate-pulse text-sm">Generating vector...</div>}
                    {processingDoc.vector && <VectorDisplay vector={processingDoc.vector} />}
                </div>
            </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g., 'A sunny day at the beach'"
            className="w-full h-24 p-3 bg-slate-900 rounded-md border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 text-slate-200 resize-none"
            disabled={isFlowRunning}
            />
            <button
            type="submit"
            disabled={!text.trim() || isFlowRunning}
            className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition-all duration-200"
            >
            Create Embedding
            </button>
        </form>
      )}


      <div className="mt-6">
        <h3 className="font-semibold text-slate-300 mb-2">Source Documents</h3>
        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
          {documents.length === 0 ? (
            <p className="text-slate-500 text-sm">No documents added yet.</p>
          ) : (
            [...documents].reverse().map(doc => (
              <div key={doc.id} className="bg-slate-900 p-3 rounded-md border border-slate-700">
                <p className="text-slate-300 text-sm break-words">"{doc.text}"</p>
                <div className="text-right mt-1">{getStatusIndicator(doc.status)}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default InputPanel;

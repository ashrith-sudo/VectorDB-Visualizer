import React, { useState, useEffect } from 'react';
import { Vector, SearchResult, FlowStep } from '../types';
import VectorDisplay from './VectorDisplay';
import { SearchIcon } from './icons/SearchIcon';

interface QueryPanelProps {
  onSearch: (query: string) => void;
  isFlowRunning: boolean;
  queryVector: Vector | null;
  results: SearchResult[];
  hasDocuments: boolean;
  currentStep: FlowStep;
  currentQuery: string;
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
                <span key={index} className="bg-pink-500/20 text-pink-300 px-2 py-1 rounded-md text-sm animate-fade-in">{token}</span>
            ))}
        </div>
    );
};

const QueryPanel: React.FC<QueryPanelProps> = ({ onSearch, isFlowRunning, queryVector, results, hasDocuments, currentStep, currentQuery }) => {
  const [query, setQuery] = useState<string>('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };
  
  const isSearching = currentStep >= FlowStep.QUERY_ENTERED && currentStep < FlowStep.SHOWING_RESULTS;
  const showQueryProcess = currentStep >= FlowStep.TOKENIZING_QUERY && currentStep < FlowStep.IDLE;

  return (
    <div className="bg-slate-800/50 rounded-lg p-6 h-full shadow-lg border border-slate-700">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-pink-500/10 p-2 rounded-lg">
          <SearchIcon className="w-6 h-6 text-pink-400" />
        </div>
        <h2 className="text-xl font-bold text-white">3. Query & Retrieve</h2>
      </div>
      <p className="text-slate-400 mb-4 text-sm">A query is embedded, then compared to stored vectors to find the closest matches (highest similarity).</p>

      <form onSubmit={handleSearch} className="flex flex-col gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., 'coastal skies'"
          className="w-full p-3 bg-slate-900 rounded-md border border-slate-600 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 text-slate-200"
          disabled={!hasDocuments || isFlowRunning}
        />
        <button
          type="submit"
          disabled={!query.trim() || !hasDocuments || isFlowRunning}
          className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition-all duration-200"
        >
          {isSearching ? 'Processing...' : 'Search'}
        </button>
      </form>

      { !hasDocuments && <p className="text-center text-slate-500 text-xs mt-2">Add documents before searching.</p> }

      {showQueryProcess && (
        <div className="mt-6 space-y-4">
           <div>
                <h4 className="text-sm font-semibold mb-2 text-slate-400">Query Tokenization:</h4>
                {currentStep >= FlowStep.TOKENIZING_QUERY && <TokenizerView text={currentQuery} />}
            </div>
             <div>
                <h4 className="text-sm font-semibold mb-2 text-slate-400">Query Vector:</h4>
                <div className="bg-slate-900 p-3 rounded-md border border-slate-700 min-h-[3rem] flex items-center">
                    {currentStep === FlowStep.EMBEDDING_QUERY && !queryVector && <div className="text-yellow-400 animate-pulse text-sm">Generating query vector...</div>}
                    {queryVector && <VectorDisplay vector={queryVector} highlight />}
                </div>
            </div>
        </div>
      )}

      <div className="mt-6">
        <h3 className="font-semibold text-slate-300 mb-2">Retrieved Results</h3>
        <div className="space-y-3">
            {results.length > 0 ? (
                results.map((result, index) => (
                    <div 
                        key={result.id} 
                        className="bg-slate-900 p-3 rounded-md border border-pink-500/50 animate-fade-in"
                        style={{animationDelay: `${index * 150}ms`}}
                    >
                        <p className="text-slate-300 text-sm break-words">"{result.text}"</p>
                        <p className="text-right text-xs text-pink-400 font-mono mt-1">Similarity: {result.similarity.toFixed(4)}</p>
                    </div>
                ))
            ) : (
                <p className="text-slate-500 text-sm">No results to display. Run a search to see the most similar documents.</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default QueryPanel;

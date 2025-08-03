import React from 'react';
import { Document, DocumentStatus, SearchResult } from '../types';
import VectorDisplay from './VectorDisplay';
import { DatabaseIcon } from './icons/DatabaseIcon';

interface VectorDatabaseViewProps {
  documents: Document[];
  searchResults: SearchResult[];
  comparingDocId: number | null;
  liveSimilarity: number | null;
}

const VectorDatabaseView: React.FC<VectorDatabaseViewProps> = ({ documents, searchResults, comparingDocId, liveSimilarity }) => {
  const searchResultIds = new Set(searchResults.map(r => r.id));
  const storedDocs = documents.filter(d => d.status === DocumentStatus.STORED);

  const getSimilarityColor = (similarity: number) => {
      if (similarity > 0.75) return 'text-green-400';
      if (similarity > 0.5) return 'text-yellow-400';
      if (similarity > 0.25) return 'text-orange-400';
      return 'text-red-400';
  }

  return (
    <div className="bg-slate-800/50 rounded-lg p-6 h-full shadow-lg border border-slate-700">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-violet-500/10 p-2 rounded-lg">
          <DatabaseIcon className="w-6 h-6 text-violet-400" />
        </div>
        <h2 className="text-xl font-bold text-white">2. Vector Database</h2>
      </div>
      <p className="text-slate-400 mb-4 text-sm">Embeddings are stored and indexed for efficient searching. Each vector is a point in a high-dimensional space.</p>

      <div className="space-y-3 max-h-[28rem] overflow-y-auto pr-2">
        {storedDocs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500">
            <DatabaseIcon className="w-12 h-12 mb-2" />
            <p>Database is empty.</p>
            <p className="text-xs">Add documents to populate.</p>
          </div>
        ) : (
          storedDocs.map(doc => {
            const isComparing = comparingDocId === doc.id;
            const isMatch = searchResultIds.has(doc.id);
            const ringClass = isComparing ? 'ring-2 ring-yellow-400' : isMatch ? 'ring-2 ring-violet-500/50' : '';
            
            return (
                <div 
                key={doc.id} 
                className={`bg-slate-900 p-3 rounded-md border border-slate-700 transition-all duration-300 ${ringClass}`}
                >
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono text-slate-500">ID: {doc.id}</span>
                    {isComparing && liveSimilarity !== null && (
                        <span key={liveSimilarity} className={`text-xs font-bold font-mono animate-fade-in ${getSimilarityColor(liveSimilarity)}`}>
                            Sim: {liveSimilarity.toFixed(4)}
                        </span>
                    )}
                    {isMatch && !isComparing && (
                        <span className="text-xs font-bold text-violet-400">MATCH</span>
                    )}
                </div>
                <p className="text-slate-300 text-sm mb-3 break-words truncate">"{doc.text}"</p>
                {doc.vector && <VectorDisplay vector={doc.vector} highlight={isComparing} />}
                </div>
            )
          })
        )}
      </div>
    </div>
  );
};

export default VectorDatabaseView;

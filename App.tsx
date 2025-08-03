import React, { useState, useCallback, useEffect } from 'react';
import { Document, DocumentStatus, Vector, SearchResult, FlowStep } from './types';
import { generateVectorFromString, findTopKSimilar, cosineSimilarity } from './services/vectorService';
import InputPanel from './components/InputPanel';
import VectorDatabaseView from './components/VectorDatabaseView';
import QueryPanel from './components/QueryPanel';
import { ArrowIcon } from './components/icons/ArrowIcon';

const NARRATION_TEXT: Record<FlowStep, string> = {
  [FlowStep.IDLE]: "Add a document to begin. The system is ready.",
  [FlowStep.INPUT_ENTERED]: "A new document has been submitted.",
  [FlowStep.TOKENIZING_INPUT]: "First, the raw text is broken down into smaller units called 'tokens'. This helps the model understand the content.",
  [FlowStep.EMBEDDING_INPUT]: "The tokens are fed into an embedding model, which converts their semantic meaning into a numerical vector.",
  [FlowStep.STORING_VECTOR]: "This new vector is stored and indexed in the database, ready to be searched.",
  [FlowStep.QUERY_ENTERED]: "A search query has been entered.",
  [FlowStep.TOKENIZING_QUERY]: "Like a document, the query text is also tokenized before being converted into a vector.",
  [FlowStep.EMBEDDING_QUERY]: "The query tokens are now being converted into a query vector. The goal is to represent the query's intent in the same vector space.",
  [FlowStep.SEARCHING_START]: "The search begins. The query vector will be compared against every vector in the database.",
  [FlowStep.SEARCHING_COMPARE]: "Calculating similarity (e.g., Cosine Similarity) between the query vector and a database vector.",
  [FlowStep.SEARCHING_DONE]: "All vectors have been compared. Now ranking the results based on their similarity scores.",
  [FlowStep.SHOWING_RESULTS]: "The top 3 most similar documents are retrieved and displayed. The higher the score, the closer the match.",
};

const App: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [queryVector, setQueryVector] = useState<Vector | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [currentStep, setCurrentStep] = useState<FlowStep>(FlowStep.IDLE);
  
  // State for animations
  const [processingDoc, setProcessingDoc] = useState<Document | null>(null);
  const [comparingDocId, setComparingDocId] = useState<number | null>(null);
  const [liveSimilarity, setLiveSimilarity] = useState<number | null>(null);
  const [currentQuery, setCurrentQuery] = useState<string>('');

  const runAnimationStep = (nextStep: FlowStep, delay: number) => {
      setTimeout(() => setCurrentStep(nextStep), delay);
  };
  
  const handleAddDocument = useCallback((text: string) => {
    if (!text.trim() || currentStep !== FlowStep.IDLE) return;

    const newDoc: Document = { id: Date.now(), text, vector: null, status: DocumentStatus.EMBEDDING };
    setProcessingDoc(newDoc);
    setCurrentStep(FlowStep.INPUT_ENTERED);
    runAnimationStep(FlowStep.TOKENIZING_INPUT, 500);
    runAnimationStep(FlowStep.EMBEDDING_INPUT, 2500);
    
    setTimeout(() => {
        const vector = generateVectorFromString(text);
        setProcessingDoc(doc => doc ? { ...doc, vector, status: DocumentStatus.STORED } : null);
        runAnimationStep(FlowStep.STORING_VECTOR, 500);
    }, 4500);

    setTimeout(() => {
        setDocuments(prevDocs => [...prevDocs, { ...newDoc, vector: generateVectorFromString(text), status: DocumentStatus.STORED }]);
        setProcessingDoc(null);
        setCurrentStep(FlowStep.IDLE);
    }, 6000);
  }, [currentStep]);

  const handleSearch = useCallback((query: string) => {
    if (!query.trim() || documents.filter(d => d.status === DocumentStatus.STORED).length === 0 || currentStep !== FlowStep.IDLE) {
      return;
    }
    
    setCurrentQuery(query);
    setSearchResults([]);
    setQueryVector(null);
    setComparingDocId(null);
    setLiveSimilarity(null);

    setCurrentStep(FlowStep.QUERY_ENTERED);
    runAnimationStep(FlowStep.TOKENIZING_QUERY, 500);
    runAnimationStep(FlowStep.EMBEDDING_QUERY, 2500);

    setTimeout(() => {
      const vector = generateVectorFromString(query);
      setQueryVector(vector);
      runAnimationStep(FlowStep.SEARCHING_START, 1000);
    }, 4000);

  }, [documents, currentStep]);

  useEffect(() => {
    if (currentStep === FlowStep.SEARCHING_START && queryVector) {
      const storedDocs = documents.filter(d => d.status === DocumentStatus.STORED && d.vector);
      let i = 0;
      
      const compareNext = () => {
        if (i < storedDocs.length) {
          const docToCompare = storedDocs[i];
          setComparingDocId(docToCompare.id);
          const similarity = cosineSimilarity(queryVector, docToCompare.vector!);
          setLiveSimilarity(similarity);
          setCurrentStep(FlowStep.SEARCHING_COMPARE);
          
          i++;
          setTimeout(compareNext, 1200);
        } else {
           // Finished comparing
           setComparingDocId(null);
           setLiveSimilarity(null);
           setCurrentStep(FlowStep.SEARCHING_DONE);
           runAnimationStep(FlowStep.SHOWING_RESULTS, 1500);
        }
      };
      
      compareNext();
    }
  }, [currentStep, queryVector, documents]);
  
  useEffect(() => {
      if (currentStep === FlowStep.SHOWING_RESULTS && queryVector) {
          const storedDocuments = documents.filter(doc => doc.status === DocumentStatus.STORED && doc.vector);
          const results = findTopKSimilar(queryVector, storedDocuments as (Document & { vector: Vector })[], 3);
          setSearchResults(results);
          setTimeout(() => {
              setCurrentStep(FlowStep.IDLE)
              setCurrentQuery('');
          }, 3000);
      }
  }, [currentStep, queryVector, documents])

  const isFlowRunning = currentStep !== FlowStep.IDLE;
  
  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans p-4 lg:p-8 flex flex-col">
      <header className="text-center mb-4">
        <h1 className="text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500">
          Vector Database Visualizer
        </h1>
        <p className="mt-2 text-slate-400 max-w-3xl mx-auto">
          An interactive, step-by-step simulation of the vector embedding and search lifecycle.
        </p>
      </header>

      <div className="w-full max-w-5xl mx-auto my-4 h-20 bg-slate-800/50 border border-slate-700 rounded-lg flex items-center justify-center p-4 shadow-lg">
          <p key={currentStep} className="text-center text-slate-300 font-medium animate-fade-in">
              <span className="font-bold text-cyan-400 mr-2">Status:</span>{NARRATION_TEXT[currentStep]}
          </p>
      </div>

      <main className="grid grid-cols-1 lg:grid-cols-11 gap-6 lg:gap-8 items-start flex-grow">
        {/* Panel 1: Input */}
        <div className="lg:col-span-3">
          <InputPanel 
            onAddDocument={handleAddDocument} 
            documents={documents} 
            isFlowRunning={isFlowRunning}
            currentStep={currentStep}
            processingDoc={processingDoc}
          />
        </div>

        <div className="hidden lg:flex justify-center items-center h-full mt-24">
            <ArrowIcon className="w-12 h-12 text-slate-600" />
        </div>

        {/* Panel 2: Database */}
        <div className="lg:col-span-3">
            <VectorDatabaseView 
                documents={documents} 
                searchResults={searchResults} 
                comparingDocId={comparingDocId}
                liveSimilarity={liveSimilarity}
            />
        </div>

        <div className="hidden lg:flex justify-center items-center h-full mt-24">
            <ArrowIcon className="w-12 h-12 text-slate-600" />
        </div>

        {/* Panel 3: Query */}
        <div className="lg:col-span-3">
          <QueryPanel 
            onSearch={handleSearch}
            isFlowRunning={isFlowRunning}
            queryVector={queryVector}
            results={searchResults}
            hasDocuments={documents.some(d => d.status === DocumentStatus.STORED)}
            currentStep={currentStep}
            currentQuery={currentQuery}
          />
        </div>
      </main>

       <footer className="text-center mt-12 text-slate-500 text-sm">
        <p>Built with React, TypeScript, and Tailwind CSS. All operations are simulated in the browser.</p>
      </footer>
    </div>
  );
};

export default App;

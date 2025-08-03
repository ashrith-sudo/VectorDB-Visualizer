
import { Vector, Document, SearchResult } from '../types';

const VECTOR_DIMENSION = 16;

// A simple hashing function to create a number from a string for seeding.
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

// Generate a deterministic, pseudo-random vector from a string.
export const generateVectorFromString = (text: string): Vector => {
  const vector: Vector = [];
  if (!text.trim()) {
      return Array(VECTOR_DIMENSION).fill(0);
  }
  const seed = hashString(text.toLowerCase().trim());
  for (let i = 0; i < VECTOR_DIMENSION; i++) {
    // A simple pseudo-random generator based on the seed
    const x = Math.sin(seed + i) * 10000;
    // Get a value between -1 and 1
    const randomValue = (x - Math.floor(x)) * 2 - 1;
    vector.push(parseFloat(randomValue.toFixed(4)));
  }
  return vector;
};

// Helper functions for cosine similarity
const dotProduct = (vecA: Vector, vecB: Vector): number => {
    return vecA.map((val, i) => val * vecB[i]).reduce((acc, val) => acc + val, 0);
};

const magnitude = (vec: Vector): number => {
    return Math.sqrt(vec.map(val => val * val).reduce((acc, val) => acc + val, 0));
};

// Calculates cosine similarity between two vectors
export const cosineSimilarity = (vecA: Vector, vecB: Vector): number => {
    if (!vecA || !vecB || vecA.length !== vecB.length) {
        return 0;
    }
    const magA = magnitude(vecA);
    const magB = magnitude(vecB);
    if (magA === 0 || magB === 0) {
        return 0;
    }
    return dotProduct(vecA, vecB) / (magA * magB);
};

// Finds the top K most similar documents
export const findTopKSimilar = (queryVector: Vector, documents: (Document & {vector: Vector})[], k: number): SearchResult[] => {
    const similarities = documents.map(doc => ({
        ...doc,
        similarity: cosineSimilarity(queryVector, doc.vector),
    }));

    similarities.sort((a, b) => b.similarity - a.similarity);

    return similarities.slice(0, k);
};

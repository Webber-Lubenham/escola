import React, { useState, useCallback } from 'react';
import { MeetingPart } from '../types';
import { getPreparationTips } from '../services/geminiService';
import { PART_TYPE_INSTRUCTIONS } from '../constants';

interface TipsModalProps {
  part: MeetingPart;
  onClose: () => void;
}

const TipsModal: React.FC<TipsModalProps> = ({ part, onClose }) => {
  const [tips, setTips] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTips = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const partInstructions = PART_TYPE_INSTRUCTIONS[part.tipo] || 'Prepare this part well, keeping the audience in mind.';
      const generatedTips = await getPreparationTips(part, partInstructions);
      setTips(generatedTips);
    } catch (err) {
      setError('Failed to fetch tips. Please check your API key and try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [part]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6 border-b flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold">AI Preparation Tips</h3>
            <p className="text-gray-600 mt-1">For: <span className="font-bold text-blue-700">{part.titulo}</span></p>
          </div>
           <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
        <div className="p-6 max-h-96 overflow-y-auto">
          {isLoading ? (
             <div className="flex flex-col items-center justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="mt-4 text-gray-600">Generating tips...</p>
             </div>
          ) : error ? (
            <div className="text-red-600 bg-red-100 p-4 rounded-md">{error}</div>
          ) : tips ? (
            <div className="prose prose-blue max-w-none" dangerouslySetInnerHTML={{ __html: tips }} />
          ) : (
            <div className="text-center">
              <p className="text-gray-700 mb-4">Click the button to get AI-powered preparation tips for this assignment.</p>
              <button
                onClick={fetchTips}
                className="px-5 py-2.5 font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 transition-all shadow-md"
              >
                Generate Tips
              </button>
            </div>
          )}
        </div>
        <div className="p-4 bg-gray-50 text-right rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TipsModal;

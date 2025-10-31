import React from 'react';
import { AutoAssignResult, WeeklyProgram, Student } from '../types';

interface AutoAssignModalProps {
    result: AutoAssignResult;
    program: WeeklyProgram;
    students: Student[];
    onClose: () => void;
    onConfirm: (suggestions: Record<string, string>) => void;
}

const AutoAssignModal: React.FC<AutoAssignModalProps> = ({ result, program, students, onClose, onConfirm }) => {
    const allParts = program.programacao.flatMap(s => s.partes);

    const findPartById = (id: number) => allParts.find(p => p.idParte === id);
    const findStudentById = (id: string) => students.find(s => s.id === id);

    const suggestionEntries = Object.entries(result.suggestions);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                <div className="p-6 border-b">
                    <h3 className="text-xl font-semibold">Auto-Assign Preview</h3>
                    <p className="text-gray-500 mt-1">Review the suggested assignments before confirming.</p>
                </div>

                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {suggestionEntries.length > 0 && (
                        <div>
                            <h4 className="font-medium text-gray-800 mb-3">Suggested Assignments</h4>
                            <ul className="space-y-3">
                                {suggestionEntries.map(([partId, studentId]) => {
                                    const part = findPartById(Number(partId));
                                    // FIX: The type of `studentId` from `Object.entries` can be inferred as `unknown`, causing a type error. Cast to string to ensure type compatibility.
                                    const student = findStudentById(studentId as string);
                                    if (!part || !student) return null;

                                    return (
                                        <li key={partId} className="p-3 bg-gray-50 rounded-md flex items-center justify-between">
                                            <p className="text-gray-700 font-medium">{part.titulo}</p>
                                            <div className="flex items-center space-x-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                                <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
                                                    {student.nome} {student.familia}
                                                </span>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}

                    {result.diagnostics.unassignedParts.length > 0 && (
                         <div className="mt-6">
                            <h4 className="font-medium text-red-700 mb-3">Unassigned Parts</h4>
                             <p className="text-sm text-gray-600 mb-3">These parts could not be automatically assigned. The reasons are listed below.</p>
                            <ul className="space-y-3">
                                {result.diagnostics.unassignedParts.map(({ part, reason }) => (
                                    <li key={part.idParte} className="p-3 bg-red-50 text-red-800 rounded-md">
                                      <div className="flex items-start space-x-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                        <div>
                                          <p className="font-medium">{part.titulo}</p>
                                          <p className="text-sm text-red-700 mt-1">{reason}</p>
                                        </div>
                                      </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                     {suggestionEntries.length === 0 && result.diagnostics.unassignedParts.length === 0 && (
                        <p className="text-center text-gray-600 py-8">All student parts for this week are already assigned.</p>
                    )}
                </div>

                <div className="p-4 bg-gray-50 flex justify-end space-x-2 rounded-b-lg">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
                        Cancel
                    </button>
                    {suggestionEntries.length > 0 && (
                        <button 
                            type="button" 
                            onClick={() => onConfirm(result.suggestions)} 
                            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Confirm Assignments
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AutoAssignModal;
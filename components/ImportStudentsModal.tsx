import React, { useState } from 'react';
import { Student } from '../types';
import { parseStudentsFromExcel } from '../utils/excel';

interface ImportStudentsModalProps {
    onImport: (students: Student[]) => void;
    onClose: () => void;
}

const ImportStudentsModal: React.FC<ImportStudentsModalProps> = ({ onImport, onClose }) => {
    const [students, setStudents] = useState<Student[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [fileName, setFileName] = useState<string>('');

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        setIsLoading(true);
        setError(null);
        setStudents([]);

        try {
            const parsedStudents = await parseStudentsFromExcel(file);
            setStudents(parsedStudents);
        } catch (err) {
            setError('Failed to parse the Excel file. Please ensure it has columns like "nome", "familia", "genero", and privilege columns (e.g., "reading", "talk").');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirm = () => {
        onImport(students);
    };
    
    const getPrivilegesSummary = (privileges: Student['privileges']) => {
        return Object.entries(privileges)
            .filter(([, value]) => value)
            .map(([key]) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()))
            .join(', ');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl">
                <div className="p-6 border-b">
                    <h3 className="text-xl font-semibold">Import Students from Excel</h3>
                    <p className="text-gray-500 mt-1">Upload an .xlsx file to replace the current student list.</p>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-500 hover:bg-gray-50">
                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className="mt-2 block text-sm font-medium text-gray-900">{fileName || 'Click to upload a file'}</span>
                             <span className="block text-xs text-gray-500">XLSX up to 10MB</span>
                            <input type="file" className="hidden" accept=".xlsx" onChange={handleFileChange} />
                        </label>
                    </div>

                    {isLoading && <p className="text-center text-gray-600">Processing file...</p>}
                    {error && <p className="text-center text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
                    
                    {students.length > 0 && (
                        <div className="border rounded-lg max-h-64 overflow-y-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Privileges</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {students.map(s => (
                                        <tr key={s.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{s.nome} {s.familia}</td>
                                            {/* FIX: Use `s.privileges.isMale` to determine gender as 'genero' does not exist on the Student type. */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{s.privileges.isMale ? 'Brother' : 'Sister'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs">{getPrivilegesSummary(s.privileges) || 'None'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-gray-50 flex justify-between items-center rounded-b-lg">
                    <p className="text-sm text-gray-600">{students.length} students found.</p>
                    <div className="flex space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
                            Cancel
                        </button>
                        <button 
                            type="button" 
                            onClick={handleConfirm}
                            disabled={students.length === 0 || isLoading}
                            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            Confirm Import
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImportStudentsModal;
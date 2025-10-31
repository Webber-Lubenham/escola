import React, { useState } from 'react';
import type { MeetingPart, RequiredPrivileges, Student } from '../types';
import { PRIVILEGE_LIST } from '../constants';

interface RequirementsModalProps {
    part: MeetingPart;
    currentRequirements: RequiredPrivileges;
    onSave: (requiredPrivileges: RequiredPrivileges) => void;
    onClose: () => void;
}

const RequirementsModal: React.FC<RequirementsModalProps> = ({ part, currentRequirements, onSave, onClose }) => {
    const [selectedPrivileges, setSelectedPrivileges] = useState<RequiredPrivileges>([...currentRequirements]);

    const handlePrivilegeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        // FIX: Cast `name` to the more specific type `keyof Omit<Student['privileges'], 'isMale'>`
        // to align with the `RequiredPrivileges` type. This is safe because `isMale` is not
        // rendered as a selectable privilege in the UI.
        const key = name as keyof Omit<Student['privileges'], 'isMale'>;

        setSelectedPrivileges(prev =>
            checked ? [...prev, key] : prev.filter(p => p !== key)
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(selectedPrivileges);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b">
                        <h3 className="text-xl font-semibold">Custom Requirements</h3>
                        <p className="text-gray-600 mt-1">For: <span className="font-bold text-blue-700">{part.titulo}</span></p>
                    </div>
                    <div className="p-6 max-h-[60vh] overflow-y-auto">
                        <p className="text-sm text-gray-700 mb-4">
                            Select additional privileges required for a student to be assigned this part. The default privilege for this part type is always required.
                        </p>
                        <div className="grid grid-cols-1 gap-2 p-3 bg-gray-50 rounded-md border">
                            {PRIVILEGE_LIST.map(priv => (
                                <label key={priv.key} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100">
                                    <input
                                        type="checkbox"
                                        name={priv.key}
                                        checked={selectedPrivileges.includes(priv.key)}
                                        onChange={handlePrivilegeChange}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-800">{priv.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 flex justify-end space-x-2 rounded-b-lg">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors">
                            Save Requirements
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RequirementsModal;
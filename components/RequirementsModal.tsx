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
        // FIX: Cast `name` to the more specific type `keyof Student['privileges']`
        // to align with the `RequiredPrivileges` type.
        const key = name as keyof Student['privileges'];

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
                        <div className="grid grid-cols-1 gap-4 p-3 bg-gray-50 rounded-md border">
                            {PRIVILEGE_LIST.map(priv => (
                                <div key={priv.key} className="relative flex items-start">
                                    <div className="flex h-6 items-center">
                                        <input
                                            id={`req-${priv.key}`}
                                            name={priv.key}
                                            type="checkbox"
                                            checked={selectedPrivileges.includes(priv.key)}
                                            onChange={handlePrivilegeChange}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm leading-6">
                                        <label htmlFor={`req-${priv.key}`} className="font-medium text-gray-900 cursor-pointer">
                                            {priv.label}
                                        </label>
                                        <p className="text-gray-500 text-xs">{priv.description}</p>
                                    </div>
                                </div>
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
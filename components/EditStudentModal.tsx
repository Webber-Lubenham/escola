import React, { useState, useEffect, useMemo } from 'react';
import { Assignment, Student, studentRoles, StudentRole } from '../types';
import { PRIVILEGE_LIST } from '../constants';
import { formatWeekLabel } from '../utils/date';

interface EditStudentModalProps {
    student: Student | null;
    allAssignments: Record<string, Assignment>;
    onSave: (studentData: Omit<Student, 'id'> | Student) => void;
    onClose: () => void;
}

const emptyStudent: Omit<Student, 'id'> = {
    nome: '',
    gender: 'male',
    email: '',
    telefone: '',
    dataNascimento: '',
    dataBatismo: '',
    congregation: 'Congregação Central',
    systemRole: 'student',
    cargo: '',
    ativo: true,
    observacoes: '',
    ministryExperience: '',
    privileges: {
        treasures: false,
        gems: false,
        reading: false,
        talk: false,
        startingConversation: false,
        followingUp: false,
        makingDisciples: false,
        explainingBeliefs: false,
        chairman: false,
        pray: false,
    },
};

const roleLabels: Record<Exclude<StudentRole, ''>, string> = {
    'anciao': 'Elder',
    'servo_ministerial': 'Ministerial Servant',
    'pioneiro_regular': 'Regular Pioneer',
    'publicador_batizado': 'Baptized Publisher',
    'publicador_nao_batizado': 'Unbaptized Publisher',
    'estudante_novo': 'New Student',
};


const statusStyles: Record<Assignment['status'], string> = {
    assigned: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    absent: 'bg-red-100 text-red-800',
};

const maleOnlyPrivileges: (keyof Student['privileges'])[] = [
    'chairman', 'pray', 'treasures', 'gems', 'reading', 'talk'
];

const EditStudentModal: React.FC<EditStudentModalProps> = ({ student, allAssignments, onSave, onClose }) => {
    const [formData, setFormData] = useState<Omit<Student, 'id'>>(emptyStudent);

    useEffect(() => {
        if (student) {
            setFormData({
                ...emptyStudent, // Start with defaults for any potentially missing fields
                ...student,
                privileges: { ...emptyStudent.privileges, ...student.privileges },
            });
        } else {
            setFormData(emptyStudent);
        }
    }, [student]);

    const participationHistory = useMemo(() => {
        if (!student) return [];
        return Object.values(allAssignments)
            .filter(a => a.student.id === student.id)
            .sort((a, b) => b.weekId.localeCompare(a.weekId)); // Sort by date descending
    }, [student, allAssignments]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
          const { checked } = e.target as HTMLInputElement;
          if (name === 'ativo') {
            setFormData(prev => ({ ...prev, [name]: checked }));
          } else {
            handlePrivilegeChange(e as React.ChangeEvent<HTMLInputElement>);
          }
        } else if (name === 'gender') {
            const newGender = value as 'male' | 'female';
            setFormData(prev => {
                const newPrivileges = { ...prev.privileges };
                if (newGender === 'female') {
                    // A sister cannot have male-only privileges, so uncheck them.
                    maleOnlyPrivileges.forEach(p => {
                        newPrivileges[p] = false;
                    });
                }
                return {
                    ...prev,
                    gender: newGender,
                    privileges: newPrivileges
                };
            });
        } else {
          setFormData(prev => ({...prev, [name]: value}));
        }
    };

    const handlePrivilegeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            privileges: {
                ...prev.privileges,
                [name]: checked,
            },
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (student) {
            onSave({ ...formData, id: student.id });
        } else {
            onSave(formData);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b">
                        <h3 className="text-xl font-semibold">{student ? 'Edit Student' : 'Add New Student'}</h3>
                        <p className="text-gray-500 mt-1">Enter the student's details and privileges.</p>
                    </div>
                    <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
                        {/* Basic Info */}
                        <fieldset className="space-y-4">
                            <legend className="text-md font-medium text-gray-800">Basic Info</legend>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Student Name</label>
                                    <input type="text" name="nome" id="nome" value={formData.nome} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Full Name" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                                    <div className="mt-2 flex rounded-md shadow-sm">
                                      <label className={`relative transition-colors duration-150 inline-flex items-center justify-center w-1/2 p-2 text-sm font-medium border border-gray-300 rounded-l-md cursor-pointer focus-within:z-10 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 ${formData.gender === 'male' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
                                          <input
                                              type="radio"
                                              name="gender"
                                              value="male"
                                              checked={formData.gender === 'male'}
                                              onChange={handleChange}
                                              className="sr-only"
                                          />
                                          Brother
                                      </label>
                                      <label className={`relative transition-colors duration-150 -ml-px inline-flex items-center justify-center w-1/2 p-2 text-sm font-medium border border-gray-300 rounded-r-md cursor-pointer focus-within:z-10 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 ${formData.gender === 'female' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
                                          <input
                                              type="radio"
                                              name="gender"
                                              value="female"
                                              checked={formData.gender === 'female'}
                                              onChange={handleChange}
                                              className="sr-only"
                                          />
                                          Sister
                                      </label>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="dataNascimento" className="block text-sm font-medium text-gray-700">Birth Date</label>
                                    <input type="date" name="dataNascimento" id="dataNascimento" value={formData.dataNascimento} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                            </div>
                        </fieldset>
                        
                        {/* Contact Info */}
                        <fieldset className="space-y-4">
                            <legend className="text-md font-medium text-gray-800">Contact</legend>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                    <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                                 <div>
                                    <label htmlFor="telefone" className="block text-sm font-medium text-gray-700">Phone</label>
                                    <input type="tel" name="telefone" id="telefone" value={formData.telefone} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                            </div>
                        </fieldset>

                        {/* Congregation Details */}
                        <fieldset className="space-y-4">
                            <legend className="text-md font-medium text-gray-800">Congregation Details</legend>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="congregation" className="block text-sm font-medium text-gray-700">Congregation</label>
                                    <input type="text" name="congregation" id="congregation" value={formData.congregation || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                                <div>
                                    <label htmlFor="systemRole" className="block text-sm font-medium text-gray-700">System Role</label>
                                    <select name="systemRole" id="systemRole" value={formData.systemRole || 'student'} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500">
                                        <option value="student">Student</option>
                                        <option value="instructor">Instructor</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="cargo" className="block text-sm font-medium text-gray-700">Role/Privilege</label>
                                    <select name="cargo" id="cargo" value={formData.cargo} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500">
                                        <option value="">Select a role...</option>
                                        {studentRoles.map(roleKey => (
                                            <option key={roleKey} value={roleKey}>
                                                {roleLabels[roleKey]}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="dataBatismo" className="block text-sm font-medium text-gray-700">Baptism Date</label>
                                    <input type="date" name="dataBatismo" id="dataBatismo" value={formData.dataBatismo} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label htmlFor="ministryExperience" className="block text-sm font-medium text-gray-700">Ministry Experience</label>
                                    <input type="text" name="ministryExperience" id="ministryExperience" value={formData.ministryExperience || ''} onChange={handleChange} placeholder="e.g., 5 years pioneer, 10 hrs/month" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700">Notes</label>
                                <textarea name="observacoes" id="observacoes" value={formData.observacoes} onChange={handleChange} rows={2} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
                            </div>
                             <div className="flex items-center">
                                <input type="checkbox" name="ativo" id="ativo" checked={formData.ativo} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                <label htmlFor="ativo" className="ml-2 block text-sm text-gray-900">Active Student</label>
                            </div>
                        </fieldset>

                        {/* Privileges */}
                        <fieldset>
                            <legend className="text-md font-medium text-gray-800">Privileges</legend>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mt-2 p-4 bg-gray-50 rounded-md border">
                                {PRIVILEGE_LIST.map(priv => {
                                    const isMaleOnly = maleOnlyPrivileges.includes(priv.key);
                                    const isDisabled = isMaleOnly && formData.gender === 'female';

                                    return (
                                        <div key={priv.key} className={`relative flex items-start ${isDisabled ? 'opacity-60' : ''}`}>
                                            <div className="flex h-6 items-center">
                                                <input
                                                    id={priv.key}
                                                    name={priv.key}
                                                    type="checkbox"
                                                    checked={formData.privileges[priv.key as keyof Student['privileges']] || false}
                                                    onChange={handlePrivilegeChange}
                                                    disabled={isDisabled}
                                                    className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                                />
                                            </div>
                                            <div className="ml-3 text-sm leading-6">
                                                <label htmlFor={priv.key} className={`font-medium text-gray-900 ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                                                    {priv.label}
                                                </label>
                                                <p className="text-gray-500 text-xs">{priv.description}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </fieldset>

                        {/* Participation History */}
                        {student && (
                             <fieldset>
                                <legend className="text-md font-medium text-gray-800">Participation History</legend>
                                {participationHistory.length > 0 ? (
                                    <div className="mt-2 border rounded-md max-h-48 overflow-y-auto">
                                        <ul className="divide-y divide-gray-200">
                                            {participationHistory.map(asg => (
                                                <li key={`${asg.weekId}-${asg.partId}`} className="p-3 flex justify-between items-center">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-800">{asg.partTitle}</p>
                                                        <p className="text-xs text-gray-500">{formatWeekLabel(new Date(`${asg.weekId}T12:00:00Z`), 'en')}</p>
                                                    </div>
                                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusStyles[asg.status]}`}>
                                                        {asg.status}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 mt-2">No assignment history found for this student.</p>
                                )}
                            </fieldset>
                        )}
                    </div>
                    <div className="p-4 bg-gray-50 flex justify-end space-x-2 rounded-b-lg">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors">
                            Save Student
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditStudentModal;
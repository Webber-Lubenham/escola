import React, { useState } from 'react';
import { translations, Language, studentRoleLabels } from '../i18n';
import { studentRoles } from '../types';

interface SignUpProps {
    onSignUp: () => void;
    language: Language;
    setLanguage: (lang: Language) => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSignUp, language, setLanguage }) => {
    const [formState, setFormState] = useState({
        fullName: '',
        dob: '',
        congregation: '',
        role: '',
        systemRole: 'instructor',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const t = translations[language];
    const roleLabels = studentRoleLabels[language];

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLanguage(e.target.value as Language);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Simulating signup with data:", formState);
        onSignUp();
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">{t.title}</h1>
                    <p className="text-gray-500 mt-2">{t.subtitle}</p>
                </div>
                
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-600" htmlFor="language-select">{t.language}</label>
                    <select
                        id="language-select"
                        value={language}
                        onChange={handleLanguageChange}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="pt">{t.portuguese}</option>
                        <option value="en">{t.english}</option>
                    </select>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <fieldset>
                        <legend className="text-lg font-semibold text-gray-700 mb-2">{t.personalInfo}</legend>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600" htmlFor="fullName">{t.fullName}</label>
                                <input type="text" id="fullName" name="fullName" value={formState.fullName} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder={t.fullNamePlaceholder} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600" htmlFor="dob">{t.dob}</label>
                                <input type="text" id="dob" name="dob" value={formState.dob} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder={t.dobPlaceholder} />
                            </div>
                        </div>
                    </fieldset>
                    
                     <fieldset>
                         <legend className="text-lg font-semibold text-gray-700 mb-2">{t.congregationInfo}</legend>
                         <div className="space-y-4">
                             <div>
                                 <label className="block text-sm font-medium text-gray-600" htmlFor="congregation">{t.congregation}</label>
                                 <input type="text" id="congregation" name="congregation" value={formState.congregation} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder={t.congregationPlaceholder} />
                             </div>
                             <div>
                                 <label className="block text-sm font-medium text-gray-600" htmlFor="role">{t.role}</label>
                                 <select id="role" name="role" value={formState.role} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                                     <option value="" disabled>{t.selectRole}</option>
                                    {studentRoles.map(roleKey => (
                                        <option key={roleKey} value={roleKey}>
                                            {roleLabels[roleKey]}
                                        </option>
                                    ))}
                                 </select>
                             </div>
                             <div>
                                 <label className="block text-sm font-medium text-gray-600" htmlFor="systemRole">{t.systemRole}</label>
                                 <select id="systemRole" name="systemRole" value={formState.systemRole} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                                     <option value="instructor">{t.instructorRole}</option>
                                     <option value="student">{t.studentRole}</option>
                                 </select>
                             </div>
                         </div>
                    </fieldset>

                    <fieldset>
                         <legend className="text-lg font-semibold text-gray-700 mb-2">{t.credentials}</legend>
                         <div className="space-y-4">
                             <div>
                                 <label className="block text-sm font-medium text-gray-600" htmlFor="email">{t.email}</label>
                                 <input type="email" id="email" name="email" value={formState.email} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder={t.emailPlaceholder} />
                             </div>
                             <div>
                                 <label className="block text-sm font-medium text-gray-600" htmlFor="password">{t.password}</label>
                                 <input type="password" id="password" name="password" value={formState.password} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder={t.passwordPlaceholder} />
                             </div>
                              <div>
                                 <label className="block text-sm font-medium text-gray-600" htmlFor="confirmPassword">{t.confirmPassword}</label>
                                 <input type="password" id="confirmPassword" name="confirmPassword" value={formState.confirmPassword} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder={t.passwordPlaceholder} />
                             </div>
                         </div>
                    </fieldset>
                    
                    <button type="submit" className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition">
                        {t.signUp}
                    </button>
                </form>

                 <div className="text-center mt-6">
                    <p className="text-sm text-gray-600">
                        {t.alreadyHaveAccount}{' '}
                        <button onClick={onSignUp} className="font-medium text-blue-600 hover:underline">
                           {t.login}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
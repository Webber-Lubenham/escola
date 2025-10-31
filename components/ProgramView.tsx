import React, { useState } from 'react';
import { Assignment, MeetingPart, Student, WeeklyProgram, CustomRequirements, RequiredPrivileges } from '../types';
import { ICONS, PRIVILEGE_LIST } from '../constants';
import AssignStudentModal from './AssignStudentModal';
import TipsModal from './TipsModal';
import RequirementsModal from './RequirementsModal';
import { isAssignablePart } from '../utils/studentUtils';

interface ProgramViewProps {
  program: WeeklyProgram;
  assignments: Record<string, Assignment>;
  students: Student[];
  onAssign: (partId: number, studentId: string, weekId: string) => void;
  onUnassign: (partId: number, weekId: string) => void;
  onUpdateAssignmentStatus: (partId: number, weekId: string, status: Assignment['status']) => void;
  customRequirements: CustomRequirements;
  onSetCustomRequirements: (partId: number, weekId: string, requiredPrivileges: RequiredPrivileges) => void;
}

const statusStyles = {
    assigned: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Assigned' },
    completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
    absent: { bg: 'bg-red-100', text: 'text-red-800', label: 'Absent' },
};

const ProgramView: React.FC<ProgramViewProps> = ({ program, assignments, students, onAssign, onUnassign, onUpdateAssignmentStatus, customRequirements, onSetCustomRequirements }) => {
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isTipsModalOpen, setIsTipsModalOpen] = useState(false);
  const [isRequirementsModalOpen, setRequirementsModalOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<MeetingPart | null>(null);

  const handleOpenAssignModal = (part: MeetingPart) => {
    setSelectedPart(part);
    setIsAssignModalOpen(true);
  };
  
  const handleOpenTipsModal = (part: MeetingPart) => {
    setSelectedPart(part);
    setIsTipsModalOpen(true);
  };

  const handleOpenRequirementsModal = (part: MeetingPart) => {
    setSelectedPart(part);
    setRequirementsModalOpen(true);
  };

  const handleAssignStudent = (studentId: string) => {
    if (selectedPart) {
      onAssign(selectedPart.idParte, studentId, program.idSemana);
    }
    setIsAssignModalOpen(false);
    setSelectedPart(null);
  };
  
  const handleSaveRequirements = (requiredPrivileges: RequiredPrivileges) => {
    if (selectedPart) {
      onSetCustomRequirements(selectedPart.idParte, program.idSemana, requiredPrivileges);
    }
    setRequirementsModalOpen(false);
    setSelectedPart(null);
  };

  const getSectionIcon = (sectionTitle: string) => {
    const lowerCaseTitle = sectionTitle.toLowerCase();
    if (lowerCaseTitle.includes('tesouros') || lowerCaseTitle.includes('treasures')) return ICONS.treasures;
    if (lowerCaseTitle.includes('ministério') || lowerCaseTitle.includes('ministry')) return ICONS.ministry;
    if (lowerCaseTitle.includes('vida') || lowerCaseTitle.includes('living')) return ICONS.life;
    return null;
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-4 sm:p-6 bg-gray-50 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">{program.semanaLabel}</h2>
        <p className="text-md text-gray-600 mt-1">{program.tema}</p>
      </div>
      <div className="divide-y divide-gray-200">
        {program.programacao.map((section, sectionIndex) => (
          <div key={sectionIndex} className="p-4 sm:p-6">
            <div className="flex items-center mb-4">
              <span className="mr-3">{getSectionIcon(section.secao)}</span>
              <h3 className="text-lg font-semibold text-gray-700">{section.secao}</h3>
            </div>
            <ul className="space-y-4">
              {section.partes.map((part) => {
                const assignmentKey = `${program.idSemana}-${part.idParte}`;
                const assignment = assignments[assignmentKey];
                const customReqs = customRequirements[assignmentKey];
                
                return (
                  <li key={part.idParte} className="p-4 bg-gray-50 rounded-lg shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-blue-700">{part.titulo}</p>
                        <p className="text-sm text-gray-500">{part.duracaoMin} min.</p>
                        {part.description && <p className="text-sm text-gray-600 mt-1 italic">{part.description}</p>}
                         {customReqs && customReqs.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1 items-center">
                            <span className="text-xs font-semibold text-gray-500 mr-1">Reqs:</span>
                            {customReqs.map(req => {
                              const label = PRIVILEGE_LIST.find(p => p.key === req)?.label.replace('Starting Conversation', 'Start Conv.').replace('Following Up', 'Follow Up').replace('Making Disciples', 'Disciples').replace('Explaining Beliefs', 'Beliefs') || req;
                              return <span key={req} className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">{label}</span>
                            })}
                          </div>
                        )}
                      </div>
                      <div className="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0 flex items-center space-x-2">
                        {assignment ? (
                          <div className="flex items-center space-x-2">
                             <div className="flex items-center gap-2">
                                {/* FIX: Property 'familia' does not exist on type 'Student'. The 'nome' property contains the full name. */}
                                <span className="font-medium text-gray-800">{assignment.student.nome}</span>
                                <select 
                                    value={assignment.status} 
                                    onChange={(e) => onUpdateAssignmentStatus(part.idParte, program.idSemana, e.target.value as Assignment['status'])}
                                    className={`text-xs font-medium border-none rounded-md ${statusStyles[assignment.status].bg} ${statusStyles[assignment.status].text} focus:ring-2 focus:ring-blue-500`}
                                >
                                    <option value="assigned">Assigned</option>
                                    <option value="completed">Completed</option>
                                    <option value="absent">Absent</option>
                                </select>
                             </div>
                             <button onClick={() => onUnassign(part.idParte, program.idSemana)} className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                             </button>
                          </div>
                        ) : (
                          isAssignablePart(part) && (
                            <button onClick={() => handleOpenAssignModal(part)} className="px-4 py-2 text-sm font-semibold bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors shadow-sm">
                              Assign
                            </button>
                          )
                        )}
                        {isAssignablePart(part) && (
                          <button onClick={() => handleOpenRequirementsModal(part)} className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-gray-100 transition-colors" title="Set Custom Requirements">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0L8 5.45c-.4.36-.82.82-1.13 1.27l-.21.32c-.31.47-.62.98-.91 1.52l-.21.39c-.29.54-.56 1.12-.8 1.71l-.17.42c-.24.59-.44 1.22-.61 1.87l-.11.41c-.17.65-.29 1.33-.37 2.02l-.04.34c-.08.68-.11 1.38-.11 2.09s.03 1.41.11 2.09l.04.34c.08.69.2 1.37.37 2.02l.11.41c.17.65.37 1.28.61 1.87l.17.42c.24.59.51 1.17.8 1.71l.21.39c.29.54.6.95.91 1.52l.21.32c.31.45.73.89 1.13 1.27l.51.51c.4.36.82.82 1.27 1.13l.32.21c.47.31.98.62 1.52.91l.39.21c.54.29 1.12.56 1.71.8l.42.17c.59.24 1.22.44 1.87.61l.41.11c.65.17 1.33.29 2.02.37l.34.04c.68.08 1.38.11 2.09.11s1.41-.03 2.09-.11l.34-.04c.69-.08 1.37-.2 2.02-.37l.41-.11c.65-.17 1.28-.37 1.87-.61l.42-.17c.59-.24 1.17-.51 1.71-.8l.39-.21c.54-.29.95-.6 1.52-.91l.32-.21c.45-.31.89-.73 1.27-1.13l.51-.51c.36-.4.82-.82 1.13-1.27l.21-.32c.31-.47.62-.98.91-1.52l.21-.39c.29-.54.56-1.12.8-1.71l.17-.42c.24-.59.44-1.22.61-1.87l.11-.41c.17-.65.29-1.33.37-2.02l.04-.34c.08-.68.11-1.38-.11-2.09s-.03-1.41-.11-2.09l-.04-.34c-.08-.69-.2-1.37-.37-2.02l-.11-.41c-.17-.65-.37-1.28-.61-1.87l-.17-.42c-.24-.59-.51-1.17-.8-1.71l-.21-.39c-.29-.54-.6-.95-.91-1.52l-.21-.32c-.31-.45-.73-.89-1.13-1.27l-.51-.51zM10 12a2 2 0 100-4 2 2 0 000 4z"></path></svg>
                          </button>
                        )}
                      </div>
                    </div>
                     {isAssignablePart(part) && (
                      <div className="mt-3 text-right">
                          <button onClick={() => handleOpenTipsModal(part)} className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:underline">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            <span>Get AI Preparation Tips</span>
                          </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      {isAssignModalOpen && selectedPart && (
        <AssignStudentModal
          part={selectedPart}
          students={students}
          weekId={program.idSemana}
          allAssignments={assignments}
          onClose={() => setIsAssignModalOpen(false)}
          onAssign={handleAssignStudent}
          customRequirementsForPart={customRequirements[`${program.idSemana}-${selectedPart.idParte}`]}
        />
      )}
       {isTipsModalOpen && selectedPart && (
        <TipsModal
          part={selectedPart}
          onClose={() => setIsTipsModalOpen(false)}
        />
      )}
      {isRequirementsModalOpen && selectedPart && (
        <RequirementsModal
          part={selectedPart}
          currentRequirements={customRequirements[`${program.idSemana}-${selectedPart.idParte}`] || []}
          onClose={() => setRequirementsModalOpen(false)}
          onSave={handleSaveRequirements}
        />
      )}
    </div>
  );
};

export default ProgramView;

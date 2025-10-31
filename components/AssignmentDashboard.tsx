import React, { useState } from 'react';
import { Assignment, Student, WeeklyProgram, AutoAssignResult, CustomRequirements, RequiredPrivileges } from '../types';
import ProgramView from './ProgramView';
import StudentList from './StudentList';
import { autoAssign } from '../utils/autoAssign';
import AutoAssignModal from './AutoAssignModal';

interface AssignmentDashboardProps {
  program: WeeklyProgram;
  students: Student[];
  assignments: Record<string, Assignment>;
  onAssign: (partId: number, studentId: string, weekId: string) => void;
  onUnassign: (partId: number, weekId: string) => void;
  onUpdateAssignmentStatus: (partId: number, weekId: string, status: Assignment['status']) => void;
  onAddStudent: (student: Student) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onImportStudents: (students: Student[]) => void;
  customRequirements: CustomRequirements;
  onSetCustomRequirements: (partId: number, weekId: string, requiredPrivileges: RequiredPrivileges) => void;
}

const AssignmentDashboard: React.FC<AssignmentDashboardProps> = ({
  program,
  students,
  assignments,
  onAssign,
  onUnassign,
  onUpdateAssignmentStatus,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onImportStudents,
  customRequirements,
  onSetCustomRequirements,
}) => {
  const [isAutoAssignOpen, setIsAutoAssignOpen] = useState(false);
  const [autoAssignResult, setAutoAssignResult] = useState<AutoAssignResult | null>(null);

  const handleAutoAssign = () => {
    const result = autoAssign(program, students, assignments, customRequirements);
    setAutoAssignResult(result);
    setIsAutoAssignOpen(true);
  };

  const handleConfirmAutoAssign = (suggestions: Record<string, string>) => {
    Object.entries(suggestions).forEach(([partId, studentId]) => {
      onAssign(Number(partId), studentId, program.idSemana);
    });
    setIsAutoAssignOpen(false);
    setAutoAssignResult(null);
  };


  return (
    <>
      <div className="mb-6 bg-white p-4 rounded-lg shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-gray-800">Assignment Management</h3>
        <button
          onClick={handleAutoAssign}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 text-sm font-semibold bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 1-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 1 3.09-3.09L12 5.25l2.846.813a4.5 4.5 0 0 1 3.09 3.09L21.75 12l-2.846.813a4.5 4.5 0 0 1-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.898 20.51l-1.5-1.5-1.4-1.4a3.375 3.375 0 0 0-2.455-2.456L10.5 15.25l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L15 11.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L18.75 15l-1.035.259a3.375 3.375 0 0 0-2.456 2.456z" /></svg>
          <span>Auto-assign Students</span>
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2">
          <ProgramView 
            program={program}
            assignments={assignments}
            students={students}
            onAssign={onAssign}
            onUnassign={onUnassign}
            onUpdateAssignmentStatus={onUpdateAssignmentStatus}
            customRequirements={customRequirements}
            onSetCustomRequirements={onSetCustomRequirements}
          />
        </div>
        <div>
          <StudentList 
            students={students}
            assignments={assignments}
            onAddStudent={onAddStudent}
            onUpdateStudent={onUpdateStudent}
            onDeleteStudent={onDeleteStudent}
            onImportStudents={onImportStudents}
          />
        </div>
      </div>
       {isAutoAssignOpen && autoAssignResult && (
        <AutoAssignModal
          result={autoAssignResult}
          program={program}
          students={students}
          onClose={() => setIsAutoAssignOpen(false)}
          onConfirm={handleConfirmAutoAssign}
        />
      )}
    </>
  );
};

export default AssignmentDashboard;
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
            onAutoAssign={handleAutoAssign}
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
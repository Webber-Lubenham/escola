import React, { useMemo } from 'react';
import { MeetingPart, Student, RequiredPrivileges, Assignment } from '../types';
import { getQualifiedStudents } from '../utils/studentUtils';

interface AssignStudentModalProps {
  part: MeetingPart;
  students: Student[];
  weekId: string;
  allAssignments: Record<string, Assignment>;
  onClose: () => void;
  onAssign: (studentId: string) => void;
  customRequirementsForPart?: RequiredPrivileges;
}

const AssignStudentModal: React.FC<AssignStudentModalProps> = ({ part, students, weekId, allAssignments, onClose, onAssign, customRequirementsForPart }) => {

  const qualifiedStudents = useMemo(() => {
    // First, filter students based on part requirements
    const filteredStudents = getQualifiedStudents(part, students, customRequirementsForPart);

    // Then, calculate current load for this week for sorting purposes
    const studentLoad: Record<string, number> = {};
    students.forEach(s => (studentLoad[s.id] = 0));
    Object.values(allAssignments)
        .filter(a => a.weekId === weekId)
        .forEach(a => {
            if (studentLoad[a.student.id] !== undefined) {
                studentLoad[a.student.id]++;
            }
        });
        
    // Finally, sort the filtered list by load for display in the modal
    return filteredStudents.sort((a, b) => {
        const loadA = studentLoad[a.id] || 0;
        const loadB = studentLoad[b.id] || 0;
        if (loadA !== loadB) {
            return loadA - loadB;
        }
        return a.nome.localeCompare(b.nome);
    });
  }, [part, students, weekId, allAssignments, customRequirementsForPart]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 border-b">
          <h3 className="text-xl font-semibold">Assign Student</h3>
          <p className="text-gray-600 mt-1">For: <span className="font-bold text-blue-700">{part.titulo}</span></p>
        </div>
        <div className="p-6 max-h-80 overflow-y-auto">
          <ul className="space-y-2">
            {qualifiedStudents.length > 0 ? qualifiedStudents.map(student => {
              const nameParts = student.nome.trim().split(/\s+/);
              let initials = '';
              if (nameParts.length > 0 && nameParts[0]) { initials += nameParts[0][0]; }
              if (nameParts.length > 1 && nameParts[nameParts.length - 1]) { initials += nameParts[nameParts.length - 1][0]; }
              else if (nameParts.length === 1 && nameParts[0].length > 1) { initials += nameParts[0][1]; }
              
              return (
              <li key={student.id}>
                <button
                  onClick={() => onAssign(student.id)}
                  className="w-full text-left p-3 rounded-md hover:bg-blue-50 transition-colors flex items-center space-x-3"
                >
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                        {initials.toUpperCase()}
                    </div>
                    <span>{student.nome}</span>
                </button>
              </li>
            )}) : <p className="text-gray-500">No qualified students found for this part.</p>}
          </ul>
        </div>
        <div className="p-4 bg-gray-50 text-right rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignStudentModal;
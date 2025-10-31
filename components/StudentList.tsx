import React, { useState } from 'react';
import { Assignment, Student } from '../types';
import EditStudentModal from './EditStudentModal';
import ImportStudentsModal from './ImportStudentsModal';
import ConfirmationModal from './ConfirmationModal';
import { studentRoleLabels } from '../i18n';

interface StudentListProps {
  students: Student[];
  assignments: Record<string, Assignment>;
  onAddStudent: (studentData: Omit<Student, 'id'>) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onImportStudents: (students: Student[]) => void;
}

const StudentList: React.FC<StudentListProps> = ({ students, assignments, onAddStudent, onUpdateStudent, onDeleteStudent, onImportStudents }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);


  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setIsEditModalOpen(true);
  };
  
  const handleOpenAdd = () => {
    setEditingStudent(null);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingStudent(null);
  };

  const handleSaveStudent = (studentData: Omit<Student, 'id'> | Student) => {
    if ('id' in studentData) {
      onUpdateStudent(studentData);
    } else {
      onAddStudent(studentData);
    }
    handleCloseEditModal();
  };
  
  const handleConfirmImport = (importedStudents: Student[]) => {
    onImportStudents(importedStudents);
    setIsImportModalOpen(false);
  };

  const handleDeleteClick = (student: Student) => {
    setStudentToDelete(student);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (studentToDelete) {
        onDeleteStudent(studentToDelete.id);
    }
  };
  
  const handleCloseConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setStudentToDelete(null);
  };

  return (
    <>
      <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4 border-b pb-2 gap-2 flex-wrap">
          <h3 className="text-lg font-semibold text-gray-700">Available Students</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-semibold bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors shadow-sm"
              title="Import from Excel"
            >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
               <span>Import</span>
            </button>
            <button
              onClick={handleOpenAdd}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-semibold bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <span>Add</span>
            </button>
          </div>
        </div>
        {students.length === 0 ? (
            <div className="text-center py-10 px-4">
               <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197" />
               </svg>
               <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
               <p className="mt-1 text-sm text-gray-500">Get started by adding a new student or importing a list from Excel.</p>
           </div>
        ) : (
        <ul className="space-y-3 max-h-[600px] overflow-y-auto">
          {students.map(student => {
            const roleLabel = student.cargo ? studentRoleLabels.en[student.cargo] : (student.gender === 'male' ? 'Brother' : 'Sister');
            return (
              <li key={student.id} className="p-3 bg-gray-50 rounded-md flex items-center justify-between group">
                 <div className="flex items-center space-x-3">
                      <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                              {student.nome.charAt(0)}{student.familia.charAt(0)}
                          </div>
                          <span className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white ${student.ativo ? 'bg-green-400' : 'bg-gray-400'}`} title={student.ativo ? 'Active' : 'Inactive'}></span>
                      </div>
                      <div>
                          <p className="font-semibold text-gray-800">{student.nome} {student.familia}</p>
                          <p className="text-sm text-gray-500">
                             {roleLabel}
                          </p>
                      </div>
                  </div>
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenEdit(student)} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-100" title="Edit Student">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                            <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <button onClick={() => handleDeleteClick(student)} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-100" title="Delete Student">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                             <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
              </li>
            );
          })}
        </ul>
        )}
      </div>
      {isEditModalOpen && (
        <EditStudentModal 
            student={editingStudent}
            allAssignments={assignments}
            onClose={handleCloseEditModal}
            onSave={handleSaveStudent}
        />
      )}
      {isImportModalOpen && (
        <ImportStudentsModal
            onClose={() => setIsImportModalOpen(false)}
            onImport={handleConfirmImport}
        />
      )}
       {isConfirmModalOpen && studentToDelete && (
          <ConfirmationModal
            title="Delete Student"
            message={`Are you sure you want to delete ${studentToDelete.nome} ${studentToDelete.familia}? This will unassign them from all parts and cannot be undone.`}
            confirmText="Delete"
            onConfirm={handleConfirmDelete}
            onClose={handleCloseConfirmModal}
          />
      )}
    </>
  );
};

export default StudentList;
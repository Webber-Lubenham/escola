import React, { useState, useMemo, useEffect } from 'react';
import { students as initialStudents } from './data/students';
import { Assignment, Student, WeeklyProgram, CustomRequirements, RequiredPrivileges } from './types';
import AssignmentDashboard from './components/AssignmentDashboard';
import { Header } from './components/Header';
import { fetchMeetingData } from './services/wolApiService';
import { formatWeekLabel } from './utils/date';
import SignUp from './components/SignUp';
import { Language } from './i18n';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentDate, setCurrentDate] = useState(new Date('2025-09-08T12:00:00Z'));
  const [language, setLanguage] = useState<Language>('pt');
  
  const [program, setProgram] = useState<WeeklyProgram | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [assignments, setAssignments] = useState<Record<string, Assignment>>({});
  const [students, setStudents] = useState<Student[]>([]);
  const [customRequirements, setCustomRequirements] = useState<CustomRequirements>({});

  // Check login state on mount
  useEffect(() => {
    const storedLoginState = localStorage.getItem('ministry-meeting-isLoggedIn');
    if (storedLoginState === 'true') {
        setIsLoggedIn(true);
    }
  }, []);

  // Load students from localStorage on mount, or use initialStudents
  useEffect(() => {
    try {
      const storedStudents = localStorage.getItem('ministry-meeting-students');
      if (storedStudents) {
        setStudents(JSON.parse(storedStudents));
      } else {
        setStudents(initialStudents);
        localStorage.setItem('ministry-meeting-students', JSON.stringify(initialStudents));
      }
    } catch (error) {
      console.error("Failed to load students from localStorage", error);
      setStudents(initialStudents);
    }
  }, []);

  // Save students to localStorage whenever they change
  useEffect(() => {
    try {
        if (students.length > 0) {
            localStorage.setItem('ministry-meeting-students', JSON.stringify(students));
        }
    } catch (error) {
      console.error("Failed to save students to localStorage", error);
    }
  }, [students]);
  
  // Load assignments from localStorage
  useEffect(() => {
    try {
      const storedAssignments = localStorage.getItem('ministry-meeting-assignments');
      if (storedAssignments) {
        setAssignments(JSON.parse(storedAssignments));
      }
    } catch (error) {
      console.error("Failed to load assignments from localStorage", error);
    }
  }, []);

  // Save assignments to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ministry-meeting-assignments', JSON.stringify(assignments));
    } catch (error) {
      console.error("Failed to save assignments to localStorage", error);
    }
  }, [assignments]);


  // Load custom requirements from localStorage
  useEffect(() => {
    try {
      const storedReqs = localStorage.getItem('ministry-meeting-requirements');
      if (storedReqs) {
        setCustomRequirements(JSON.parse(storedReqs));
      }
    } catch (error) {
      console.error("Failed to load custom requirements from localStorage", error);
    }
  }, []);

  // Save custom requirements to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ministry-meeting-requirements', JSON.stringify(customRequirements));
    } catch (error) {
      console.error("Failed to save custom requirements to localStorage", error);
    }
  }, [customRequirements]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const loadProgram = async () => {
      setIsLoading(true);
      setError(null);
      setProgram(null);
      try {
        const data = await fetchMeetingData(currentDate, language);
        setProgram(data);
      } catch (e) {
        setError("Failed to load program data. This might happen if the program for the selected week is not available.");
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadProgram();
  }, [currentDate, language, isLoggedIn]);

  const handleLogin = () => {
    localStorage.setItem('ministry-meeting-isLoggedIn', 'true');
    setIsLoggedIn(true);
  };
    
  const handleLogout = () => {
      localStorage.removeItem('ministry-meeting-isLoggedIn');
      setIsLoggedIn(false);
  };

  const handleWeekChange = (direction: 'next' | 'prev') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
      return newDate;
    });
  };

  const handleAssign = (partId: number, studentId: string, weekId: string) => {
    const student = students.find(s => s.id === studentId);
    const part = program?.programacao.flatMap(s => s.partes).find(p => p.idParte === partId);

    if (student && part) {
      const assignmentKey = `${weekId}-${partId}`;
      setAssignments(prev => ({
        ...prev,
        [assignmentKey]: { student, partId, weekId, partTitle: part.titulo, status: 'assigned' },
      }));
    }
  };

  const handleUnassign = (partId: number, weekId: string) => {
    const assignmentKey = `${weekId}-${partId}`;
    setAssignments(prev => {
      const newAssignments = { ...prev };
      delete newAssignments[assignmentKey];
      return newAssignments;
    });
  };

  const handleUpdateAssignmentStatus = (partId: number, weekId: string, status: Assignment['status']) => {
    const assignmentKey = `${weekId}-${partId}`;
    setAssignments(prev => {
      if (prev[assignmentKey]) {
        return {
          ...prev,
          [assignmentKey]: {
            ...prev[assignmentKey],
            status,
          },
        };
      }
      return prev;
    });
  };
  
  const handleAddStudent = (newStudent: Student) => {
    setStudents(prev => [...prev, newStudent]);
  };
  
  const handleUpdateStudent = (updatedStudent: Student) => {
      setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
  };
  
  const handleDeleteStudent = (studentId: string) => {
      setStudents(prev => prev.filter(s => s.id !== studentId));
      // Also unassign this student from all parts
      setAssignments(prev => {
          const newAssignments = { ...prev };
          Object.keys(newAssignments).forEach(key => {
              if (newAssignments[key].student.id === studentId) {
                  delete newAssignments[key];
              }
          });
          return newAssignments;
      });
  };

  const handleImportStudents = (importedStudents: Student[]) => {
    setStudents(importedStudents);
    // Unassign all students since the list has changed
    setAssignments({});
  };

  const handleSetCustomRequirements = (partId: number, weekId: string, requiredPrivileges: RequiredPrivileges) => {
    const key = `${weekId}-${partId}`;
    setCustomRequirements(prev => {
        const newReqs = { ...prev };
        if (requiredPrivileges.length > 0) {
            newReqs[key] = requiredPrivileges;
        } else {
            delete newReqs[key]; // Clean up if no requirements are set
        }
        return newReqs;
    });
  };

  if (!isLoggedIn) {
    return <SignUp onSignUp={handleLogin} language={language} setLanguage={setLanguage} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Header onLogout={handleLogout} />
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <label htmlFor="language-select" className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                <select
                  id="language-select"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="w-full sm:w-auto p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="pt">Português (Brasil)</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div className="flex-1 text-center">
                 <h2 className="text-lg font-semibold text-gray-700">Selected Week</h2>
                 <p className="text-blue-600 font-medium">{formatWeekLabel(currentDate, language)}</p>
              </div>
              <div className="flex-1 flex items-center justify-end space-x-2">
                 <button onClick={() => handleWeekChange('prev')} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
                    &larr; Prev
                 </button>
                 <button onClick={() => handleWeekChange('next')} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
                    Next &rarr;
                 </button>
              </div>
            </div>
          </div>

          {isLoading && (
             <div className="flex items-center justify-center p-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="ml-4 text-gray-600">Loading Program...</p>
             </div>
          )}
          {error && <p className="text-center text-red-500 bg-red-100 p-4 rounded-md">{error}</p>}
          
          {!isLoading && !error && program ? (
            <AssignmentDashboard
              program={program}
              students={students}
              assignments={assignments}
              onAssign={handleAssign}
              onUnassign={handleUnassign}
              onUpdateAssignmentStatus={handleUpdateAssignmentStatus}
              onAddStudent={handleAddStudent}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
              onImportStudents={handleImportStudents}
              customRequirements={customRequirements}
              onSetCustomRequirements={handleSetCustomRequirements}
            />
          ) : (
            !isLoading && !error && <p className="text-center text-gray-500 p-10">No program found for the selected week. Please try another date.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
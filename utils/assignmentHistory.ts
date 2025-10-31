import { Assignment, Student, HistoricoDesignacao } from '../types';

const WEEKS_TO_CONSIDER = 8;

export const processAssignmentHistory = (
    allAssignments: Record<string, Assignment>,
    students: Student[]
): Map<string, HistoricoDesignacao> => {
    const historyMap = new Map<string, HistoricoDesignacao>();
    const eightWeeksAgo = new Date();
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - (WEEKS_TO_CONSIDER * 7));
    const eightWeeksAgoId = eightWeeksAgo.toISOString().split('T')[0];

    // Initialize map for all students to ensure everyone is included
    students.forEach(student => {
        historyMap.set(student.id, {
            total_designacoes_8_semanas: 0,
            ultima_designacao: undefined,
            designacoes_recentes: [],
        });
    });

    const relevantAssignments = Object.values(allAssignments).filter(a => a.weekId >= eightWeeksAgoId);
    
    // Sort by date to easily find the last assignment
    relevantAssignments.sort((a, b) => a.weekId.localeCompare(b.weekId));

    for (const assignment of relevantAssignments) {
        const studentId = assignment.student.id;
        const studentHistory = historyMap.get(studentId);

        if (studentHistory) {
            studentHistory.total_designacoes_8_semanas++;
            studentHistory.ultima_designacao = assignment.weekId;
            studentHistory.designacoes_recentes.push({ data_inicio_semana: assignment.weekId });
        }
    }

    return historyMap;
};

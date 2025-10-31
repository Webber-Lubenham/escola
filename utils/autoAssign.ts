import { Assignment, WeeklyProgram, Student, MeetingPart, AutoAssignResult, CustomRequirements, RequiredPrivileges, UnassignedPartInfo } from '../types';
import { isAssignablePart, getQualifiedStudents } from './studentUtils';
import { processAssignmentHistory } from './assignmentHistory';
import { BalanceadorHistorico } from './historyBalancer';

const findQualificationBottleneck = (
    part: MeetingPart,
    students: Student[],
    customRequirementsForPart?: RequiredPrivileges
): string => {
    // Role check for appointed parts
    if (part.tipo === 'talk' || part.tipo === 'gems') {
        const hasAppointedMen = students.some(s => s.ativo && s.gender === 'male' && (s.cargo === 'anciao' || s.cargo === 'servo_ministerial'));
        if (!hasAppointedMen) {
            return 'No Elders or Ministerial Servants are available in the student list.';
        }
    }

    // Gender check
    if (part.restricoes?.genero) {
        if (part.restricoes.genero === 'M') {
            const hasGenderMatch = students.some(s => s.ativo && s.gender === 'male');
            if (!hasGenderMatch) return 'No active male students exist in the student list.';
        } else { // 'F'
            const hasGenderMatch = students.some(s => s.ativo && s.gender === 'female');
            if (!hasGenderMatch) return 'No active female students exist in the student list.';
        }
    }

    // Default privilege check
    const defaultPrivilegeMap: Partial<Record<string, keyof Student['privileges']>> = {
        'reading': 'reading',
        'student_talk': 'talk',
        'explaining_beliefs': 'explainingBeliefs',
        'starting_conversation': 'startingConversation',
        'following_up': 'followingUp',
        'making_disciples': 'makingDisciples',
    };
    const requiredDefaultPrivilege = defaultPrivilegeMap[part.tipo];
    
    if (requiredDefaultPrivilege) {
        const hasPrivilegeMatch = students.some(s => s.ativo && s.privileges[requiredDefaultPrivilege]);
        if (!hasPrivilegeMatch) {
            return `No active students have the required default privilege: '${requiredDefaultPrivilege}'.`;
        }
    }

    // Custom requirements check
    if (customRequirementsForPart && customRequirementsForPart.length > 0) {
        const hasCustomMatch = students.some(s => 
            s.ativo && customRequirementsForPart.every(priv => s.privileges[priv])
        );
        if (!hasCustomMatch) {
            return `No active students meet all custom requirements: ${customRequirementsForPart.join(', ')}.`;
        }
    }

    return 'No active students meet the combined qualification criteria (role, gender, privileges).';
};


export const autoAssign = (
    program: WeeklyProgram,
    students: Student[],
    currentAssignments: Record<string, Assignment>,
    customRequirements: CustomRequirements
): AutoAssignResult => {
    const allProgramParts = program.programacao.flatMap(section => section.partes);
    const assignableParts = allProgramParts.filter(isAssignablePart);

    const unassignedPartsToAutoAssign = assignableParts.filter(
        part => !currentAssignments[`${program.idSemana}-${part.idParte}`]
    );

    const historyMap = processAssignmentHistory(currentAssignments, students);
    const balancer = new BalanceadorHistorico(historyMap);

    const initialStudentLoad: Record<string, number> = {};
    students.forEach(s => (initialStudentLoad[s.id] = 0));

    Object.values(currentAssignments).forEach(ass => {
        if (ass.weekId === program.idSemana && initialStudentLoad[ass.student.id] !== undefined) {
            initialStudentLoad[ass.student.id]++;
        }
    });
    
    const tempStudentLoad = { ...initialStudentLoad };

    const suggestions: Record<string, string> = {}; // partId -> studentId
    const unassignedParts: UnassignedPartInfo[] = [];

    // Prioritize parts with fewer qualified candidates to solve for the hardest parts first
    const sortedParts = [...unassignedPartsToAutoAssign].sort((a, b) => {
        const keyA = `${program.idSemana}-${a.idParte}`;
        const keyB = `${program.idSemana}-${b.idParte}`;
        const candidatesA = getQualifiedStudents(a, students, customRequirements[keyA]).length;
        const candidatesB = getQualifiedStudents(b, students, customRequirements[keyB]).length;
        return candidatesA - candidatesB;
    });

    for (const part of sortedParts) {
        const key = `${program.idSemana}-${part.idParte}`;
        const customReqs = customRequirements[key];

        // STEP 1: QUALIFICATION
        // Filter the student list to find everyone who is qualified for this part.
        // This correctly handles all requirements: active status, gender, role (Elder/MS),
        // and any custom privileges set by the user for this specific part.
        const allQualifiedStudents = getQualifiedStudents(part, students, customReqs);

        if (allQualifiedStudents.length === 0) {
            const reason = findQualificationBottleneck(part, students, customReqs);
            unassignedParts.push({ part, reason });
            continue;
        }

        // STEP 2: PRIORITIZE BY CURRENT WEEK'S LOAD
        // To ensure fair distribution and avoid assigning multiple parts if possible,
        // we first prioritize students who have the fewest assignments in the current week.
        
        // Find the minimum number of assignments any qualified student has this week.
        // This will be 0 if there are available students with no parts yet.
        const minAssignmentsThisWeek = Math.min(
            ...allQualifiedStudents.map(student => tempStudentLoad[student.id] || 0)
        );

        // Create a candidate pool consisting *only* of students who have that minimum number of assignments.
        // This is the core logic that prevents assigning a second part if someone with zero parts is available.
        const leastBusyCandidates = allQualifiedStudents.filter(
            student => (tempStudentLoad[student.id] || 0) === minAssignmentsThisWeek
        );
        
        if (leastBusyCandidates.length === 0) {
            // This is a safeguard and should not be reached if allQualifiedStudents has items.
            unassignedParts.push({ part, reason: 'Could not find a candidate with the minimum number of weekly assignments.' });
            continue;
        }

        // STEP 3: TIE-BREAK USING 8-WEEK HISTORY
        // If there's a tie (multiple students have the same low number of weekly assignments),
        // we use their assignment history over the last 8 weeks to break the tie.
        // The balancer selects the student who is most "due" for a part.
        const candidateIds = leastBusyCandidates.map(s => s.id);
        const bestStudentScore = balancer.selecionarMelhorEstudante(candidateIds);
        
        // Final selection and assignment.
        const bestStudentId = bestStudentScore?.estudanteId;
        
        if (bestStudentId) {
            suggestions[part.idParte.toString()] = bestStudentId;
            // IMPORTANT: Increment the selected student's load for the next part's calculation in this loop.
            tempStudentLoad[bestStudentId] = (tempStudentLoad[bestStudentId] || 0) + 1;
        } else {
             unassignedParts.push({ part, reason: 'No suitable candidate could be selected from the qualified pool.' });
        }
    }

    const warnings: string[] = [];
    // Recalculate the load including the new suggestions to generate accurate warnings.
    const finalStudentLoad = { ...initialStudentLoad };
    Object.values(suggestions).forEach(studentId => {
        finalStudentLoad[studentId] = (finalStudentLoad[studentId] || 0) + 1;
    });

    Object.entries(finalStudentLoad).forEach(([studentId, count]) => {
        if (count > 1) {
            const student = students.find(s => s.id === studentId);
            if (student) {
                warnings.push(`${student.nome} has been assigned ${count} parts this week due to limited availability of other qualified students.`);
            }
        }
    });

    return {
        suggestions,
        diagnostics: {
            unassignedParts,
            warnings,
        },
    };
};

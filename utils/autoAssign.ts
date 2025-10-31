import { Assignment, WeeklyProgram, Student, MeetingPart, AutoAssignResult, CustomRequirements, RequiredPrivileges, UnassignedPartInfo } from '../types';
import { isStudentPart, getQualifiedStudents } from './studentUtils';

const findQualificationBottleneck = (
    part: MeetingPart,
    students: Student[],
    customRequirementsForPart?: RequiredPrivileges
): string => {
    // Gender check
    if (part.restricoes?.genero) {
        if (part.restricoes.genero === 'M') {
            const hasGenderMatch = students.some(s => s.privileges.isMale);
            if (!hasGenderMatch) return 'No male students exist in the student list.';
        } else { // 'F'
            const hasGenderMatch = students.some(s => !s.privileges.isMale);
            if (!hasGenderMatch) return 'No female students exist in the student list.';
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
        const hasPrivilegeMatch = students.some(s => s.privileges[requiredDefaultPrivilege as keyof Omit<Student['privileges'], 'isMale'>]);
        if (!hasPrivilegeMatch) {
            return `No students have the required default privilege: '${requiredDefaultPrivilege}'.`;
        }
    }

    // Custom requirements check
    if (customRequirementsForPart && customRequirementsForPart.length > 0) {
        const hasCustomMatch = students.some(s => 
            customRequirementsForPart.every(priv => s.privileges[priv])
        );
        if (!hasCustomMatch) {
            return `No students meet all custom requirements: ${customRequirementsForPart.join(', ')}.`;
        }
    }

    return 'No students meet the combined qualification criteria (gender, default, and custom privileges).';
};


export const autoAssign = (
    program: WeeklyProgram,
    students: Student[],
    currentAssignments: Record<string, Assignment>,
    customRequirements: CustomRequirements
): AutoAssignResult => {
    const allProgramParts = program.programacao.flatMap(section => section.partes);

    const studentParts = allProgramParts.filter(isStudentPart);

    const unassignedStudentParts = studentParts.filter(
        part => !currentAssignments[`${program.idSemana}-${part.idParte}`]
    );

    const studentLoad: Record<string, number> = {};
    students.forEach(s => (studentLoad[s.id] = 0));

    Object.values(currentAssignments).forEach(ass => {
        if (ass.weekId === program.idSemana && studentLoad[ass.student.id] !== undefined) {
            studentLoad[ass.student.id]++;
        }
    });

    const suggestions: Record<string, string> = {}; // partId -> studentId
    const unassignedParts: UnassignedPartInfo[] = [];

    // Prioritize parts with fewer qualified candidates to solve for the hardest parts first
    const sortedParts = [...unassignedStudentParts].sort((a, b) => {
        const keyA = `${program.idSemana}-${a.idParte}`;
        const keyB = `${program.idSemana}-${b.idParte}`;
        const candidatesA = getQualifiedStudents(a, students, studentLoad, customRequirements[keyA]).length;
        const candidatesB = getQualifiedStudents(b, students, studentLoad, customRequirements[keyB]).length;
        return candidatesA - candidatesB;
    });

    for (const part of sortedParts) {
        const key = `${program.idSemana}-${part.idParte}`;
        const customReqs = customRequirements[key];

        // Get all theoretically qualified students, sorted by load
        const allQualifiedStudents = getQualifiedStudents(part, students, studentLoad, customReqs);

        if (allQualifiedStudents.length === 0) {
            // There is fundamentally no one who can take this part.
            const reason = findQualificationBottleneck(part, students, customReqs);
            unassignedParts.push({ part, reason });
            continue;
        }

        // Filter out students already suggested in this auto-assign run
        const assignedInThisRun = Object.values(suggestions);
        const availableStudents = allQualifiedStudents.filter(s => !assignedInThisRun.includes(s.id));
        
        if (availableStudents.length === 0) {
            // Qualified students exist, but they're all busy this week.
            unassignedParts.push({ part, reason: 'All qualified students have already been assigned to other parts this week.' });
            continue;
        }

        // The list is already sorted by load, so the first student is the best candidate
        const bestStudent = availableStudents[0];
        suggestions[part.idParte.toString()] = bestStudent.id;
        studentLoad[bestStudent.id]++;
    }

    return {
        suggestions,
        diagnostics: {
            unassignedParts,
            warnings: [],
        },
    };
};
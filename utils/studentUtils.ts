import { MeetingPart, Student, RequiredPrivileges } from '../types';

export const isAssignablePart = (part: MeetingPart): boolean => {
    const assignablePartTypes = [
        'talk',
        'gems',
        'reading',
        'starting_conversation',
        'following_up',
        'making_disciples',
        'explaining_beliefs',
        'student_talk'
    ];
    return assignablePartTypes.includes(part.tipo);
};

export const getQualifiedStudents = (
    part: MeetingPart,
    students: Student[],
    studentLoad: Record<string, number>,
    customRequirements?: RequiredPrivileges
): Student[] => {
    const qualified = students.filter(student => {
        // Active student check
        if (!student.ativo) {
            return false;
        }

        // Role-based checks for appointed men parts
        if (part.tipo === 'talk' || part.tipo === 'gems') {
            if (student.gender !== 'male') return false;
            const isAppointed = student.cargo === 'anciao' || student.cargo === 'servo_ministerial';
            if (!isAppointed) return false;
        }

        // Gender check from part restrictions
        if ((part.restricoes?.genero === 'M' && student.gender !== 'male') ||
            (part.restricoes?.genero === 'F' && student.gender !== 'female')) {
            return false;
        }

        // Default privilege check for student parts
        const defaultPrivilegeMap: Partial<Record<string, keyof Student['privileges']>> = {
            'reading': 'reading',
            'student_talk': 'talk',
            'explaining_beliefs': 'explainingBeliefs',
            'starting_conversation': 'startingConversation',
            'following_up': 'followingUp',
            'making_disciples': 'makingDisciples',
        };

        const requiredDefaultPrivilege = defaultPrivilegeMap[part.tipo];
        if (requiredDefaultPrivilege && !student.privileges[requiredDefaultPrivilege]) {
            return false;
        }

        // Custom requirements check
        if (customRequirements && customRequirements.length > 0) {
            if (!customRequirements.every(privilege => student.privileges[privilege])) {
                return false;
            }
        }

        return true;
    });

    // Sort by current assignment load (ascending), then by name as a tie-breaker
    return qualified.sort((a, b) => {
        const loadA = studentLoad[a.id] || 0;
        const loadB = studentLoad[b.id] || 0;
        if (loadA !== loadB) {
            return loadA - loadB;
        }
        return a.nome.localeCompare(b.nome);
    });
};
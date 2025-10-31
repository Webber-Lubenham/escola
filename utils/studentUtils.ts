import { MeetingPart, Student, RequiredPrivileges } from '../types';

export const isStudentPart = (part: MeetingPart): boolean => {
    const studentPartTypes = ['reading', 'starting_conversation', 'following_up', 'making_disciples', 'explaining_beliefs', 'student_talk'];
    return studentPartTypes.includes(part.tipo);
};

export const getQualifiedStudents = (
    part: MeetingPart,
    students: Student[],
    studentLoad: Record<string, number>,
    customRequirements?: RequiredPrivileges
): Student[] => {
    const qualified = students.filter(student => {
        // Gender check
        if ((part.restricoes?.genero === 'M' && student.gender !== 'male') ||
            (part.restricoes?.genero === 'F' && student.gender !== 'female')) {
            return false;
        }

        // Default privilege check based on part type
        const defaultPrivilegeMap: Partial<Record<string, keyof Student['privileges']>> = {
            'reading': 'reading',
            'student_talk': 'talk', // student_talk part type requires the 'talk' privilege
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
    
    // Sort by current assignment load (ascending)
    return qualified.sort((a, b) => {
        const loadA = studentLoad[a.id] || 0;
        const loadB = studentLoad[b.id] || 0;
        return loadA - loadB;
    });
};
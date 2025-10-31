import { MeetingPart, Student, RequiredPrivileges } from '../types';

/**
 * Checks if a given part is an assignment for a student.
 * Excludes parts like opening comments, songs, videos, or congregation study.
 * @param part The meeting part to check.
 * @returns True if the part is a student assignment, false otherwise.
 */
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

/**
 * These part types are structurally assigned only to male students,
 * based on the 'Our Christian Life and Ministry Meeting Instructions'.
 */
const MALE_ONLY_PART_TYPES: string[] = [
    'talk',          // Handled by Elders or Ministerial Servants (males)
    'gems',          // Handled by Elders or Ministerial Servants (males)
    'reading',       // Student assignment for a male student
    'student_talk'   // Student assignment for a male student (as a talk)
];

/**
 * Filters the master list of students to find who is eligible for a specific part.
 * It checks multiple criteria in order, returning only those who pass all checks.
 * The comments explain the reason for disqualification at each step.
 *
 * @param part The meeting part to find qualified students for.
 * @param students The complete list of students in the congregation.
 * @param customRequirements Optional extra privileges set by the user for this part.
 * @returns An array of qualified students.
 */
export const getQualifiedStudents = (
    part: MeetingPart,
    students: Student[],
    customRequirements?: RequiredPrivileges
): Student[] => {
    return students.filter(student => {
        // === CHECK 1: Student must be active ===
        const isInactive = !student.ativo;
        if (isInactive) {
            // REASON FOR DISQUALIFICATION: Student is marked as inactive.
            return false;
        }

        // === CHECK 2: Gender requirements must be met ===
        // A) Intrinsic rule-based gender check for specific part types.
        const isMaleOnlyPartType = MALE_ONLY_PART_TYPES.includes(part.tipo);
        const isWrongGenderForRule = isMaleOnlyPartType && student.gender !== 'male';
        if (isWrongGenderForRule) {
            // REASON FOR DISQUALIFICATION: This part type is reserved for male students.
            return false;
        }

        // B) Explicit gender restriction from program data.
        const explicitGenderRestriction = part.restricoes?.genero;
        if (explicitGenderRestriction) {
            const requiredGender = explicitGenderRestriction === 'M' ? 'male' : 'female';
            const isWrongGenderForData = student.gender !== requiredGender;
            if (isWrongGenderForData) {
                // REASON FOR DISQUALIFICATION: Part data specifies it is for the other gender.
                return false;
            }
        }

        // === CHECK 3: Role requirements for appointed brothers must be met ===
        const isAppointedPart = part.tipo === 'talk' || part.tipo === 'gems';
        if (isAppointedPart) {
            const isAppointedBrother = student.cargo === 'anciao' || student.cargo === 'servo_ministerial';
            if (!isAppointedBrother) {
                // REASON FOR DISQUALIFICATION: Part requires an Elder or Ministerial Servant.
                return false;
            }
        }

        // === CHECK 4: Default privilege for the part type must be enabled ===
        const defaultPrivilegeMap: Partial<Record<string, keyof Student['privileges']>> = {
            'talk': 'treasures', // The main "Treasures" talk for appointed brothers
            'gems': 'gems',      // The "Spiritual Gems" part for appointed brothers
            'reading': 'reading',
            'student_talk': 'talk', // Note: 'talk' privilege is for student talks
            'explaining_beliefs': 'explainingBeliefs',
            'starting_conversation': 'startingConversation',
            'following_up': 'followingUp',
            'making_disciples': 'makingDisciples',
        };
        const requiredDefaultPrivilege = defaultPrivilegeMap[part.tipo];
        if (requiredDefaultPrivilege) {
            const hasDefaultPrivilege = student.privileges[requiredDefaultPrivilege];
            if (!hasDefaultPrivilege) {
                // REASON FOR DISQUALIFICATION: Student does not have the default privilege for this type of part.
                return false;
            }
        }

        // === CHECK 5: All custom requirements must be met ===
        const hasCustomRequirements = customRequirements && customRequirements.length > 0;
        if (hasCustomRequirements) {
            const meetsAllCustomRequirements = customRequirements.every(privilege => student.privileges[privilege]);
            if (!meetsAllCustomRequirements) {
                // REASON FOR DISQUALIFICATION: Student is missing one or more custom-set privileges for this part.
                return false;
            }
        }

        // If a student passes all checks, they are qualified.
        return true;
    });
};

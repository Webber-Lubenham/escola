export const studentRoles = [
  'anciao',
  'servo_ministerial',
  'pioneiro_regular',
  'publicador_batizado',
  'publicador_nao_batizado',
  'estudante_novo',
] as const;

export type StudentRole = typeof studentRoles[number] | '';

export interface Student {
  id: string;
  nome: string; // This will now be the full name
  gender: 'male' | 'female';
  email?: string;
  telefone?: string;
  dataNascimento?: string;
  dataBatismo?: string;
  congregation?: string;
  systemRole?: 'instructor' | 'student';
  cargo?: StudentRole;
  ativo: boolean;
  observacoes?: string;
  ministryExperience?: string; // New field for ministry experience
  privileges: {
    treasures: boolean;
    gems: boolean;
    reading: boolean;
    talk: boolean;
    startingConversation: boolean;
    followingUp: boolean;
    makingDisciples: boolean;
    explainingBeliefs: boolean;
    chairman: boolean;
    pray: boolean;
  };
}

export interface MeetingPart {
  idParte: number;
  titulo: string;
  duracaoMin: number;
  tipo: string;
  description?: string;
  restricoes?: {
    genero: 'M' | 'F';
  };
  referencias?: string[];
  tema?: string;
}

export interface MeetingSection {
  secao: string;
  partes: MeetingPart[];
}

export interface WeeklyProgram {
  idSemana: string;
  semanaLabel: string;
  tema: string;
  programacao: MeetingSection[];
}

export interface Assignment {
  student: Student;
  partId: number;
  weekId: string;
  partTitle: string;
  status: 'assigned' | 'completed' | 'absent';
}

export type RequiredPrivileges = (keyof Student['privileges'])[];

export type CustomRequirements = Record<string, RequiredPrivileges>; // Key is `${weekId}-${partId}`

export interface UnassignedPartInfo {
  part: MeetingPart;
  reason: string;
}

export interface AutoAssignDiagnostics {
  unassignedParts: UnassignedPartInfo[];
  warnings: string[];
}

export interface AutoAssignResult {
  suggestions: Record<string, string>; // partId -> studentId
  diagnostics: AutoAssignDiagnostics;
}

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
  // New optional fields for workbook UI
  long_description?: string;
  image?: {
    alt: string;
  };
  questions?: string[];
  lembrete?: string;
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
  audio?: string;
  source?: string;
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

// Types for History Balancer
export interface HistoricoDesignacao {
  total_designacoes_8_semanas: number;
  ultima_designacao?: string; // date string 'YYYY-MM-DD'
  designacoes_recentes: { data_inicio_semana: string }[];
}

export interface PontuacaoPrioridade {
  estudanteId: string;
  pontuacaoBase: number;
  fatorAleatorio: number;
  pontuacaoFinal: number;
  totalDesignacoes8Semanas: number;
  diasDesdeUltima?: number;
  ultimaDesignacao?: string;
  detalhes: {
    bonusTempoSemDesignacao: number;
    penalizacaoFrequencia: number;
    ajusteAleatorio: number;
  };
}

export interface ConfiguracaoBalanceamento {
  pesoFrequencia: number;
  pesoTempoSemDesignacao: number;
  fatorAleatorioMax: number;
  semanasHistorico: number;
  bonusMaximoTempo: number;
}

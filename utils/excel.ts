import * as xlsx from 'xlsx';
import { Student } from '../types';

const toBoolean = (value: any): boolean => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
        const lower = value.toLowerCase().trim();
        return lower === 'true' || lower === 'verdadeiro' || lower === 'yes' || lower === 'sim' || lower === '1';
    }
    if (typeof value === 'number') {
        return value === 1;
    }
    return false;
};


export const parseStudentsFromExcel = (file: File): Promise<Student[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                if (!data) {
                    throw new Error("File data is empty.");
                }
                const workbook = xlsx.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = xlsx.utils.sheet_to_json<any>(worksheet);

                const students: Student[] = jsonData.map((row) => {
                    const normalizedRow: { [key: string]: any } = {};
                    Object.keys(row).forEach(key => {
                        normalizedRow[key.toLowerCase().trim().replace(/ /g, '')] = row[key];
                    });
                    
                    const fullName = (normalizedRow.nome || normalizedRow.firstname || '').split(' ');
                    const firstName = fullName[0] || '';
                    const lastName = normalizedRow.familia || normalizedRow.sobrenome || normalizedRow.lastname || fullName.slice(1).join(' ') || '';


                    const student: Student = {
                        id: crypto.randomUUID(),
                        nome: firstName,
                        familia: lastName,
                        email: normalizedRow.email || '',
                        telefone: normalizedRow.telefone || normalizedRow.phone || '',
                        dataNascimento: normalizedRow.datanascimento || normalizedRow.birthdate || '',
                        dataBatismo: normalizedRow.databatismo || normalizedRow.baptismdate || '',
                        congregation: normalizedRow.congregation || normalizedRow.congregacao || 'Congregação Central',
                        systemRole: (normalizedRow.systemrole || normalizedRow.funcaonosistema || 'student').toLowerCase() as 'instructor' | 'student',
                        cargo: normalizedRow.cargo || normalizedRow.role || '',
                        ativo: toBoolean(normalizedRow.ativo !== undefined ? normalizedRow.ativo : (normalizedRow.active !== undefined ? normalizedRow.active : true)),
                        observacoes: normalizedRow.observacoes || normalizedRow.notes || '',
                        ministryExperience: normalizedRow.ministryexperience || normalizedRow.experienciaministerial || '',
                        privileges: {
                            isMale: (normalizedRow.genero || normalizedRow.gender || 'masculino').toLowerCase() !== 'feminino',
                            chairman: toBoolean(normalizedRow.chairman),
                            pray: toBoolean(normalizedRow.pray),
                            treasures: toBoolean(normalizedRow.treasures || normalizedRow.tresures),
                            gems: toBoolean(normalizedRow.gems),
                            reading: toBoolean(normalizedRow.reading),
                            talk: toBoolean(normalizedRow.talk),
                            startingConversation: toBoolean(normalizedRow.startingconversation || normalizedRow.starting),
                            followingUp: toBoolean(normalizedRow.followingup || normalizedRow.following),
                            makingDisciples: toBoolean(normalizedRow.makingdisciples || normalizedRow.making),
                            explainingBeliefs: toBoolean(normalizedRow.explainingbeliefs || normalizedRow.explaining),
                        }
                    };
                    
                    if (!student.nome || !student.familia) {
                        throw new Error(`Row is missing 'nome' or 'familia': ${JSON.stringify(row)}`);
                    }

                    return student;
                });

                resolve(students);

            } catch (error) {
                console.error("Error processing Excel file:", error);
                reject(error);
            }
        };

        reader.onerror = (error) => {
            reject(error);
        };

        reader.readAsArrayBuffer(file);
    });
};
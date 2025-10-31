
import React, { useState, useEffect } from 'react';
import { WeeklyProgram, MeetingPart } from './types';
import { fetchMeetingData } from './services/wolApiService';
import { formatWeekLabel } from './utils/date';
import { Language } from './i18n';

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date('2025-10-20T12:00:00Z'));
  const [language, setLanguage] = useState<Language>('pt');
  
  const [program, setProgram] = useState<WeeklyProgram | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
  }, [currentDate, language]);

  const handleWeekChange = (direction: 'next' | 'prev') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
      return newDate;
    });
  };
  
  const PartCard: React.FC<{ part: MeetingPart, index: number, language: Language }> = ({ part, index, language }) => {
    return (
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          <span className="text-blue-600 mr-2">{index}.</span>{part.titulo}
          { part.duracaoMin > 0 && <span className="text-base font-normal text-gray-500 ml-2">({part.duracaoMin} min)</span>}
        </h3>
        
        {part.image && (
          <div className="my-4 p-4 border rounded-lg bg-gray-50 text-center">
             <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded">
                <p className="text-gray-500 italic">{part.image.alt}</p>
             </div>
          </div>
        )}

        {part.long_description && (
          <div className="prose max-w-none text-gray-700 leading-relaxed mb-4" style={{ whiteSpace: 'pre-wrap' }}>
            {part.long_description}
          </div>
        )}
        
        {part.referencias && (
          <p className="text-sm text-gray-600 mb-4">{part.referencias.join(' ')}</p>
        )}
        
        {part.lembrete && (
            <div className="mt-4 p-3 bg-gray-100 border-l-4 border-gray-400 text-sm text-gray-700">
                <p><span className="font-bold">{language === 'pt' ? 'LEMBRE-SE:' : 'REMEMBER:'}</span> {part.lembrete}</p>
            </div>
        )}

        {part.questions && part.questions.map((q, i) => (
          <div key={i} className="my-4">
            <p className="text-gray-700 mb-2" style={{ whiteSpace: 'pre-wrap' }}>{q}</p>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Sua resposta"
              rows={3}
              aria-label={`Response for: ${q}`}
            />
          </div>
        ))}
      </div>
    );
  };
  
  const datePart = program ? 
    (language === 'pt' 
        ? program.semanaLabel.substring(0, program.semanaLabel.lastIndexOf(' de ')) 
        : program.semanaLabel.split(',')[0]
    )
    : '';

  return (
    <div className="bg-white text-gray-800 font-sans">
      <header className="bg-gray-100 border-b">
        <div className="max-w-4xl mx-auto p-4 flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center space-x-4 text-sm font-medium text-gray-600">
            <a href="#" className="hover:text-blue-600">Digite um assunto</a>
            <a href="#" className="hover:text-blue-600 font-bold text-blue-700">BÍBLIA</a>
            <a href="#" className="hover:text-blue-600">PUBLICAÇÕES</a>
            <a href="#" className="hover:text-blue-600">REUNIÕES</a>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {program && program.source && (
            <div className="text-sm text-blue-600 mb-4">
              {program.source} {datePart}
            </div>
          )}
          
          <div className="border rounded-lg p-4 mb-6">
              <h4 className="text-sm text-gray-600 mb-2">Audio Player</h4>
              <audio controls className="w-full">
                  <source src={program?.audio} type="audio/mpeg" />
                  Your browser does not support the audio element.
              </audio>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{formatWeekLabel(currentDate, language)}</h1>
            <p className="text-gray-600">Nossa Vida e Ministério Cristão — Apostila do Mês — 2025</p>
          </div>

          <div className="flex items-center justify-center space-x-2 mb-8">
             <button onClick={() => handleWeekChange('prev')} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
                &larr; Prev
             </button>
             <button onClick={() => handleWeekChange('next')} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
                Next &rarr;
             </button>
          </div>

          {isLoading && (
             <div className="flex items-center justify-center p-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="ml-4 text-gray-600">Loading Program...</p>
             </div>
          )}
          {error && <p className="text-center text-red-500 bg-red-100 p-4 rounded-md">{error}</p>}
          
          {!isLoading && !error && program ? (
            <div>
              {program.programacao.map((section, sectionIdx) => {
                const startingPartNumber = program.programacao.slice(0, sectionIdx).reduce((acc, sec) => acc + sec.partes.length, 0);
                return (
                  <section key={section.secao} className="mb-12">
                    <h2 className="text-2xl font-bold text-blue-800 border-b-2 border-blue-200 pb-2 mb-6">
                      {section.secao}
                    </h2>
                    {section.partes.map((part, partIdx) => (
                        <PartCard key={part.idParte} part={part} index={startingPartNumber + partIdx + 1} language={language} />
                    ))}
                  </section>
                )
              })}
            </div>
          ) : (
            !isLoading && !error && <p className="text-center text-gray-500 p-10">No program found for the selected week. Please try another date.</p>
          )}

        </div>
      </main>
      
      <footer className="border-t bg-gray-50">
        <div className="max-w-4xl mx-auto p-4 text-center text-xs text-gray-500">
          <div className="mb-2">
              <button 
                onClick={() => setLanguage(lang => lang === 'pt' ? 'en' : 'pt')}
                className="px-3 py-1 border border-gray-300 rounded-md bg-gray-50 hover:bg-gray-100"
              >
                {language === 'pt' ? 'Português (Brasil)' : 'English'}
              </button>
          </div>
          <p>Copyright © 2025 Watch Tower Bible and Tract Society of Pennsylvania</p>
          <div className="mt-2 space-x-4">
              <a href="#" className="hover:underline">Termos de Uso</a>
              <a href="#" className="hover:underline">Política de Privacidade</a>
              <a href="#" className="hover:underline">Configurações de Privacidade</a>
              <a href="#" className="hover:underline">JW.ORG</a>
              <a href="#" className="hover:underline">Login</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
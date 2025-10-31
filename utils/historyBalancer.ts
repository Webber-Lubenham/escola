/**
 * Sistema de Balanceamento por Histórico de Designações
 * 
 * Este módulo implementa o algoritmo de balanceamento que prioriza estudantes
 * com menos designações nas últimas 8 semanas, incluindo fatores aleatórios
 * para evitar padrões previsíveis.
 */

import type { HistoricoDesignacao, PontuacaoPrioridade, ConfiguracaoBalanceamento } from '../types';

/**
 * Configuração padrão do algoritmo
 */
const CONFIGURACAO_PADRAO: ConfiguracaoBalanceamento = {
  pesoFrequencia: 10,
  pesoTempoSemDesignacao: 1,
  fatorAleatorioMax: 5,
  semanasHistorico: 8,
  bonusMaximoTempo: 56
};

/**
 * Classe principal para balanceamento por histórico
 */
export class BalanceadorHistorico {
  private configuracao: ConfiguracaoBalanceamento;
  private historicoMap: Map<string, HistoricoDesignacao>;

  constructor(
    historico: Map<string, HistoricoDesignacao>,
    configuracao: Partial<ConfiguracaoBalanceamento> = {}
  ) {
    this.historicoMap = historico;
    this.configuracao = { ...CONFIGURACAO_PADRAO, ...configuracao };
  }

  /**
   * Calcula a pontuação de prioridade para um estudante
   * Menor pontuação = maior prioridade
   */
  calcularPontuacao(estudanteId: string): PontuacaoPrioridade {
    const historico = this.historicoMap.get(estudanteId);
    const totalDesignacoes = historico?.total_designacoes_8_semanas || 0;
    const ultimaDesignacao = historico?.ultima_designacao;

    // 1. Penalização por frequência (mais designações = maior penalização)
    const penalizacaoFrequencia = totalDesignacoes * this.configuracao.pesoFrequencia;

    // 2. Bônus por tempo sem designação
    let bonusTempoSemDesignacao = 0;
    let diasDesdeUltima: number | undefined;

    if (ultimaDesignacao) {
      diasDesdeUltima = Math.floor(
        (Date.now() - new Date(ultimaDesignacao).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      // Aplicar bônus limitado ao máximo configurado
      const bonusBruto = Math.min(diasDesdeUltima, this.configuracao.bonusMaximoTempo);
      bonusTempoSemDesignacao = bonusBruto * this.configuracao.pesoTempoSemDesignacao;
    } else {
      // Se nunca teve designação, dar bônus máximo
      bonusTempoSemDesignacao = this.configuracao.bonusMaximoTempo * this.configuracao.pesoTempoSemDesignacao;
    }

    // 3. Fator aleatório para evitar padrões previsíveis
    const fatorAleatorio = Math.random() * this.configuracao.fatorAleatorioMax;

    // 4. Cálculo da pontuação base e final
    const pontuacaoBase = 100; // Base neutra
    const ajusteAleatorio = fatorAleatorio - (this.configuracao.fatorAleatorioMax / 2); // Centrado em 0
    
    const pontuacaoFinal = pontuacaoBase + penalizacaoFrequencia - bonusTempoSemDesignacao + ajusteAleatorio;

    return {
      estudanteId,
      pontuacaoBase,
      fatorAleatorio,
      pontuacaoFinal: Math.max(0, pontuacaoFinal), // Não permitir pontuação negativa
      totalDesignacoes8Semanas: totalDesignacoes,
      diasDesdeUltima,
      ultimaDesignacao,
      detalhes: {
        bonusTempoSemDesignacao,
        penalizacaoFrequencia,
        ajusteAleatorio
      }
    };
  }

  /**
   * Ordena uma lista de estudantes por prioridade (menor pontuação primeiro)
   */
  ordenarPorPrioridade(estudantesIds: string[]): PontuacaoPrioridade[] {
    const pontuacoes = estudantesIds.map(id => this.calcularPontuacao(id));
    
    return pontuacoes.sort((a, b) => {
      // Ordenar por pontuação final (menor = maior prioridade)
      if (a.pontuacaoFinal !== b.pontuacaoFinal) {
        return a.pontuacaoFinal - b.pontuacaoFinal;
      }
      
      // Em caso de empate, priorizar quem tem menos designações
      if (a.totalDesignacoes8Semanas !== b.totalDesignacoes8Semanas) {
        return a.totalDesignacoes8Semanas - b.totalDesignacoes8Semanas;
      }
      
      // Em caso de empate total, manter ordem aleatória
      return Math.random() - 0.5;
    });
  }

  /**
   * Seleciona o melhor estudante de uma lista baseado na prioridade
   */
  selecionarMelhorEstudante(estudantesIds: string[]): PontuacaoPrioridade | null {
    if (estudantesIds.length === 0) {
      return null;
    }

    const ordenados = this.ordenarPorPrioridade(estudantesIds);
    return ordenados[0];
  }
}

// src/app/dashboard/pgr/exportarPDF.ts

export function exportarAbaPDF(
  pgr: any,
  abaKey: string,
  abaLabel: string
) {
  const win = window.open('', '_blank')
  if (!win) {
    alert('Permita pop-ups para exportar o PDF.')
    return
  }

  const corRisco = (c: string) => {
    switch (c?.toLowerCase()) {
      case 'critico': case 'crítico': return '#dc2626'
      case 'alto': return '#f97316'
      case 'moderado': return '#f59e0b'
      case 'baixo': return '#16a34a'
      case 'muito baixo': return '#22c55e'
      default: return '#64748b'
    }
  }

  const bgRisco = (c: string) => {
    switch (c?.toLowerCase()) {
      case 'critico': case 'crítico': return '#fef2f2'
      case 'alto': return '#fff7ed'
      case 'moderado': return '#fffbeb'
      case 'baixo': return '#f0fdf4'
      case 'muito baixo': return '#f0fdf4'
      default: return '#f8fafc'
    }
  }

  const statusColor = (s: string) => {
    switch (s?.toLowerCase()) {
      case 'conforme': case 'implementado': case 'concluido': case 'concluído': return { bg: '#dcfce7', color: '#16a34a' }
      case 'parcialmente conforme': case 'parcial': case 'em andamento': case 'em progresso': return { bg: '#fef3c7', color: '#f59e0b' }
      case 'nao conforme': case 'não conforme': case 'pendente': case 'nao iniciado': case 'não iniciado': return { bg: '#fef2f2', color: '#dc2626' }
      default: return { bg: '#f1f5f9', color: '#64748b' }
    }
  }

  const esc = (text: any) => {
    if (text === null || text === undefined) return ''
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  }

  let conteudo = ''

  if (abaKey === 'resumo') {
    const ind = pgr.indicadores
    conteudo = `
      <div class="kpi-grid">
      <div class="kpi-card"><div class="kpi-label">Média Geral</div><div class="kpi-valor" style="color:${ind.mediaGeral >= 3.5 ? '#16a34a' : ind.mediaGeral >= 2.5 ? '#f59e0b' : '#dc2626'}">${ind.mediaGeral}/5.00</div></div>
      <div class="kpi-card"><div class="kpi-label">Respondentes</div><div class="kpi-valor" style="color:#3b82f6">${ind.totalRespondentes}</div></div>
      <div class="kpi-card"><div class="kpi-label">Participação</div><div class="kpi-valor" style="color:#8b5cf6">${ind.taxaParticipacao ? ind.taxaParticipacao + '%' : 'N/D'}</div></div>
      <div class="kpi-card"><div class="kpi-label">Fatores Críticos</div><div class="kpi-valor" style="color:#dc2626">${ind.fatoresCriticos}</div></div>
      <div class="kpi-card"><div class="kpi-label">Fatores Altos</div><div class="kpi-valor" style="color:#f97316">${ind.fatoresAltos}</div></div>
      <div class="kpi-card"><div class="kpi-label">Medidas</div><div class="kpi-valor" style="color:#0891b2">${ind.totalMedidasRecomendadas}</div></div>
      </div>
      <h2>Visão Geral por Categoria de Risco</h2>
      <table><thead><tr><th style="text-align:left">Categoria</th><th>Média</th><th>% Crítico</th><th>Prob.</th><th>Sev.</th><th>Nível</th><th>Classificação</th></tr></thead><tbody>
      ${pgr.inventario.map((item: any) =>
        `<tr><td style="font-weight:600">${esc(item.categoria)}</td>
        <td style="text-align:center">${item.mediaPontuacao}</td>
        <td style="text-align:center">${item.percentualCritico}%</td>
        <td style="text-align:center">${item.probabilidade.valor} (${esc(item.probabilidade.descricao)})</td>
        <td style="text-align:center">${item.severidade.valor} (${esc(item.severidade.descricao)})</td>
        <td style="text-align:center;font-weight:700;color:${corRisco(item.classificacao)}">${item.nivelRisco}</td>
        <td style="text-align:center"><span class="badge" style="background:${bgRisco(item.classificacao)};color:${corRisco(item.classificacao)}">${esc(item.classificacao)}</span></td></tr>`
      ).join('')}</tbody></table>
      <div class="two-col"><div class="info-box"><h3>Objetivos</h3><p>${esc(pgr.objetivos)}</p></div>
      <div class="info-box"><h3>Metodologia</h3><p>${esc(pgr.metodologia)}</p></div></div>`
  }

  if (abaKey === 'inventario') {
    conteudo = pgr.inventario.map((item: any) => {
      const total = Object.values(item.distribuicao as Record<string, number>).reduce((s: number, v: number) => s + v, 0)
      return `<div class="risk-card" style="border-left:4px solid ${corRisco(item.classificacao)}">
        <div class="risk-header"><div><h3>${esc(item.categoria)}</h3>
        <p class="subtitle">Fator NR-1: ${esc(item.fatorNR1)} | ISO 45003: ${esc(item.fatorISO45003)}</p></div>
        <div style="text-align:right"><span class="badge" style="background:${bgRisco(item.classificacao)};color:${corRisco(item.classificacao)};font-size:13px;padding:6px 16px">${esc(item.classificacao)} (${item.nivelRisco})</span>
        <p class="subtitle" style="margin-top:4px">${esc(item.prioridade)}</p></div></div>
        <div class="kpi-grid" style="margin-bottom:12px">
        <div class="kpi-card"><div class="kpi-label">MÉDIA</div><div class="kpi-valor">${item.mediaPontuacao}</div></div>
        <div class="kpi-card"><div class="kpi-label">% CRÍTICO</div><div class="kpi-valor" style="color:${item.percentualCritico > 30 ? '#dc2626' : '#1e293b'}">${item.percentualCritico}%</div></div>
        <div class="kpi-card"><div class="kpi-label">PROBABILIDADE</div><div class="kpi-valor">${item.probabilidade.valor}</div><div class="kpi-sub">${esc(item.probabilidade.descricao)}</div></div>
        <div class="kpi-card"><div class="kpi-label">SEVERIDADE</div><div class="kpi-valor">${item.severidade.valor}</div><div class="kpi-sub">${esc(item.severidade.descricao)}</div></div></div>
        <div class="dist-bar">${[1, 2, 3, 4, 5].map(n => {
          const pct = total > 0 ? ((item.distribuicao[n] || 0) / total) * 100 : 0
          const cores = ['#dc2626', '#f97316', '#f59e0b', '#84cc16', '#16a34a']
          return `<div style="flex:${Math.max(pct, 2)};background:${cores[n - 1]};border-radius:4px;text-align:center;color:#fff;font-size:10px;font-weight:700;padding:3px 0">${pct > 8 ? Math.round(pct) + '%' : ''}</div>`
        }).join('')}</div>
        <div style="display:flex;justify-content:space-between;font-size:10px;color:#94a3b8;margin-bottom:12px"><span>1 (Crítico)</span><span>5 (Ótimo)</span></div>
        ${item.causasProvaveis?.length > 0 ? `<h4>Causas Prováveis</h4>${item.causasProvaveis.map((c: any) =>
          `<div class="causa-box"><strong>${esc(c.titulo)}</strong><p>${esc(c.descricao)}</p>${c.impactos ? `<p class="subtle">Impactos: ${esc(c.impactos)}</p>` : ''}</div>`
        ).join('')}` : ''}
        ${item.medidasRecomendadas?.length > 0 ? `<h4>Medidas de Controle Recomendadas</h4>${item.medidasRecomendadas.map((m: any) =>
          `<div class="medida-box"><div style="display:flex;justify-content:space-between;align-items:center"><strong>${esc(m.titulo)}</strong><span class="badge" style="background:#dcfce7;color:#16a34a">${esc(m.tipo)}</span></div>
          <p>${esc(m.descricao)}</p><p class="subtle">Responsável: ${esc(m.responsavel)} | Prazo: ${esc(m.prazoSugerido)} | Ref: ${esc(m.referenciaLegal)}</p></div>`
        ).join('')}` : ''}
        </div>`
    }).join('')
  }

  if (abaKey === 'matriz') {
    conteudo = `<h2>Matriz de Risco</h2><table><thead><tr><th style="text-align:left">Categoria</th><th>Probabilidade</th><th>Severidade</th><th>Nível Risco</th><th>Classificação</th></tr></thead><tbody>
      ${pgr.matrizRisco.map((m: any) =>
        `<tr><td style="font-weight:600">${esc(m.categoria)}</td>
        <td style="text-align:center">${m.probabilidade} (${esc(m.probabilidadeDesc)})</td>
        <td style="text-align:center">${m.severidade} (${esc(m.severidadeDesc)})</td>
        <td style="text-align:center;font-weight:700;font-size:16px;color:${corRisco(m.classificacao)}">${m.nivelRisco}</td>
        <td style="text-align:center"><span class="badge" style="background:${bgRisco(m.classificacao)};color:${corRisco(m.classificacao)}">${esc(m.classificacao)}</span></td></tr>`
      ).join('')}</tbody></table>`
  }

  if (abaKey === 'apr') {
    if (!pgr.apr) { conteudo = '<p class="empty">APR não disponível neste PGR.</p>' }
    else {
      conteudo = `<h2>${esc(pgr.apr.titulo)}</h2><p class="subtitle">Data: ${esc(pgr.apr.dataElaboracao)} | Responsável: ${esc(pgr.apr.responsavel)}</p>
        <table class="small-table"><thead><tr><th>ID</th><th>Perigo</th><th>Consequências</th><th>P</th><th>S</th><th>NR</th><th>Classif.</th><th>Medidas</th><th>Resp.</th><th>Prazo</th></tr></thead><tbody>
        ${pgr.apr.itens.map((item: any) =>
          `<tr><td>${esc(item.id)}</td><td style="font-weight:600;max-width:160px">${esc(item.perigo)}</td><td style="max-width:180px">${esc(item.consequencias)}</td>
          <td style="text-align:center">${item.probabilidade.valor}</td><td style="text-align:center">${item.severidade.valor}</td>
          <td style="text-align:center;font-weight:700;color:${corRisco(item.classificacao)}">${item.nivelRisco}</td>
          <td style="text-align:center"><span class="badge" style="background:${bgRisco(item.classificacao)};color:${corRisco(item.classificacao)}">${esc(item.classificacao)}</span></td>
          <td style="max-width:200px">${esc(item.medidasControle)}</td><td>${esc(item.responsavel)}</td><td>${esc(item.prazo)}</td></tr>`
        ).join('')}</tbody></table>
        ${pgr.apr.observacoes ? `<div class="obs-box"><strong>Observações</strong><p>${esc(pgr.apr.observacoes)}</p></div>` : ''}`
    }
  }

  if (abaKey === 'relatorio') {
    if (!pgr.relatorioAvaliacao) { conteudo = '<p class="empty">Relatório não disponível.</p>' }
    else {
      const r = pgr.relatorioAvaliacao
      conteudo = `<h2>${esc(r.titulo)}</h2><p class="subtitle">Data: ${esc(r.dataElaboracao)} | Período: ${esc(r.periodoAvaliacao)}</p>
        <div class="info-box"><h3>Introdução</h3><p>${esc(r.introducao)}</p></div>
        <div class="info-box"><h3>Metodologia</h3><div class="two-col">
        <p><strong>Instrumento:</strong> ${esc(r.metodologia.instrumento)}</p>
        <p><strong>Escala:</strong> ${esc(r.metodologia.escala)}</p>
        <p><strong>Classificação:</strong> ${esc(r.metodologia.classificacaoRisco)}</p>
        <p><strong>Amostra:</strong> ${r.metodologia.amostra.totalRespondentes} de ${r.metodologia.amostra.totalColaboradores}</p></div></div>
        <h3>Resultados Gerais</h3><div class="kpi-grid">
        <div class="kpi-card"><div class="kpi-valor">${r.resultadosGerais.mediaGeral}</div><div class="kpi-label">Média Geral</div></div>
        <div class="kpi-card" style="background:#fef2f2"><div class="kpi-valor" style="color:#dc2626">${r.resultadosGerais.fatoresCriticos}</div><div class="kpi-label">Críticos</div></div>
        <div class="kpi-card" style="background:#fff7ed"><div class="kpi-valor" style="color:#f97316">${r.resultadosGerais.fatoresAltos}</div><div class="kpi-label">Altos</div></div>
        <div class="kpi-card" style="background:#fffbeb"><div class="kpi-valor" style="color:#f59e0b">${r.resultadosGerais.fatoresModerados}</div><div class="kpi-label">Moderados</div></div>
        <div class="kpi-card" style="background:#f0fdf4"><div class="kpi-valor" style="color:#16a34a">${r.resultadosGerais.fatoresBaixos}</div><div class="kpi-label">Baixos</div></div></div>
        ${r.topRiscos?.length > 0 ? `<h3>Top Riscos Prioritários</h3>${r.topRiscos.map((tr: any, i: number) =>
          `<div class="risk-item"><span class="rank" style="background:${bgRisco(tr.classificacao)};color:${corRisco(tr.classificacao)}">${i + 1}</span>
          <div style="flex:1"><strong>${esc(tr.categoria)}</strong><br><span class="subtle">Média: ${tr.media} | % Crítico: ${tr.percentualCritico}% | Nível: ${tr.nivelRisco}</span></div>
          <span class="badge" style="background:${bgRisco(tr.classificacao)};color:${corRisco(tr.classificacao)}">${esc(tr.classificacao)}</span></div>`
        ).join('')}` : ''}
        <div class="info-box" style="border-left:4px solid #3b82f6"><h3>Conclusão</h3><p>${esc(r.conclusao)}</p>
        <div style="margin-top:8px">${r.referenciaLegal?.map((ref: string) => `<span class="ref-tag">${esc(ref)}</span>`).join(' ') || ''}</div></div>`
    }
  }

  if (abaKey === 'setores') {
    if (!pgr.analiseSetores?.length) { conteudo = '<p class="empty">Sem dados de setor.</p>' }
    else {
      conteudo = pgr.analiseSetores.map((setor: any) =>
        `<div class="risk-card"><div class="risk-header"><div><h3>${esc(setor.setor)}</h3><p class="subtitle">${setor.respondentes} respondentes</p></div>
        <div style="text-align:right"><div class="kpi-valor" style="color:${setor.media >= 3.5 ? '#16a34a' : setor.media >= 2.5 ? '#f59e0b' : '#dc2626'}">${setor.media}</div><div class="kpi-sub">média geral</div></div></div>
        ${setor.categorias.map((cat: any) =>
          `<div style="margin-bottom:6px"><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:2px"><span>${esc(cat.categoria)}</span><span style="font-weight:600;color:${cat.media >= 3.5 ? '#16a34a' : cat.media >= 2.5 ? '#f59e0b' : '#dc2626'}">${cat.media}</span></div>
          <div style="height:8px;background:#f1f5f9;border-radius:4px;overflow:hidden"><div style="height:100%;width:${(cat.media / 5) * 100}%;background:${cat.media >= 3.5 ? '#16a34a' : cat.media >= 2.5 ? '#f59e0b' : '#dc2626'};border-radius:4px"></div></div></div>`
        ).join('')}
        <div class="two-col" style="margin-top:12px">
        ${setor.pontosCriticos?.length > 0 ? `<div class="alert-box red"><strong>PONTOS CRÍTICOS</strong>${setor.pontosCriticos.map((p: string) => `<p>- ${esc(p)}</p>`).join('')}</div>` : ''}
        ${setor.pontosFortes?.length > 0 ? `<div class="alert-box green"><strong>PONTOS FORTES</strong>${setor.pontosFortes.map((p: string) => `<p>- ${esc(p)}</p>`).join('')}</div>` : ''}
        </div></div>`
      ).join('')
    }
  }

  if (abaKey === 'plano') {
    conteudo = `<h2>Plano de Ação</h2><table class="small-table"><thead><tr><th>#</th><th>Categoria</th><th>Risco</th><th>Ação</th><th>Tipo</th><th>Responsável</th><th>Prazo</th><th>Ref. Legal</th></tr></thead><tbody>
      ${pgr.planoAcao.map((a: any) =>
        `<tr><td>${a.ordem}</td><td style="font-weight:600">${esc(a.categoria)}</td>
        <td><span class="badge" style="background:${bgRisco(a.classificacaoRisco)};color:${corRisco(a.classificacaoRisco)}">${esc(a.classificacaoRisco)}</span></td>
        <td style="max-width:220px">${esc(a.acao)}</td>
        <td><span class="badge" style="background:#f1f5f9;color:#64748b">${esc(a.tipo)}</span></td>
        <td>${esc(a.responsavel)}</td><td>${esc(a.prazo)}</td><td class="subtle">${esc(a.referenciaLegal)}</td></tr>`
      ).join('')}</tbody></table>`
  }

  if (abaKey === 'cronograma') {
    const cores = ['#dc2626', '#f97316', '#f59e0b', '#16a34a', '#3b82f6', '#8b5cf6']
    conteudo = pgr.cronograma.map((fase: any, i: number) =>
      `<div class="risk-card" style="border-left:4px solid ${cores[i] || '#94a3b8'}"><div class="risk-header"><div><h3>${esc(fase.fase)}</h3><p class="subtitle">${esc(fase.descricao)}</p></div>
      <span class="badge" style="background:#f1f5f9;color:#475569;font-size:13px;padding:6px 14px">${esc(fase.prazo)}</span></div></div>`
    ).join('')
  }

  if (abaKey === 'monitoramento') {
    if (!pgr.monitoramento) { conteudo = '<p class="empty">Monitoramento não disponível.</p>' }
    else {
      const mon = pgr.monitoramento
      conteudo = `<h2>${esc(mon.titulo)}</h2>
        <div class="kpi-grid">
        <div class="kpi-card"><div class="kpi-label">DATA ELABORAÇÃO</div><div class="kpi-valor" style="font-size:14px">${esc(mon.dataElaboracao)}</div></div>
        <div class="kpi-card" style="background:#dbeafe"><div class="kpi-label" style="color:#3b82f6">PRÓXIMA AVALIAÇÃO</div><div class="kpi-valor" style="font-size:14px;color:#1e40af">${esc(mon.dataProximaAvaliacao)}</div></div>
        <div class="kpi-card"><div class="kpi-label">CICLO</div><div class="kpi-valor" style="font-size:14px">${esc(mon.cicloAvaliacao)}</div></div></div>
        <h3>Critérios de Reavaliação</h3><div class="info-box">${mon.criteriosReavaliacao.map((c: string) => `<p>- ${esc(c)}</p>`).join('')}</div>
        <h3>Indicadores por Categoria</h3><table><thead><tr><th style="text-align:left">Categoria</th><th>Classif.</th><th>NR</th><th>Média</th><th>Meta</th><th>Frequência</th><th>Status</th></tr></thead><tbody>
        ${mon.indicadores.map((ind: any) => {
          const sc = statusColor(ind.statusAcompanhamento)
          return `<tr><td style="font-weight:600">${esc(ind.categoria)}</td>
            <td style="text-align:center"><span class="badge" style="background:${bgRisco(ind.classificacaoAtual)};color:${corRisco(ind.classificacaoAtual)}">${esc(ind.classificacaoAtual)}</span></td>
            <td style="text-align:center;font-weight:700;color:${corRisco(ind.classificacaoAtual)}">${ind.nivelRiscoAtual}</td>
            <td style="text-align:center">${ind.mediaAtual}</td><td>${esc(ind.metaReducao)}</td><td>${esc(ind.frequenciaMonitoramento)}</td>
            <td><span class="badge" style="background:${sc.bg};color:${sc.color}">${esc(ind.statusAcompanhamento)}</span></td></tr>`
        }).join('')}</tbody></table>
        <h3>Métricas Complementares</h3><div class="kpi-grid">
        ${Object.entries(mon.metricas).map(([key, met]: [string, any]) =>
          `<div class="kpi-card" style="border-left:3px solid #3b82f6"><div class="kpi-label" style="text-transform:capitalize">${key.replace(/([A-Z])/g, ' $1')}</div>
          <p style="font-size:12px;margin:4px 0 0">Atual: <strong>${esc(met.valorAtual)}</strong></p>
          <p style="font-size:11px;margin:2px 0 0;color:#64748b">Meta: ${esc(met.meta)}</p>
          <p style="font-size:10px;margin:2px 0 0;color:#94a3b8">Fonte: ${esc(met.fonte)}</p></div>`
        ).join('')}</div>
        <h3>Registro de Ações</h3>
        ${mon.registroAcoes.map((reg: any) =>
          `<div class="medida-box"><div style="display:flex;justify-content:space-between"><strong>${esc(reg.acao)}</strong><span class="subtle">${esc(reg.data)}</span></div>
          <p>Resultado: ${esc(reg.resultado)}</p><p class="subtle">Próximo passo: ${esc(reg.proximoPasso)} | Responsável: ${esc(reg.responsavel)}</p></div>`
        ).join('')}`
    }
  }

  if (abaKey === 'conformidade') {
    conteudo = `<h2>Conformidade Legal</h2>
      ${Object.entries(pgr.conformidade).map(([, item]: [string, any]) => {
        const sc = statusColor(item.status)
        return `<div class="risk-card"><div class="risk-header"><div><h3 style="font-size:15px">${esc(item.descricao)}</h3><p class="subtitle">${esc(item.evidencia)}</p></div>
          <span class="badge" style="background:${sc.bg};color:${sc.color}">${esc(item.status)}</span></div></div>`
      }).join('')}`
  }

  if (abaKey === 'iso45003') {
    if (!pgr.relatorioISO45003) { conteudo = '<p class="empty">ISO 45003 não disponível.</p>' }
    else {
      const iso = pgr.relatorioISO45003
      conteudo = `<h2>${esc(iso.titulo)}</h2><p class="subtitle">Data: ${esc(iso.dataElaboracao)}</p>
        <div class="info-box" style="border-left:4px solid #3b82f6"><strong>Status Geral</strong><p style="font-size:15px;font-weight:600;color:#2563eb">${esc(iso.statusGeral)}</p></div>
        <div class="info-box"><h3>Resumo Executivo</h3><p>${esc(iso.resumoExecutivo)}</p></div>
        <h3>Mapeamento de Fatores</h3><table><thead><tr><th style="text-align:left">Categoria</th><th>Fator ISO</th><th>Média</th><th>Classif.</th><th>NR</th><th>Conformidade</th></tr></thead><tbody>
        ${iso.mapeamentoFatores.map((f: any) => {
          const sc = statusColor(f.conformidade)
          return `<tr><td style="font-weight:600">${esc(f.categoria)}</td><td>${esc(f.fatorISO45003)}</td><td style="text-align:center">${f.media}</td>
            <td style="text-align:center"><span class="badge" style="background:${bgRisco(f.classificacao)};color:${corRisco(f.classificacao)}">${esc(f.classificacao)}</span></td>
            <td style="text-align:center;font-weight:700;color:${corRisco(f.classificacao)}">${f.nivelRisco}</td>
            <td style="text-align:center"><span class="badge" style="background:${sc.bg};color:${sc.color}">${esc(f.conformidade)}</span></td></tr>`
        }).join('')}</tbody></table>
        <h3>Análise de Requisitos</h3>
        ${iso.analiseRequisitos.map((req: any) => {
          const sc = statusColor(req.status)
          return `<div class="req-item"><span class="req-clause">${esc(req.clausula)}</span><div style="flex:1"><strong>${esc(req.requisito)}</strong><p class="subtle">${esc(req.evidencia)}</p></div>
            <span class="badge" style="background:${sc.bg};color:${sc.color}">${esc(req.status)}</span></div>`
        }).join('')}
        <div class="two-col" style="margin-top:16px">
        <div class="alert-box orange"><strong>Lacunas</strong>${iso.lacunasIdentificadas.map((l: string) => `<p>${esc(l)}</p>`).join('')}</div>
        <div class="alert-box green"><strong>Recomendações</strong>${iso.recomendacoes.map((r: string) => `<p>${esc(r)}</p>`).join('')}</div></div>`
    }
  }

  if (abaKey === 'indicadoresSaude') {
    if (!pgr.indicadoresSaude) { conteudo = '<p class="empty">Indicadores não disponíveis.</p>' }
    else {
      const is2 = pgr.indicadoresSaude
      const ip = is2.indicadoresPrincipais
      conteudo = `<h2>${esc(is2.titulo)}</h2><p class="subtitle">Data: ${esc(is2.dataApuracao)}</p>
        <div class="kpi-grid">
        <div class="kpi-card"><div class="kpi-valor">${ip.mediaGeral.valor}</div><div class="kpi-label">Média Geral (${esc(ip.mediaGeral.escala)})</div><span class="badge" style="background:#dbeafe;color:#2563eb">${esc(ip.mediaGeral.interpretacao)}</span></div>
        <div class="kpi-card"><div class="kpi-valor" style="color:${ip.indiceRiscoPsicossocial.valor <= 30 ? '#16a34a' : ip.indiceRiscoPsicossocial.valor <= 60 ? '#f59e0b' : '#dc2626'}">${ip.indiceRiscoPsicossocial.valor}%</div><div class="kpi-label">Índice de Risco</div><span class="badge" style="background:#dbeafe;color:#2563eb">${esc(ip.indiceRiscoPsicossocial.interpretacao)}</span></div>
        <div class="kpi-card"><div class="kpi-valor" style="color:#3b82f6">${ip.taxaParticipacao.valor ? ip.taxaParticipacao.valor + '%' : 'N/D'}</div><div class="kpi-label">Participação (meta: ${esc(ip.taxaParticipacao.meta)})</div><span class="badge" style="background:#dbeafe;color:#2563eb">${esc(ip.taxaParticipacao.interpretacao)}</span></div>
        <div class="kpi-card"><div class="kpi-valor">${ip.concentracaoRiscoCritico.valor}</div><div class="kpi-label">Concentração Risco Crítico</div><div style="font-size:13px;font-weight:600;color:#dc2626">${ip.concentracaoRiscoCritico.percentual}%</div></div></div>
        <h3>Perfil de Risco</h3><div class="two-col">
        ${is2.perfilRisco.piorCategoria ? `<div class="alert-box red"><strong>PIOR CATEGORIA</strong><p style="font-size:16px;font-weight:700">${esc(is2.perfilRisco.piorCategoria.nome)}</p><p class="subtle">Média: ${is2.perfilRisco.piorCategoria.media} | ${esc(is2.perfilRisco.piorCategoria.classificacao)}</p></div>` : ''}
        ${is2.perfilRisco.melhorCategoria ? `<div class="alert-box green"><strong>MELHOR CATEGORIA</strong><p style="font-size:16px;font-weight:700">${esc(is2.perfilRisco.melhorCategoria.nome)}</p><p class="subtle">Média: ${is2.perfilRisco.melhorCategoria.media} | ${esc(is2.perfilRisco.melhorCategoria.classificacao)}</p></div>` : ''}
        </div><p style="font-size:12px;color:#64748b">Amplitude: <strong>${is2.perfilRisco.amplitude}</strong></p>
        <h3>Indicadores Complementares</h3><div class="kpi-grid">
        ${Object.entries(is2.indicadoresComplementares).map(([key, val]: [string, any]) =>
          `<div class="kpi-card"><div class="kpi-label" style="text-transform:capitalize">${key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}</div>
          <p style="font-size:12px;margin:4px 0 0">Atual: <strong>${esc(val.valorAtual)}</strong></p>
          <p style="font-size:11px;margin:2px 0;color:#64748b">Meta: ${esc(val.meta)}</p>
          <p style="font-size:10px;color:#94a3b8">Fonte: ${esc(val.fonte)} | ${esc(val.frequencia)}</p></div>`
        ).join('')}</div>
        <h3>Metas 12 Meses</h3><table><thead><tr><th style="text-align:left">Indicador</th><th style="text-align:left">Meta</th><th style="text-align:left">Prazo</th></tr></thead><tbody>
        ${is2.metas12meses.map((m: any) => `<tr><td style="font-weight:600">${esc(m.indicador)}</td><td>${esc(m.meta)}</td><td>${esc(m.prazo)}</td></tr>`).join('')}
        </tbody></table>`
    }
  }

  if (abaKey === 'politica') {
    conteudo = pgr.politicaSST ? `<div class="doc-text">${formatarTextoEstruturado(pgr.politicaSST)}</div>` : '<p class="empty">Política SST não disponível.</p>'
  }

  if (abaKey === 'comunicacao') {
    if (!pgr.comunicacao) { conteudo = '<p class="empty">Comunicação não disponível.</p>' }
    else {
      const com = pgr.comunicacao
      const cores = ['#dc2626', '#f97316', '#f59e0b', '#16a34a', '#3b82f6', '#8b5cf6']
      conteudo = `<h2>${esc(com.titulo)}</h2><p class="subtitle">Data: ${esc(com.dataElaboracao)}</p>
        <div class="info-box"><h3>Objetivo</h3><p>${esc(com.objetivo)}</p></div>
        <div class="info-box"><h3>Princípios</h3>${com.principios.map((p: string) => `<p>- ${esc(p)}</p>`).join('')}</div>
        ${com.etapas.map((etapa: any, i: number) =>
          `<div class="risk-card" style="border-left:4px solid ${cores[i] || '#94a3b8'}"><div class="risk-header"><h4>Etapa ${i + 1}: ${esc(etapa.fase)}</h4>
          <span class="badge" style="background:#f1f5f9;color:#475569">${esc(etapa.prazo)}</span></div>
          <div class="two-col"><p><strong>Público:</strong> ${esc(etapa.publicoAlvo)}</p><p><strong>Canal:</strong> ${esc(etapa.canal)}</p><p><strong>Responsável:</strong> ${esc(etapa.responsavel)}</p></div>
          <p>${esc(etapa.conteudo)}</p></div>`
        ).join('')}
        ${com.pontosAtencao ? `<div class="obs-box"><strong>Pontos de Atenção</strong><p>${esc(com.pontosAtencao)}</p></div>` : ''}
        <p class="subtle"><strong>Referência Legal:</strong> ${esc(com.referenciaLegal)}</p>`
    }
  }

  if (abaKey === 'declaracao') {
    conteudo = pgr.declaracaoConformidade ? `<div class="doc-text">${formatarTextoEstruturado(pgr.declaracaoConformidade)}</div>` : '<p class="empty">Declaração não disponível.</p>'
  }

  if (abaKey === 'parecer') {
    conteudo = pgr.parecerTecnico ? `<div class="doc-text">${formatarTextoEstruturado(pgr.parecerTecnico)}</div>` : '<p class="empty">Parecer não disponível.</p>'
  }

  const html = '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>' + esc(pgr.titulo) + ' - ' + abaLabel.replace(/[^\w\s]/g, '').trim() + '</title>'
    + '<style>'
    + '* { margin:0; padding:0; box-sizing:border-box; }'
    + 'body { font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; color:#1e293b; padding:40px; max-width:1100px; margin:0 auto; font-size:13px; line-height:1.6; }'
    + '.header { border-bottom:3px solid #3b82f6; padding-bottom:16px; margin-bottom:32px; }'
    + '.header h1 { font-size:22px; font-weight:700; }'
    + '.header .sub { font-size:13px; color:#64748b; margin-top:4px; }'
    + '.header .doc-type { display:inline-block; padding:4px 14px; background:#dbeafe; color:#2563eb; border-radius:20px; font-size:12px; font-weight:600; margin-top:8px; }'
    + 'h2 { font-size:18px; font-weight:700; margin:24px 0 12px; }'
    + 'h3 { font-size:14px; font-weight:700; margin:16px 0 8px; }'
    + 'h4 { font-size:13px; font-weight:700; margin:12px 0 6px; }'
    + 'table { width:100%; border-collapse:collapse; margin:12px 0 20px; font-size:12px; }'
    + 'th { padding:8px 10px; text-align:left; font-size:11px; font-weight:600; color:#64748b; text-transform:uppercase; border-bottom:2px solid #e2e8f0; }'
    + 'td { padding:8px 10px; border-bottom:1px solid #f1f5f9; font-size:12px; vertical-align:top; }'
    + '.small-table td,.small-table th { padding:6px; font-size:11px; }'
    + '.kpi-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:12px; margin:16px 0; }'
    + '.kpi-card { padding:14px; background:#f8fafc; border-radius:8px; text-align:center; }'
    + '.kpi-label { font-size:11px; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; }'
    + '.kpi-valor { font-size:24px; font-weight:700; color:#1e293b; margin:4px 0; }'
    + '.kpi-sub { font-size:11px; color:#64748b; }'
    + '.badge { display:inline-block; padding:3px 10px; border-radius:12px; font-size:11px; font-weight:700; }'
    + '.ref-tag { display:inline-block; padding:2px 8px; border-radius:8px; font-size:11px; background:#e2e8f0; color:#64748b; margin:2px; }'
    + '.risk-card { background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:20px; margin-bottom:16px; page-break-inside:avoid; }'
    + '.risk-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px; }'
    + '.risk-item { display:flex; align-items:center; gap:12px; padding:12px 0; border-bottom:1px solid #f1f5f9; }'
    + '.rank { width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:14px; flex-shrink:0; }'
    + '.req-item { display:flex; gap:12px; align-items:flex-start; padding:10px 0; border-bottom:1px solid #f1f5f9; }'
    + '.req-clause { font-size:12px; font-weight:700; color:#3b82f6; min-width:40px; }'
    + '.info-box { padding:14px; background:#f8fafc; border-radius:8px; margin:12px 0; }'
    + '.info-box p { font-size:13px; color:#475569; line-height:1.7; }'
    + '.two-col { display:grid; grid-template-columns:1fr 1fr; gap:12px; }'
    + '.dist-bar { display:flex; gap:3px; height:22px; margin-bottom:4px; }'
    + '.causa-box { padding:10px 14px; background:#fffbeb; border-radius:8px; margin-bottom:6px; border-left:3px solid #f59e0b; }'
    + '.causa-box strong { color:#92400e; font-size:13px; }'
    + '.causa-box p { font-size:12px; color:#78716c; margin-top:4px; }'
    + '.medida-box { padding:10px 14px; background:#f0fdf4; border-radius:8px; margin-bottom:6px; border-left:3px solid #16a34a; }'
    + '.medida-box strong { color:#166534; font-size:13px; }'
    + '.medida-box p { font-size:12px; color:#475569; margin-top:4px; }'
    + '.obs-box { padding:14px; background:#fffbeb; border-left:4px solid #f59e0b; border-radius:8px; margin:16px 0; }'
    + '.obs-box strong { color:#92400e; }'
    + '.obs-box p { color:#78716c; font-size:13px; margin-top:6px; }'
    + '.alert-box { padding:12px; border-radius:8px; }'
    + '.alert-box.red { background:#fef2f2; } .alert-box.red strong { color:#dc2626; } .alert-box.red p { color:#991b1b; font-size:12px; margin-top:2px; }'
    + '.alert-box.green { background:#f0fdf4; } .alert-box.green strong { color:#16a34a; } .alert-box.green p { color:#166534; font-size:12px; margin-top:2px; }'
    + '.alert-box.orange { background:#fff7ed; } .alert-box.orange strong { color:#ea580c; } .alert-box.orange p { color:#9a3412; font-size:12px; margin-top:4px; }'
    + '.subtitle { font-size:13px; color:#64748b; }'
    + '.subtle { font-size:11px; color:#94a3b8; }'
    + '.empty { text-align:center; padding:48px; color:#94a3b8; font-size:16px; }'
    + '.doc-text { padding:32px; }'
    + '.doc-text h1 { font-size:20px; margin:24px 0 8px; border-bottom:2px solid #e2e8f0; padding-bottom:8px; }'
    + '.doc-text h2 { font-size:16px; margin:20px 0 8px; }'
    + '.doc-text h3 { font-size:14px; margin:16px 0 6px; }'
    + '.doc-text p { margin:6px 0; line-height:1.7; }'
    + '.doc-text ul,.doc-text ol { margin:8px 0 8px 20px; }'
    + '.doc-text li { margin:4px 0; }'
    + '.footer { margin-top:40px; padding-top:16px; border-top:1px solid #e2e8f0; display:flex; justify-content:space-between; font-size:11px; color:#94a3b8; }'
    + '@media print { body { padding:20px; } .risk-card { break-inside:avoid; } @page { margin:15mm; size:A4; } }'
    + '</style></head><body>'
    + '<div class="header"><h1>' + esc(pgr.titulo) + '</h1>'
    + '<p class="sub">Versão ' + pgr.versao + ' | Período: ' + esc(pgr.periodoAvaliacao) + ' | Status: ' + esc(pgr.status) + '</p>'
    + '<span class="doc-type">' + abaLabel.replace(/[^\w\s\u00C0-\u00FF]/g, '').trim() + '</span></div>'
    + conteudo
    + '<div class="footer"><span>PGR Psicossocial - ' + abaLabel.replace(/[^\w\s\u00C0-\u00FF]/g, '').trim() + '</span>'
    + '<span>Exportado em ' + new Date().toLocaleDateString('pt-BR') + '</span></div>'
    + '<script>window.onload=function(){setTimeout(function(){window.print()},500)}<\/script>'
    + '</body></html>'

  win.document.write(html)
  win.document.close()
}

function formatarTextoEstruturado(texto: string): string {
  if (!texto) return ''
  return texto
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^\s*[-•]\s+(.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*<\/li>)/g, '<ul>$1</ul>')
    .replace(/<\/ul>\s*<ul>/g, '')
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>')
}

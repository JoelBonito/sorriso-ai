# Componentes PDF com React-PDF

Esta pasta contém todos os componentes para geração de PDFs usando `@react-pdf/renderer`.

## 📁 Estrutura

```
src/components/pdf/
├── README.md                          # Esta documentação
├── index.ts                           # Exports centralizados
├── BudgetPDFDocument.tsx              # Documento de orçamento (STUB - Fase 2)
├── TechnicalReportPDFDocument.tsx     # Documento de relatório técnico (STUB - Fase 3)
└── shared/                            # Componentes compartilhados
    ├── types.ts                       # Interfaces TypeScript
    ├── styles.ts                      # Estilos compartilhados
    ├── PDFClinicHeader.tsx            # ✅ Header com logo e dados da clínica
    ├── PDFPatientInfo.tsx             # ✅ Dados do paciente
    ├── PDFSimulationImages.tsx        # ✅ Imagens antes/depois
    └── PDFFooter.tsx                  # ✅ Rodapé com responsável técnico
```

## ✅ Fase 1 - CONCLUÍDA

### O que foi implementado:

1. **Instalação da dependência**
   - `@react-pdf/renderer@4.3.1` instalado com sucesso

2. **Interfaces TypeScript** (`shared/types.ts`)
   - `ClinicInfo` - Dados da clínica
   - `PatientInfo` - Dados do paciente
   - `SimulationImages` - URLs das imagens antes/depois
   - `BasePDFProps` - Props compartilhadas

3. **Estilos compartilhados** (`shared/styles.ts`)
   - `colors` - Paleta de cores TruSmile
   - `commonStyles` - Estilos para página, header, seções, footer
   - `tableStyles` - Estilos para tabelas (será usado na Fase 2)

4. **Componentes reutilizáveis** (✅ 100% funcionais)
   - **PDFClinicHeader** - Logomarca + dados da clínica em box cinza
   - **PDFPatientInfo** - Nome, CPF, telefone, data, número do documento
   - **PDFSimulationImages** - Imagens antes/depois lado a lado
   - **PDFFooter** - Responsável técnico + texto de rodapé

5. **Stubs dos documentos principais**
   - `BudgetPDFDocument` - Estrutura básica (implementação completa na Fase 2)
   - `TechnicalReportPDFDocument` - Estrutura básica (implementação completa na Fase 3)

### Verificação de segurança:

✅ **Compilação TypeScript**: OK - Build passou sem erros
✅ **Código existente**: INTACTO - Nada foi alterado ou deletado
✅ **Sistema atual**: FUNCIONANDO - MVP continua operacional
✅ **Imports**: OK - Arquivo index.ts centraliza exports

## 🎯 Estrutura Visual dos PDFs

Ambos os PDFs (orçamento e relatório) seguirão esta estrutura idêntica:

```
┌─────────────────────────────────────────┐
│  [FUNDO TURQUESA]                       │
│  ┌─────────────────────────────────┐   │
│  │   LOGO DA CLÍNICA (se houver)   │   │
│  └─────────────────────────────────┘   │
│  TÍTULO DO DOCUMENTO                    │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│  [BOX CINZA]                            │
│  Clínica: Nome da Clínica               │
│  CNPJ: XX.XXX.XXX/XXXX-XX               │
│  Endereço: Rua X, 123                   │
│  Telefone: (XX) XXXXX-XXXX              │
│  E-mail: contato@clinica.com            │
│  ─────────────────────────────────      │
│  Responsável: Dr. Fulano | CRO: 12345   │
└─────────────────────────────────────────┘

DADOS DO PACIENTE
  Nome: João da Silva
  CPF: XXX.XXX.XXX-XX
  Telefone: (XX) XXXXX-XXXX
  Data: DD/MM/YYYY
  Documento: ORCAM-202511-1234

SIMULAÇÃO DO TRATAMENTO
  ┌──────────┐  ┌──────────┐
  │  ANTES   │  │  DEPOIS  │
  │  [FOTO]  │  │  [FOTO]  │
  └──────────┘  └──────────┘

[CONTEÚDO ESPECÍFICO]
  - Orçamento: Tabela de procedimentos
  - Relatório: Texto descritivo

────────────────────────────────────────
Responsável Técnico: Dr. Fulano | CRO: 12345
Documento gerado automaticamente por Facet.AI
```

## 📦 Como usar (quando estiver completo)

```typescript
import { BudgetPDFDocument } from '@/components/pdf';
import { pdf } from '@react-pdf/renderer';

// Preparar dados
const data = {
  clinicInfo: { /* ... */ },
  patientInfo: { /* ... */ },
  simulationImages: { /* ... */ },
  // ... resto dos dados
};

// Gerar PDF
const blob = await pdf(<BudgetPDFDocument {...data} />).toBlob();

// Upload ou download
// ...
```

## 🚧 Próximas Fases

### Fase 2: Implementar Orçamento PDF
- Tabela de procedimentos com React-PDF
- Resumo financeiro (subtotal, desconto, total)
- Condições de pagamento
- Integração com budgetService.ts

### Fase 3: Implementar Relatório Técnico PDF
- Formatação do texto do relatório
- Quebra de páginas automática
- Disclaimers legais em página separada
- Integração com technicalReportService.ts

### Fase 4: Migração e Limpeza
- Substituir jsPDF por React-PDF nos serviços
- Deletar pdfService.ts e technicalReportService.ts
- Remover dependência jsPDF
- Testar tudo
- Commit e push

## 🛡️ Garantias de Segurança

- ✅ Código novo em paralelo (não substitui código antigo)
- ✅ Sistema atual 100% funcional
- ✅ TypeScript com type-safety completa
- ✅ Sem breaking changes
- ✅ Testado com build de produção

---

**Status**: Fase 1 concluída com sucesso
**Última atualização**: 2025-11-12
**Desenvolvido com**: @react-pdf/renderer 4.3.1

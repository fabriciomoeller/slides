# POC Middleware - Kong API Gateway + NATS Mensageria

## Integração Protheus (TOTVS) <-> EME4 Manufatura

**Data:** 04/03/2026
**Versão:** 1.0
**Status:** Em análise

---

## Sumário

1. [Objetivo](#1-objetivo)
2. [Arquitetura Proposta](#2-arquitetura-proposta)
3. [Mapeamento de Endpoints - EME4](#3-mapeamento-de-endpoints---eme4)
4. [Mapeamento de Endpoints - Protheus](#4-mapeamento-de-endpoints---protheus)
5. [Cenário 1 - Sincronização de Engenharia](#5-cenário-1---sincronização-de-engenharia-protheus---eme4)
6. [Cenário 2 - Ordens de Produção e Apontamentos](#6-cenário-2---ordens-de-produção-e-apontamentos-protheus---eme4)
7. [Componentes do Middleware](#7-componentes-do-middleware)
8. [Mapeamento DE-PARA de Campos](#8-mapeamento-de-para-de-campos)
9. [Resumo Executivo](#9-resumo-executivo)

---

## 1. Objetivo

Analisar a viabilidade de implementar um **middleware** baseado em **Kong API Gateway** e **NATS (JetStream)** para integrar o módulo de Manufatura do ERP Protheus (TOTVS) com o sistema EME4 Manufatura, cobrindo dois cenários:

- **Cenário 1:** Sincronização de dados de Engenharia (Protheus -> EME4)
- **Cenário 2:** Ordens de Produção e Apontamentos (Protheus <-> EME4, bidirecional)

---

## 2. Arquitetura Proposta

```
┌─────────────┐       ┌──────────────────────────────────────────────────┐       ┌─────────────┐
│             │       │              MIDDLEWARE                          │       │             │
│  PROTHEUS   │       │                                                  │       │    EME4     │
│  (TOTVS)    │──────>│  ┌──────────┐    ┌──────────┐    ┌───────────┐  │──────>│ MANUFATURA  │
│             │       │  │   KONG   │───>│   NATS   │───>│  WORKERS  │  │       │             │
│  - PCP      │<──────│  │ Gateway  │    │ JetStream│    │ Consumer/ │  │<──────│ - Elementos │
│  - Produção │       │  │          │    │          │    │ Producer  │  │       │ - Ord.Prod. │
│             │       │  └──────────┘    └──────────┘    └───────────┘  │       │             │
└─────────────┘       └──────────────────────────────────────────────────┘       └─────────────┘
```

---

## 3. Mapeamento de Endpoints - EME4

### 3.1 APIs de Engenharia (M3ElementosManufatura)

#### 3.1.1 RecursoProducao (Centro de Trabalho)

| Operação | Método | Endpoint | Descrição |
|----------|--------|----------|-----------|
| Incluir | POST | `RecursoProducao/Incluir_API` | Criar recurso de produção |
| Alterar | PUT | `RecursoProducao/Alterar_API` | Alterar recurso existente |
| Excluir | DELETE | `RecursoProducao/Excluir_API` | Excluir recurso |
| Consultar | GET | `RecursoProducao/ConsultarRegistros_API` | Consultar recursos |
| Listar | GET | `RecursoProducao/RetornaRecursos` | Retorna todos os recursos |

**Estrutura de dados:**

```json
{
  "IDRecursoProd": "Integer",
  "Codigo": "String (único)",
  "Descricao": "String",
  "IdFilial": "Integer (FK - obrigatório)",
  "IdCentroCusto": "Integer (FK)",
  "UnidadeTempo": "Char (1=Min, 2=Hora)",
  "TipoRecurso": "Char (0=Máquina, 1=Paralelo)",
  "TipoRelogio": "Char (0=Horário, 1=Trabalho)",
  "DtInicioDisp": "DateTime",
  "DtFinalDisp": "DateTime",
  "Aponta": "Boolean",
  "CargaMaquina": "Boolean",
  "ApontaQualidade": "Boolean",
  "ApontTempo": "Boolean",
  "IdVariavelProcesso": "Integer (FK - opcional)"
}
```

**Validações:** Código único. Filial obrigatória e ativa. Centro de custo ativo (se informado).

---

#### 3.1.2 LinhaProducao

| Operação | Método | Endpoint | Descrição |
|----------|--------|----------|-----------|
| Incluir | POST | `LinhaProducao/Incluir_API` | Criar linha de produção |
| Alterar | PUT | `LinhaProducao/Alterar_API` | Alterar linha existente |
| Excluir | DELETE | `LinhaProducao/Excluir_API` | Excluir linha |
| Consultar | GET | `LinhaProducao/ConsultarRegistros_API` | Consultar linhas |

**Estrutura de dados:**

```json
{
  "IDLinhaProd": "Integer",
  "Codigo": "String (único)",
  "Descricao": "String",
  "IdFilial": "Integer (FK - obrigatório)",
  "IdCtaContabilWIP": "Integer (FK)",
  "IdCtaContabilRefugo": "Integer (FK)",
  "IdAlmoxProc": "Integer (FK)",
  "IdUsuaProgamador": "Integer (FK)"
}
```

**Validações:** Código único. Filial obrigatória e ativa. Contas contábeis e almoxarifado ativos.

---

#### 3.1.3 FerramentaProducao

| Operação | Método | Endpoint | Descrição |
|----------|--------|----------|-----------|
| Incluir | POST | `FerramentaProducao/Incluir_API` | Criar ferramenta |
| Alterar | PUT | `FerramentaProducao/Alterar_API` | Alterar ferramenta |
| Excluir | DELETE | `FerramentaProducao/Excluir_API` | Excluir ferramenta |
| Consultar | GET | `FerramentaProducao/ConsultarRegistros_API` | Consultar ferramentas |

**Estrutura de dados:**

```json
{
  "IDFerramentaProducao": "Integer",
  "Codigo": "String",
  "Descricao": "String",
  "Situacao": "Char (0=Ativo, 1=Inativo)"
}
```

---

#### 3.1.4 ProdutoPapelManufatura (Produto com papel de manufatura)

| Operação | Método | Endpoint | Descrição |
|----------|--------|----------|-----------|
| Incluir | POST | `ProdutoPapelManufatura/Incluir_API` | Criar papel manufatura do produto |
| Alterar | PUT | `ProdutoPapelManufatura/Alterar_API` | Alterar papel |
| Excluir | DELETE | `ProdutoPapelManufatura/Excluir_API` | Excluir papel |
| Consultar | GET | `ProdutoPapelManufatura/ConsultarRegistros_API` | Consultar papéis |

**Estrutura de dados:**

```json
{
  "IDProdutoPapel": "Integer",
  "IDFProduto": "Integer (FK - obrigatório)",
  "IDFFilial": "Integer (FK - obrigatório)",
  "IDFPapelProAssunto": "Integer (FK - obrigatório)",
  "Status": "Char (0=Ativo, 1=Inativo)",
  "Apontamento": "Char",
  "Baixa": "Char",
  "OrigemProduto": "Char",
  "TipoProduto": "Char",
  "Demanda": "Char",
  "OrigemOrdem": "Char",
  "ApontaRefugo": "Char",
  "EstocaRefugo": "Boolean"
}
```

**Validações:** Produto, Filial e Papel obrigatórios. Filial não pode ser duplicada para um produto.

---

#### 3.1.5 ListaMateriaisProduto (BOM - Bill of Materials)

| Operação | Método | Endpoint | Descrição |
|----------|--------|----------|-----------|
| Incluir | POST | `ListaMateriaisProduto/Incluir_API` | Criar BOM |
| Alterar | PUT | `ListaMateriaisProduto/Alterar_API` | Alterar BOM |
| Excluir | DELETE | `ListaMateriaisProduto/Excluir_API` | Excluir BOM |
| Consultar | GET | `ListaMateriaisProduto/ConsultarRegistros_API` | Consultar BOMs |
| Clonar | POST | `ListaMateriaisProduto/Clonar` | Clonar BOM existente |
| Desmarcar Padrão | POST | `ListaMateriaisProduto/DesmarcaPadraoLista` | Remover flag padrão |
| Existe Padrão | GET | `ListaMateriaisProduto/ExisteListaPadrao` | Verificar se há BOM padrão |

**Estrutura de dados:**

```json
{
  "IDListaMateriais": "Integer",
  "IdProduto": "Integer (FK)",
  "Codigo": "String",
  "Versao": "String",
  "DtInicialVersao": "DateTime (ISO8601)",
  "DtFinalVersao": "DateTime (ISO8601)",
  "SerieInicial": "String",
  "SerieFinal": "String",
  "IdAlmox": "Integer (FK - Almoxarifado)",
  "IdUsuarioResp": "Integer (FK - Usuário)",
  "IdEmbalagem": "Integer (FK)",
  "Situacao": "Char (ativo/inativo)",
  "Padrao": "Boolean",
  "ItensListaMaterialProd": [
    {
      "IDItemListaMaterial": "Integer",
      "Sequencia": "Integer",
      "IdProd": "Integer (FK - Produto componente)",
      "PercentualPerda": "Double (0-100%)",
      "EhQtdeFixa": "Boolean",
      "Qtde": "Double",
      "QtdeEfetiva": "Double",
      "QtdeBase": "Double",
      "QtdeUnica": "Boolean",
      "TipoItem": "Char (0=Preferencial, 1=Alternativo)",
      "Observacao": "String",
      "IdUnidadeProduto": "Integer (FK)"
    }
  ]
}
```

**Validações:** Código e Versão obrigatórios. Produto ativo. Almoxarifado e Unidade padrão obrigatórios. Código+Versão únicos por produto.

---

#### 3.1.6 RoteiroProducao (Roteiro de Fabricação)

| Operação | Método | Endpoint | Descrição |
|----------|--------|----------|-----------|
| Incluir | POST | `RoteiroProducao/Incluir_API` | Criar roteiro |
| Alterar | PUT | `RoteiroProducao/Alterar_API` | Alterar roteiro |
| Excluir | DELETE | `RoteiroProducao/Excluir_API` | Excluir roteiro |
| Consultar | GET | `RoteiroProducao/ConsultarRegistros_API` | Consultar roteiros |
| Clonar | POST | `RoteiroProducao/Clonar` | Clonar roteiro |
| Existe Padrão | GET | `RoteiroProducao/ExisteRoteiroPadrao` | Verificar roteiro padrão |
| Desmarcar Padrão | POST | `RoteiroProducao/DesmarcaPadraoRoteiro` | Remover flag padrão |

**Estrutura de dados:**

```json
{
  "IDRoteiro": "Integer",
  "IdProduto": "Integer (FK)",
  "Codigo": "String",
  "Versao": "String",
  "DtInicialVersao": "DateTime (ISO8601)",
  "DtFinalVersao": "DateTime (ISO8601)",
  "NumSerieInicial": "String",
  "NumeroSerieFinal": "String",
  "IdFilial": "Integer (FK)",
  "IdUnidadeProd": "Integer (FK)",
  "IdUsuarioResp": "Integer (FK)",
  "Situacao": "Char",
  "Padrao": "Boolean",
  "OperacoesRoteiro": [
    {
      "IDOperacao": "Integer",
      "SeqOperacao": "Integer (>0, único no roteiro)",
      "Descricao": "String",
      "IdRecurso": "Integer (FK - Recurso Produção)",
      "Texto": "String",
      "QtdeProduto": "Double (>0)",
      "UnTempo": "Char (1=Minuto, 2=Hora)",
      "TempoSetup": "Double (>=0)",
      "TempoHomem": "Double (>=0)",
      "TempoRecurso": "Double (>=0)",
      "TempoEntreTarefas": "Double",
      "QtdeCarga": "Double (>0)",
      "QtdeRecursos": "Double (>0)",
      "PercRefugo": "Double (0-100%)",
      "IdFerramentaProducao": "Integer (FK - opcional)",
      "GeraFormOP": "Boolean",
      "ApontarEtapa": "Boolean",
      "ExecucaoOperacao": "Boolean",
      "GeraMascaraLote": "Boolean",
      "Alternativa": "Boolean",
      "TpRecurso": "Char (0=Interno, 1=Externo)",
      "Padrao": "Boolean"
    }
  ]
}
```

**Validações:** Sequência de operação única (>0). Produto e Filial ativos. Recurso obrigatório. Tempos >= 0. Quantidades > 0.

---

#### 3.1.7 OperacaoRoteiro

| Operação | Método | Endpoint | Descrição |
|----------|--------|----------|-----------|
| Incluir | POST | `OperacaoRoteiro/Incluir` | Criar operação |
| Alterar | PUT | `OperacaoRoteiro/Alterar` | Alterar operação |
| Excluir | DELETE | `OperacaoRoteiro/Excluir` | Excluir operação |
| Clonar | POST | `OperacaoRoteiro/Clonar` | Clonar operação |

---

#### 3.1.8 Entidades Auxiliares

| Entidade | Endpoints | Descrição |
|----------|-----------|-----------|
| ParamFilialManufatura | CRUD | Parâmetros de Filial Manufatura |
| CadastroCalendario | CRUD | Calendários de produção |
| CadastroTurno | CRUD | Turnos de trabalho |
| FamProdPapelManufatura | CRUD + Replicar + Copiar | Famílias de produto com papel manufatura |
| ItemListaMateriaisOperacao | CRUD | Itens de lista de materiais por operação |
| ListaFormOpRot | CRUD | Formulários por operação de roteiro |

---

### 3.2 APIs de Ordem de Produção (__M3OrdemProducaoManufatura)

#### 3.2.1 DoctoOrdProducaoManufatura (Ordem de Produção)

| Operação | Método | Endpoint | Descrição |
|----------|--------|----------|-----------|
| Incluir | POST | `DoctoOrdProducaoManufatura/Incluir_API` | Criar OP |
| Alterar | PUT | `DoctoOrdProducaoManufatura/Alterar_API` | Alterar OP |
| Excluir | DELETE | `DoctoOrdProducaoManufatura/Excluir_API` | Excluir OP |
| Consultar | GET | `DoctoOrdProducaoManufatura/ConsultarRegistros_API` | Consultar OPs |
| Consultar Listas Mat. | GET | `DoctoOrdProducaoManufatura/ConsultarRegistros_ParteListasMat_API` | Listas de materiais da OP |
| Consultar Operações | GET | `DoctoOrdProducaoManufatura/ConsultarRegistros_ParteOperacao_API` | Operações da OP |
| Alterar Situação | POST | `DoctoOrdProducaoManufatura/AlteraSituacaoDaOrdemProducao` | Mudar status da OP |

**Situações da OP:**

| Código | Descrição |
|--------|-----------|
| `0` | Planejada |
| `5` | Finalizada |
| `6` | Concluída |

**Estrutura de dados (criação):**

```json
{
  "IDTipoDocto": "Integer",
  "IDFilial": "Integer",
  "IDF_ProPapMnf": "Integer (Produto Papel Manufatura)",
  "IDF_AlmoxPapProd": "Integer (Almoxarifado)",
  "IDF_LinhaProducao": "Integer",
  "IDF_UnPapelProd": "Integer (Unidade)",
  "QtdeOrdem": "Double",
  "IDF_RoteiroProducao": "Integer",
  "Situacao": "String (padrão: '0' = Planejada)",
  "IDF_LstMatProdRoteiro": "Integer (Lista Materiais)",
  "IDF_UsuarioProgramador": "Integer",
  "LoteNumeroSerie": "String",
  "DtInicio": "DateTime",
  "DtTerminoOriginal": "DateTime",
  "DtTerminoReal": "DateTime",
  "TipoOrdem": "String",
  "TpApontamento": "String",
  "Observacao": "String",
  "OrdPrioridade": "Integer",
  "TpReservaLogica": "String",
  "OrigemOrdem": "String",
  "QtdeInicial": "Double",
  "QtdeBaixada": "Double",
  "QtdePerda": "Double",
  "EmiteBaixa": "String",
  "FormularioOrdem": "Boolean",
  "ApontaVetorCusto": "String",
  "CustoMaterial": "Double",
  "CustoVCF": "Double",
  "CustoPropMaterial": "Double",
  "CustoPropVCF": "Double",
  "RoteiroInspecao": "Boolean",
  "EstocaRefugo": "Boolean",
  "RefugoCustoSubproduto": "Boolean",
  "IDF_ProdutoRefugo": "Integer",
  "ProporcaoRefugoProdu": "Double",
  "CustoFechado": "Boolean",
  "CustoFechadoPeriodo": "Boolean",
  "IDF_ItemProdPedVen": "Integer",
  "IDF_TipoLaudo": "Integer",
  "ListaMateriais": "Array (ver abaixo)",
  "Operacoes": "Array (ver abaixo)"
}
```

**Estrutura ListaMateriais da OP:**

```json
{
  "IDF_Produto": "Integer",
  "IDF_UnidProduto": "Integer",
  "IDF_AlmoxProduto": "Integer",
  "Sequencia": "Integer",
  "Qtde": "Double",
  "QtdeEfetiva": "Double",
  "PercPerda": "Double",
  "TipoItem": "Char",
  "DtReserva": "DateTime",
  "OrigemOrdem": "String",
  "IDF_Lote": "Integer"
}
```

**Estrutura Operações da OP:**

```json
{
  "IDF_OperacaoRoteiro": "Integer",
  "SeqOperacao": "Integer",
  "IDF_Recurso": "Integer",
  "IDF_Ferramenta": "Integer",
  "QtdeProduto": "Double",
  "NroPecasferramenta": "Integer",
  "TipoRecurso": "Char",
  "UnTempo": "Char",
  "Descricao": "String"
}
```

---

#### 3.2.2 ApontamentoBaixaProdFabricado

| Operação | Método | Endpoint | Descrição |
|----------|--------|----------|-----------|
| Incluir | POST | `ApontamentoBaixaProdFabricado/Incluir_API` | Registrar produção |
| Alterar | PUT | `ApontamentoBaixaProdFabricado/Alterar_API` | Alterar apontamento |
| Excluir | DELETE | `ApontamentoBaixaProdFabricado/Excluir_API` | Excluir apontamento |
| Consultar | GET | `ApontamentoBaixaProdFabricado/ConsultarRegistros_API` | Consultar apontamentos |

**Estrutura de dados:**

```json
{
  "IDOrdemProducao": "Integer",
  "Quantidade": "Double (produto fabricado)",
  "QuantidadeRefugo": "Double",
  "NumeroLote": "String",
  "dtDataApontamento": "String (ISO8601)",
  "dtHoraApontamento": "String (ISO8601)",
  "dtValidadeLote": "String (ISO8601)"
}
```

---

#### 3.2.3 ApontamentoBaixaMateriaPrima

| Operação | Método | Endpoint | Descrição |
|----------|--------|----------|-----------|
| CRUD | via ExecutarMetodo | `ApontamentoBaixaMateriaPrima/*` | Baixa de matéria-prima por OP |

---

#### 3.2.4 ApontamentoHorasTrabalhadas

| Operação | Método | Endpoint | Descrição |
|----------|--------|----------|-----------|
| CRUD | via ExecutarMetodo | `ApontamentoHorasTrabalhadas/*` | Registro de horas por operação |

Suporta cálculo automático de horas e geração de horas por baixa.

---

#### 3.2.5 IntegracaoOrdProdManuf

| Operação | Método | Endpoint | Descrição |
|----------|--------|----------|-----------|
| Preencher Custos | POST | `IntegracaoOrdProdManuf/PreencherInformacoesCustos` | Integração de custos de produção |

---

### 3.3 Resposta Padrão EME4

Todas as APIs retornam:

```json
{
  "Sucesso": "Boolean",
  "Mensagem": "String",
  "Conteudo": {
    "ID": "Integer",
    "Registros": ["Array (quando consulta)"]
  },
  "MensagemErro": "String (se houver erro)"
}
```

---

## 4. Mapeamento de Endpoints - Protheus

O Protheus **não expõe por padrão** APIs REST públicas para todas as tabelas de manufatura. A abordagem recomendada pela TOTVS:

### 4.1 Estratégias de Exposição REST

| Estratégia | Descrição | Recomendação |
|------------|-----------|--------------|
| **FWRestModel** | Publica modelos MVC existentes como REST | Cadastros simples (Produtos, Centros de Trabalho) |
| **API customizada TLPP** | Endpoints customizados em TLPP/AdvPL | Processos complexos (OPs, Apontamentos) |
| **ExecAuto** | Execução automática de rotinas padrão | Dentro das APIs customizadas |
| **EAI 2.0** | Enterprise Application Integration TOTVS | Integração corporativa |

### 4.2 Tabelas e Rotinas Protheus

| Entidade | Tabela | Rotina Padrão | Estratégia REST Recomendada |
|----------|--------|---------------|----------------------------|
| Produtos | SB1 | MATA010 | FWRestModel |
| Estrutura de Produto (BOM) | SG1 | MATA200 | FWRestModel ou API TLPP |
| Roteiros de Fabricação | SG2 | MATA630 | API TLPP + ExecAuto |
| Centros de Trabalho | SH1/SHB | MATA610/MATA640 | FWRestModel |
| Ordens de Produção | SC2 | MATA650 | API TLPP + ExecAuto |
| Apontamento de Produção | SD3 | MATA250 | API PCPA121/PCPA125 (Minha Produção) |
| Apontamento de Horas | SH6 | MATA681 | API TLPP + ExecAuto |

### 4.3 Autenticação Protheus

- **Basic Auth**: Usuário e senha codificados em Base64
- **OAuth2**: Endpoint `/api/oauth2/v1/token` para obtenção de token
- Configuração via `appserver.ini` (seções HTTPV11, HTTPREST, HTTPURI)

### 4.4 Campos Principais das Tabelas Protheus

#### SB1 - Produtos

| Campo | Descrição |
|-------|-----------|
| B1_COD | Código do Produto |
| B1_DESC | Descrição |
| B1_TIPO | Tipo (PA=Prod.Acabado, PI=Prod.Intermediário, MP=Matéria-Prima, ME=Mercadoria) |
| B1_UM | Unidade de Medida |
| B1_LOCPAD | Armazém Padrão |
| B1_GRUPO | Grupo |
| B1_ORIGEM | Origem (Nacional/Importado) |

#### SG1 - Estrutura de Produto (BOM)

| Campo | Descrição |
|-------|-----------|
| G1_COD | Código do Produto Pai |
| G1_COMP | Código do Componente |
| G1_QUANT | Quantidade |
| G1_PERDA | Percentual de Perda |
| G1_INI | Data Início Validade |
| G1_FIM | Data Fim Validade |
| G1_REVINI | Revisão Inicial |
| G1_REVFIM | Revisão Final |
| G1_FIXVAR | Quantidade Fixa/Variável |

#### SG2 - Roteiro de Operações

| Campo | Descrição |
|-------|-----------|
| G2_COD | Código do Produto |
| G2_OPERAC | Código da Operação |
| G2_RECURSO | Código do Recurso |
| G2_DESCRI | Descrição |
| G2_TEMPP | Tempo Padrão |
| G2_SETUP | Tempo de Setup |
| G2_FERRAM | Ferramenta |

#### SC2 - Ordens de Produção

| Campo | Descrição |
|-------|-----------|
| C2_NUM | Número da OP |
| C2_PRODUTO | Código do Produto |
| C2_QUANT | Quantidade |
| C2_DATPRI | Data Início Prevista |
| C2_DATPRF | Data Fim Prevista |
| C2_LOCAL | Armazém |
| C2_ROTEIRO | Roteiro |
| C2_QUJE | Quantidade Produzida |
| C2_PERDA | Quantidade Perdida |
| C2_STATUS | Status (Prevista, Aberta, Iniciada, Encerrada) |

#### SD3 - Apontamentos de Produção

| Campo | Descrição |
|-------|-----------|
| D3_OP | Número da OP |
| D3_COD | Código do Produto |
| D3_QUANT | Quantidade |
| D3_EMISSAO | Data Emissão |
| D3_LOTECTL | Lote |
| D3_PERDA | Quantidade Perda |
| D3_TM | Tipo de Movimento |

---

## 5. Cenário 1 - Sincronização de Engenharia (Protheus -> EME4)

### 5.1 Direção do Fluxo

**Unidirecional: Protheus (master) -> Middleware -> EME4 (destino)**

O Protheus é o sistema master dos dados de engenharia. O EME4 recebe e consome esses dados para executar o chão de fábrica.

### 5.2 Eventos NATS

| # | Subject NATS | Produtor | Consumidor | Descrição |
|---|-------------|----------|------------|-----------|
| 1 | `eng.recurso.sync` | Protheus | Worker -> EME4 | Sincronizar Centro de Trabalho (SH1 -> RecursoProducao) |
| 2 | `eng.linha.sync` | Protheus | Worker -> EME4 | Sincronizar Linha de Produção |
| 3 | `eng.ferramenta.sync` | Protheus | Worker -> EME4 | Sincronizar Ferramentas |
| 4 | `eng.produto.sync` | Protheus | Worker -> EME4 | Sincronizar Produto + Papel Manufatura (SB1 -> ProdutoPapelManufatura) |
| 5 | `eng.bom.sync` | Protheus | Worker -> EME4 | Sincronizar BOM (SG1 -> ListaMateriaisProduto + Itens) |
| 6 | `eng.roteiro.sync` | Protheus | Worker -> EME4 | Sincronizar Roteiro (SG2 -> RoteiroProducao + Operações) |

### 5.3 Ordem de Execução (Dependências)

```
Nível 1 (sem dependência - executar em paralelo):
  ├── eng.recurso.sync    (Centros de Trabalho)
  ├── eng.linha.sync      (Linhas de Produção)
  └── eng.ferramenta.sync (Ferramentas)

Nível 2 (depende de Filial cadastrada):
  └── eng.produto.sync    (Produtos + Papel Manufatura)

Nível 3 (depende de Produto + Recurso):
  ├── eng.bom.sync        (Lista de Materiais / BOM)
  └── eng.roteiro.sync    (Roteiros de Fabricação)
```

### 5.4 Diagrama de Sequência - Sincronizar Engenharia

```
PROTHEUS             KONG Gateway          NATS JetStream        WORKER              EME4
   │                      │                      │                  │                  │
   │─ POST /mw/eng/sync ─>│                      │                  │                  │
   │                      │─ Auth (JWT/Key) ─────>│                  │                  │
   │                      │─ Rate Limit Check ───>│                  │                  │
   │                      │─ Publish eng.*.sync ─>│                  │                  │
   │<─── 202 Accepted ────│                      │                  │                  │
   │                      │                      │─ Persist (Stream)│                  │
   │                      │                      │─ Deliver ────────>│                  │
   │                      │                      │                  │─ Transforma ──────>│
   │                      │                      │                  │  DE-PARA campos   │
   │                      │                      │                  │─ POST *_API ──────>│
   │                      │                      │                  │<── {Sucesso:true} ─│
   │                      │                      │<── ACK ──────────│                  │
   │                      │                      │                  │                  │
```

---

## 6. Cenário 2 - Ordens de Produção e Apontamentos (Protheus <-> EME4)

### 6.1 Direção do Fluxo

**Bidirecional:**
- **Protheus -> EME4**: Criação, liberação e alteração de OPs
- **EME4 -> Protheus**: Apontamentos de produção, matéria-prima e horas

### 6.2 Eventos NATS

| # | Subject NATS | Direção | Descrição |
|---|-------------|---------|-----------|
| 7 | `op.criar` | Protheus -> EME4 | Criar Ordem de Produção (SC2 -> DoctoOrdProducaoManufatura) |
| 8 | `op.liberar` | Protheus -> EME4 | Liberar OP (AlteraSituacaoDaOrdemProducao) |
| 9 | `op.alterar` | Protheus -> EME4 | Alterar OP (quantidade, datas, etc.) |
| 10 | `op.cancelar` | Protheus -> EME4 | Cancelar/Excluir OP |
| 11 | `op.apontamento.produto` | EME4 -> Protheus | Apontamento produto fabricado -> SD3 |
| 12 | `op.apontamento.mp` | EME4 -> Protheus | Baixa de matéria-prima -> SD3 |
| 13 | `op.apontamento.horas` | EME4 -> Protheus | Horas trabalhadas -> SH6 |
| 14 | `op.status.update` | EME4 -> Protheus | Atualização de status (Finalizada/Concluída) |

### 6.3 Diagrama de Sequência - Criar Ordem de Produção

```
PROTHEUS             KONG Gateway          NATS JetStream        WORKER              EME4
   │                      │                      │                  │                  │
   │─ POST /mw/op/criar ─>│                      │                  │                  │
   │                      │─ Auth + Validate ────>│                  │                  │
   │                      │─ Publish op.criar ───>│                  │                  │
   │<─── 202 Accepted ────│                      │                  │                  │
   │                      │                      │─ Persist ────────>│                  │
   │                      │                      │─ Deliver ────────>│                  │
   │                      │                      │                  │─ Mapeamento ──────>│
   │                      │                      │                  │  SC2 -> OP EME4   │
   │                      │                      │                  │  SG1 -> ListaMat  │
   │                      │                      │                  │  SG2 -> Operacoes │
   │                      │                      │                  │─ POST Incluir_API >│
   │                      │                      │                  │<── {Sucesso, ID} ──│
   │                      │                      │<── ACK ──────────│                  │
   │                      │                      │                  │                  │
```

### 6.4 Diagrama de Sequência - Retorno de Apontamento

```
EME4                 WORKER/Producer       NATS JetStream        WORKER              PROTHEUS
   │                      │                      │                  │                  │
   │─ Apontamento feito ─>│                      │                  │                  │
   │                      │─ Pub op.apto.prod ──>│                  │                  │
   │                      │                      │─ Persist ────────>│                  │
   │                      │                      │─ Deliver ────────>│                  │
   │                      │                      │                  │─ Mapeamento ──────>│
   │                      │                      │                  │  EME4 -> SD3/SH6  │
   │                      │                      │                  │─ POST Protheus ───>│
   │                      │                      │                  │<──── 200 OK ───────│
   │                      │                      │<── ACK ──────────│                  │
   │                      │                      │                  │                  │
```

---

## 7. Componentes do Middleware

### 7.1 Kong API Gateway

| Funcionalidade | Descrição |
|---------------|-----------|
| **Autenticação** | JWT ou API Key por sistema (Protheus e EME4) |
| **Rate Limiting** | Controle de vazão (ex: 100 req/min por sistema) |
| **Request Transformation** | Normalização de headers e payload |
| **Logging** | Registro de todas as requisições (audit trail) |
| **Load Balancing** | Distribuição entre workers |
| **Health Check** | Monitoramento de saúde dos backends |
| **Rotas** | `/api/middleware/eng/*` e `/api/middleware/op/*` |

### 7.2 NATS JetStream

| Funcionalidade | Descrição |
|---------------|-----------|
| **Streams** | `ENGENHARIA` (eventos eng.*) e `ORDENS_PRODUCAO` (eventos op.*) |
| **Persistência** | Garantia de entrega at-least-once |
| **Consumers** | Workers dedicados por tipo de evento |
| **Dead Letter Queue** | Mensagens que falharam após N tentativas |
| **Replay** | Reprocessamento de mensagens sob demanda |
| **Retention** | Política de retenção configurável |

### 7.3 Workers/Consumers

| Funcionalidade | Descrição |
|---------------|-----------|
| **Transformação DE-PARA** | Mapeamento de campos entre Protheus e EME4 |
| **Orquestração** | Respeitar ordem de dependência entre entidades |
| **Retry com Backoff** | Retentar em caso de falha temporária (ex: 1s, 5s, 30s, 5min) |
| **Idempotência** | Evitar duplicatas via chave única (código + filial) |
| **Logging** | Registrar resultado de cada processamento |
| **Monitoramento** | Métricas de sucesso/falha por evento |

---

## 8. Mapeamento DE-PARA de Campos

### 8.1 Centro de Trabalho / Recurso

| Protheus (SH1) | EME4 (RecursoProducao) | Observação |
|----------------|----------------------|------------|
| H1_CODIGO | Codigo | Direto |
| H1_DESCRI | Descricao | Direto |
| H1_FILIAL | IdFilial | Tabela DE-PARA de Filiais |
| H1_TIPO | TipoRecurso | Mapeamento de domínio |
| H1_CCUSTO | IdCentroCusto | Tabela DE-PARA |

### 8.2 Produto

| Protheus (SB1) | EME4 (ProdutoPapelManufatura) | Observação |
|----------------|-------------------------------|------------|
| B1_COD | IDFProduto | Tabela DE-PARA de Produtos |
| B1_FILIAL | IDFFilial | Tabela DE-PARA de Filiais |
| B1_TIPO | TipoProduto | Mapeamento de domínio |
| B1_ORIGEM | OrigemProduto | Mapeamento de domínio |

### 8.3 Estrutura de Produto (BOM)

| Protheus (SG1) | EME4 (ListaMateriaisProduto) | Observação |
|----------------|------------------------------|------------|
| G1_COD | IdProduto | Tabela DE-PARA de Produtos |
| G1_REVFIM | Versao | Direto |
| G1_COMP | Itens[].IdProd | Tabela DE-PARA de Produtos |
| G1_QUANT | Itens[].Qtde | Direto |
| G1_PERDA | Itens[].PercentualPerda | Direto |
| G1_INI | DtInicialVersao | Conversão de formato de data |
| G1_FIM | DtFinalVersao | Conversão de formato de data |
| G1_FIXVAR | Itens[].EhQtdeFixa | Mapeamento de domínio |

### 8.4 Roteiro de Fabricação

| Protheus (SG2) | EME4 (RoteiroProducao) | Observação |
|----------------|------------------------|------------|
| G2_COD | IdProduto | Tabela DE-PARA de Produtos |
| G2_OPERAC | OperacoesRoteiro[].SeqOperacao | Direto |
| G2_RECURSO | OperacoesRoteiro[].IdRecurso | Tabela DE-PARA de Recursos |
| G2_DESCRI | OperacoesRoteiro[].Descricao | Direto |
| G2_TEMPP | OperacoesRoteiro[].TempoHomem | Conversão de unidade de tempo |
| G2_SETUP | OperacoesRoteiro[].TempoSetup | Conversão de unidade de tempo |
| G2_FERRAM | OperacoesRoteiro[].IdFerramentaProducao | Tabela DE-PARA |

### 8.5 Ordem de Produção

| Protheus (SC2) | EME4 (DoctoOrdProducaoManufatura) | Observação |
|----------------|-----------------------------------|------------|
| C2_NUM | (referência externa) | Armazenar para rastreabilidade |
| C2_PRODUTO | IDF_ProPapMnf | Tabela DE-PARA de Produtos |
| C2_QUANT | QtdeOrdem | Direto |
| C2_DATPRI | DtInicio | Conversão de formato de data |
| C2_DATPRF | DtTerminoOriginal | Conversão de formato de data |
| C2_FILIAL | IDFilial | Tabela DE-PARA de Filiais |
| C2_ROTEIRO | IDF_RoteiroProducao | Tabela DE-PARA de Roteiros |
| C2_LOCAL | IDF_AlmoxPapProd | Tabela DE-PARA de Almoxarifados |
| C2_STATUS | Situacao | Mapeamento de domínio de status |

### 8.6 Apontamento de Produção (Retorno EME4 -> Protheus)

| EME4 (ApontamentoBaixaProdFabricado) | Protheus (SD3) | Observação |
|--------------------------------------|----------------|------------|
| IDOrdemProducao | D3_OP | Tabela DE-PARA de OPs |
| Quantidade | D3_QUANT | Direto |
| QuantidadeRefugo | D3_PERDA | Direto |
| NumeroLote | D3_LOTECTL | Direto |
| dtDataApontamento | D3_EMISSAO | Conversão de formato de data |

### 8.7 Tabelas DE-PARA Necessárias

| Tabela | Descrição |
|--------|-----------|
| DE-PARA Filiais | Código Protheus <-> ID EME4 |
| DE-PARA Produtos | Código Protheus <-> ID EME4 |
| DE-PARA Recursos | Código Protheus <-> ID EME4 |
| DE-PARA Almoxarifados | Código Protheus <-> ID EME4 |
| DE-PARA Unidades | Código Protheus <-> ID EME4 |
| DE-PARA Ordens de Produção | Número OP Protheus <-> ID OP EME4 |
| DE-PARA Roteiros | Código Protheus <-> ID EME4 |
| DE-PARA Domínios | Valores de campos (Tipo, Status, Situação) |

---

## 9. Resumo Executivo

### 9.1 O que o Middleware resolve

| Benefício | Descrição |
|-----------|-----------|
| **Desacoplamento** | Protheus e EME4 não precisam se conhecer diretamente. Cada sistema se comunica apenas com o middleware |
| **Confiabilidade** | NATS JetStream garante que nenhuma mensagem se perde, mesmo com indisponibilidade temporária |
| **Escalabilidade** | Workers podem ser escalados horizontalmente conforme demanda de produção |
| **Monitoramento** | Visibilidade total do fluxo de dados entre os sistemas via Kong e dashboards NATS |
| **Resiliência** | Se um sistema cair, as mensagens ficam na fila e são processadas quando voltar |
| **Governança** | Kong provê autenticação, rate limiting e logging centralizado |
| **Transformação** | Mapeamento DE-PARA centralizado, facilitando manutenção |

### 9.2 Volumetria Estimada

| Tipo de Evento | Frequência | Criticidade |
|---------------|------------|-------------|
| Engenharia (cadastros) | Baixa (dezenas/semana) | Alta (base para produção) |
| Ordens de Produção | Média (dezenas/dia) | Alta (operação) |
| Apontamentos | Alta (centenas/dia) | Crítica (tempo real) |

### 9.3 Integrações Mapeadas

- **Total de eventos/subjects NATS:** 14
  - 6 de Engenharia (unidirecional: Protheus -> EME4)
  - 8 de Ordens de Produção (bidirecional)

### 9.4 Próximos Passos

1. Validação desta análise pelo time técnico
2. Construção do diagrama/fluxograma detalhado para apresentação à diretoria
3. Definição do escopo mínimo da POC (quais eventos implementar primeiro)
4. Prototipagem do middleware com Kong + NATS
5. Testes de integração com ambientes de homologação

---

> **Nota:** Este documento é a base para construção do fluxograma/diagrama de apresentação à diretoria para aprovação do projeto Middleware.

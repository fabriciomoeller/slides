# POC Middleware - Kong/APISIX API Gateway + NATS Mensageria

## Integração Protheus (TOTVS) <-> EME4 Manufatura

**Data:** 04/03/2026
**Versão:** 2.0
**Status:** Em análise
**Changelog v2:** Adicionado Load Balancing das APIs EME4 via Kong/APISIX. Adicionada seção de performance e benchmarks do NATS e Kong/APISIX. Adicionada comparação Kong vs APISIX.

---

## Sumário

1. [Objetivo](#1-objetivo)
2. [Arquitetura Proposta v2](#2-arquitetura-proposta-v2)
3. [Load Balancing das APIs EME4](#3-load-balancing-das-apis-eme4)
4. [Mapeamento de Endpoints - EME4](#4-mapeamento-de-endpoints---eme4)
5. [Mapeamento de Endpoints - Protheus](#5-mapeamento-de-endpoints---protheus)
6. [Cenário 1 - Sincronização de Engenharia](#6-cenário-1---sincronização-de-engenharia-protheus---eme4)
7. [Cenário 2 - Ordens de Produção e Apontamentos](#7-cenário-2---ordens-de-produção-e-apontamentos-protheus---eme4)
8. [Componentes do Middleware](#8-componentes-do-middleware)
9. [Kong vs APISIX - Comparação](#9-kong-vs-apisix---comparação)
10. [Mapeamento DE-PARA de Campos](#10-mapeamento-de-para-de-campos)
11. [Performance e Benchmarks](#11-performance-e-benchmarks)
12. [Resumo Executivo](#12-resumo-executivo)

---

## 1. Objetivo

Analisar a viabilidade de implementar um **middleware** baseado em **Kong ou APISIX (API Gateway)** e **NATS (JetStream)** para integrar o módulo de Manufatura do ERP Protheus (TOTVS) com o sistema EME4 Manufatura, cobrindo dois cenários:

- **Cenário 1:** Sincronização de dados de Engenharia (Protheus -> EME4)
- **Cenário 2:** Ordens de Produção e Apontamentos (Protheus <-> EME4, bidirecional)

Nesta v2, adicionamos o **Load Balancing das APIs do EME4** para melhor distribuição e consumo das requisições, e uma análise de performance das tecnologias escolhidas.

---

## 2. Arquitetura Proposta v2

A principal evolução nesta versão é que o **Kong/APISIX** não atua apenas como porta de entrada do Middleware, mas também como **Load Balancer** na saída, distribuindo as requisições entre múltiplas instâncias do EME4.

```
                                    MIDDLEWARE
┌───────────┐     ┌──────────────────────────────────────────────────┐     ┌──────────────────┐
│           │     │                                                  │     │  EME4 Instância 1│
│           │     │  ┌────────────┐  ┌────────┐  ┌───────────┐     │  ┌─>│  (Engenharia)    │
│ PROTHEUS  │────>│  │ KONG/APISIX│─>│  NATS  │─>│  WORKERS  │─────│──┤  └──────────────────┘
│ (TOTVS)   │     │  │  (nginx)   │  │JetStream│  │           │     │  │  ┌──────────────────┐
│           │<────│  │            │  │        │  │           │<────│──┤  │  EME4 Instância 2│
│           │     │  │ ┌────────┐ │  └────────┘  └───────────┘     │  ├─>│  (Ord. Produção)  │
│           │     │  │ │  Load  │ │                                 │  │  └──────────────────┘
│           │     │  │ │Balancer│ │─────────────────────────────────│──┤  ┌──────────────────┐
│           │     │  │ └────────┘ │                                 │  └─>│  EME4 Instância N│
│           │     │  └────────────┘                                 │     │  (Backup/Escala)  │
└───────────┘     └──────────────────────────────────────────────────┘     └──────────────────┘

                   ▲                ▲                ▲
                   │                │                │
              Construído        Escrito em       Consome da fila
              sobre NGINX        Go (leve)       e entrega via
              (comprovado       ~18MB RAM         Load Balancer
               há 20+ anos)    10k+ msg/seg
```

---

## 3. Load Balancing das APIs EME4

### 3.1 Por que Load Balancing?

O EME4 pode ter múltiplas instâncias de serviço rodando (por módulo, por filial, ou para escala). O Kong/APISIX distribui as requisições entre elas, garantindo:

- **Nenhuma instância fica sobrecarregada**
- **Se uma instância cair, o tráfego é redirecionado automaticamente**
- **Performance otimizada** — a instância menos ocupada recebe a próxima requisição

### 3.2 Estratégias de Load Balancing Disponíveis

| Estratégia | Como Funciona | Quando Usar |
|------------|---------------|-------------|
| **Round Robin** | Distribui requisições em sequência circular (1, 2, 3, 1, 2, 3...) | Instâncias com capacidade igual |
| **Weighted Round Robin** | Distribui com peso (instância A recebe 70%, B recebe 30%) | Instâncias com capacidade diferente |
| **Least Connections** | Envia para a instância com menos conexões ativas | Quando o tempo de resposta varia |
| **Consistent Hashing** | Sempre envia o mesmo tipo de dado para a mesma instância | Quando há cache ou afinidade |
| **Health Check Ativo** | Testa periodicamente se a instância está saudável | Sempre (recomendado) |

### 3.3 Configuração Proposta para EME4

```
┌─────────────────────────────────────────────────────────────┐
│                   KONG/APISIX - UPSTREAMS                   │
│                                                             │
│  Upstream: eme4-engenharia                                  │
│  ├── Target: eme4-server-01:8080  (peso: 100, saudável)    │
│  ├── Target: eme4-server-02:8080  (peso: 100, saudável)    │
│  └── Health Check: GET /health a cada 10s                   │
│                                                             │
│  Upstream: eme4-ordens-producao                             │
│  ├── Target: eme4-server-01:8081  (peso: 100, saudável)    │
│  ├── Target: eme4-server-02:8081  (peso: 100, saudável)    │
│  └── Health Check: GET /health a cada 10s                   │
│                                                             │
│  Algoritmo: Least Connections                               │
│  Timeout: 30s                                               │
│  Retries: 3                                                 │
│  Health Check: ativo + passivo                              │
└─────────────────────────────────────────────────────────────┘
```

### 3.4 Diagrama de Sequência com Load Balancing

```
WORKER              KONG/APISIX (Load Balancer)         EME4 Instâncias
   │                        │                           ┌──────────────┐
   │── POST Incluir_API ───>│                           │ Instância 1  │
   │                        │── Health Check OK? ──────>│ (CPU: 40%)   │
   │                        │                           └──────────────┘
   │                        │── Health Check OK? ──┐    ┌──────────────┐
   │                        │                      └───>│ Instância 2  │
   │                        │                           │ (CPU: 80%)   │
   │                        │                           └──────────────┘
   │                        │
   │                        │  Least Connections: Inst.1 tem menos conexões
   │                        │                           ┌──────────────┐
   │                        │── Roteia para Inst. 1 ───>│ Instância 1  │
   │                        │<── { Sucesso: true } ─────│              │
   │<── { Sucesso: true } ──│                           └──────────────┘
   │                        │
```

### 3.5 Cenário de Failover Automático

```
WORKER              KONG/APISIX                         EME4 Instâncias
   │                        │                           ┌──────────────┐
   │── POST Incluir_API ───>│                           │ Instância 1  │
   │                        │── Envia para Inst. 1 ────>│  FORA DO AR  │
   │                        │<── Timeout/Erro ──────────│      X       │
   │                        │                           └──────────────┘
   │                        │  (marca Inst. 1 como "unhealthy")
   │                        │                           ┌──────────────┐
   │                        │── Reenvia para Inst. 2 ──>│ Instância 2  │
   │                        │<── { Sucesso: true } ─────│  (saudável)  │
   │<── { Sucesso: true } ──│                           └──────────────┘
   │                        │
   │                        │  (continua testando Inst. 1 a cada 10s)
   │                        │  (quando Inst. 1 voltar, reativa automaticamente)
```

### 3.6 Fluxo Completo v2 - Com Load Balancing

```
PROTHEUS        KONG/APISIX         NATS JetStream      WORKER          KONG/APISIX (LB)     EME4
   │            (Entrada)                │                  │            (Saída)                │
   │─ POST ────>│                        │                  │                │                  │
   │            │─ Auth ────────────────>│                  │                │                  │
   │            │─ Publish ────────────>│                  │                │                  │
   │<── 202 ────│                        │                  │                │                  │
   │            │                        │─ Deliver ───────>│                │                  │
   │            │                        │                  │─ Transforma ──>│                  │
   │            │                        │                  │                │─ Load Balance ──>│
   │            │                        │                  │                │  (melhor inst.)  │
   │            │                        │                  │                │<── Sucesso ──────│
   │            │                        │                  │<── Sucesso ────│                  │
   │            │                        │<── ACK ──────────│                │                  │
```

---

## 4. Mapeamento de Endpoints - EME4

### 4.1 APIs de Engenharia (M3ElementosManufatura)

#### 4.1.1 RecursoProducao (Centro de Trabalho)

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

#### 4.1.2 LinhaProducao

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

#### 4.1.3 FerramentaProducao

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

#### 4.1.4 ProdutoPapelManufatura (Produto com papel de manufatura)

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

#### 4.1.5 ListaMateriaisProduto (BOM - Bill of Materials)

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

#### 4.1.6 RoteiroProducao (Roteiro de Fabricação)

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

#### 4.1.7 OperacaoRoteiro

| Operação | Método | Endpoint | Descrição |
|----------|--------|----------|-----------|
| Incluir | POST | `OperacaoRoteiro/Incluir` | Criar operação |
| Alterar | PUT | `OperacaoRoteiro/Alterar` | Alterar operação |
| Excluir | DELETE | `OperacaoRoteiro/Excluir` | Excluir operação |
| Clonar | POST | `OperacaoRoteiro/Clonar` | Clonar operação |

---

#### 4.1.8 Entidades Auxiliares

| Entidade | Endpoints | Descrição |
|----------|-----------|-----------|
| ParamFilialManufatura | CRUD | Parâmetros de Filial Manufatura |
| CadastroCalendario | CRUD | Calendários de produção |
| CadastroTurno | CRUD | Turnos de trabalho |
| FamProdPapelManufatura | CRUD + Replicar + Copiar | Famílias de produto com papel manufatura |
| ItemListaMateriaisOperacao | CRUD | Itens de lista de materiais por operação |
| ListaFormOpRot | CRUD | Formulários por operação de roteiro |

---

### 4.2 APIs de Ordem de Produção (__M3OrdemProducaoManufatura)

#### 4.2.1 DoctoOrdProducaoManufatura (Ordem de Produção)

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

#### 4.2.2 ApontamentoBaixaProdFabricado

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

#### 4.2.3 ApontamentoBaixaMateriaPrima

| Operação | Método | Endpoint | Descrição |
|----------|--------|----------|-----------|
| CRUD | via ExecutarMetodo | `ApontamentoBaixaMateriaPrima/*` | Baixa de matéria-prima por OP |

---

#### 4.2.4 ApontamentoHorasTrabalhadas

| Operação | Método | Endpoint | Descrição |
|----------|--------|----------|-----------|
| CRUD | via ExecutarMetodo | `ApontamentoHorasTrabalhadas/*` | Registro de horas por operação |

Suporta cálculo automático de horas e geração de horas por baixa.

---

#### 4.2.5 IntegracaoOrdProdManuf

| Operação | Método | Endpoint | Descrição |
|----------|--------|----------|-----------|
| Preencher Custos | POST | `IntegracaoOrdProdManuf/PreencherInformacoesCustos` | Integração de custos de produção |

---

### 4.3 Resposta Padrão EME4

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

## 5. Mapeamento de Endpoints - Protheus

O Protheus **não expõe por padrão** APIs REST públicas para todas as tabelas de manufatura. A abordagem recomendada pela TOTVS:

### 5.1 Estratégias de Exposição REST

| Estratégia | Descrição | Recomendação |
|------------|-----------|--------------|
| **FWRestModel** | Publica modelos MVC existentes como REST | Cadastros simples (Produtos, Centros de Trabalho) |
| **API customizada TLPP** | Endpoints customizados em TLPP/AdvPL | Processos complexos (OPs, Apontamentos) |
| **ExecAuto** | Execução automática de rotinas padrão | Dentro das APIs customizadas |
| **EAI 2.0** | Enterprise Application Integration TOTVS | Integração corporativa |

### 5.2 Tabelas e Rotinas Protheus

| Entidade | Tabela | Rotina Padrão | Estratégia REST Recomendada |
|----------|--------|---------------|----------------------------|
| Produtos | SB1 | MATA010 | FWRestModel |
| Estrutura de Produto (BOM) | SG1 | MATA200 | FWRestModel ou API TLPP |
| Roteiros de Fabricação | SG2 | MATA630 | API TLPP + ExecAuto |
| Centros de Trabalho | SH1/SHB | MATA610/MATA640 | FWRestModel |
| Ordens de Produção | SC2 | MATA650 | API TLPP + ExecAuto |
| Apontamento de Produção | SD3 | MATA250 | API PCPA121/PCPA125 (Minha Produção) |
| Apontamento de Horas | SH6 | MATA681 | API TLPP + ExecAuto |

### 5.3 Autenticação Protheus

- **Basic Auth**: Usuário e senha codificados em Base64
- **OAuth2**: Endpoint `/api/oauth2/v1/token` para obtenção de token
- Configuração via `appserver.ini` (seções HTTPV11, HTTPREST, HTTPURI)

### 5.4 Campos Principais das Tabelas Protheus

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

## 6. Cenário 1 - Sincronização de Engenharia (Protheus -> EME4)

### 6.1 Direção do Fluxo

**Unidirecional: Protheus (master) -> Middleware -> EME4 (destino)**

O Protheus é o sistema master dos dados de engenharia. O EME4 recebe e consome esses dados para executar o chão de fábrica.

### 6.2 Eventos NATS

| # | Subject NATS | Produtor | Consumidor | Descrição |
|---|-------------|----------|------------|-----------|
| 1 | `eng.recurso.sync` | Protheus | Worker -> EME4 | Sincronizar Centro de Trabalho (SH1 -> RecursoProducao) |
| 2 | `eng.linha.sync` | Protheus | Worker -> EME4 | Sincronizar Linha de Produção |
| 3 | `eng.ferramenta.sync` | Protheus | Worker -> EME4 | Sincronizar Ferramentas |
| 4 | `eng.produto.sync` | Protheus | Worker -> EME4 | Sincronizar Produto + Papel Manufatura (SB1 -> ProdutoPapelManufatura) |
| 5 | `eng.bom.sync` | Protheus | Worker -> EME4 | Sincronizar BOM (SG1 -> ListaMateriaisProduto + Itens) |
| 6 | `eng.roteiro.sync` | Protheus | Worker -> EME4 | Sincronizar Roteiro (SG2 -> RoteiroProducao + Operações) |

### 6.3 Ordem de Execução (Dependências)

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

### 6.4 Diagrama de Sequência v2 - Com Load Balancing

```
PROTHEUS        KONG/APISIX         NATS JetStream      WORKER          KONG/APISIX (LB)     EME4
   │            (Entrada)                │                  │            (Saída-Balancer)       │
   │─ POST ────>│                        │                  │                │                  │
   │            │─ Auth (JWT/Key) ──────>│                  │                │                  │
   │            │─ Rate Limit ──────────>│                  │                │                  │
   │            │─ Pub eng.*.sync ──────>│                  │                │                  │
   │<── 202 ────│                        │                  │                │                  │
   │            │                        │─ Persist ───────>│                │                  │
   │            │                        │─ Deliver ───────>│                │                  │
   │            │                        │                  │─ Transforma ──>│                  │
   │            │                        │                  │  DE-PARA       │                  │
   │            │                        │                  │                │─ Least Conn ────>│
   │            │                        │                  │                │  (melhor inst.)  │
   │            │                        │                  │                │<── Sucesso ──────│
   │            │                        │                  │<── Sucesso ────│                  │
   │            │                        │<── ACK ──────────│                │                  │
```

---

## 7. Cenário 2 - Ordens de Produção e Apontamentos (Protheus <-> EME4)

### 7.1 Direção do Fluxo

**Bidirecional:**
- **Protheus -> EME4**: Criação, liberação e alteração de OPs
- **EME4 -> Protheus**: Apontamentos de produção, matéria-prima e horas

### 7.2 Eventos NATS

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

### 7.3 Diagrama de Sequência v2 - Criar OP com Load Balancing

```
PROTHEUS        KONG/APISIX         NATS JetStream      WORKER          KONG/APISIX (LB)     EME4
   │            (Entrada)                │                  │            (Saída-Balancer)       │
   │─ POST ────>│                        │                  │                │                  │
   │            │─ Auth + Validate ─────>│                  │                │                  │
   │            │─ Pub op.criar ────────>│                  │                │                  │
   │<── 202 ────│                        │                  │                │                  │
   │            │                        │─ Persist ───────>│                │                  │
   │            │                        │─ Deliver ───────>│                │                  │
   │            │                        │                  │─ Mapeamento ──>│                  │
   │            │                        │                  │  SC2->OP EME4  │                  │
   │            │                        │                  │                │─ Least Conn ────>│
   │            │                        │                  │                │  (melhor inst.)  │
   │            │                        │                  │                │<── {Sucesso,ID} ─│
   │            │                        │                  │<── Sucesso ────│                  │
   │            │                        │<── ACK ──────────│                │                  │
```

### 7.4 Diagrama de Sequência v2 - Retorno de Apontamento

```
EME4            WORKER/Producer     NATS JetStream      WORKER          KONG/APISIX (LB)     PROTHEUS
   │                  │                  │                  │                │                  │
   │─ Apontamento ───>│                  │                  │                │                  │
   │                  │─ Pub op.apto ───>│                  │                │                  │
   │                  │                  │─ Persist ───────>│                │                  │
   │                  │                  │─ Deliver ───────>│                │                  │
   │                  │                  │                  │─ Mapeamento ──>│                  │
   │                  │                  │                  │  EME4->SD3     │                  │
   │                  │                  │                  │                │─ Route Protheus ─>│
   │                  │                  │                  │                │<── 200 OK ────────│
   │                  │                  │                  │<── Sucesso ────│                  │
   │                  │                  │<── ACK ──────────│                │                  │
```

---

## 8. Componentes do Middleware

### 8.1 Kong/APISIX API Gateway (construído sobre NGINX)

Tanto o Kong quanto o APISIX são construídos sobre o **NGINX** — o servidor web mais usado do mundo, que processa mais de 30% de todo o tráfego da internet. Isso significa que a base do nosso API Gateway é uma tecnologia **comprovada há mais de 20 anos**, com desempenho excepcional.

| Funcionalidade | Descrição |
|---------------|-----------|
| **Autenticação** | JWT ou API Key por sistema (Protheus e EME4) |
| **Rate Limiting** | Controle de vazão (ex: 100 req/min por sistema) |
| **Load Balancing** | Distribuição entre múltiplas instâncias EME4 |
| **Health Check** | Monitoramento ativo/passivo de saúde dos backends |
| **Failover** | Redirecionamento automático quando instância cai |
| **Request Transformation** | Normalização de headers e payload |
| **Logging** | Registro de todas as requisições (audit trail) |
| **Rotas de Entrada** | `/api/middleware/eng/*` e `/api/middleware/op/*` |
| **Upstreams de Saída** | `eme4-engenharia` e `eme4-ordens-producao` |

### 8.2 NATS JetStream

| Funcionalidade | Descrição |
|---------------|-----------|
| **Streams** | `ENGENHARIA` (eventos eng.*) e `ORDENS_PRODUCAO` (eventos op.*) |
| **Persistência** | Garantia de entrega at-least-once |
| **Consumers** | Workers dedicados por tipo de evento |
| **Dead Letter Queue** | Mensagens que falharam após N tentativas |
| **Replay** | Reprocessamento de mensagens sob demanda |
| **Retention** | Política de retenção configurável |

### 8.3 Workers — Quando usar e quando NÃO usar

Workers existem **somente quando há trabalho real a fazer**. O nome já diz: Worker = trabalhador. Se não há trabalho, não há Worker no caminho.

O Middleware opera em **dois modos**, dependendo do fluxo:

#### Modo 1: Passthrough (sem Worker) — Kong/APISIX direto para o destino

Quando **não há transformação, orquestração nem lógica de negócio**, o Kong/APISIX atua como proxy reverso + load balancer direto. A requisição entra e sai sem intermediário.

```
Produtor ──> Kong/APISIX ──> Load Balance ──> EME4
                │
                └── Auth, Rate Limit, Logging, Health Check
                    (tudo feito pelo próprio Kong/APISIX)
```

**Quando usar:**
- A API de origem e destino falam a **mesma língua** (mesmo formato JSON)
- Não precisa de tradução de campos
- Não precisa de fila/mensageria (requisição síncrona é aceitável)
- Exemplo futuro: Agente de IA consultando diretamente a API do EME4

**O que se ganha mesmo sem Worker:**
- Load Balancing entre instâncias
- Failover automático
- Autenticação centralizada (o produtor não precisa saber a sessão do EME4 — o Kong/APISIX resolve via plugin ou session pool)
- Rate Limiting (protege o EME4 de sobrecarga)
- Logging e rastreabilidade de todas as requisições
- Health Check dos backends

```
Agente IA          Kong/APISIX                          EME4 Servidores
   │                    │                               ┌──────────────┐
   │── GET /op/1234 ──>│                               │ Servidor A   │
   │                    │── Auth + LB (Least Conn) ───>│              │
   │                    │<── { dados da OP } ──────────│              │
   │<── { dados } ─────│                               └──────────────┘
   │                    │
   │  Sem Worker. Sem fila. Direto.
   │  Mas com: Auth, LB, Failover, Logging, Rate Limit.
```

#### Modo 2: Com Worker — Quando há trabalho a fazer

Quando existe **transformação de dados, orquestração, lógica de negócio ou necessidade de mensageria assíncrona**, o Worker entra no fluxo.

```
Produtor ──> Kong/APISIX ──> NATS ──> Worker ──> Kong/APISIX (LB) ──> EME4
                                         │
                                         └── Tradução DE-PARA
                                             Orquestração
                                             Retry/Idempotência
                                             Session Pool
```

**Quando usar:**
- Os sistemas falam **línguas diferentes** (Protheus usa códigos, EME4 usa IDs internos)
- Precisa de **transformação** de campos (mapeamento DE-PARA)
- Precisa de **garantia de entrega** (mensageria assíncrona com NATS)
- Precisa de **orquestração** (respeitar ordem de dependência)
- Precisa de **retry automático** com backoff
- Precisa de **gestão de sessão** (Session Pool para o EME4)

**Funcionalidades do Worker (quando existe):**

| Funcionalidade | Descrição |
|---------------|-----------|
| **Transformação DE-PARA** | Mapeamento de campos entre sistemas |
| **Orquestração** | Respeitar ordem de dependência entre entidades |
| **Retry com Backoff** | Retentar em caso de falha temporária (1s, 5s, 30s, 5min) |
| **Idempotência** | Evitar duplicatas via chave única (código + filial) |
| **Session Pool** | Gerenciar sessões stateful do EME4 |
| **Logging** | Registrar resultado de cada processamento |
| **Monitoramento** | Métricas de sucesso/falha por evento |

#### Resumo: Quando Worker sim, quando Worker não

| Cenário | Worker? | Por quê |
|---------|---------|---------|
| Protheus envia OP para EME4 | **Sim** | Precisa traduzir campos SC2 → OP EME4 |
| Protheus envia engenharia para EME4 | **Sim** | Precisa traduzir e orquestrar dependências |
| EME4 retorna apontamento para Protheus | **Sim** | Precisa traduzir EME4 → SD3/SH6 |
| Agente IA consulta status de OP no EME4 | **Não** | Passthrough — mesmo formato, resposta síncrona |
| Agente IA consulta lista de produtos | **Não** | Passthrough — consulta direta com LB |
| Agente IA cria OP no EME4 | **Depende** | Se a IA já monta o JSON no formato EME4: não. Se precisa traduzir: sim |
| Dashboard consulta métricas | **Não** | Passthrough — consulta direta |
| Sistema externo envia dados em formato próprio | **Sim** | Precisa traduzir formato externo → formato EME4 |

#### Diagrama: Os dois modos coexistindo

```
                              ┌──────────────────────────────────────────┐
                              │              MIDDLEWARE                   │
                              │                                          │
┌───────────┐                 │  ┌────────────┐                          │   ┌──────────┐
│ Agente IA │── GET /op/123 ─>│  │            │── Passthrough (direto) ──│──>│          │
│           │<── { dados } ───│  │            │<─────────────────────────│──<│          │
└───────────┘                 │  │            │                          │   │          │
                              │  │ KONG/APISIX│                          │   │   EME4   │
┌───────────┐                 │  │            │  ┌──────┐  ┌────────┐   │   │          │
│ Protheus  │── POST /op ────>│  │            │─>│ NATS │─>│ Worker │───│──>│          │
│           │<── 202 ─────────│  │            │  └──────┘  └────────┘   │   │          │
└───────────┘                 │  └────────────┘                          │   └──────────┘
                              │                                          │
                              │  Modo 1: Passthrough (sem Worker)        │
                              │  Modo 2: Com Worker (quando há trabalho) │
                              └──────────────────────────────────────────┘
```

---

## 9. Kong vs APISIX - Comparação

Ambos são API Gateways construídos sobre o NGINX. A escolha depende das prioridades do projeto:

| Critério | Kong | APISIX |
|----------|------|--------|
| **Base** | NGINX + OpenResty (Lua) | NGINX + OpenResty (Lua) |
| **Linguagem de Plugins** | Lua, Go, Python, JS | Lua, Java, Python, Go, Wasm |
| **Licença** | Apache 2.0 (OSS) + Enterprise | Apache 2.0 (100% open-source) |
| **Performance** | Excelente (~10k req/s por instância) | Superior (~18k req/s por instância) |
| **Latência** | ~1-2ms por request | ~0.5-1ms por request |
| **Dashboard** | Kong Manager (Enterprise) ou Konga (OSS) | Dashboard nativo gratuito |
| **Configuração** | API REST + DB (PostgreSQL) | API REST + etcd (sem DB relacional) |
| **Load Balancing** | Round Robin, Weighted, Least Conn, Hash | Round Robin, Weighted, Least Conn, Hash, EWMA |
| **Health Check** | Ativo + Passivo | Ativo + Passivo |
| **Comunidade** | Muito grande, mais madura | Crescendo rápido, CNCF Incubating |
| **Curva de Aprendizado** | Moderada | Moderada |
| **Ideal para** | Quem quer ecossistema maduro e suporte Enterprise | Quem quer máxima performance e 100% open-source |

### Recomendação

| Se a prioridade é... | Escolha |
|----------------------|---------|
| Ecossistema maduro e suporte comercial | **Kong** |
| Performance máxima e custo zero de licença | **APISIX** |
| Para a POC | **Qualquer um dos dois** (ambos atendem) |

---

## 10. Mapeamento DE-PARA de Campos

### 10.1 Centro de Trabalho / Recurso

| Protheus (SH1) | EME4 (RecursoProducao) | Observação |
|----------------|----------------------|------------|
| H1_CODIGO | Codigo | Direto |
| H1_DESCRI | Descricao | Direto |
| H1_FILIAL | IdFilial | Tabela DE-PARA de Filiais |
| H1_TIPO | TipoRecurso | Mapeamento de domínio |
| H1_CCUSTO | IdCentroCusto | Tabela DE-PARA |

### 10.2 Produto

| Protheus (SB1) | EME4 (ProdutoPapelManufatura) | Observação |
|----------------|-------------------------------|------------|
| B1_COD | IDFProduto | Tabela DE-PARA de Produtos |
| B1_FILIAL | IDFFilial | Tabela DE-PARA de Filiais |
| B1_TIPO | TipoProduto | Mapeamento de domínio |
| B1_ORIGEM | OrigemProduto | Mapeamento de domínio |

### 10.3 Estrutura de Produto (BOM)

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

### 10.4 Roteiro de Fabricação

| Protheus (SG2) | EME4 (RoteiroProducao) | Observação |
|----------------|------------------------|------------|
| G2_COD | IdProduto | Tabela DE-PARA de Produtos |
| G2_OPERAC | OperacoesRoteiro[].SeqOperacao | Direto |
| G2_RECURSO | OperacoesRoteiro[].IdRecurso | Tabela DE-PARA de Recursos |
| G2_DESCRI | OperacoesRoteiro[].Descricao | Direto |
| G2_TEMPP | OperacoesRoteiro[].TempoHomem | Conversão de unidade de tempo |
| G2_SETUP | OperacoesRoteiro[].TempoSetup | Conversão de unidade de tempo |
| G2_FERRAM | OperacoesRoteiro[].IdFerramentaProducao | Tabela DE-PARA |

### 10.5 Ordem de Produção

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

### 10.6 Apontamento de Produção (Retorno EME4 -> Protheus)

| EME4 (ApontamentoBaixaProdFabricado) | Protheus (SD3) | Observação |
|--------------------------------------|----------------|------------|
| IDOrdemProducao | D3_OP | Tabela DE-PARA de OPs |
| Quantidade | D3_QUANT | Direto |
| QuantidadeRefugo | D3_PERDA | Direto |
| NumeroLote | D3_LOTECTL | Direto |
| dtDataApontamento | D3_EMISSAO | Conversão de formato de data |

### 10.7 Tabelas DE-PARA Necessárias

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

## 11. Performance e Benchmarks

### 11.1 NATS - Velocidade com Recursos Mínimos

O NATS é um sistema de mensageria escrito em **Go**, projetado desde o início para ser extremamente rápido e leve. É usado em produção por empresas como Tesla, Mastercard, GE e Walmart.

#### Números que impressionam:

| Métrica | Valor | Comparação |
|---------|-------|------------|
| **Mensagens por segundo** | 10-25 milhões msg/seg (pub/sub puro) | RabbitMQ: ~50k msg/seg |
| **Latência** | < 200 microssegundos (0.2ms) | RabbitMQ: 1-5ms |
| **Uso de memória** | ~18 MB (servidor idle) | RabbitMQ: ~150 MB, Kafka: ~1 GB |
| **Binário do servidor** | ~20 MB (executável único) | Kafka requer JVM (~500 MB) |
| **Startup** | < 1 segundo | Kafka: 30-60 segundos |
| **JetStream (persistido)** | 500k-1M msg/seg | Kafka: ~300k msg/seg |
| **Conexões simultâneas** | 100k+ por servidor | Depende da RAM |

#### Para o nosso cenário (centenas de mensagens/dia):

```
┌─────────────────────────────────────────────────────────────────┐
│                   NATS no nosso caso de uso                     │
│                                                                 │
│  Mensagens por dia:     ~500 (apontamentos + OPs + eng.)       │
│  Capacidade do NATS:    ~25.000.000 msg/seg                    │
│                                                                 │
│  Uso do NATS: 0,000002% da capacidade                          │
│                                                                 │
│  É como usar um carro de Fórmula 1 para ir à padaria.          │
│  Mas a "gasolina" (RAM/CPU) custa quase nada:                  │
│                                                                 │
│  RAM necessária:  ~30 MB (com JetStream + nossas mensagens)    │
│  CPU necessária:  < 1% de um core                              │
│  Disco:           Proporcional ao volume de mensagens retidas   │
│                                                                 │
│  Ou seja: roda em QUALQUER servidor que já exista na empresa.   │
└─────────────────────────────────────────────────────────────────┘
```

#### Por que o NATS é tão rápido?

- **Escrito em Go**: linguagem compilada, sem máquina virtual, sem garbage collection pesado
- **Protocolo próprio**: texto simples sobre TCP, sem overhead de HTTP
- **Zero-copy**: os dados passam direto da rede para o consumidor
- **Sem broker pesado**: diferente do Kafka que precisa de ZooKeeper/KRaft, o NATS é autossuficiente
- **Cluster nativo**: basta apontar os nós uns para os outros, sem configuração complexa

---

### 11.2 Kong / APISIX - A Força do NGINX

O Kong e o APISIX são construídos sobre o **NGINX** via **OpenResty** (NGINX + LuaJIT). O NGINX é o servidor web e reverse proxy **mais utilizado do mundo**, responsável por mais de 30% de todo o tráfego da internet global.

#### Por que isso importa?

O NGINX foi projetado em 2004 por Igor Sysoev especificamente para resolver o **C10K problem** — servir 10.000 conexões simultâneas. Hoje ele lida com **milhões**.

| Métrica | Kong (NGINX) | APISIX (NGINX) | Servidor HTTP comum |
|---------|-------------|----------------|---------------------|
| **Requisições/seg** | ~10.000/instância | ~18.000/instância | ~1.000-3.000 |
| **Latência adicionada** | ~1-2ms | ~0.5-1ms | ~5-20ms |
| **Conexões simultâneas** | 10.000+ | 10.000+ | ~500-1.000 |
| **Uso de memória** | ~50-100 MB | ~40-80 MB | Varia |
| **Modelo de concorrência** | Event-driven (não-bloqueante) | Event-driven (não-bloqueante) | Thread por conexão |

#### O que é o modelo Event-Driven do NGINX?

```
Modelo TRADICIONAL (uma thread por conexão):
┌──────────────────────────────────────────┐
│  Requisição 1 ──> Thread 1 (esperando...) │  Cada conexão ocupa
│  Requisição 2 ──> Thread 2 (esperando...) │  uma thread e RAM.
│  Requisição 3 ──> Thread 3 (esperando...) │  Com 10.000 conexões,
│  ...                                      │  precisa de 10.000
│  Requisição N ──> Thread N (esperando...) │  threads = MUITO RAM
└──────────────────────────────────────────┘

Modelo NGINX (event-driven):
┌──────────────────────────────────────────┐
│                                          │
│  Worker 1 ──> cuida de 5.000 conexões    │  Poucos workers
│  Worker 2 ──> cuida de 5.000 conexões    │  cuidam de TUDO.
│                                          │  Sem espera ociosa.
│  Total: 2 workers = 10.000 conexões      │  Mínimo de RAM.
│                                          │
└──────────────────────────────────────────┘
```

#### Para o nosso cenário:

```
┌─────────────────────────────────────────────────────────────────┐
│               KONG/APISIX no nosso caso de uso                  │
│                                                                 │
│  Requisições por dia:   ~500                                    │
│  Capacidade do Kong:    ~10.000 req/seg = ~864.000.000 req/dia │
│                                                                 │
│  Uso: 0,00006% da capacidade                                   │
│                                                                 │
│  RAM necessária:  ~50-100 MB                                    │
│  CPU necessária:  < 1% de um core                               │
│                                                                 │
│  E ainda temos Load Balancing, Auth, Rate Limiting,             │
│  Health Check, Logging e Failover — DE GRAÇA.                   │
│                                                                 │
│  Tudo isso por causa do NGINX que está por baixo.               │
└─────────────────────────────────────────────────────────────────┘
```

---

### 11.3 Comparação: NATS vs Alternativas de Mensageria

| Critério | NATS | RabbitMQ | Apache Kafka |
|----------|------|----------|-------------|
| **Linguagem** | Go | Erlang | Scala/Java |
| **Requer JVM?** | Não | Não (Erlang VM) | Sim |
| **RAM mínima** | ~18 MB | ~150 MB | ~1 GB |
| **Throughput** | 10-25M msg/seg | ~50k msg/seg | ~300k msg/seg |
| **Latência** | < 0.2ms | 1-5ms | 5-20ms |
| **Persistência** | JetStream (built-in) | Sim | Sim (log-based) |
| **Complexidade** | Baixa (binário único) | Média | Alta (ZooKeeper/KRaft) |
| **Ideal para** | Alta performance, IoT, Microservices | Enterprise messaging | Big Data, streaming |
| **Licença** | Apache 2.0 | MPL 2.0 | Apache 2.0 |
| **Para nosso caso** | Perfeito (leve e rápido) | Viável, mas mais pesado | Exagero para o volume |

---

### 11.4 Infraestrutura Total Estimada

```
┌──────────────────────────────────────────────────────────┐
│           MIDDLEWARE COMPLETO - Recursos Estimados        │
│                                                          │
│  Componente         │  RAM    │  CPU   │  Disco         │
│─────────────────────┼─────────┼────────┼────────────────│
│  Kong/APISIX        │  100 MB │  < 1%  │  ~50 MB        │
│  NATS JetStream     │  30 MB  │  < 1%  │  ~1 GB (msgs)  │
│  Workers (3x)       │  150 MB │  < 5%  │  ~50 MB (logs) │
│─────────────────────┼─────────┼────────┼────────────────│
│  TOTAL              │  280 MB │  < 7%  │  ~1.1 GB       │
│                                                          │
│  Cabe em qualquer VM ou container com 512 MB de RAM.     │
│  Pode rodar junto com outros serviços.                   │
│  Não precisa de servidor dedicado para a POC.            │
└──────────────────────────────────────────────────────────┘
```

---

## 12. Resumo Executivo

### 12.1 O que o Middleware resolve

| Benefício | Descrição |
|-----------|-----------|
| **Desacoplamento** | Protheus e EME4 não precisam se conhecer diretamente |
| **Confiabilidade** | NATS JetStream garante que nenhuma mensagem se perde |
| **Load Balancing** | Kong/APISIX distribui carga entre instâncias EME4 |
| **Alta Disponibilidade** | Failover automático se uma instância EME4 cair |
| **Escalabilidade** | Workers e instâncias EME4 escaláveis horizontalmente |
| **Monitoramento** | Visibilidade total do fluxo via Kong e dashboards NATS |
| **Resiliência** | Se um sistema cair, as mensagens ficam na fila |
| **Governança** | Autenticação, rate limiting e logging centralizado |
| **Transformação** | Mapeamento DE-PARA centralizado |
| **Performance** | NATS + NGINX = latência < 2ms para o middleware completo |
| **Leveza** | Middleware inteiro roda com ~280 MB de RAM |

### 12.2 Volumetria Estimada

| Tipo de Evento | Frequência | Criticidade |
|---------------|------------|-------------|
| Engenharia (cadastros) | Baixa (dezenas/semana) | Alta (base para produção) |
| Ordens de Produção | Média (dezenas/dia) | Alta (operação) |
| Apontamentos | Alta (centenas/dia) | Crítica (tempo real) |

### 12.3 Integrações Mapeadas

- **Total de eventos/subjects NATS:** 14
  - 6 de Engenharia (unidirecional: Protheus -> EME4)
  - 8 de Ordens de Produção (bidirecional)

### 12.4 Tecnologias Escolhidas - Por que confiamos nelas

| Tecnologia | Fundação | Por que confiar |
|------------|----------|-----------------|
| **NGINX** (base do Kong/APISIX) | 2004, Igor Sysoev | Serve 30%+ da internet mundial. Usado por Netflix, Cloudflare, WordPress.com |
| **Kong** | 2015, Kong Inc. | 300M+ downloads. Usado por Samsung, Nasdaq, Honeywell |
| **APISIX** | 2019, Apache Foundation | CNCF Incubating. Usado por NASA, Airbus, WPS |
| **NATS** | 2010, Synadia | CNCF Incubating. Usado por Tesla, Mastercard, GE, Walmart |
| **Go** (linguagem do NATS) | 2009, Google | Criada no Google. Usada em Docker, Kubernetes, Terraform |

### 12.5 Visão Estratégica — O Middleware como base para IA

A POC utiliza a integração Protheus-EME4 como caso de uso real e tangível, mas o objetivo estratégico do Middleware é mais amplo:

**Construir a infraestrutura que permitirá agentes de IA consumirem APIs de todos os sistemas da Datainfo.**

```
                    HOJE (POC)                          FUTURO PRÓXIMO

  Protheus ──> Middleware ──> EME4       Agentes IA ──┐
                                         Protheus ────┤
                                         App Mobile ──┼──> MIDDLEWARE ──┬──> EME4
                                         Dashboard ───┤    (Kong+NATS) ├──> Protheus
                                         Sistema X ───┘               ├──> Sistema X
                                                                      ├──> Sistema Y
                                                                      └──> Sistema Z
```

| Fase | Escopo | Volume Estimado |
|------|--------|-----------------|
| **POC (agora)** | Protheus <-> EME4 (Engenharia + OPs) | Centenas/dia |
| **Fase 2** | + Outros módulos EME4 + Sistemas Datainfo | Milhares/dia |
| **Fase 3 (IA)** | + Agentes de IA consultando e atuando em todos os sistemas | Dezenas de milhares/dia |

O Middleware é a **pista de decolagem** que precisa existir antes da IA entrar em cena. Sem ele, cada agente de IA precisaria:
- Conhecer a autenticação de cada sistema (sessão EME4, OAuth Protheus, tokens, etc.)
- Lidar com falhas, timeouts e retentativas individualmente
- Ser reescrito quando um sistema muda
- Não teria rastreabilidade nem controle de vazão

Com o Middleware, o agente de IA fala com **uma porta única**, e toda a complexidade é abstraída.

### 12.6 Próximos Passos

1. Validação desta análise pelo time técnico
2. Escolha entre Kong ou APISIX para a POC
3. Construção do diagrama/fluxograma detalhado para apresentação à diretoria
4. Definição do escopo mínimo da POC (quais eventos implementar primeiro)
5. Prototipagem do middleware com Kong/APISIX + NATS
6. Testes de integração com ambientes de homologação
7. Planejamento da Fase 2 (outros sistemas Datainfo) e Fase 3 (IA)

---

> **Nota:** Este documento é a base para construção do fluxograma/diagrama de apresentação à diretoria para aprovação do projeto Middleware. A POC é o caso de uso inicial — o Middleware é a infraestrutura estratégica para o futuro com IA.

-- Script de criação da tabela para a Caminhada do ECA no Supabase
-- Copie este conteúdo e execute-o no SQL Editor do painel do Supabase.

-- 1. Criação da tabela com as colunas em camelCase (usando aspas duplas) para bater perfeitamente com os tipos do React
CREATE TABLE IF NOT EXISTS public.delegacoes (
  id TEXT PRIMARY KEY,
  "nomeEscola" TEXT NOT NULL,
  endereco TEXT NOT NULL,
  embarque TEXT NOT NULL,
  destino TEXT NOT NULL,
  "horarioSaida" TEXT NOT NULL,
  "horarioRetorno" TEXT NOT NULL,
  responsavel TEXT NOT NULL,
  contato TEXT NOT NULL,
  quantidade INTEGER NOT NULL,
  "dataCadastro" TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  documento TEXT,
  "documentoNome" TEXT
);

-- 2. Habilitar o Row Level Security (RLS)
ALTER TABLE public.delegacoes ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas de acesso público (Leitura, Inserção, Atualização e Deleção)
-- Como o aplicativo original não possui login de usuário, permitimos acesso anônimo/público para todos os métodos.
CREATE POLICY "Permitir leitura pública" ON public.delegacoes
  FOR SELECT USING (true);

CREATE POLICY "Permitir inserção pública" ON public.delegacoes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização pública" ON public.delegacoes
  FOR UPDATE USING (true);

CREATE POLICY "Permitir exclusão pública" ON public.delegacoes
  FOR DELETE USING (true);

-- 4. Opcional: Inserir dados iniciais se a tabela estiver vazia
INSERT INTO public.delegacoes (id, "nomeEscola", endereco, embarque, destino, "horarioSaida", "horarioRetorno", responsavel, contato, quantidade, "dataCadastro")
VALUES 
  ('1', 'Escola Municipal Carlos Batalha', 'Rua Direta do Cabula, 120 - Cabula, Salvador - BA', 'Pátio Principal da Escola', 'Campo Grande (Concentração da Caminhada)', '07:00', '12:30', 'Prof. Marcos Silva Santos', '(71) 98877-6655', 45, '2026-07-06T14:30:00.000Z'),
  ('2', 'Colégio Estadual Central da Bahia', 'Avenida Joana Angélica, 350 - Nazaré, Salvador - BA', 'Portão B (Av. Joana Angélica)', 'Campo Grande (Concentração da Caminhada)', '07:30', '13:00', 'Coordenadora Sandra Souza Neves', '(71) 99988-1122', 80, '2026-07-07T09:15:00.000Z'),
  ('3', 'Escola Municipal Olga Mettig', 'Rua da Indonésia, s/n - Granjas Rurais, Salvador - BA', 'Ponto de Ônibus em frente à Escola', 'Campo Grande (Concentração da Caminhada)', '06:45', '12:00', 'Diretora Ana Paula Lima', '(71) 98765-4321', 35, '2026-07-07T16:45:00.000Z'),
  ('4', 'Centro Educacional Carneiro Ribeiro (SAPE)', 'Rua Saldanha Marinho, 32 - Caixa d''Água, Salvador - BA', 'Estacionamento interno da Escola', 'Campo Grande (Concentração da Caminhada)', '07:15', '12:45', 'Prof. Roberto Costa Ramos', '(71) 99122-3344', 60, '2026-07-08T08:00:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- 5. Criação da tabela configs para armazenar o login, senha e detalhes do evento
CREATE TABLE IF NOT EXISTS public.configs (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Habilitar o RLS para a tabela configs
ALTER TABLE public.configs ENABLE ROW LEVEL SECURITY;

-- Adicionar políticas de acesso público à tabela configs (Leitura e Escrita completas)
CREATE POLICY "Permitir leitura pública configs" ON public.configs
  FOR SELECT USING (true);

CREATE POLICY "Permitir inserção pública configs" ON public.configs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização pública configs" ON public.configs
  FOR UPDATE USING (true);

CREATE POLICY "Permitir exclusão pública configs" ON public.configs
  FOR DELETE USING (true);

-- Dados padrão iniciais para as configurações
INSERT INTO public.configs (key, value) VALUES
  ('admin_username', 'admin'),
  ('admin_password', 'admin'),
  ('event_title', 'Caminhada do ECA'),
  ('event_date', '13 de Julho'),
  ('event_time', '08:00h'),
  ('event_location', 'Campo Grande')
ON CONFLICT (key) DO NOTHING;


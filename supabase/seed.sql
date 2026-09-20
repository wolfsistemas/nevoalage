-- Seed demo NevoaLaje (tenant fixo para a fábrica demo)

insert into public.tenants (id, nome, slug, plano, status, cidade, cnpj, telefone, logo_text, created_at)
values
  ('11111111-1111-1111-1111-111111111111', 'Oficina São Roque Pré-Moldados', 'sao-roque', 'oficina', 'ativo', 'Jataí/GO', '12.345.678/0001-90', '(64) 99912-4400', 'NL', '2026-03-12'),
  ('22222222-2222-2222-2222-222222222222', 'Lajes Cerrado', 'lajes-cerrado', 'fabrica', 'ativo', 'Rio Verde/GO', null, null, 'LC', '2026-05-02'),
  ('33333333-3333-3333-3333-333333333333', 'Blocos Norte', 'blocos-norte', 'nevoa', 'trial', 'Mineiros/GO', null, null, 'BN', '2026-08-20'),
  ('44444444-4444-4444-4444-444444444444', 'Pré-Laje Centro', 'prelaje-centro', 'oficina', 'inadimplente', 'Catalão/GO', null, null, 'PC', '2026-01-18')
on conflict (id) do update set nome = excluded.nome, plano = excluded.plano, status = excluded.status, cidade = excluded.cidade;

insert into public.tenant_config (
  tenant_id, inter_eixo_eps, inter_eixo_lajota, barra_trelica, precos_m2, algoritmo_padrao
) values (
  '11111111-1111-1111-1111-111111111111',
  0.50, 0.43, 12,
  '{"eps_h8":92,"eps_h12":108,"eps_h16":124,"eps_h20":142,"lajota_ceramica_h8":86,"lajota_ceramica_h12":98,"lajota_ceramica_h16":112,"lajota_ceramica_h20":128}'::jsonb,
  'DP'
) on conflict (tenant_id) do nothing;

insert into public.products (id, tenant_id, descricao, unidade, custo_unitario, tipo) values
  ('aaaaaaaa-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', 'Treliça TG8 12m', 'barra', 68, 'material'),
  ('aaaaaaaa-0001-0001-0001-000000000002', '11111111-1111-1111-1111-111111111111', 'Treliça TG12 12m', 'barra', 92, 'material'),
  ('aaaaaaaa-0001-0001-0001-000000000003', '11111111-1111-1111-1111-111111111111', 'Treliça TG16 12m', 'barra', 105, 'material'),
  ('aaaaaaaa-0001-0001-0001-000000000004', '11111111-1111-1111-1111-111111111111', 'EPS H8 placa 50x100', 'placa', 11.90, 'material'),
  ('aaaaaaaa-0001-0001-0001-000000000005', '11111111-1111-1111-1111-111111111111', 'EPS H12 placa 50x100', 'placa', 13.50, 'material'),
  ('aaaaaaaa-0001-0001-0001-000000000006', '11111111-1111-1111-1111-111111111111', 'Lajota Cerâmica', 'un', 1.70, 'material'),
  ('aaaaaaaa-0001-0001-0001-000000000007', '11111111-1111-1111-1111-111111111111', 'Cimento CP II 50kg', 'saco', 37, 'material'),
  ('aaaaaaaa-0001-0001-0001-000000000008', '11111111-1111-1111-1111-111111111111', 'Areia Grossa', 'm³', 200, 'material'),
  ('aaaaaaaa-0001-0001-0001-000000000009', '11111111-1111-1111-1111-111111111111', 'Brita 0', 'm³', 200, 'material'),
  ('aaaaaaaa-0001-0001-0001-000000000010', '11111111-1111-1111-1111-111111111111', 'Vergalhão CA-60 6mm', 'barra', 25, 'material'),
  ('aaaaaaaa-0001-0001-0001-000000000011', '11111111-1111-1111-1111-111111111111', 'Disco de Corte', 'un', 10, 'material'),
  ('aaaaaaaa-0001-0001-0001-000000000012', '11111111-1111-1111-1111-111111111111', 'ART', 'un', 28, 'servico'),
  ('aaaaaaaa-0001-0001-0001-000000000013', '11111111-1111-1111-1111-111111111111', 'Plotagem de Projeto', 'un', 10, 'servico'),
  ('aaaaaaaa-0001-0001-0001-000000000014', '11111111-1111-1111-1111-111111111111', 'Viagem de Entrega', 'un', 50, 'frete'),
  ('aaaaaaaa-0001-0001-0001-000000000015', '11111111-1111-1111-1111-111111111111', 'Diária de Ajudante', 'm²', 4.50, 'servico'),
  ('aaaaaaaa-0001-0001-0001-000000000016', '11111111-1111-1111-1111-111111111111', 'Comissão', 'm²', 1, 'servico'),
  ('aaaaaaaa-0001-0001-0001-000000000017', '11111111-1111-1111-1111-111111111111', 'Laudo Técnico', 'un', 300, 'servico'),
  ('aaaaaaaa-0001-0001-0001-000000000018', '11111111-1111-1111-1111-111111111111', 'Frete Isopor', 'un', 80, 'frete'),
  ('aaaaaaaa-0001-0001-0001-000000000019', '11111111-1111-1111-1111-111111111111', 'Frete Lajota', 'un', 50, 'frete')
on conflict (id) do nothing;

insert into public.clients (id, tenant_id, nome, telefone, email, endereco, documento) values
  ('bbbbbbbb-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', 'João Batista da Silva', '64999887766', 'joao@email.com', 'Rua das Palmeiras, 120 — Setor Central', '123.456.789-00'),
  ('bbbbbbbb-0001-0001-0001-000000000002', '11111111-1111-1111-1111-111111111111', 'Construtora Vale Verde', '6436332211', 'obras@valeverde.com', 'Av. Goiás, 890', '11.222.333/0001-44'),
  ('bbbbbbbb-0001-0001-0001-000000000003', '11111111-1111-1111-1111-111111111111', 'Maria Aparecida Lopes', '64991223344', '', 'Chácara Recanto, km 4', '')
on conflict (id) do nothing;

insert into public.quotes (id, tenant_id, numero, client_id, cliente_nome, status, area_total, valor_total, algoritmo, observacao, created_at, updated_at) values
  ('cccccccc-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', 1042, 'bbbbbbbb-0001-0001-0001-000000000001', 'João Batista da Silva', 'APROVADO', 43.78, 4481.84, 'DP', 'Obra residencial — entrega em 2 viagens.', '2026-09-12T10:00:00Z', '2026-09-14T16:20:00Z'),
  ('cccccccc-0001-0001-0001-000000000002', '11111111-1111-1111-1111-111111111111', 1043, 'bbbbbbbb-0001-0001-0001-000000000002', 'Construtora Vale Verde', 'ABERTO', 41, 5084, 'BEST', '', '2026-09-18T09:00:00Z', '2026-09-18T09:00:00Z')
on conflict (id) do nothing;

insert into public.quote_rooms (id, tenant_id, quote_id, nome, vao_menor, vao_maior, tipo, altura, largura_viga, qtd_vigotas, tamanho_vigota, metragem_eps, area, valor_estimado, preco_m2) values
  ('dddddddd-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', 'cccccccc-0001-0001-0001-000000000001', 'Sala', 4.2, 5.1, 'EPS', 12, 12, 11, 4.32, 42, 21.42, 2313.36, 108),
  ('dddddddd-0001-0001-0001-000000000002', '11111111-1111-1111-1111-111111111111', 'cccccccc-0001-0001-0001-000000000001', 'Quarto 1', 3.1, 3.6, 'EPS', 12, 12, 8, 3.22, 21.7, 11.16, 1205.28, 108),
  ('dddddddd-0001-0001-0001-000000000003', '11111111-1111-1111-1111-111111111111', 'cccccccc-0001-0001-0001-000000000001', 'Cozinha', 2.8, 4.0, 'LAJOTA_CERAMICA', 8, 10, 10, 2.9, 0, 11.2, 963.20, 86),
  ('dddddddd-0001-0001-0001-000000000004', '11111111-1111-1111-1111-111111111111', 'cccccccc-0001-0001-0001-000000000002', 'Bloco A — hall', 5.0, 8.2, 'EPS', 16, 15, 17, 5.15, 80, 41, 5084, 124)
on conflict (id) do nothing;

insert into public.deliveries (id, tenant_id, quote_id, data, vigotas, observacao) values
  ('eeeeeeee-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', 'cccccccc-0001-0001-0001-000000000001', '2026-09-16', '[{"tamanho":4.32,"qtd":6},{"tamanho":3.22,"qtd":4}]'::jsonb, '1ª viagem — sala e quarto.')
on conflict (id) do nothing;

insert into public.platform_admins (email, nome)
values ('superadmin@nevoalaje.com', 'Super Admin')
on conflict (email) do nothing;

-- =============================================
-- Seed: Exercícios de Alongamento
-- Execute APÓS database_update_exercises_v2.sql
-- =============================================

INSERT INTO public.exercises (id, name, body_part, target, equipment, gif_url, secondary_muscles, instructions, source, is_custom, created_by)
VALUES

-- ── MEMBROS INFERIORES ──────────────────────────────────────────

('seed_str_001', 'Alongamento do Quadríceps em Pé', 'stretching', 'quadriceps', 'body weight', null, ARRAY['hip flexors'], ARRAY[
  'Fique em pé com os pés juntos, próximo a uma parede ou apoio se necessário.',
  'Dobre o joelho direito levando o calcanhar em direção ao glúteo.',
  'Segure o tornozelo com a mão direita e mantenha os joelhos alinhados.',
  'Contraia o glúteo para aprofundar o alongamento sem arquear a lombar.',
  'Mantenha por 20 a 30 segundos e repita no lado esquerdo.'
], 'seed', false, null),

('seed_str_002', 'Alongamento dos Isquiotibiais Sentado', 'stretching', 'hamstrings', 'body weight', null, ARRAY['lower back', 'calves'], ARRAY[
  'Sente-se no chão com as pernas estendidas à frente.',
  'Mantenha a coluna ereta e incline o tronco para frente a partir do quadril.',
  'Tente alcançar os pés ou os tornozelos, sem arredondar as costas.',
  'Sinta o alongamento na parte posterior das coxas.',
  'Mantenha a posição por 20 a 30 segundos e respire profundamente.'
], 'seed', false, null),

('seed_str_003', 'Alongamento da Panturrilha na Parede', 'stretching', 'calves', 'body weight', null, ARRAY['achilles tendon'], ARRAY[
  'Fique de frente para uma parede, apoiando as mãos na altura do peito.',
  'Posicione o pé direito um passo atrás com o calcanhar no chão.',
  'Dobre levemente o joelho da perna da frente e mantenha o de trás estendido.',
  'Pressione o calcanhar traseiro contra o chão e incline o corpo levemente para a frente.',
  'Sinta o alongamento na panturrilha. Mantenha por 20 a 30 segundos e troque de lado.'
], 'seed', false, null),

('seed_str_004', 'Alongamento do Flexor do Quadril (Ajoelhado)', 'stretching', 'hip flexors', 'body weight', null, ARRAY['quadriceps', 'iliopsoas'], ARRAY[
  'Ajoelhe-se no chão com o joelho direito no chão e o esquerdo à frente, formando 90 graus.',
  'Mantenha o tronco ereto e empurre o quadril levemente para frente.',
  'Contraia o glúteo direito para intensificar o alongamento.',
  'Você deve sentir o alongamento na parte anterior da coxa e no quadril do lado de baixo.',
  'Mantenha por 20 a 30 segundos e troque de lado.'
], 'seed', false, null),

('seed_str_005', 'Figura 4 Deitado (Piriforme)', 'stretching', 'glutes', 'body weight', null, ARRAY['piriformis', 'hip rotators'], ARRAY[
  'Deite-se de costas com os joelhos dobrados e os pés apoiados no chão.',
  'Cruze o tornozelo direito sobre o joelho esquerdo, formando um "4".',
  'Entrelace as mãos atrás da coxa esquerda e puxe suavemente em direção ao peito.',
  'Sinta o alongamento profundo no glúteo direito.',
  'Mantenha por 20 a 30 segundos e repita do outro lado.'
], 'seed', false, null),

('seed_str_006', 'Alongamento do Adutor (Borboleta)', 'stretching', 'adductors', 'body weight', null, ARRAY['groin', 'inner thighs'], ARRAY[
  'Sente-se no chão e junte as plantas dos pés, deixando os joelhos caírem para os lados.',
  'Segure os pés com as mãos e mantenha a coluna ereta.',
  'Pressione suavemente os joelhos em direção ao chão com os cotovelos.',
  'Incline o tronco levemente para frente mantendo as costas retas para aprofundar.',
  'Mantenha por 20 a 30 segundos, respirando normalmente.'
], 'seed', false, null),

('seed_str_007', 'Alongamento do Glúteo Sentado', 'stretching', 'glutes', 'body weight', null, ARRAY['piriformis', 'outer hip'], ARRAY[
  'Sente-se em uma cadeira ou no chão com a coluna ereta.',
  'Cruze a perna direita sobre a esquerda, posicionando o tornozelo sobre o joelho.',
  'Mantenha o pé direito flexionado para proteger o joelho.',
  'Incline levemente o tronco para frente até sentir o alongamento no glúteo direito.',
  'Mantenha por 20 a 30 segundos e repita do outro lado.'
], 'seed', false, null),

('seed_str_008', 'Alongamento dos Isquiotibiais com Toalha (Deitado)', 'stretching', 'hamstrings', 'band', null, ARRAY['calves', 'lower back'], ARRAY[
  'Deite-se de costas e dobre o joelho esquerdo com o pé no chão.',
  'Envolva uma toalha ou faixa elástica no pé direito.',
  'Estenda a perna direita para cima, segurando as pontas da toalha.',
  'Puxe suavemente a perna em direção ao peito mantendo o joelho estendido.',
  'Sinta o alongamento na parte posterior da coxa. Mantenha 20 a 30 segundos e troque.'
], 'seed', false, null),

('seed_str_009', 'Rotação de Tornozelo', 'stretching', 'calves', 'body weight', null, ARRAY['ankle joint', 'tibialis anterior'], ARRAY[
  'Sente-se em uma cadeira ou no chão com uma perna cruzada sobre a outra.',
  'Segure a perna acima do tornozelo para estabilizá-la.',
  'Gire o pé em círculos completos, primeiro no sentido horário por 10 repetições.',
  'Inverta o sentido e faça mais 10 rotações anti-horárias.',
  'Repita com o outro pé.'
], 'seed', false, null),

('seed_str_010', 'Abertura de Quadril com Apoio', 'stretching', 'hip rotators', 'body weight', null, ARRAY['adductors', 'glutes'], ARRAY[
  'Fique em pé ao lado de uma parede para apoio.',
  'Levante o joelho direito à altura do quadril.',
  'Rotate o joelho para fora abrindo o quadril, como se fosse pisar em um degrau lateral.',
  'Faça o movimento de forma controlada em 10 repetições.',
  'Repita com a perna esquerda.'
], 'seed', false, null),

-- ── MEMBROS SUPERIORES ──────────────────────────────────────────

('seed_str_011', 'Alongamento do Tríceps', 'stretching', 'triceps', 'body weight', null, ARRAY['shoulders', 'lats'], ARRAY[
  'Fique em pé ou sentado com a coluna ereta.',
  'Levante o braço direito acima da cabeça e dobre o cotovelo, levando a mão atrás da nuca.',
  'Com a mão esquerda, segure o cotovelo direito e puxe gentilmente para a esquerda.',
  'Sinta o alongamento na parte posterior do braço.',
  'Mantenha por 20 a 30 segundos e repita com o outro braço.'
], 'seed', false, null),

('seed_str_012', 'Alongamento do Bíceps e Peitoral', 'stretching', 'biceps', 'body weight', null, ARRAY['chest', 'forearms'], ARRAY[
  'Fique em pé com os braços estendidos para os lados, palmas viradas para cima.',
  'Gire os braços para trás, abrindo o peito e afastando os ombros.',
  'Mantenha os cotovelos estendidos durante todo o movimento.',
  'Sinta o alongamento na parte anterior dos braços e no peito.',
  'Mantenha por 20 a 30 segundos.'
], 'seed', false, null),

('seed_str_013', 'Alongamento do Ombro Cruzado', 'stretching', 'shoulders', 'body weight', null, ARRAY['rear deltoid', 'upper back'], ARRAY[
  'Fique em pé ou sentado com a coluna ereta.',
  'Estenda o braço direito à frente do corpo e puxe-o com o braço esquerdo em direção ao peito.',
  'Mantenha o ombro direito baixo e relaxado.',
  'Sinta o alongamento no ombro e na parte posterior do braço.',
  'Mantenha por 20 a 30 segundos e repita com o outro braço.'
], 'seed', false, null),

('seed_str_014', 'Rotação de Pulso', 'stretching', 'forearms', 'body weight', null, ARRAY['wrist flexors', 'wrist extensors'], ARRAY[
  'Estenda os braços à frente com os cotovelos levemente dobrados.',
  'Gire os punhos em círculos completos por 10 repetições no sentido horário.',
  'Inverta o sentido e faça mais 10 rotações anti-horárias.',
  'Abra e feche as mãos entre as séries para aliviar a tensão.',
  'Repita 2 a 3 vezes.'
], 'seed', false, null),

('seed_str_015', 'Alongamento do Antebraço (Flexores)', 'stretching', 'forearms', 'body weight', null, ARRAY['wrist flexors'], ARRAY[
  'Estenda o braço direito à frente com a palma voltada para cima.',
  'Com a mão esquerda, segure os dedos direitos e dobre o punho para baixo.',
  'Mantenha o cotovelo estendido e sinta o alongamento na parte inferior do antebraço.',
  'Mantenha por 20 a 30 segundos.',
  'Repita com o outro braço.'
], 'seed', false, null),

('seed_str_016', 'Alongamento do Antebraço (Extensores)', 'stretching', 'forearms', 'body weight', null, ARRAY['wrist extensors'], ARRAY[
  'Estenda o braço direito à frente com a palma voltada para baixo.',
  'Com a mão esquerda, segure os dedos direitos e dobre o punho para baixo.',
  'Sinta o alongamento na parte superior do antebraço.',
  'Mantenha por 20 a 30 segundos.',
  'Repita com o outro braço.'
], 'seed', false, null),

-- ── PESCOÇO E OMBROS ────────────────────────────────────────────

('seed_str_017', 'Alongamento Lateral do Pescoço', 'stretching', 'neck', 'body weight', null, ARRAY['trapezius', 'levator scapulae'], ARRAY[
  'Sente-se ou fique em pé com a coluna ereta.',
  'Incline a cabeça para a direita, levando a orelha em direção ao ombro.',
  'Para intensificar, coloque a mão direita levemente sobre a cabeça sem forçar.',
  'Mantenha o ombro esquerdo relaxado e baixo.',
  'Mantenha por 20 a 30 segundos e repita para o lado esquerdo.'
], 'seed', false, null),

('seed_str_018', 'Rotação de Pescoço', 'stretching', 'neck', 'body weight', null, ARRAY['sternocleidomastoid', 'trapezius'], ARRAY[
  'Sente-se com a coluna ereta e os ombros relaxados.',
  'Gire a cabeça suavemente para a direita até onde for confortável.',
  'Mantenha por 5 segundos e volte ao centro.',
  'Repita para o lado esquerdo.',
  'Faça 5 repetições para cada lado de forma lenta e controlada.'
], 'seed', false, null),

('seed_str_019', 'Alongamento do Trapézio', 'stretching', 'traps', 'body weight', null, ARRAY['neck', 'shoulders'], ARRAY[
  'Sente-se com a coluna ereta e os pés apoiados no chão.',
  'Incline a cabeça para a direita enquanto leva o ombro direito levemente para baixo.',
  'Para aprofundar, segure a lateral da cadeira com a mão esquerda.',
  'Sinta o alongamento no lado do pescoço e no trapézio.',
  'Mantenha por 20 a 30 segundos e repita do outro lado.'
], 'seed', false, null),

('seed_str_020', 'Alongamento do Peitoral na Porta', 'stretching', 'pectorals', 'body weight', null, ARRAY['anterior deltoid', 'biceps'], ARRAY[
  'Posicione-se em uma porta ou canto de parede.',
  'Levante os braços até a altura dos ombros e apoie os antebraços nas laterais da porta.',
  'Dê um passo leve para frente até sentir o alongamento no peito.',
  'Mantenha o queixo levantado e a coluna ereta.',
  'Mantenha por 20 a 30 segundos e respire profundamente.'
], 'seed', false, null),

-- ── COSTAS E COLUNA ─────────────────────────────────────────────

('seed_str_021', 'Postura da Criança (Child''s Pose)', 'stretching', 'lower back', 'body weight', null, ARRAY['lats', 'glutes', 'upper back'], ARRAY[
  'Ajoelhe-se no chão e sente sobre os calcanhares.',
  'Estenda os braços à frente e abaixe o tronco em direção ao chão.',
  'Deixe a testa tocar o chão ou um apoio macio.',
  'Sinta o alongamento nas costas, nas laterais e nos quadris.',
  'Mantenha por 30 a 60 segundos, respirando profundamente e relaxando a cada expiração.'
], 'seed', false, null),

('seed_str_022', 'Gato-Vaca (Cat-Cow)', 'stretching', 'spine', 'body weight', null, ARRAY['lower back', 'abs', 'neck'], ARRAY[
  'Fique em quatro apoios com as mãos sob os ombros e os joelhos sob os quadris.',
  'Inspire e arqueie as costas para baixo, levantando a cabeça e o cóccix (Vaca).',
  'Expire e arredonde as costas para cima, abaixando a cabeça entre os braços (Gato).',
  'Alterne os movimentos de forma suave e sincronizada com a respiração.',
  'Repita 10 a 15 vezes em ritmo lento.'
], 'seed', false, null),

('seed_str_023', 'Torção Espinhal Sentado', 'stretching', 'spine', 'body weight', null, ARRAY['obliques', 'lower back', 'glutes'], ARRAY[
  'Sente-se no chão com as pernas estendidas à frente.',
  'Dobre o joelho direito e passe o pé por cima da perna esquerda, apoiando-o no chão.',
  'Coloque o cotovelo esquerdo do lado externo do joelho direito.',
  'Rode o tronco para a direita olhando por cima do ombro.',
  'Mantenha por 20 a 30 segundos e repita para o lado oposto.'
], 'seed', false, null),

('seed_str_024', 'Alongamento da Lombar Deitado (Joelhos ao Peito)', 'stretching', 'lower back', 'body weight', null, ARRAY['glutes', 'hips'], ARRAY[
  'Deite-se de costas com as pernas estendidas.',
  'Dobre os dois joelhos e abraçe-os puxando-os em direção ao peito.',
  'Mantenha a cabeça no chão e relaxe os ombros.',
  'Faça movimentos suaves de lado a lado para massagear a lombar.',
  'Mantenha por 30 segundos e respire profundamente.'
], 'seed', false, null),

('seed_str_025', 'Extensão de Coluna Deitado (Cobra)', 'stretching', 'spine', 'body weight', null, ARRAY['abs', 'lower back'], ARRAY[
  'Deite-se de bruços com as mãos ao lado do peito.',
  'Pressione as mãos no chão e levante o tronco estendendo os cotovelos parcialmente.',
  'Mantenha o quadril e as pernas relaxados no chão.',
  'Olhe levemente para cima sem forçar o pescoço.',
  'Mantenha por 15 a 30 segundos e desça lentamente.'
], 'seed', false, null),

('seed_str_026', 'Alongamento do Latíssimo em Pé', 'stretching', 'lats', 'body weight', null, ARRAY['obliques', 'upper back'], ARRAY[
  'Fique em pé com os pés afastados na largura dos quadris.',
  'Eleve os braços acima da cabeça e entrelace os dedos, virando as palmas para cima.',
  'Incline o tronco suavemente para a direita, sentindo o alongamento no lado esquerdo.',
  'Mantenha o quadril estável e os ombros longe das orelhas.',
  'Mantenha por 20 a 30 segundos e repita para o lado esquerdo.'
], 'seed', false, null),

('seed_str_027', 'Torção Espinhal Deitado', 'stretching', 'spine', 'body weight', null, ARRAY['obliques', 'lower back', 'hips'], ARRAY[
  'Deite-se de costas com os braços estendidos para os lados em forma de T.',
  'Dobre os joelhos até a altura do quadril.',
  'Leve os dois joelhos para a direita até o chão, mantendo os ombros apoiados.',
  'Vire a cabeça para a esquerda para aumentar a rotação.',
  'Mantenha por 20 a 30 segundos e repita para o lado esquerdo.'
], 'seed', false, null),

('seed_str_028', 'Postura do Cachorro Olhando para Baixo', 'stretching', 'lats', 'body weight', null, ARRAY['hamstrings', 'calves', 'shoulders', 'lower back'], ARRAY[
  'Comece em quatro apoios com as mãos sob os ombros.',
  'Pressione as mãos no chão e eleve os quadris para cima formando um "V" invertido.',
  'Tente estender os joelhos e pressionar os calcanhares em direção ao chão.',
  'Afaste os ombros das orelhas e deixe a cabeça relaxar entre os braços.',
  'Mantenha por 20 a 30 segundos, respirando profundamente.'
], 'seed', false, null),

-- ── QUADRIL E GLÚTEOS ───────────────────────────────────────────

('seed_str_029', 'Postura do Pombo (Pigeon Pose)', 'stretching', 'glutes', 'body weight', null, ARRAY['piriformis', 'hip rotators', 'hip flexors'], ARRAY[
  'Comece em quatro apoios e deslize o joelho direito para frente, posicionando-o atrás do pulso direito.',
  'Estenda a perna esquerda completamente para trás.',
  'Quadre os quadris em direção ao chão, mantendo-os alinhados.',
  'Para intensificar, incline o tronco para frente sobre a perna dobrada.',
  'Mantenha por 30 a 60 segundos e repita do outro lado.'
], 'seed', false, null),

('seed_str_030', 'Alongamento do Iliopsoas em Pé', 'stretching', 'hip flexors', 'body weight', null, ARRAY['quadriceps', 'iliopsoas'], ARRAY[
  'Fique em pé e dê um grande passo para frente com a perna direita.',
  'Abaixe o joelho esquerdo até o chão em posição de afundo.',
  'Mantenha o tronco ereto e empurre o quadril para frente e para baixo.',
  'Erga levemente os braços para cima para aprofundar o alongamento.',
  'Mantenha por 20 a 30 segundos e repita com a outra perna.'
], 'seed', false, null),

('seed_str_031', 'Rotação Interna do Quadril Deitado', 'stretching', 'hip rotators', 'body weight', null, ARRAY['glutes', 'outer hip'], ARRAY[
  'Deite-se de costas com os joelhos dobrados e os pés apoiados no chão.',
  'Deixe o joelho direito cair para fora naturalmente até onde for confortável.',
  'Para aumentar, coloque a mão esquerda sobre o joelho e aplique leve pressão.',
  'Sinta o alongamento na parte externa do quadril e glúteo.',
  'Mantenha por 20 a 30 segundos e repita do outro lado.'
], 'seed', false, null),

-- ── MOBILIDADE GERAL ────────────────────────────────────────────

('seed_str_032', 'Círculos de Quadril em Pé', 'stretching', 'hip rotators', 'body weight', null, ARRAY['lower back', 'glutes', 'adductors'], ARRAY[
  'Fique em pé com as mãos nos quadris e os pés afastados na largura dos ombros.',
  'Faça círculos amplos com o quadril no sentido horário.',
  'Realize 10 repetições lentas e controladas.',
  'Inverta o sentido e faça mais 10 repetições anti-horárias.',
  'Mantenha os joelhos levemente dobrados durante todo o movimento.'
], 'seed', false, null),

('seed_str_033', 'Rotação de Ombros', 'stretching', 'shoulders', 'body weight', null, ARRAY['trapezius', 'rotator cuff'], ARRAY[
  'Fique em pé ou sentado com os braços relaxados ao lado do corpo.',
  'Eleve os ombros em direção às orelhas.',
  'Role os ombros para trás de forma ampla e controlada.',
  'Desça os ombros e complete o círculo.',
  'Faça 10 repetições para trás e 10 para frente.'
], 'seed', false, null),

('seed_str_034', 'Mobilização de Tornozelo (Inkblot)', 'stretching', 'calves', 'body weight', null, ARRAY['tibialis anterior', 'ankle joint'], ARRAY[
  'Fique em pé próximo a uma parede para apoio.',
  'Apoie-se na perna esquerda e eleve o pé direito do chão.',
  'Tente tocar o chão com os dedos do pé direito enquanto mantém o calcanhar elevado.',
  'Faça 10 repetições controladas antes de trocar de pé.',
  'Mantenha o equilíbrio usando a parede se necessário.'
], 'seed', false, null),

('seed_str_035', 'Flexão de Tronco para Frente em Pé', 'stretching', 'hamstrings', 'body weight', null, ARRAY['lower back', 'calves'], ARRAY[
  'Fique em pé com os pés juntos ou levemente afastados.',
  'Dobre o tronco para frente a partir do quadril, deixando os braços caírem.',
  'Dobre ligeiramente os joelhos se necessário para evitar tensão excessiva na lombar.',
  'Relaxe o pescoço e deixe a cabeça pender naturalmente.',
  'Mantenha por 20 a 30 segundos e suba lentamente vértebra por vértebra.'
], 'seed', false, null)

ON CONFLICT (id) DO NOTHING;

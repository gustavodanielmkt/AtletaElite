-- =============================================
-- Seed: Exercícios de Mobilidade
-- Execute no Supabase SQL Editor
-- =============================================

INSERT INTO public.exercises (id, name, body_part, target, equipment, gif_url, secondary_muscles, instructions, source, is_custom, created_by)
VALUES

-- ── MOBILIDADE DE QUADRIL ──────────────────────────────────────

('seed_mob_001', 'Rotação de Quadril em Quatro Apoios (CARs)', 'back', 'hip rotators', 'body weight', null, ARRAY['glutes', 'hip flexors', 'lower back'], ARRAY[
  'Fique em quatro apoios com as mãos sob os ombros e os joelhos sob os quadris.',
  'Eleve o joelho direito para o lado mantendo 90 graus de flexão.',
  'Leve o joelho para frente e para cima como se fosse tocar o ombro.',
  'Continue o círculo levando o joelho para trás e para cima o máximo possível.',
  'Complete o círculo de forma lenta e controlada, explorando toda a amplitude.',
  'Faça 5 círculos no sentido horário e 5 no anti-horário. Repita do outro lado.'
], 'seed', false, null),

('seed_mob_002', 'Afundo com Rotação de Quadril (Hip 90/90)', 'back', 'hip rotators', 'body weight', null, ARRAY['adductors', 'glutes', 'hip flexors'], ARRAY[
  'Sente-se no chão com a perna direita à frente formando 90 graus e a esquerda na lateral também em 90 graus.',
  'Mantenha o tronco ereto e os isquios apoiados no chão.',
  'Incline levemente para frente sobre a perna da frente para sentir o quadril externo.',
  'Gire o tronco para o lado da perna de trás para sentir o quadril interno.',
  'Alterne lentamente entre as duas posições por 30 a 60 segundos.',
  'Troque de lado e repita.'
], 'seed', false, null),

('seed_mob_003', 'World''s Greatest Stretch', 'back', 'hip flexors', 'body weight', null, ARRAY['thoracic spine', 'shoulders', 'hamstrings', 'glutes'], ARRAY[
  'Fique em pé e dê um grande passo para frente com a perna direita, como em um afundo.',
  'Coloque a mão esquerda no chão ao lado do pé direito.',
  'Gire o tronco para a direita elevando o braço direito em direção ao teto.',
  'Retorne a mão ao chão e empurre o quadril para cima estendendo ambas as pernas.',
  'Volte à posição inicial e repita 5 vezes antes de trocar de lado.',
  'Faça o movimento de forma lenta e controlada, respirando profundamente.'
], 'seed', false, null),

('seed_mob_004', 'Mobilidade de Quadril em Pé (Hip CARs)', 'back', 'hip rotators', 'body weight', null, ARRAY['glutes', 'hip flexors', 'adductors'], ARRAY[
  'Fique em pé próximo a uma parede para apoio, com o peso na perna esquerda.',
  'Eleve o joelho direito até a altura do quadril.',
  'Faça um círculo amplo com o joelho: para fora, para trás, para baixo e para frente.',
  'Mantenha o tronco estável e o joelho de apoio levemente dobrado.',
  'Execute 5 círculos lentos e aumente a amplitude a cada repetição.',
  'Inverta a direção e repita. Troque de perna.'
], 'seed', false, null),

('seed_mob_005', 'Avanço Lateral com Afundamento (Lateral Lunge)', 'back', 'adductors', 'body weight', null, ARRAY['glutes', 'quadriceps', 'hip rotators'], ARRAY[
  'Fique em pé com os pés afastados ao dobro da largura dos ombros.',
  'Desloque o peso para a direita dobrando o joelho direito e mantendo o esquerdo estendido.',
  'Mantenha o pé direito totalmente apoiado no chão e o tronco ereto.',
  'Empurre o quadril para baixo e para trás como se fosse sentar.',
  'Mantenha por 2 segundos e retorne ao centro.',
  'Alterne os lados por 10 repetições de cada.'
], 'seed', false, null),

-- ── MOBILIDADE TORÁCICA ────────────────────────────────────────

('seed_mob_006', 'Rotação Torácica em Quatro Apoios', 'back', 'spine', 'body weight', null, ARRAY['thoracic spine', 'obliques', 'upper back'], ARRAY[
  'Fique em quatro apoios com a coluna neutra.',
  'Coloque a mão direita atrás da cabeça com o cotovelo apontando para o lado.',
  'Gire o tronco abrindo o cotovelo direito em direção ao teto.',
  'Retorne lentamente sem deixar o quadril se mover.',
  'Faça 8 a 10 repetições de cada lado, aumentando a amplitude gradualmente.',
  'Inspire ao abrir e expire ao fechar.'
], 'seed', false, null),

('seed_mob_007', 'Extensão Torácica com Rolo de Espuma', 'back', 'upper back', 'roller', null, ARRAY['thoracic spine', 'lats', 'shoulders'], ARRAY[
  'Sente-se à frente do rolo de espuma e posicione-o na altura da coluna torácica.',
  'Apoie a cabeça com as mãos entrelaçadas atrás da nuca.',
  'Deixe-se cair levemente para trás sobre o rolo até sentir pressão na coluna.',
  'Expire e relaxe a coluna sobre o rolo por 3 a 5 segundos.',
  'Deslize o rolo um segmento para cima e repita.',
  'Trabalhe toda a coluna torácica do nível das costelas até os ombros.'
], 'seed', false, null),

('seed_mob_008', 'Rotação Torácica Sentado (Open Book)', 'back', 'spine', 'body weight', null, ARRAY['thoracic spine', 'obliques', 'shoulders'], ARRAY[
  'Deite-se de lado com os joelhos dobrados em 90 graus e os braços estendidos à frente.',
  'Mantenha os joelhos juntos e fixos no chão durante o movimento.',
  'Abra o braço de cima em arco em direção ao chão do lado oposto, seguindo com os olhos.',
  'Deixe o ombro e a coluna torácica rotacionarem, mas não o quadril.',
  'Mantenha a posição aberta por 2 a 3 segundos e retorne.',
  'Faça 8 a 10 repetições de cada lado.'
], 'seed', false, null),

('seed_mob_009', 'Rotação de Tronco em Pé com Bastão', 'back', 'spine', 'body weight', null, ARRAY['thoracic spine', 'obliques', 'lower back'], ARRAY[
  'Fique em pé com os pés afastados na largura dos ombros.',
  'Segure um bastão (ou toque as pontas dos dedos nos ombros) com os braços cruzados no peito.',
  'Gire o tronco para a direita o máximo possível sem mover os pés ou o quadril.',
  'Retorne ao centro e gire para a esquerda.',
  'Faça o movimento de forma lenta e progressiva, aumentando a amplitude a cada repetição.',
  'Realize 10 rotações para cada lado.'
], 'seed', false, null),

('seed_mob_010', 'Extensão de Coluna em Pé (Backbend)', 'back', 'spine', 'body weight', null, ARRAY['thoracic spine', 'abs', 'hip flexors'], ARRAY[
  'Fique em pé com os pés afastados na largura dos quadris.',
  'Coloque as mãos na lombar com os dedos apontando para baixo como apoio.',
  'Inspire e eleve o peito em direção ao teto, abrindo a caixa torácica.',
  'Deixe a cabeça cair levemente para trás se for confortável.',
  'Mantenha por 3 a 5 segundos e retorne ao centro.',
  'Repita 8 a 10 vezes, aumentando a amplitude progressivamente.'
], 'seed', false, null),

-- ── MOBILIDADE DE OMBROS ───────────────────────────────────────

('seed_mob_011', 'CARs de Ombro (Círculos Articulares)', 'shoulders', 'shoulders', 'body weight', null, ARRAY['rotator cuff', 'trapezius', 'serratus anterior'], ARRAY[
  'Fique em pé com o tronco estável e o braço direito ao lado do corpo.',
  'Gire o braço lentamente para frente em um círculo completo, como uma roda.',
  'Mantenha o cotovelo estendido e leve o braço o mais alto e trás possível.',
  'Complete 3 círculos lentos no sentido anti-horário.',
  'Inverta a direção e faça mais 3 círculos no sentido horário.',
  'Repita com o braço esquerdo. Foco na amplitude máxima, não na velocidade.'
], 'seed', false, null),

('seed_mob_012', 'Mobilidade de Ombro com Bastão (Pass-Through)', 'shoulders', 'shoulders', 'body weight', null, ARRAY['rotator cuff', 'trapezius', 'chest'], ARRAY[
  'Fique em pé e segure um bastão ou elástico com as duas mãos mais largas que os ombros.',
  'Mantenha os cotovelos estendidos e eleve o bastão acima da cabeça.',
  'Continue o movimento para trás levando o bastão atrás das costas.',
  'Retorne pelo mesmo caminho até a posição inicial.',
  'Faça o movimento lentamente, sem forçar. Afaste as mãos se sentir resistência.',
  'Repita 8 a 10 vezes, aproximando as mãos progressivamente.'
], 'seed', false, null),

('seed_mob_013', 'Rotação Interna e Externa de Ombro (90/90)', 'shoulders', 'rotator cuff', 'body weight', null, ARRAY['deltoid', 'infraspinatus', 'subscapularis'], ARRAY[
  'Deite-se de costas com o braço direito a 90 graus do tronco, cotovelo dobrado em 90 graus.',
  'Rotação externa: leve o antebraço em direção ao chão acima da cabeça.',
  'Rotação interna: leve o antebraço em direção ao chão abaixo do quadril.',
  'Faça o movimento de forma lenta e controlada, sem compensar com o tronco.',
  'Mantenha 2 segundos em cada posição extrema.',
  'Realize 8 a 10 repetições de cada lado.'
], 'seed', false, null),

('seed_mob_014', 'Mobilidade de Escápula (Retrações e Protrações)', 'shoulders', 'serratus anterior', 'body weight', null, ARRAY['trapezius', 'rhomboids', 'shoulders'], ARRAY[
  'Fique em posição de prancha alta com as mãos sob os ombros.',
  'Deixe o peito afundar entre os braços aproximando as escápulas (retração).',
  'Empurre o chão afastando as escápulas ao máximo (protração).',
  'Faça o movimento de forma lenta, sentindo cada escápula separadamente.',
  'Mantenha 2 segundos em cada posição.',
  'Repita 10 a 12 vezes, mantendo os cotovelos estendidos.'
], 'seed', false, null),

('seed_mob_015', 'Abertura de Peito com Braços no Chão (Prone Y-T-W)', 'shoulders', 'upper back', 'body weight', null, ARRAY['trapezius', 'rhomboids', 'posterior deltoid', 'rotator cuff'], ARRAY[
  'Deite-se de bruços com os braços estendidos acima da cabeça em posição Y.',
  'Levante os dois braços do chão o máximo possível, contraindo as escápulas.',
  'Mantenha 2 segundos e desça. Repita 8 vezes.',
  'Mova os braços para T (90 graus) e repita o movimento de elevação.',
  'Mova os braços para W (cotovelos dobrados) e repita.',
  'Mantenha o queixo próximo ao chão durante todo o exercício.'
], 'seed', false, null),

-- ── MOBILIDADE DE PESCOÇO ──────────────────────────────────────

('seed_mob_016', 'CARs de Pescoço (Círculos Articulares)', 'neck', 'neck', 'body weight', null, ARRAY['sternocleidomastoid', 'trapezius', 'cervical spine'], ARRAY[
  'Sente-se com a coluna ereta e os ombros relaxados.',
  'Leve o queixo suavemente em direção ao peito.',
  'Gire a cabeça para a direita, levando a orelha em direção ao ombro.',
  'Continue o círculo levando a cabeça para trás com cuidado.',
  'Complete o círculo voltando ao centro pelo lado esquerdo.',
  'Faça 3 círculos lentos para cada sentido. Nunca force ou acelere o movimento.'
], 'seed', false, null),

('seed_mob_017', 'Retração Cervical (Chin Tuck)', 'neck', 'neck', 'body weight', null, ARRAY['deep cervical flexors', 'upper trapezius'], ARRAY[
  'Sente-se ou fique em pé com a coluna ereta.',
  'Faça um "duplo queixo": puxe a cabeça diretamente para trás sem inclinar.',
  'Você deve sentir um leve alongamento na base do crânio.',
  'Mantenha por 3 a 5 segundos e retorne.',
  'Faça 10 a 15 repetições de forma suave.',
  'Este exercício corrige a postura da cabeça para frente e ativa os flexores profundos.'
], 'seed', false, null),

('seed_mob_018', 'Flexão e Extensão de Pescoço Ativa', 'neck', 'neck', 'body weight', null, ARRAY['sternocleidomastoid', 'trapezius', 'cervical extensors'], ARRAY[
  'Sente-se com a coluna ereta e os ombros relaxados.',
  'Leve o queixo suavemente em direção ao peito, sentindo o alongamento na nuca.',
  'Mantenha por 2 segundos e retorne ao centro.',
  'Leve a cabeça levemente para trás olhando para cima.',
  'Mantenha por 2 segundos e retorne.',
  'Faça 8 a 10 repetições de cada movimento de forma lenta e controlada.'
], 'seed', false, null),

-- ── MOBILIDADE DE TORNOZELO ────────────────────────────────────

('seed_mob_019', 'Mobilidade de Tornozelo em Avanço', 'back', 'calves', 'body weight', null, ARRAY['achilles tendon', 'tibialis anterior', 'ankle joint'], ARRAY[
  'Fique de joelhos próximo a uma parede com o pé direito à frente.',
  'Empurre o joelho direito em direção à parede, mantendo o calcanhar no chão.',
  'Tente levar o joelho o mais para frente possível sem levantar o calcanhar.',
  'Mantenha por 2 segundos e retorne.',
  'Faça 10 repetições lentas antes de trocar de pé.',
  'Varie a direção do joelho (para fora, reto, para dentro) para trabalhar toda a articulação.'
], 'seed', false, null),

('seed_mob_020', 'Círculos de Tornozelo com Amplitude Total (CARs)', 'back', 'calves', 'body weight', null, ARRAY['ankle joint', 'tibialis anterior', 'peroneals'], ARRAY[
  'Sente-se em uma cadeira ou no chão com uma perna cruzada sobre a outra.',
  'Segure a perna acima do tornozelo para estabilizá-la completamente.',
  'Faça círculos amplos com o pé: para cima, para fora, para baixo, para dentro.',
  'Vá devagar e explore toda a amplitude articular do tornozelo.',
  'Faça 5 círculos no sentido horário e 5 no anti-horário.',
  'Repita com o outro pé. Mantenha os movimentos lentos e controlados.'
], 'seed', false, null),

-- ── MOBILIDADE DE PUNHO E COTOVELO ────────────────────────────

('seed_mob_021', 'Mobilidade de Punho em Quatro Apoios', 'back', 'forearms', 'body weight', null, ARRAY['wrist flexors', 'wrist extensors', 'forearms'], ARRAY[
  'Fique em quatro apoios com as mãos abertas no chão.',
  'Gire as mãos para fora de forma que os dedos apontem para os lados.',
  'Desloque levemente o peso para frente e para trás, sentindo o alongamento nos punhos.',
  'Gire as mãos para dentro com os dedos apontando um para o outro e repita.',
  'Vire as palmas para cima e apoie o dorso das mãos no chão para alongar os extensores.',
  'Repita cada posição por 20 a 30 segundos.'
], 'seed', false, null),

('seed_mob_022', 'Rotação de Cotovelo (Pronação e Supinação)', 'back', 'forearms', 'body weight', null, ARRAY['biceps', 'forearm rotators', 'elbow joint'], ARRAY[
  'Fique em pé ou sentado com o cotovelo dobrado em 90 graus e fixo ao lado do corpo.',
  'Com a palma voltada para cima (supinação), gire o antebraço devagar.',
  'Leve até a palma voltada para baixo (pronação).',
  'Faça o movimento de forma lenta, chegando ao limite confortável em cada direção.',
  'Mantenha 2 segundos em cada extremo.',
  'Repita 10 vezes com cada braço.'
], 'seed', false, null),

-- ── MOBILIDADE DE COLUNA LOMBAR ────────────────────────────────

('seed_mob_023', 'Mobilidade Lombar em Quatro Apoios (Círculos de Quadril)', 'back', 'lower back', 'body weight', null, ARRAY['hip rotators', 'glutes', 'lumbar spine'], ARRAY[
  'Fique em quatro apoios com a coluna neutra.',
  'Faça círculos amplos com o quadril no sentido horário.',
  'Mantenha os braços fixos e o movimento concentrado na lombar e no quadril.',
  'Faça 8 círculos lentos e inverta a direção.',
  'Aumente a amplitude progressivamente a cada círculo.',
  'Foco na qualidade do movimento, não na velocidade.'
], 'seed', false, null),

('seed_mob_024', 'Inclinação Pélvica Deitado (Pelvic Tilt)', 'back', 'lower back', 'body weight', null, ARRAY['abs', 'glutes', 'hip flexors'], ARRAY[
  'Deite-se de costas com os joelhos dobrados e os pés apoiados no chão.',
  'Pressione a lombar contra o chão contraindo o abdômen (retroversão pélvica).',
  'Mantenha por 3 segundos e relaxe criando um arco na lombar (anteversão pélvica).',
  'Alterne entre os dois movimentos de forma lenta e controlada.',
  'Faça 10 a 15 repetições em cada direção.',
  'Mantenha a respiração fluindo durante todo o exercício.'
], 'seed', false, null),

('seed_mob_025', 'Femoral Slide (Deslizamento de Calcanhar)', 'back', 'hip flexors', 'body weight', null, ARRAY['lower back', 'hip flexors', 'hamstrings'], ARRAY[
  'Deite-se de costas com as pernas estendidas.',
  'Deslize lentamente o calcanhar direito em direção ao glúteo dobrando o joelho.',
  'Pare quando sentir resistência e mantenha por 2 segundos.',
  'Deslize de volta estendendo a perna lentamente.',
  'Mantenha a lombar em posição neutra durante todo o movimento.',
  'Faça 10 repetições com cada perna de forma alternada.'
], 'seed', false, null),

-- ── MOBILIDADE INTEGRADA ───────────────────────────────────────

('seed_mob_026', 'Posição de Agachamento Profundo (Deep Squat Hold)', 'back', 'hip rotators', 'body weight', null, ARRAY['adductors', 'hip flexors', 'calves', 'lower back', 'ankles'], ARRAY[
  'Fique em pé com os pés afastados na largura dos ombros, levemente abertos.',
  'Agache o mais fundo possível mantendo os calcanhares no chão.',
  'Use as mãos para se apoiar inicialmente se necessário.',
  'Mantenha o peito erguido e a coluna neutra.',
  'Dentro da posição, faça pequenos movimentos de lado a lado para explorar a amplitude.',
  'Mantenha a posição por 30 a 60 segundos, respirando profundamente.'
], 'seed', false, null),

('seed_mob_027', 'Mobilidade de Tornozelo e Quadril (Squat to Stand)', 'back', 'hip flexors', 'body weight', null, ARRAY['hamstrings', 'calves', 'lower back', 'ankles', 'thoracic spine'], ARRAY[
  'Fique em pé com os pés na largura dos ombros.',
  'Dobre o tronco para frente e segure os dedos dos pés.',
  'Dobre os joelhos agachando enquanto mantém os pés seguros.',
  'Eleve o peito e os quadris ao mesmo tempo chegando à posição de agachamento.',
  'Estenda os joelhos lentamente voltando à posição inicial.',
  'Repita 8 a 10 vezes de forma fluida e controlada.'
], 'seed', false, null),

('seed_mob_028', 'Mobilidade Total em Prancha Caminhada', 'back', 'spine', 'body weight', null, ARRAY['shoulders', 'hamstrings', 'calves', 'thoracic spine', 'hip flexors'], ARRAY[
  'Fique em pé com os pés juntos.',
  'Dobre o tronco e caminhe com as mãos até a posição de prancha.',
  'Mantenha a posição de prancha por 2 segundos com o corpo reto.',
  'Caminhe com as mãos de volta em direção aos pés.',
  'Endireite o tronco lentamente e repita.',
  'Faça 6 a 8 repetições lentas. Pode adicionar uma flexão na posição de prancha.'
], 'seed', false, null),

('seed_mob_029', 'Mobilidade de Ombro e Quadril (Thread the Needle)', 'back', 'upper back', 'body weight', null, ARRAY['thoracic spine', 'shoulders', 'hip rotators'], ARRAY[
  'Fique em quatro apoios com as mãos sob os ombros.',
  'Deslize o braço direito pelo chão sob o corpo em direção à esquerda.',
  'Deixe o ombro e a cabeça descerem, com a orelha tocando o chão.',
  'Mantenha por 3 a 5 segundos sentindo a rotação torácica.',
  'Retorne e eleve o braço direito em direção ao teto girando o tronco.',
  'Faça 6 a 8 repetições e repita do outro lado.'
], 'seed', false, null),

('seed_mob_030', 'Mobilidade de Quadril em Agachamento Lateral Profundo', 'back', 'adductors', 'body weight', null, ARRAY['hip rotators', 'glutes', 'inner thighs', 'calves'], ARRAY[
  'Fique em pé com os pés muito afastados, mais que o dobro dos ombros.',
  'Dobre o joelho direito agachando profundamente para o lado direito.',
  'Mantenha o pé esquerdo totalmente apoiado e a perna esquerda estendida.',
  'Deslize para o lado esquerdo agachando nesse lado e estendendo o direito.',
  'Alterne de forma fluida de um lado para o outro.',
  'Faça 8 a 10 repetições de cada lado mantendo o ritmo lento e controlado.'
], 'seed', false, null)

ON CONFLICT (id) DO NOTHING;

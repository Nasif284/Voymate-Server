-- Auto-generated Clean Cloud DB Restore Script
SET session_replication_role = 'replica';

-- 1. Clear all existing data
TRUNCATE TABLE "admin_status_history", "admins", "assistant_message_embeddings", "assistant_messages", "assistant_conversations", "call_participants", "calls", "chat_message_attachments", "chat_messages", "chat_conversations", "community_trip_bookings", "community_trips", "communities", "connection_requests", "connections", "destinations", "trip_matches", "trips", "user_interests", "user_languages", "user_locations", "user_onboarding", "user_privacy_settings", "user_status_history", "user_travel_skills", "users", "verification_activities", "verification_documents", "verification_extracted_data", "verifications", "roles", "countries" CASCADE;

-- 2. Seed clean Roles and Countries (with correct UTF-8 emojis)
INSERT INTO "roles" ("id", "name", "description", "created_at") VALUES
(gen_random_uuid(), 'SUPER_ADMIN', 'Super Administrator with full system privileges', NOW()),
(gen_random_uuid(), 'MODERATOR', 'Moderator handling user moderation, support, and identity verifications', NOW()),
(gen_random_uuid(), 'ANALYST', 'Analyst with read-only access to dashboards, reports, and logs', NOW())
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "countries" ("code", "name", "phone_prefix", "flag_emoji") VALUES
('AF', 'Afghanistan', '+93', '🇦🇫'),
('AL', 'Albania', '+355', '🇦🇱'),
('DZ', 'Algeria', '+213', '🇩🇿'),
('AD', 'Andorra', '+376', '🇦🇩'),
('AO', 'Angola', '+244', '🇦🇴'),
('AR', 'Argentina', '+54', '🇦🇷'),
('AM', 'Armenia', '+374', '🇦🇲'),
('AU', 'Australia', '+61', '🇦🇺'),
('AT', 'Austria', '+43', '🇦🇹'),
('AZ', 'Azerbaijan', '+994', '🇦🇿'),
('BH', 'Bahrain', '+973', '🇧🇭'),
('BD', 'Bangladesh', '+880', '🇧🇩'),
('BY', 'Belarus', '+375', '🇧🇾'),
('BE', 'Belgium', '+32', '🇧🇪'),
('BZ', 'Belize', '+501', '🇧🇿'),
('BT', 'Bhutan', '+975', '🇧🇹'),
('BO', 'Bolivia', '+591', '🇧🇴'),
('BA', 'Bosnia and Herzegovina', '+387', '🇧🇦'),
('BW', 'Botswana', '+267', '🇧🇼'),
('BR', 'Brazil', '+55', '🇧🇷'),
('BG', 'Bulgaria', '+359', '🇧🇬'),
('KH', 'Cambodia', '+855', '🇰🇭'),
('CM', 'Cameroon', '+237', '🇨🇲'),
('CA', 'Canada', '+1', '🇨🇦'),
('CL', 'Chile', '+56', '🇨🇱'),
('CN', 'China', '+86', '🇨🇳'),
('CO', 'Colombia', '+57', '🇨🇴'),
('CR', 'Costa Rica', '+506', '🇨🇷'),
('HR', 'Croatia', '+385', '🇭🇷'),
('CU', 'Cuba', '+53', '🇨🇺'),
('CY', 'Cyprus', '+357', '🇨🇾'),
('CZ', 'Czech Republic', '+420', '🇨🇿'),
('DK', 'Denmark', '+45', '🇩🇰'),
('EC', 'Ecuador', '+593', '🇪🇨'),
('EG', 'Egypt', '+20', '🇪🇬'),
('EE', 'Estonia', '+372', '🇪🇪'),
('ET', 'Ethiopia', '+251', '🇪🇹'),
('FI', 'Finland', '+358', '🇫🇮'),
('FR', 'France', '+33', '🇫🇷'),
('GE', 'Georgia', '+995', '🇬🇪'),
('DE', 'Germany', '+49', '🇩🇪'),
('GH', 'Ghana', '+233', '🇬🇭'),
('GR', 'Greece', '+30', '🇬🇷'),
('GT', 'Guatemala', '+502', '🇬🇹'),
('HK', 'Hong Kong', '+852', '🇭🇰'),
('HU', 'Hungary', '+36', '🇭🇺'),
('IS', 'Iceland', '+354', '🇮🇸'),
('IN', 'India', '+91', '🇮🇳'),
('ID', 'Indonesia', '+62', '🇮🇩'),
('IR', 'Iran', '+98', '🇮🇷'),
('IQ', 'Iraq', '+964', '🇮🇶'),
('IE', 'Ireland', '+353', '🇮🇪'),
('IL', 'Israel', '+972', '🇮🇱'),
('IT', 'Italy', '+39', '🇮🇹'),
('JM', 'Jamaica', '+1-876', '🇯🇲'),
('JP', 'Japan', '+81', '🇯🇵'),
('JO', 'Jordan', '+962', '🇯🇴'),
('KZ', 'Kazakhstan', '+7', '🇰🇿'),
('KE', 'Kenya', '+254', '🇰🇪'),
('KW', 'Kuwait', '+965', '🇰🇼'),
('KG', 'Kyrgyzstan', '+996', '🇰🇬'),
('LA', 'Laos', '+856', '🇱🇦'),
('LV', 'Latvia', '+371', '🇱🇻'),
('LB', 'Lebanon', '+961', '🇱🇧'),
('LT', 'Lithuania', '+370', '🇱🇹'),
('LU', 'Luxembourg', '+352', '🇱🇺'),
('MY', 'Malaysia', '+60', '🇲🇾'),
('MV', 'Maldives', '+960', '🇲🇻'),
('MX', 'Mexico', '+52', '🇲🇽'),
('MC', 'Monaco', '+377', '🇲🇨'),
('MA', 'Morocco', '+212', '🇲🇦'),
('NP', 'Nepal', '+977', '🇳🇵'),
('NL', 'Netherlands', '+31', '🇳🇱'),
('NZ', 'New Zealand', '+64', '🇳🇿'),
('NO', 'Norway', '+47', '🇳🇴'),
('OM', 'Oman', '+968', '🇴🇲'),
('PK', 'Pakistan', '+92', '🇵🇰'),
('PA', 'Panama', '+507', '🇵🇦'),
('PE', 'Peru', '+51', '🇵🇪'),
('PH', 'Philippines', '+63', '🇵🇭'),
('PL', 'Poland', '+48', '🇵🇱'),
('PT', 'Portugal', '+351', '🇵🇹'),
('QA', 'Qatar', '+974', '🇶🇦'),
('RO', 'Romania', '+40', '🇷🇴'),
('RU', 'Russia', '+7', '🇷🇺'),
('SA', 'Saudi Arabia', '+966', '🇸🇦'),
('RS', 'Serbia', '+381', '🇷🇸'),
('SG', 'Singapore', '+65', '🇸🇬'),
('ZA', 'South Africa', '+27', '🇿🇦'),
('KR', 'South Korea', '+82', '🇰🇷'),
('ES', 'Spain', '+34', '🇪🇸'),
('LK', 'Sri Lanka', '+94', '🇱🇰'),
('SE', 'Sweden', '+46', '🇸🇪'),
('CH', 'Switzerland', '+41', '🇨🇭'),
('TW', 'Taiwan', '+886', '🇹🇼'),
('TH', 'Thailand', '+66', '🇹🇭'),
('TR', 'Turkey', '+90', '🇹🇷'),
('UA', 'Ukraine', '+380', '🇺🇦'),
('AE', 'United Arab Emirates', '+971', '🇦🇪'),
('GB', 'United Kingdom', '+44', '🇬🇧'),
('US', 'United States', '+1', '🇺🇸'),
('VN', 'Vietnam', '+84', '🇻🇳')
ON CONFLICT ("code") DO NOTHING;

-- Table: admins (3 rows)
INSERT INTO "admins" ("id", "full_name", "email", "password_hash", "avatar_url", "last_active_at", "last_active_ip", "created_by", "created_at", "updated_at", "role_id", "account_status") VALUES
('81b6dbbf-b86b-4d8f-80b2-c4c854716470', 'Moderator', 'moderator@gmail.com', '$2b$12$tDNpZtTTViLdXbzkhRHLFe7Trm3D7qgwbf4Yr4F21iYzv9ibz5GVe', NULL, NULL, NULL, NULL, '2026-10-11 07:03:35.218+00', '2026-10-11 07:03:35.218+00', 'e550d1b9-5c19-4eed-8ed4-7adb0618ef85', 'ACTIVE'),
('015b71b2-7ede-4c5a-8178-c140863d8d05', 'Admin', 'admin@gmail.com', '$2b$12$Q5HUVoYxAsT9bL2fFZwT7eaxRXvGKJBN.t16lJpxYpVbuXLKQ/xxW', NULL, '2026-10-11 07:23:44.716+00', '172.18.0.1', NULL, '2026-10-11 07:02:48.707+00', '2026-10-11 07:02:48.707+00', 'bc8880b4-1405-4a57-ae83-45a1a85fbbb7', 'ACTIVE'),
('025c007d-3fbe-4917-965e-b02938c8db3c', 'Analyst', 'analyst@gmail.com', '$2b$12$VeinBEPMR23oezJi2ZZ3Ge7rwZCxmc/kQdgRQivqUniNCD/UT0QmO', NULL, '2026-10-11 07:24:57.709+00', '172.18.0.1', NULL, '2026-10-11 07:04:02.178+00', '2026-10-11 07:04:02.178+00', '1f979576-5235-4e13-b33f-af17ef3d2450', 'ACTIVE');

-- Table: assistant_conversations (1 rows)
INSERT INTO "assistant_conversations" ("id", "user_id", "created_at", "updated_at") VALUES
('d10a1b17-44b8-45f4-befd-c9e2ff3a2b9c', 'abaa0ce0-ad3f-4e50-8db8-de0bb9e1b890', '2026-10-04 09:43:04.94+00', '2026-10-04 09:43:04.94+00');

-- Table: assistant_message_embeddings (2 rows)
INSERT INTO "assistant_message_embeddings" ("id", "message_id", "conversation_id", "content", "embedding", "created_at") VALUES
('cc6ab63e-9c88-45ae-bc23-68175252cab2', '3567e440-fdae-497f-998b-f9228a20804f', 'd10a1b17-44b8-45f4-befd-c9e2ff3a2b9c', 'Hi', '[-0.09047623,0.040439524,0.023905642,0.05894793,-0.022882342,-0.04722012,0.045047585,0.015786324,-0.048199557,-0.03779407,-0.0190777,0.021308806,-0.004683033,-0.04330816,0.059914846,0.059103403,-0.02803671,-0.05921841,-0.12440315,-0.0356,-0.0060805446,0.032429088,-0.037800692,0.024711033,-0.042724337,-0.04245384,0.045935698,0.098625615,-0.04999797,-0.035235804,0.070839755,0.03316319,0.026588326,0.00017312737,0.003881667,0.030467318,-0.07820255,-0.12037957,0.018041458,0.022829046,-0.001774979,-0.02344985,0.0030581162,0.024355708,0.044154007,-0.040109806,0.020192299,0.010888137,0.028731534,0.012367684,-0.09131911,-0.06812443,0.006191584,-0.012560473,0.092824884,0.027907146,-0.03121978,-0.025235213,0.07843617,-0.07330274,-0.0669824,0.013900235,-0.14281446,0.008772049,0.020701187,9.084961e-05,-0.0591358,-0.0652027,-0.038024653,-0.061972465,-0.0025070985,-0.004245012,-0.041362125,-0.049571346,0.022460146,-0.035628147,0.04038629,0.048840955,0.052019555,0.03164205,0.030273134,-0.03807999,-0.01651855,-0.006834163,-0.00896496,-0.038086154,0.023735195,-0.008561259,-0.051279634,0.010258368,-0.10671528,0.05387758,0.030373877,-0.03544667,-0.07692983,-0.061188627,0.077836886,0.0010848737,-0.12356827,0.27917352,0.047993336,0.052141473,0.042187676,0.102176875,-0.021179266,0.053146686,-0.05259434,0.0774884,-0.005982204,0.022334047,0.025644599,-0.0017713641,-0.027925333,-0.019152524,0.054905336,0.070753746,-0.0033721616,0.0074942433,0.025769586,-0.07102822,-0.024785338,-0.053852774,0.03375685,-0.045082375,-0.019834379,-0.02400761,0.003078272,-4.3980475e-33,0.0713741,-0.024629116,0.043476567,0.08482529,-0.04635676,-0.03410239,-0.022942033,-0.049980048,0.0020603794,0.005182712,0.008058326,0.005911299,-0.04033642,-0.0023422767,-0.025733795,0.03138196,0.049170766,0.059575647,0.03628142,0.035963826,-0.079503305,-0.03188955,0.02035408,0.05408884,0.03402208,-0.026679993,0.00513573,-0.13762335,0.053568207,0.06246083,0.046655513,0.00825157,-0.0011227531,0.015864313,-0.014868683,-0.010654541,0.01392519,-0.051111575,-0.05115707,0.018110512,-0.026031876,0.04104916,0.061839726,-0.040964186,0.020300183,0.043521572,0.01520855,0.022139858,0.0058543463,0.033841792,-0.05831836,0.004042376,-0.13897072,0.0042135892,-0.005619984,-0.043549716,-0.005907089,-0.07454476,0.083596215,0.04025039,0.03140864,0.07681259,-0.027448941,0.018343344,-0.15333217,-0.034891233,0.049403936,-0.034693472,0.11441815,-0.02062937,-0.043794937,-0.0124856075,0.007639831,0.04816309,-0.035232604,0.03678452,0.061434727,0.017074253,0.01939338,-0.01523738,-0.00423116,0.045932494,-0.0083264895,0.01585034,0.059514135,-0.00918051,-0.014988148,-0.06762526,-0.07328121,-0.039639547,-0.07592969,0.022783475,0.08009244,-0.021901524,0.016690724,3.857909e-33,0.096436955,0.061698996,-0.05794522,-0.0141536305,-0.018940443,-0.014195078,-0.002279261,0.089794956,-0.08377998,-0.022681868,0.06835092,-0.030290166,0.068115026,0.017522315,0.04475265,0.025644332,0.092251316,0.047560018,-0.07287112,0.0041140104,-0.032728598,-0.034214903,-0.09297428,-0.062267225,-0.007878036,0.00504695,0.015190953,0.0685869,-0.059300277,-0.025944712,0.07010255,-0.009648436,0.011402587,0.052074485,0.0017910977,0.1041135,0.012168339,-0.07342392,0.033401288,-0.09780909,-0.04589645,0.027853921,-0.01983406,0.09239142,-0.012382827,-0.03981183,0.005085229,0.041459538,-0.08423465,0.010074618,-0.08320346,-0.028330497,0.042422898,0.004081539,-0.04561825,0.054545555,0.013089515,0.059325814,0.03164391,0.013329765,0.013429232,0.054203305,0.008320451,0.088434756,0.024797663,0.034834504,-0.015730325,-0.009239166,-0.030403208,-0.0537002,0.042600103,-0.009559006,0.03537034,0.026207022,-0.015997246,-0.02279962,0.011323372,0.034805734,-0.00011506968,0.06145515,0.026066305,-0.003490018,-0.026824249,0.04367661,0.019686196,0.014217378,0.04134928,0.031210925,-0.0029417444,-0.055945873,0.007755524,0.079662904,0.070181906,-0.053064816,0.008652865,-1.4479996e-08,0.02998711,-0.037417926,0.06350311,0.09183395,0.053494066,0.05868661,-0.02926081,-0.014544148,-0.031856358,0.04178824,0.055905323,0.034898136,-0.038873747,-0.052514017,0.053542905,-0.023016382,-0.029626403,0.043376405,-0.05715612,-0.13761602,0.036554016,0.025227409,0.0022908251,-0.032115445,0.0070252367,-0.06363674,-0.035700973,-0.0017242541,0.01163122,-0.061393388,-0.01344757,0.18389244,-0.0076987934,-0.01579383,0.029754715,-0.022259856,-0.0098021105,-0.011900221,0.062330283,-0.025128655,-0.042132735,-0.05619325,-0.041269984,-0.032421958,-0.015781797,0.046427242,0.0011591761,-0.054149467,0.036491364,-0.066533096,-0.0434341,-0.022845598,0.054748934,0.07311267,0.030016437,0.061779525,0.016192326,0.012287961,-0.0053639263,-0.008564248,0.15086378,0.068150416,0.017865676,0.011276224]'::vector, '2026-10-04 09:43:25.809367+00'),
('97ece161-a81f-4825-9249-3fa845b5c565', 'a95ee669-7ef9-402f-b585-521055492e40', 'd10a1b17-44b8-45f4-befd-c9e2ff3a2b9c', 'Hello Muhammad! How can I assist you with your travel plans today?', '[0.065032326,0.10378624,0.0594066,0.037576616,0.0014864354,-0.0012145909,0.043737795,-0.0711955,-0.11143693,-0.057988606,-0.019720199,-0.032162536,-0.034611374,0.057149123,0.071062215,0.0056156088,-0.013917215,-0.052530237,-0.030609436,-0.007900586,-0.033539813,0.007822382,0.025678271,0.021791946,-0.027938448,0.06331563,0.050338965,0.024037922,0.014593558,-0.052527327,0.015040301,0.008813665,-0.060606606,-0.012274911,0.044489108,0.051318225,0.022008173,-0.048795827,0.09937022,0.02922357,0.08293324,-0.003545718,-0.007831009,0.031269945,0.029992301,-0.0059595783,-0.018710908,0.09256681,0.08417647,0.026482431,-0.0626864,0.036124203,0.020402748,-0.05416224,0.04663042,0.012653722,-0.011919014,-0.0057633705,-0.0056817154,-0.040972095,-0.039814543,0.052164532,-0.016796239,0.013006348,-0.094617605,-0.046665665,-0.055193067,0.03940369,0.014833526,0.032467365,-0.09147016,0.020610245,-0.018030439,0.0067251036,-0.06628914,-0.07075789,0.014781395,-0.07966806,-0.030863889,0.017558247,-0.025858242,-0.009318338,-0.056454662,0.03260085,0.012320734,-0.05765855,-0.009785488,0.050333418,0.036192924,-0.034005918,0.0438926,-0.04865944,-0.001971566,-0.0015444561,-0.07794413,-0.026196657,-0.052710794,0.00042970089,-0.07197466,0.063808806,0.06854328,0.076826945,0.0993189,-0.0038988173,-0.019389743,0.086902425,-0.0862402,0.03792234,-0.024358442,-0.040080473,-0.06887883,-0.033398435,0.013423088,-0.06947536,0.04065866,0.044591513,-0.09168998,0.07108178,0.0056722355,0.015322312,0.01788,-0.035595298,0.08972402,0.026821762,-0.0361271,-0.0521685,0.051637232,-4.0704574e-33,0.013979952,0.006773294,-0.0127224075,0.11014987,-0.03010778,-0.06987532,-0.090710476,-0.017003506,-0.056987803,-0.020289835,0.083475165,0.0047502164,0.056428604,0.06333884,-0.05990678,-0.006115159,0.023043687,0.013032416,0.05469424,-0.0186831,0.042034015,-0.123802304,0.0039792,0.030754345,0.1135602,0.031711705,0.10172359,-0.081924655,0.10780128,0.039721422,-0.04017796,0.048968554,-0.051951867,-0.058206495,-0.041125245,0.094459124,-0.0888443,-0.07565252,-0.08618414,-0.052116156,-0.0075039323,0.006210389,0.050384972,0.018393466,-0.050795443,0.04195551,0.06885084,-0.018350724,0.069126606,0.044063445,-0.12211368,-0.06533034,-0.069563955,-0.066637576,-0.004926099,-0.114693396,-0.02064709,-0.0066005997,0.040273275,0.013489333,0.021653464,-0.060936987,-0.06863335,0.03816933,0.0077194874,-0.09164075,-0.05112177,-0.0025813575,0.036858186,-0.005964656,0.02489665,0.04126117,0.052307773,0.037593905,0.024638703,0.051101983,-0.01778192,-0.011969382,0.067242414,0.008302606,0.014892072,0.059669778,-0.047812007,0.021256851,0.061240416,0.0025618875,0.06365591,-0.011121554,-0.052695293,-0.054295816,-0.056885753,0.055437285,0.048158687,-0.014541615,-0.06276138,2.0917053e-33,0.062168326,0.0395847,0.024829539,-0.04287084,0.030648978,-0.029863458,0.09589876,0.0526476,0.03663051,0.011735563,-0.10454744,-0.017206484,0.068207145,-0.027639385,-0.0105138505,-0.07490382,0.07998732,-0.013568891,-0.04101252,0.03096022,-0.07803869,0.06255864,-0.06834463,-0.02464504,0.00924318,0.08548476,0.06153373,-0.0039716642,-0.06707292,-0.0065339054,-0.057527717,-0.009188025,-0.10357688,0.07375067,-0.021023184,0.080340564,-0.04756018,0.054811195,-0.055782802,0.026542937,0.011722293,0.03784705,0.013622311,0.031509697,-0.027886942,0.10589216,0.024819707,0.008754767,0.019700937,-0.02257812,0.0036237184,0.032324374,-0.04753938,-0.06152599,0.051286153,0.018188046,-0.045218494,-0.09095549,0.01866792,-0.066020206,-0.09120649,-0.022678338,0.08433526,0.07169137,-0.025542222,-0.049740896,0.024961961,-0.012292122,0.06147402,-0.0084895855,-0.012925955,-0.005019254,-0.006654809,0.012428615,0.030655956,-0.0016300328,0.058951203,0.03368892,-0.044577263,-0.005246983,0.030473597,-0.008960055,-0.0806656,-0.052176762,0.06856455,-0.015195474,-0.020261966,-0.0033243706,0.045485247,0.032147035,-0.074249454,0.044867273,0.025890749,0.0036630305,-0.043728612,-1.771146e-08,-0.017570479,-0.00077658833,0.054712266,-0.006095934,0.047310878,0.010588732,-0.03806506,0.027278908,-0.051583596,-0.015311492,0.060715396,0.07414817,-0.08157923,0.075541,0.017284006,0.036932208,0.019741593,0.010925275,-0.001211161,-0.094277576,-0.03424596,0.024024725,-0.015645148,0.037125546,0.033694852,0.11456667,-0.05586907,0.06908093,0.03816687,0.07701715,0.03891035,0.051811226,-0.11283801,-0.04158712,-0.037504688,-0.08261222,-0.070788436,-0.013737591,0.02524639,-0.03638149,-0.0025140909,0.016431699,-0.03462886,0.05113732,0.012712356,-0.03200698,-0.0014472057,-0.045234356,-0.071326025,-0.054901455,-0.08566537,-0.030909965,0.093763985,0.035364445,0.05036497,0.04001795,0.016325,-0.11662167,0.005133211,0.039275333,0.045997005,-0.024363779,-0.1043126,-0.025907304]'::vector, '2026-10-04 09:43:25.832597+00');

-- Table: assistant_messages (2 rows)
INSERT INTO "assistant_messages" ("id", "conversation_id", "role", "content", "created_at") VALUES
('3567e440-fdae-497f-998b-f9228a20804f', 'd10a1b17-44b8-45f4-befd-c9e2ff3a2b9c', 'user', 'Hi', '2026-10-04 09:43:25.794+00'),
('a95ee669-7ef9-402f-b585-521055492e40', 'd10a1b17-44b8-45f4-befd-c9e2ff3a2b9c', 'assistant', 'Hello Muhammad! How can I assist you with your travel plans today?', '2026-10-04 09:43:25.799+00');

-- Table: communities (1 rows)
INSERT INTO "communities" ("id", "name", "slug", "email", "password_hash", "phone", "tagline", "description", "avatar_url", "cover_url", "city", "state", "country", "instagram_handle", "website_url", "is_onboarded", "verification_status", "is_verified", "verification_doc_url", "verification_notes", "verified_at", "rating", "total_trips_count", "created_at", "updated_at", "deleted_at", "email_verified_at", "is_email_verified") VALUES
('9510b781-b2cb-42c1-b592-c84c122181a9', 'Voymate', 'voymate', 'voymate@gmail.com', '$2b$12$d0mxXJzfLp7KujKd5Q7aoeX4RC0lFJTnIwXQiG20HIPwGsy/b38rm', NULL, 'We make the travel experience unforgettable!', 'We are hosting community based camps, trekking and group trips in regular intervals.', 'communities/avatars/a521d59c-83fc-4536-8794-8ad69abf44c4', 'communities/covers/55f3c7db-06ab-4ce7-ab76-9362c03f5206', 'Kannur', 'Kerala', 'India', 'https://www.instagram.com/nasif_pariyaram/', NULL, TRUE, 'PENDING', FALSE, 'communities/verifications/d3cb952e-356b-4032-9eb9-72a353c87576', NULL, NULL, '5.00', '1', '2026-10-13 15:31:22.289+00', '2026-10-13 16:35:53.946+00', NULL, '2026-10-13 15:31:37.032+00', TRUE);

-- Table: community_trip_bookings (1 rows)
INSERT INTO "community_trip_bookings" ("id", "booking_code", "trip_id", "user_id", "contact_name", "contact_phone", "emergency_phone", "note", "amount", "currency", "razorpay_order_id", "razorpay_payment_id", "booked_at", "created_at") VALUES
('11b9a1b1-8412-4360-81fd-94375fcd8eeb', 'VM-YELLAPET-7435', 'cff591ce-6403-4eb2-9040-6f20ba498756', 'abaa0ce0-ad3f-4e50-8db8-de0bb9e1b890', 'Muhammad Nasif', '9446574453', '9446574453', NULL, '2500.00', 'INR', 'order_TnSiAny6Xkck15', 'pay_TnSijMU7n12qTi', '2026-10-13 16:42:18.597+00', '2026-10-13 16:42:18.597+00');

-- Table: community_trips (1 rows)
INSERT INTO "community_trips" ("id", "community_id", "title", "slug", "category", "pricing_type", "price", "currency", "price_note", "destination_name", "city", "state", "country", "date_from", "date_to", "duration_text", "max_capacity", "joined_count", "description", "itinerary", "gallery", "inclusions", "exclusions", "status", "created_at", "updated_at", "deleted_at") VALUES
('cff591ce-6403-4eb2-9040-6f20ba498756', '9510b781-b2cb-42c1-b592-c84c122181a9', 'Yellapetty Camping in Munnar', 'yellapetty-camping-in-munnar', 'CAMP', 'PAID', '2500.00', 'INR', NULL, 'Yellappetti', 'Munnar', 'Kerala', 'India', '2026-11-15', '2026-11-16', '1 Night/ 1 Day', '15', '1', 'Yellapetty means ΓÇÿlast villageΓÇÖ in Tamil. Yellapetty is a small village in Munnar, which is situated at border between Kerla and Tamilnadu and on the mountains of western ghat.', 'Day 1\r\n\r\n03:00 pm Arrive at assemble point.\r\n03:45 pm Trek To camp Site. [Distance: 2 km, Nature walk]\r\n05:00 pm Welcome drink.\r\n05:30 pm Assigning Tent.\r\n07:00 pm Camp Fire.\r\n08:45 pm Dinner.\r\n11:30 pm Tent stay along with sleeping bags.\r\n\r\nDay: 2\r\n\r\n05:00 am Wakeup Call\r\n05:30 am Sunrise Trek to Top Valley Hills(1.7KM)\r\n08:00 am Breakfast\r\n11:00 am Trek back to yellapetty post office ΓÇô assemble point.\r\n12:00 pm Signoff.', '{community-trips/gallery/78d7435a-17bf-4a82-898c-e72dcabbc46e,community-trips/gallery/e1818b06-6537-42c4-be32-38446225551e,community-trips/gallery/684e11c8-519d-4ec2-bd40-293de2507c28}', 'Tent stay on sharing basis with sleeping bag\r\nWelcome drink, Dinner and Breakfast\r\nCampfire\r\nSunrise trek\r\nFirst Aid Kit', 'Travel till assemble point and back\r\nMineral water/lime water/ purchased for personal consumption\r\nAll kinds of Extra Meals / soft drinks ordered.\r\nAny kind of personal expenses.\r\nAny kind of cost which is not mentioned in the cost includes above.\r\nAll expenses incurred due to unforeseen and unavoidable circumstances like roadblocks, bad weather.\r\nAny medical / Emergency evacuations if required.', 'PUBLISHED', '2026-10-13 16:35:53.851+00', '2026-10-13 16:42:18.64+00', NULL);

-- Table: connection_requests (2 rows)
INSERT INTO "connection_requests" ("id", "senderId", "receiverId", "matchId", "message", "status", "createdAt", "respondedAt") VALUES
('27ec195b-50e8-42bb-a5d6-ed5fb879ef6e', 'abaa0ce0-ad3f-4e50-8db8-de0bb9e1b890', '55851855-c255-492b-ae4c-134f8de8cbd1', NULL, 'dsaf', 'CANCELLED', '2026-10-03 17:12:03.335', '2026-10-08 07:08:19.655'),
('73ce7018-8b78-4aed-9184-52b39159551b', 'abaa0ce0-ad3f-4e50-8db8-de0bb9e1b890', '8a42279b-ef33-456f-acbb-72ab7cdb5f21', NULL, 'adsfsd', 'CANCELLED', '2026-10-03 17:21:32.676', '2026-10-08 07:08:21.001');

-- Table: destinations (7 rows)
INSERT INTO "destinations" ("id", "place_id", "name", "city", "state", "country_code", "latitude", "longitude", "created_at", "cover_url") VALUES
('87180d9c-3f2b-4d4f-bb0b-34e81311d68d', 'places/ChIJm8At9A6kBjkROaIyEamDtVI', 'Spiti Valley, Marango Rangarik, Himachal Pradesh', 'Marango Rangarik', 'Himachal Pradesh', 'IN', '32.24613700', '78.03491600', '2026-10-01 19:14:02.858+00', 'https://images.unsplash.com/photo-1651319488864-dc54d08437df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5NzgzMTV8MHwxfHNlYXJjaHwxfHxTcGl0aSUyMFZhbGxleSUyQyUyME1hcmFuZ28lMjBSYW5nYXJpayUyQyUyMEhpbWFjaGFsJTIwUHJhZGVzaHxlbnwwfDB8fHwxNzkwODgyMDQyfDA&ixlib=rb-4.1.0&q=80&w=1080'),
('23474c88-eb31-4471-8843-62f94c3d31b4', 'places/ChIJP9A_FgiHBDkRzXZQvg6oKYE', 'Manali, Himachal Pradesh, India', 'Manali', 'Himachal Pradesh', 'IN', '32.24318720', '77.18917610', '2026-10-03 09:18:29.296+00', 'https://images.unsplash.com/photo-1597167231350-d057a45dc868?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5NzgzMTV8MHwxfHNlYXJjaHwxfHxNYW5hbGklMkMlMjBIaW1hY2hhbCUyMFByYWRlc2glMkMlMjBJbmRpYXxlbnwwfDB8fHwxNzkxMDE5MTA5fDA&ixlib=rb-4.1.0&q=80&w=1080'),
('95ada168-feb4-4314-8754-b00b7a53de64', 'places/ChIJQbc2YxC6vzsRkkDzYv-H-Oo', 'Goa, India', NULL, 'Goa', 'IN', '15.29932650', '74.12399600', '2026-10-03 09:22:46.591+00', 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5NzgzMTV8MHwxfHNlYXJjaHwxfHxHb2ElMkMlMjBJbmRpYXxlbnwwfDB8fHwxNzkxMDE5MzY2fDA&ixlib=rb-4.1.0&q=80&w=1080'),
('97385c76-ee10-4feb-8c42-a26a03373a28', 'places/ChIJW_Wc1P8SCDsRmXw47fuQvWQ', 'Kerala, India', NULL, 'Keralam', 'IN', '10.16315260', '76.64127120', '2026-10-03 09:27:17.726+00', 'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5NzgzMTV8MHwxfHNlYXJjaHwxfHxLZXJhbGElMkMlMjBJbmRpYXxlbnwwfDB8fHwxNzkxMDE5NjM3fDA&ixlib=rb-4.1.0&q=80&w=1080'),
('7ff1a7e0-5158-494b-a49e-4d3ba09d4c40', 'places/ChIJCZwnAsLcCTkRBcCcaGM7xAc', 'Uttarakhand, India', NULL, 'Uttarakhand', 'IN', '30.06675300', '79.01929970', '2026-10-03 15:41:20.531+00', 'https://images.unsplash.com/photo-1608942025318-1191eeade556?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5NzgzMTV8MHwxfHNlYXJjaHwxfHxVdHRhcmFraGFuZCUyQyUyMEluZGlhfGVufDB8MHx8fDE3OTEwNDIwODB8MA&ixlib=rb-4.1.0&q=80&w=1080'),
('dddd5b48-04dd-40c1-a16e-0284f721a361', 'places/ChIJfYp-jTQ6BjkRiA0pt9R6EZQ', 'Chitkul, Himachal Pradesh, India', 'Chitkul', 'Himachal Pradesh', 'IN', '31.35078720', '78.43662660', '2026-10-03 15:45:02.783+00', 'https://images.unsplash.com/photo-1691243688591-69230d8d3c80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5NzgzMTV8MHwxfHNlYXJjaHwxfHxDaGl0a3VsJTJDJTIwSGltYWNoYWwlMjBQcmFkZXNoJTJDJTIwSW5kaWF8ZW58MHwwfHx8MTc5MTA0MjMwMnww&ixlib=rb-4.1.0&q=80&w=1080'),
('e98462fe-3832-4d54-b3ed-3c439c1f93f2', 'places/ChIJ6TGqdERcBDkRnZRHK-PSEvE', 'Kasol, Himachal Pradesh, India', 'Kasol', 'Himachal Pradesh', 'IN', '32.00999860', '77.31496250', '2026-10-03 15:48:56.012+00', 'https://images.unsplash.com/photo-1635262132278-40d2468da96c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5NzgzMTV8MHwxfHNlYXJjaHwxfHxLYXNvbCUyQyUyMEhpbWFjaGFsJTIwUHJhZGVzaCUyQyUyMEluZGlhfGVufDB8MHx8fDE3OTEwNDI1MzV8MA&ixlib=rb-4.1.0&q=80&w=1080');

-- Table: trips (8 rows)
INSERT INTO "trips" ("id", "name", "destination_id", "date_from", "date_to", "budget_style", "travel_style", "status", "created_by", "created_at", "updated_at", "deleted_at") VALUES
('1dd69210-b562-4648-bdb6-fcd083b2c09d', 'Spiti Valley Trip', '87180d9c-3f2b-4d4f-bb0b-34e81311d68d', '2026-10-15', '2026-10-20', 'BUDGET', 'ADVENTURE', 'UPCOMING', 'abaa0ce0-ad3f-4e50-8db8-de0bb9e1b890', '2026-10-01 19:14:02.911+00', '2026-10-01 19:14:02.911+00', NULL),
('8d6ee062-73b3-41af-8c47-4ff3d723690e', 'Manali Trip', '23474c88-eb31-4471-8843-62f94c3d31b4', '2026-10-15', '2026-10-25', 'BUDGET', 'ADVENTURE', 'UPCOMING', 'f3a10862-66dd-46d0-a7ee-91f5b6dc512a', '2026-10-03 09:18:29.326+00', '2026-10-03 09:18:29.326+00', NULL),
('da80c97f-991c-4809-8955-ae385283cba4', 'Goa Trip', '95ada168-feb4-4314-8754-b00b7a53de64', '2026-10-07', '2026-10-14', 'MODERATE', 'LEISURE', 'UPCOMING', '55851855-c255-492b-ae4c-134f8de8cbd1', '2026-10-03 09:22:46.616+00', '2026-10-03 09:22:46.616+00', NULL),
('cb8702b6-c9b5-48b6-b2fb-49d770a10a9c', 'Kerala Trip', '97385c76-ee10-4feb-8c42-a26a03373a28', '2026-10-14', '2026-10-21', 'BUDGET', 'LEISURE', 'UPCOMING', '58fe1116-c2c3-48ac-9c09-72a41b6dd882', '2026-10-03 09:27:17.756+00', '2026-10-03 09:27:17.756+00', NULL),
('43eb3cd5-3a57-4c39-b700-71be79fff572', 'Uttarakhand Trip', '7ff1a7e0-5158-494b-a49e-4d3ba09d4c40', '2026-10-21', '2026-10-27', 'BUDGET', 'ADVENTURE', 'UPCOMING', '302c16a9-5768-4b8e-bf93-9dc0072cc65d', '2026-10-03 15:41:20.678+00', '2026-10-03 15:41:20.678+00', NULL),
('dd3ca517-c0f4-4118-8685-5568999a0af2', 'Chitkul Trip', 'dddd5b48-04dd-40c1-a16e-0284f721a361', '2026-10-19', '2026-10-27', 'BUDGET', 'ADVENTURE', 'UPCOMING', 'fe6244c3-bbd5-4143-bef1-4f5347ff6381', '2026-10-03 15:45:02.797+00', '2026-10-03 15:45:02.797+00', NULL),
('7acaa735-64a9-4c8b-ab45-adb293c9daf9', 'Kasol Trip', 'e98462fe-3832-4d54-b3ed-3c439c1f93f2', '2026-10-13', '2026-10-26', 'MODERATE', 'ADVENTURE', 'UPCOMING', '8a42279b-ef33-456f-acbb-72ab7cdb5f21', '2026-10-03 15:48:56.03+00', '2026-10-03 15:48:56.03+00', NULL),
('237fc066-bf39-45d8-80a5-3bc22e88c998', 'Kerala Trip', '97385c76-ee10-4feb-8c42-a26a03373a28', '2026-10-21', '2026-10-26', 'MODERATE', 'LEISURE', 'UPCOMING', 'abaa0ce0-ad3f-4e50-8db8-de0bb9e1b890', '2026-10-03 17:11:05.898+00', '2026-10-03 17:11:05.898+00', NULL);

-- Table: user_interests (21 rows)
INSERT INTO "user_interests" ("id", "user_id", "interest") VALUES
('c31f5c6e-d7ce-44a3-baec-f818b1b730c7', 'abaa0ce0-ad3f-4e50-8db8-de0bb9e1b890', 'Mountains'),
('7d15938c-bfaf-4ba2-b825-0b22b5388491', 'abaa0ce0-ad3f-4e50-8db8-de0bb9e1b890', 'Culture'),
('136b28aa-5852-4a90-894d-5a090b627e0e', 'abaa0ce0-ad3f-4e50-8db8-de0bb9e1b890', 'Hiking'),
('ad08e3e0-83ef-4b44-94f5-94243f4ef384', 'f3a10862-66dd-46d0-a7ee-91f5b6dc512a', 'Mountains'),
('6f154674-0114-4939-acde-986dacab03b2', 'f3a10862-66dd-46d0-a7ee-91f5b6dc512a', 'Culture'),
('f3c3bd0e-ff3c-4d0c-842f-4ee56fcb6229', 'f3a10862-66dd-46d0-a7ee-91f5b6dc512a', 'Foodie'),
('747fb871-2597-45aa-8866-998b0677faee', '55851855-c255-492b-ae4c-134f8de8cbd1', 'Beach'),
('dd93cdb4-64d7-4bf6-99e6-7fb1cfa477b5', '55851855-c255-492b-ae4c-134f8de8cbd1', 'Mountains'),
('b4c8cd85-68ad-4873-bb6f-0e2522f831e9', '55851855-c255-492b-ae4c-134f8de8cbd1', 'Party'),
('133c8121-f18f-496e-a216-e24bac695b51', '58fe1116-c2c3-48ac-9c09-72a41b6dd882', 'Beach'),
('853c121e-a467-4192-9b77-94242cac48da', '58fe1116-c2c3-48ac-9c09-72a41b6dd882', 'Party'),
('0a81c543-e3ea-4498-8b95-3797fda4581d', '58fe1116-c2c3-48ac-9c09-72a41b6dd882', 'Culture'),
('a9370672-224c-4c3d-bef0-407aa3cfde11', '302c16a9-5768-4b8e-bf93-9dc0072cc65d', 'Mountains'),
('5b43728c-1afe-44e1-81a6-8927289e2d9a', '302c16a9-5768-4b8e-bf93-9dc0072cc65d', 'Party'),
('1cd0e4ef-2d8d-4e1d-8bfb-332ac614b45d', '302c16a9-5768-4b8e-bf93-9dc0072cc65d', 'Culture'),
('9a3acd64-6b28-443f-97fc-801b45074a0a', 'fe6244c3-bbd5-4143-bef1-4f5347ff6381', 'Mountains'),
('62153e98-e2f0-41f1-89df-c0105855944e', 'fe6244c3-bbd5-4143-bef1-4f5347ff6381', 'Party'),
('9faee968-e296-49c4-abf7-92401ac93f46', 'fe6244c3-bbd5-4143-bef1-4f5347ff6381', 'Culture'),
('cc92c44c-3c83-4be5-a91a-61024088794a', '8a42279b-ef33-456f-acbb-72ab7cdb5f21', 'Mountains'),
('b904678d-d98f-4429-b5b9-294c16928db4', '8a42279b-ef33-456f-acbb-72ab7cdb5f21', 'Foodie'),
('3688a002-3042-4367-971e-e719d4dd9bf2', '8a42279b-ef33-456f-acbb-72ab7cdb5f21', 'Culture');

-- Table: user_languages (16 rows)
INSERT INTO "user_languages" ("id", "user_id", "language") VALUES
('1d7e4f8a-3ecc-41ef-bdc5-bff7a237b937', 'abaa0ce0-ad3f-4e50-8db8-de0bb9e1b890', 'Arabic'),
('65b56b14-169d-45e8-9c7f-3caeb2c762c6', 'abaa0ce0-ad3f-4e50-8db8-de0bb9e1b890', 'Bengali'),
('c2a63798-3299-4ac8-910a-0cfa3dc96fd1', 'f3a10862-66dd-46d0-a7ee-91f5b6dc512a', 'English'),
('37f3b39c-d1fe-439b-a2c2-00bef61a0db3', 'f3a10862-66dd-46d0-a7ee-91f5b6dc512a', 'Chinese'),
('2db0695c-bb8e-49f6-9056-0ecd655c1e6a', '55851855-c255-492b-ae4c-134f8de8cbd1', 'Bengali'),
('d27d36be-e3fb-4e33-9abf-7c72689177e0', '55851855-c255-492b-ae4c-134f8de8cbd1', 'Chinese'),
('21f35923-9c49-48e6-91de-55b1b73eb2f2', '58fe1116-c2c3-48ac-9c09-72a41b6dd882', 'Hindi'),
('4c23a3c1-aaa7-476e-bee9-d360f98bf94d', '58fe1116-c2c3-48ac-9c09-72a41b6dd882', 'Gujarati'),
('bb83739b-b7f9-4890-822b-58e6c526339c', '302c16a9-5768-4b8e-bf93-9dc0072cc65d', 'Japanese'),
('c06540d3-2b9e-4701-b3ee-de69ec0f43a1', '302c16a9-5768-4b8e-bf93-9dc0072cc65d', 'English'),
('f9a1bee6-187f-4579-9493-ebbde3933eeb', 'fe6244c3-bbd5-4143-bef1-4f5347ff6381', 'Arabic'),
('fd97bd95-3132-4070-8030-ce77c5dfa223', 'fe6244c3-bbd5-4143-bef1-4f5347ff6381', 'Gujarati'),
('1b9ed99a-7de9-49a1-bd2e-ba04045dbe9a', 'fe6244c3-bbd5-4143-bef1-4f5347ff6381', 'Hindi'),
('b8ff2ca4-6b9a-4fc8-8d88-097bebedcc3d', '8a42279b-ef33-456f-acbb-72ab7cdb5f21', 'Arabic'),
('c2c35c11-291a-4713-9933-995bffe32e31', '8a42279b-ef33-456f-acbb-72ab7cdb5f21', 'Bengali'),
('ed04da4f-033e-44ad-9023-3cb58b3930b9', '8a42279b-ef33-456f-acbb-72ab7cdb5f21', 'English');

-- Table: user_locations (7 rows)
INSERT INTO "user_locations" ("user_id", "last_seen_at", "current_lat", "current_lng", "current_city", "current_state", "coordinates", "updated_at", "online_status", "current_country_code") VALUES
('f3a10862-66dd-46d0-a7ee-91f5b6dc512a', '2026-10-03 09:18:32.141+00', '10.01198807', '76.36640693', 'Kochi', NULL, NULL, '2026-10-03 09:18:31.868+00', 'ONLINE', 'IN'),
('fe6244c3-bbd5-4143-bef1-4f5347ff6381', '2026-10-04 03:13:52.109+00', '10.01200697', '76.36634888', 'Kochi', NULL, '0101000020E61000002EF18F4272175340C5FD07C725062440'::geography, '2026-10-03 15:45:05.33+00', 'ONLINE', 'IN'),
('8a42279b-ef33-456f-acbb-72ab7cdb5f21', '2026-10-03 15:48:58.924+00', '10.01174260', '76.36668709', 'Kochi', NULL, NULL, '2026-10-03 15:48:58.507+00', 'ONLINE', 'IN'),
('302c16a9-5768-4b8e-bf93-9dc0072cc65d', '2026-10-03 15:41:23.177+00', '10.03159200', '76.30343600', 'Palarivattam', NULL, NULL, '2026-10-03 15:41:23.065+00', 'ONLINE', 'IN'),
('55851855-c255-492b-ae4c-134f8de8cbd1', '2026-10-03 09:22:49.17+00', '10.05743350', '76.33477280', 'Kalamassery', NULL, NULL, '2026-10-03 09:22:49.167+00', 'ONLINE', 'IN'),
('58fe1116-c2c3-48ac-9c09-72a41b6dd882', '2026-10-03 14:09:51.909+00', '10.09236390', '76.32352390', 'Aluva', NULL, NULL, '2026-10-03 09:27:20.454+00', 'ONLINE', 'IN'),
('abaa0ce0-ad3f-4e50-8db8-de0bb9e1b890', '2026-10-13 16:58:50.556+00', '12.06157300', '75.32526600', 'Koranpeedika', NULL, '0101000020E61000000C207C28D1D452401AA20A7F861F2840'::geography, '2026-10-01 18:33:53.775+00', 'ONLINE', 'IN');

-- Table: user_onboarding (7 rows)
INSERT INTO "user_onboarding" ("user_id", "onboarding_step", "onboarding_completed", "completed_at", "updated_at", "onboarding_source") VALUES
('abaa0ce0-ad3f-4e50-8db8-de0bb9e1b890', '3', TRUE, '2026-10-01 18:26:48.896+00', '2026-10-01 15:08:10.339+00', 'SOCIAL_MEDIA'),
('f3a10862-66dd-46d0-a7ee-91f5b6dc512a', '3', TRUE, '2026-10-03 09:18:09.374+00', '2026-10-03 09:16:22.585+00', 'TRAVEL_BLOG'),
('55851855-c255-492b-ae4c-134f8de8cbd1', '3', TRUE, '2026-10-03 09:22:30.953+00', '2026-10-03 09:20:58.219+00', 'SEARCH_ENGINE'),
('58fe1116-c2c3-48ac-9c09-72a41b6dd882', '3', TRUE, '2026-10-03 09:26:57.634+00', '2026-10-03 09:25:34.092+00', 'APP_STORE'),
('302c16a9-5768-4b8e-bf93-9dc0072cc65d', '3', TRUE, '2026-10-03 15:41:04.079+00', '2026-10-03 15:39:08.531+00', 'FRIENDS_FAMILY'),
('fe6244c3-bbd5-4143-bef1-4f5347ff6381', '3', TRUE, '2026-10-03 15:44:30.123+00', '2026-10-03 15:42:50.624+00', 'SOCIAL_MEDIA'),
('8a42279b-ef33-456f-acbb-72ab7cdb5f21', '3', TRUE, '2026-10-03 15:48:40.432+00', '2026-10-03 15:47:27.52+00', 'SOCIAL_MEDIA');

-- Table: user_privacy_settings (7 rows)
INSERT INTO "user_privacy_settings" ("user_id", "show_online_status", "show_traveling_status", "updated_at", "profile_visibility", "requests_from") VALUES
('abaa0ce0-ad3f-4e50-8db8-de0bb9e1b890', TRUE, FALSE, '2026-10-01 15:08:01.302+00', 'EVERYONE', 'EVERYONE'),
('f3a10862-66dd-46d0-a7ee-91f5b6dc512a', TRUE, FALSE, '2026-10-03 09:16:04.331+00', 'EVERYONE', 'EVERYONE'),
('55851855-c255-492b-ae4c-134f8de8cbd1', TRUE, FALSE, '2026-10-03 09:20:31.407+00', 'EVERYONE', 'EVERYONE'),
('58fe1116-c2c3-48ac-9c09-72a41b6dd882', TRUE, FALSE, '2026-10-03 09:25:14.6+00', 'EVERYONE', 'EVERYONE'),
('302c16a9-5768-4b8e-bf93-9dc0072cc65d', TRUE, FALSE, '2026-10-03 15:38:49.241+00', 'EVERYONE', 'EVERYONE'),
('fe6244c3-bbd5-4143-bef1-4f5347ff6381', TRUE, FALSE, '2026-10-03 15:42:33.804+00', 'EVERYONE', 'EVERYONE'),
('8a42279b-ef33-456f-acbb-72ab7cdb5f21', TRUE, FALSE, '2026-10-03 15:47:10.91+00', 'EVERYONE', 'EVERYONE');

-- Table: user_status_history (7 rows)
INSERT INTO "user_status_history" ("id", "user_id", "status_code", "reason", "duration_days", "effective_from", "effective_until", "actioned_by", "created_at") VALUES
('3329f4d6-1280-47c0-bd85-f5695f604ef0', '8a42279b-ef33-456f-acbb-72ab7cdb5f21', 'BANNED', 'asdf asdfasd', NULL, '2026-10-11 07:06:24+00', NULL, NULL, '2026-10-11 07:06:24.01+00'),
('48f5cb01-1ed1-4410-9484-daa9023adbe4', '8a42279b-ef33-456f-acbb-72ab7cdb5f21', 'SUSPENDED', 'asdfa sdf asd', NULL, '2026-10-11 07:06:30.698+00', NULL, NULL, '2026-10-11 07:06:30.7+00'),
('cf833c06-7d2b-4814-9980-2a06b8bacc5f', '8a42279b-ef33-456f-acbb-72ab7cdb5f21', 'ACTIVE', '', NULL, '2026-10-11 07:23:49.897+00', NULL, NULL, '2026-10-11 07:23:49.906+00'),
('a866bd1c-59ce-4ec2-bebc-85e7efc17137', '8a42279b-ef33-456f-acbb-72ab7cdb5f21', 'BANNED', 'xcfadsf a', NULL, '2026-10-11 07:23:55.283+00', NULL, NULL, '2026-10-11 07:23:55.286+00'),
('27048976-4d13-4fc1-9c79-0d9507a81254', '8a42279b-ef33-456f-acbb-72ab7cdb5f21', 'ACTIVE', '', NULL, '2026-10-11 07:23:57.316+00', NULL, NULL, '2026-10-11 07:23:57.316+00'),
('cf6fe22b-5e61-4f79-a860-ee3f71790bf1', '8a42279b-ef33-456f-acbb-72ab7cdb5f21', 'SUSPENDED', 'gfda dsf', NULL, '2026-10-11 07:24:00.633+00', NULL, NULL, '2026-10-11 07:24:00.635+00'),
('fe276265-334f-4da0-8322-75fdc4b8fd77', '8a42279b-ef33-456f-acbb-72ab7cdb5f21', 'ACTIVE', '', NULL, '2026-10-11 07:24:02.797+00', NULL, NULL, '2026-10-11 07:24:02.798+00');

-- Table: user_travel_skills (14 rows)
INSERT INTO "user_travel_skills" ("id", "user_id", "skill") VALUES
('f25b3c97-825e-40b3-b08d-04de21cf8225', 'abaa0ce0-ad3f-4e50-8db8-de0bb9e1b890', 'Driving'),
('d16c8d8a-7602-4c61-af33-4e1f675a2304', 'f3a10862-66dd-46d0-a7ee-91f5b6dc512a', 'Driving'),
('3122ad7d-4be8-4fe1-ab4c-138e74083d53', 'f3a10862-66dd-46d0-a7ee-91f5b6dc512a', 'Swimming'),
('4529fe1b-3d73-424f-bef4-983384376718', '55851855-c255-492b-ae4c-134f8de8cbd1', 'Cooking'),
('1b694b5e-3fd3-4879-b983-ce2a85a45130', '55851855-c255-492b-ae4c-134f8de8cbd1', 'Driving'),
('63225c1f-b8dc-4a5c-a5f6-e30f07ff4037', '58fe1116-c2c3-48ac-9c09-72a41b6dd882', 'Swimming'),
('a16fc3d9-aafe-477c-9d86-ea3827a0e749', '58fe1116-c2c3-48ac-9c09-72a41b6dd882', 'Driving'),
('bc682507-cab3-49f9-ba7d-25037b6a48e4', '58fe1116-c2c3-48ac-9c09-72a41b6dd882', 'Cooking'),
('3fc1d440-dc42-44f2-9a37-a5bb2d781ae7', '302c16a9-5768-4b8e-bf93-9dc0072cc65d', 'Cooking'),
('34d36e19-fed8-4378-b915-f270fe403756', '302c16a9-5768-4b8e-bf93-9dc0072cc65d', 'Driving'),
('676a661d-def6-4f33-be20-7737c7d1d1e8', 'fe6244c3-bbd5-4143-bef1-4f5347ff6381', 'Photography'),
('ca43ae81-0945-4cd4-b1de-eb49405e55dc', 'fe6244c3-bbd5-4143-bef1-4f5347ff6381', 'Driving'),
('32888bd2-eb80-4b28-afab-ca5dcb749d0b', '8a42279b-ef33-456f-acbb-72ab7cdb5f21', 'Swimming'),
('403bde57-b29b-4ccd-b40f-2be58888b040', '8a42279b-ef33-456f-acbb-72ab7cdb5f21', 'Cooking');

-- Table: users (7 rows)
INSERT INTO "users" ("id", "full_name", "email", "phone", "password_hash", "avatar_url", "cover_url", "bio", "date_of_birth", "is_phone_verified", "is_email_verified", "is_id_verified", "is_traveling", "phone_verified_at", "email_verified_at", "id_verified_at", "deleted_at", "created_at", "updated_at", "gender", "travel_type", "travel_personality", "match_preference", "account_status", "country_code", "origin_region", "origin_city") VALUES
('302c16a9-5768-4b8e-bf93-9dc0072cc65d', 'Maria Philip', 'maria@gamil.com', NULL, '$2b$12$ml8cGccOTOFeqgs5WAs75.FH7kjQn1PfW/j.LkJFxD3P6Du61.Rba', 'users/profile-images/f0ba8a51-d820-48e1-9b2d-8c4b8aeb45e6', 'users/cover-images/1d9cc822-9ee4-4694-98c4-c45455ab1a84', 'A backpacker who loves to explore peaple.', '2003-07-17', FALSE, TRUE, FALSE, TRUE, NULL, '2026-10-03 15:39:05.445+00', NULL, NULL, '2026-10-03 15:38:49.212+00', '2026-10-03 15:38:49.212+00', 'FEMALE', 'BACKPACKER', 'AMBIVERT', 'EVERYONE', 'ACTIVE', 'IN', 'Kerala', 'Cherthala'),
('abaa0ce0-ad3f-4e50-8db8-de0bb9e1b890', 'Muhammad Nasif', 'nasifhima@gmail.com', NULL, NULL, 'users/profile-images/a2580b93-c432-4a63-8f1e-5945c8ae1b0e', 'users/cover-images/2d1d3c7e-e387-432d-89c8-c2335b067571', 'I am a passionate traveler!', '2003-02-12', FALSE, TRUE, FALSE, FALSE, NULL, NULL, NULL, NULL, '2026-10-01 15:08:01.287+00', '2026-10-01 15:08:01.287+00', 'MALE', 'BACKPACKER', 'INTROVERT', 'EVERYONE', 'ACTIVE', 'IN', 'Kerala', 'Kannur'),
('55851855-c255-492b-ae4c-134f8de8cbd1', 'Sarah Joseph', 'sarah@gmail.com', NULL, '$2b$12$H/GJkLSfg8piWxEqp0E.ZuCQtxri9m3ESNJsKvx5rqx05bXFZLnOS', 'users/profile-images/53942346-cc35-4560-8047-5279e64d57d9', 'users/cover-images/0595c322-34fc-4b12-9d8a-483faa723ad7', 'Solo traveler who loves to engage with strangers', '1985-06-18', FALSE, TRUE, FALSE, TRUE, NULL, '2026-10-03 09:20:45.476+00', NULL, NULL, '2026-10-03 09:20:31.404+00', '2026-10-03 09:20:31.404+00', 'MALE', 'BUDGET', 'INTROVERT', 'EVERYONE', 'ACTIVE', 'NP', 'Eastern Development Region', 'R├ä┬üjbir├ä┬üj'),
('58fe1116-c2c3-48ac-9c09-72a41b6dd882', 'Mariyam Jameela', 'mariyam@gmail.com', NULL, '$2b$12$OMVhxAGEcySJhrcLlGT88.l9t6JLtYbVLIUVH8kt.dftaVQ6.rSBW', 'users/profile-images/d906b301-6bff-43e0-b8c0-8b138ea79e2d', 'users/cover-images/16d09faa-e555-4df4-a96b-37341c9e234a', 'I am budget friendly traveler, who loves to explore the world.', '2002-06-18', FALSE, TRUE, FALSE, TRUE, NULL, '2026-10-03 09:25:31.745+00', NULL, NULL, '2026-10-03 09:25:14.595+00', '2026-10-03 09:25:14.595+00', 'FEMALE', 'BUDGET', 'EXTROVERT', 'EVERYONE', 'ACTIVE', 'IN', 'Goa', 'Chicalim'),
('f3a10862-66dd-46d0-a7ee-91f5b6dc512a', 'John Mathew', 'john@gmail.com', NULL, '$2b$12$UP8S7yj.EinamvqOMq.q1eN/HaN5Z4hJh.Em85Ebgi71lUVTTZSyy', 'users/profile-images/10c4ed79-1f6a-4ab6-8865-2a44caa0a4c7', 'users/cover-images/c3207549-e3b7-4029-81ab-620c51a86550', 'I am backpacker with great passion toward coding.', '1997-03-12', FALSE, TRUE, FALSE, FALSE, NULL, '2026-10-03 09:16:19.635+00', NULL, NULL, '2026-10-03 09:16:04.324+00', '2026-10-03 09:16:04.324+00', 'MALE', 'BACKPACKER', 'AMBIVERT', 'EVERYONE', 'ACTIVE', 'IN', 'Kerala', 'Ernakulam'),
('8a42279b-ef33-456f-acbb-72ab7cdb5f21', 'Melvin Joy', 'melvin@gmail.com', NULL, '$2b$12$icRsefibgdGnGlXSiVe./utKD8xw/1HxLjyfMmw7YwqJkhZEKkSXa', 'users/profile-images/dbeb4179-8427-4d11-9da7-72277c8fb309', 'users/cover-images/60bc577d-9515-4c41-b70a-fc1176c8b42e', 'A budget friendly traveler with great passion.', '2001-06-13', FALSE, TRUE, FALSE, FALSE, NULL, '2026-10-03 15:47:25.38+00', NULL, NULL, '2026-10-03 15:47:10.907+00', '2026-10-03 15:47:10.907+00', 'MALE', 'BACKPACKER', 'INTROVERT', 'EVERYONE', 'ACTIVE', 'IN', 'Kerala', 'Beypore'),
('fe6244c3-bbd5-4143-bef1-4f5347ff6381', 'Sinan Muahammad', 'sinan@gmail.com', NULL, '$2b$12$S2Al3RmgCvwyCHLpe.IRTuPWDhZVTf3uq7InpG2.H4jkO09u7uRfi', 'users/profile-images/42513fcb-b0a5-4360-a171-f0e3bb79a1ed', 'users/cover-images/bb52f0db-4612-40a6-9f6a-823e04c93bad', 'I am a backpacker who loves to explore deferent cultures.', '1999-07-14', FALSE, TRUE, FALSE, FALSE, NULL, '2026-10-03 15:42:47.638+00', NULL, NULL, '2026-10-03 15:42:33.801+00', '2026-10-03 15:42:33.801+00', 'MALE', 'BACKPACKER', 'AMBIVERT', 'EVERYONE', 'ACTIVE', 'IN', 'Kerala', 'Vaikam');

SET session_replication_role = 'origin';

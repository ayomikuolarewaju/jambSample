-- ================================================================
-- JAMB CBT — Seed Questions (12 per subject × 8 subjects = 96)
-- Run AFTER 001_schema.sql
-- ================================================================
do $$ declare
  eng uuid; mth uuid; phy uuid; che uuid;
  bio uuid; eco uuid; gov uuid; lit uuid;
begin
  select id into eng from subjects where code='ENG';
  select id into mth from subjects where code='MTH';
  select id into phy from subjects where code='PHY';
  select id into che from subjects where code='CHE';
  select id into bio from subjects where code='BIO';
  select id into eco from subjects where code='ECO';
  select id into gov from subjects where code='GOV';
  select id into lit from subjects where code='LIT';

-- ENGLISH
insert into questions(subject_id,question_text,option_a,option_b,option_c,option_d,correct_option,explanation) values
(eng,'Choose the word nearest in meaning to LOQUACIOUS.','Talkative','Quiet','Brilliant','Lazy','A','Loquacious means tending to talk a great deal.'),
(eng,'Which sentence is grammatically correct?','She don''t like him','They was going home','He has finished his work','We was playing football','C','Subject-verb agreement: He + has (singular).'),
(eng,'The word EPHEMERAL means:','Lasting forever','Short-lived','Very large','Deeply rooted','B','Ephemeral = something that lasts a very short time.'),
(eng,'Identify the figure of speech: "The wind whispered through the trees."','Simile','Metaphor','Personification','Hyperbole','C','Personification gives human qualities to non-human things.'),
(eng,'Choose the correct spelling:','Accomodate','Accommodate','Acomodate','Acommodate','B','Accommodate has double c and double m.'),
(eng,'The plural of curriculum is:','Curriculums','Curricula','Curriculae','Curriculum','B','Curricula is the correct Latin plural.'),
(eng,'Which word is an antonym of BENEVOLENT?','Kind','Generous','Malevolent','Caring','C','Malevolent means wishing evil to others.'),
(eng,'Select the correct form: "Neither John nor his brothers ___ attending."','is','are','was','be','B','Verb agrees with the closer subject: brothers → are.'),
(eng,'A word that imitates the sound it describes is:','Alliteration','Onomatopoeia','Assonance','Consonance','B','E.g. buzz, hiss, bang.'),
(eng,'The literary device in "As brave as a lion" is a:','Metaphor','Simile','Irony','Synecdoche','B','Simile uses ''as'' or ''like'' for comparison.'),
(eng,'Choose the correct preposition: "She is good ___ mathematics."','in','at','on','for','B','"Good at" is the correct collocation.'),
(eng,'The term SYNTAX refers to:','The study of word meanings','Rules governing sentence structure','The sounds of language','The history of words','B','Syntax = arrangement of words to form sentences.');

-- MATHEMATICS
insert into questions(subject_id,question_text,option_a,option_b,option_c,option_d,correct_option,explanation) values
(mth,'If 2x + 3 = 11, find x.','3','4','5','6','B','2x=8, x=4.'),
(mth,'What is the value of log₁₀(1000)?','2','3','4','10','B','log₁₀(10³)=3.'),
(mth,'Find the area of a circle with radius 7cm (π=22/7).','154 cm²','144 cm²','164 cm²','174 cm²','A','A=πr²=(22/7)×49=154.'),
(mth,'Simplify: (x²-4)÷(x-2)','x+2','x-2','x²+2','2x','A','x²-4=(x+2)(x-2); divide by (x-2) → x+2.'),
(mth,'What is 15% of 200?','25','30','35','40','B','(15/100)×200=30.'),
(mth,'The sum of angles in a triangle is:','90°','180°','270°','360°','B','Fundamental theorem of geometry.'),
(mth,'If P={2,3,5,7} and Q={1,2,3,4}, find P∩Q.','{2,3}','{1,2,3,4,5,7}','{2,3,5}','{1,4}','A','Intersection = common elements.'),
(mth,'Evaluate: 3²+4²','25','49','7','12','A','9+16=25.'),
(mth,'Find the gradient of y=3x²+2x-1 at x=1.','6','8','4','10','B','dy/dx=6x+2; at x=1: 8.'),
(mth,'Probability of a head on a fair coin:','1','0','1/2','1/4','C','1 out of 2 equally likely outcomes.'),
(mth,'Factorize: x²+5x+6','(x+2)(x+3)','(x-2)(x-3)','(x+1)(x+6)','(x+6)(x-1)','A','2×3=6, 2+3=5.'),
(mth,'The mean of 4,7,13,16 is:','9','10','11','12','B','Sum=40; mean=40/4=10.');

-- PHYSICS
insert into questions(subject_id,question_text,option_a,option_b,option_c,option_d,correct_option,explanation) values
(phy,'The unit of electric current is:','Volt','Ampere','Ohm','Watt','B','Current is measured in Amperes (A).'),
(phy,'Speed of light in vacuum:','3×10⁸ m/s','3×10⁶ m/s','3×10⁴ m/s','3×10¹⁰ m/s','A','c≈3×10⁸ m/s.'),
(phy,'Newton''s first law is also called the law of:','Acceleration','Inertia','Gravity','Motion','B','An object at rest stays at rest unless acted upon.'),
(phy,'Which wave requires a medium to travel?','Light','Radio','Sound','X-ray','C','Sound is a mechanical wave.'),
(phy,'Formula for kinetic energy:','KE=mgh','KE=½mv²','KE=mv','KE=Fd','B','KE=½mv².'),
(phy,'SI unit of pressure:','Newton','Pascal','Joule','Watt','B','Pressure=Force/Area; unit=Pascal.'),
(phy,'An object at rest on a shelf has ___ energy.','Kinetic','Zero','Potential','Thermal','C','Gravitational potential energy due to height.'),
(phy,'Ohm''s Law states V=','I/R','IR','I+R','I-R','B','V=IR.'),
(phy,'Heat transfer through vacuum occurs by:','Conduction','Convection','Radiation','Diffusion','C','Radiation needs no medium.'),
(phy,'Acceleration due to gravity on Earth:','9.8 m/s²','10.8 m/s²','8.9 m/s²','11 m/s²','A','g≈9.8 m/s².'),
(phy,'Work done when 10N moves object 5m:','2 J','50 J','0.5 J','15 J','B','W=F×d=10×5=50 J.'),
(phy,'Which is NOT a scalar quantity?','Speed','Mass','Velocity','Temperature','C','Velocity has direction → vector.');

-- CHEMISTRY
insert into questions(subject_id,question_text,option_a,option_b,option_c,option_d,correct_option,explanation) values
(che,'Atomic number of Carbon:','6','12','8','14','A','Carbon has 6 protons.'),
(che,'Chemical formula for water:','HO','H₂O','H₂O₂','HO₂','B','2 hydrogen + 1 oxygen.'),
(che,'Gas most responsible for greenhouse effect:','Oxygen','Nitrogen','Carbon dioxide','Hydrogen','C','CO₂ traps heat.'),
(che,'pH of a neutral solution:','0','7','14','10','B','pH 7 = neutral.'),
(che,'Bond formed by sharing electrons:','Ionic','Covalent','Metallic','Hydrogen','B','Covalent bonds share electron pairs.'),
(che,'Process of liquid to gas:','Condensation','Sublimation','Evaporation','Fusion','C','Evaporation = liquid → gas.'),
(che,'Element with atomic number 11:','Magnesium','Sodium','Potassium','Calcium','B','Sodium (Na) has 11 protons.'),
(che,'Which is a noble gas?','Chlorine','Oxygen','Argon','Fluorine','C','Argon is Group 18.'),
(che,'Reaction rate increases when temperature:','Decreases','Stays constant','Increases','Becomes zero','C','Higher temp → more collisions.'),
(che,'Avogadro''s number:','6.02×10²³','6.02×10²⁴','3.14×10²³','9.8×10²³','A','One mole = 6.02×10²³ particles.'),
(che,'Solid turning directly to gas:','Evaporation','Condensation','Sublimation','Freezing','C','Sublimation skips liquid phase.'),
(che,'An acid turns litmus paper:','Blue','Green','Red','Yellow','C','Acids turn blue litmus red.');

-- BIOLOGY
insert into questions(subject_id,question_text,option_a,option_b,option_c,option_d,correct_option,explanation) values
(bio,'Powerhouse of the cell:','Nucleus','Ribosome','Mitochondria','Golgi body','C','Mitochondria produce ATP.'),
(bio,'DNA stands for:','Deoxyribonucleic Acid','Diribonucleic Acid','Deoxyribose Acid','Dinucleic Acid','A','Carries genetic information.'),
(bio,'Photosynthesis occurs in:','Mitochondria','Chloroplast','Nucleus','Vacuole','B','Chloroplasts contain chlorophyll.'),
(bio,'Basic unit of life:','Atom','Molecule','Cell','Tissue','C','Smallest structural and functional unit.'),
(bio,'Universal blood donor type:','A','B','AB','O','D','O negative can donate to all types.'),
(bio,'Cell division processes include:','Meiosis only','Mitosis only','Both mitosis and meiosis','Osmosis','C','Mitosis = body cells; meiosis = gametes.'),
(bio,'Organ responsible for pumping blood:','Lungs','Kidney','Heart','Liver','C','Heart pumps blood throughout the body.'),
(bio,'Osmosis is movement of:','Solute high to low','Water through semipermeable membrane','Gas low to high','Ions across membrane','B','Water diffuses through semipermeable membrane.'),
(bio,'Vitamin produced by skin using sunlight:','Vitamin A','Vitamin C','Vitamin D','Vitamin K','C','UV light converts cholesterol to Vitamin D.'),
(bio,'Study of heredity is called:','Ecology','Genetics','Physiology','Taxonomy','B','Genetics = study of inherited traits.'),
(bio,'Site of protein synthesis in a cell:','Nucleus','Mitochondria','Ribosome','Vacuole','C','Ribosomes translate mRNA into proteins.'),
(bio,'Part of brain that controls balance:','Cerebrum','Cerebellum','Medulla','Thalamus','B','Cerebellum coordinates balance.');

-- ECONOMICS
insert into questions(subject_id,question_text,option_a,option_b,option_c,option_d,correct_option,explanation) values
(eco,'GDP stands for:','Gross Domestic Product','General Domestic Product','Gross Derived Product','General Derived Product','A','Measures total economic output.'),
(eco,'When demand rises and supply is constant, price will:','Fall','Rise','Stay same','Become zero','B','Higher demand → upward price pressure.'),
(eco,'Opportunity cost refers to:','Price of a good','What is given up when a choice is made','Cost of production','Tax on goods','B','Next best alternative foregone.'),
(eco,'Inflation means:','Fall in prices','Rise in general price level','Increase in production','Reduction in taxes','B','Sustained increase in overall price level.'),
(eco,'Which is a factor of production?','Money','Land','Tax','Interest','B','Land, labour, capital, entrepreneurship.'),
(eco,'A monopoly exists when:','Many sellers exist','Only one seller exists','Two sellers compete','Goods are free','B','Single seller, no close substitutes.'),
(eco,'The Nigerian currency is the:','Dollar','Pound','Naira','Franc','C','Naira (₦) is Nigeria''s currency.'),
(eco,'Devaluation means:','Increase in currency value','Decrease in currency value','Stable currency','Printing money','B','Lowers currency value relative to others.'),
(eco,'Nigeria''s apex bank:','First Bank','Central Bank of Nigeria','GTBank','Access Bank','B','CBN regulates monetary policy.'),
(eco,'Law of diminishing returns applies when:','Fixed factors only','More variable factors added to fixed','Both fixed and variable','Capital only','B','Adding more labour to fixed land.'),
(eco,'Which market has many sellers with identical products?','Monopoly','Oligopoly','Perfect competition','Monopolistic competition','C','Perfect competition: homogeneous product.'),
(eco,'Barter system involves:','Money for goods','Goods for goods','Buying on credit','Government distribution','B','Direct exchange without money.');

-- GOVERNMENT
insert into questions(subject_id,question_text,option_a,option_b,option_c,option_d,correct_option,explanation) values
(gov,'Nigeria operates a:','Unitary state','Federal state','Confederation','Monarchy','B','Nigeria is a federal republic with 36 states.'),
(gov,'The National Assembly consists of:','Senate only','House of Representatives only','Senate and House of Representatives','President and Ministers','C','Bicameral: 109-seat Senate + 360-seat House.'),
(gov,'The 1999 Constitution was promulgated under:','Obasanjo (civil)','Abdulsalami Abubakar','Babangida','Buhari','B','Gen. Abdulsalami handed over with 1999 constitution.'),
(gov,'Separation of powers was propounded by:','John Locke','Montesquieu','Rousseau','Hobbes','B','Montesquieu''s Spirit of the Laws (1748).'),
(gov,'The executive arm is headed by:','The President','The Speaker','The Chief Justice','Senate President','A','Nigeria''s President heads the executive.'),
(gov,'A bill becomes law after being signed by:','The Speaker','The Senate President','The President','The Chief Justice','C','Presidential assent converts bill to Act.'),
(gov,'INEC stands for:','Independent National Electoral Commission','International National Electoral Committee','Independent Nigerian Electoral Commission','Integrated National Electoral Commission','A','Nigeria''s electoral management body.'),
(gov,'Federalism was introduced in Nigeria in:','1914','1954','1960','1963','B','Lyttleton Constitution 1954.'),
(gov,'Rule of law means:','Government rules by force','Law is supreme and applies equally','Military controls government','President makes all laws','B','No one is above the law.'),
(gov,'How many states are in Nigeria?','30','34','36','38','C','36 states + FCT.'),
(gov,'Checks and balances ensures:','One arm is supreme','Each arm limits the others','Only judiciary has power','President controls all','B','Prevents abuse of power.'),
(gov,'A pressure group differs from a political party because it:','Contests elections','Does not seek to form government','Has no members','Operates internationally','B','Influences policy but doesn''t contest for power.');

-- LITERATURE
insert into questions(subject_id,question_text,option_a,option_b,option_c,option_d,correct_option,explanation) values
(lit,'Who wrote "Things Fall Apart"?','Wole Soyinka','Chinua Achebe','Ken Saro-Wiwa','Buchi Emecheta','B','Published 1958.'),
(lit,'A Shakespearean sonnet has how many lines?','12','14','16','18','B','3 quatrains + 1 couplet = 14 lines.'),
(lit,'The term protagonist refers to:','The villain','The main character','A minor character','The narrator','B','Central character of a story.'),
(lit,'"Purple Hibiscus" was written by:','Chimamanda Ngozi Adichie','Ama Ata Aidoo','Flora Nwapa','Buchi Emecheta','A','Published 2003.'),
(lit,'A story teaching a moral using animals is called a:','Legend','Myth','Fable','Folktale','C','E.g. Aesop''s fables.'),
(lit,'The climax of a story is:','The introduction','The resolution','The turning point/highest tension','The exposition','C','Point of highest dramatic tension.'),
(lit,'Wole Soyinka won the Nobel Prize in:','1980','1986','1990','1975','B','1986 Nobel Prize in Literature.'),
(lit,'A speech by one character alone on stage:','Dialogue','Soliloquy','Monologue','Aside','B','Reveals inner thoughts to audience.'),
(lit,'Which is a prose work?','Ode to a Nightingale','The Merchant of Venice','Arrow of God','The Waste Land','C','Arrow of God (1964) by Chinua Achebe.'),
(lit,'Repetition of initial consonant sounds is:','Assonance','Rhyme','Alliteration','Onomatopoeia','C','E.g. Peter Piper picked a peck.'),
(lit,'A story explaining natural phenomena passed down through generations is a:','Fable','Myth','Legend','Short story','B','Myths explain creation and natural events.'),
(lit,'An aside in drama is when a character speaks:','To another character','To the audience only','To themselves','To the director','B','Other characters do not hear it.');

end; $$;

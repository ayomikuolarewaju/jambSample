'use client';

import { useState, useEffect, useCallback } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const SUBJECTS = {
  "English Language": {
    required: true,
    questions: [
      { id: 1, text: "Choose the word that is nearest in meaning to LOQUACIOUS.", options: ["Talkative", "Quiet", "Brilliant", "Lazy"], answer: 0 },
      { id: 2, text: "Which of these sentences is grammatically correct?", options: ["She don't like him", "They was going home", "He has finished his work", "We was playing football"], answer: 2 },
      { id: 3, text: "The word 'EPHEMERAL' means:", options: ["Lasting forever", "Short-lived", "Very large", "Deeply rooted"], answer: 1 },
      { id: 4, text: "Identify the figure of speech: 'The wind whispered through the trees.'", options: ["Simile", "Metaphor", "Personification", "Hyperbole"], answer: 2 },
      { id: 5, text: "Choose the correct spelling:", options: ["Accomodate", "Accommodate", "Acomodate", "Acommodate"], answer: 1 },
      { id: 6, text: "The plural of 'curriculum' is:", options: ["Curriculums", "Curricula", "Curriculae", "Curriculum"], answer: 1 },
      { id: 7, text: "Which word is an antonym of BENEVOLENT?", options: ["Kind", "Generous", "Malevolent", "Caring"], answer: 2 },
      { id: 8, text: "Select the correct form: 'Neither John nor his brothers ___ attending the meeting.'", options: ["is", "are", "was", "be"], answer: 1 },
      { id: 9, text: "A word that imitates the sound it describes is called:", options: ["Alliteration", "Onomatopoeia", "Assonance", "Consonance"], answer: 1 },
      { id: 10, text: "The literary device in 'As brave as a lion' is a:", options: ["Metaphor", "Simile", "Irony", "Synecdoche"], answer: 1 },
    ]
  },
  "Mathematics": {
    required: false,
    questions: [
      { id: 1, text: "If 2x + 3 = 11, find x.", options: ["3", "4", "5", "6"], answer: 1 },
      { id: 2, text: "What is the value of log₁₀(1000)?", options: ["2", "3", "4", "10"], answer: 1 },
      { id: 3, text: "Find the area of a circle with radius 7cm. (π = 22/7)", options: ["154 cm²", "144 cm²", "164 cm²", "174 cm²"], answer: 0 },
      { id: 4, text: "Simplify: (x² - 4) / (x - 2)", options: ["x + 2", "x - 2", "x² + 2", "2x"], answer: 0 },
      { id: 5, text: "What is 15% of 200?", options: ["25", "30", "35", "40"], answer: 1 },
      { id: 6, text: "The sum of angles in a triangle is:", options: ["90°", "180°", "270°", "360°"], answer: 1 },
      { id: 7, text: "If P = {2,3,5,7} and Q = {1,2,3,4}, find P∩Q.", options: ["{2,3}", "{1,2,3,4,5,7}", "{2,3,5}", "{1,4}"], answer: 0 },
      { id: 8, text: "Evaluate: 3² + 4² = ?", options: ["25", "49", "7", "12"], answer: 0 },
      { id: 9, text: "Find the gradient of y = 3x² + 2x - 1 at x = 1.", options: ["6", "8", "4", "10"], answer: 1 },
      { id: 10, text: "The probability of getting a head when a fair coin is tossed is:", options: ["1", "0", "1/2", "1/4"], answer: 2 },
    ]
  },
  "Physics": {
    required: false,
    questions: [
      { id: 1, text: "The unit of electric current is:", options: ["Volt", "Ampere", "Ohm", "Watt"], answer: 1 },
      { id: 2, text: "What is the speed of light in vacuum?", options: ["3×10⁸ m/s", "3×10⁶ m/s", "3×10⁴ m/s", "3×10¹⁰ m/s"], answer: 0 },
      { id: 3, text: "Newton's first law of motion is also known as the law of:", options: ["Acceleration", "Inertia", "Gravity", "Motion"], answer: 1 },
      { id: 4, text: "Which wave requires a medium to travel?", options: ["Light wave", "Radio wave", "Sound wave", "X-ray"], answer: 2 },
      { id: 5, text: "The formula for kinetic energy is:", options: ["KE = mgh", "KE = ½mv²", "KE = mv", "KE = Fd"], answer: 1 },
      { id: 6, text: "What is the SI unit of pressure?", options: ["Newton", "Pascal", "Joule", "Watt"], answer: 1 },
      { id: 7, text: "An object at rest has __ energy.", options: ["Kinetic", "Zero", "Potential", "Thermal"], answer: 2 },
      { id: 8, text: "Ohm's Law states that V =", options: ["I/R", "IR", "I+R", "I-R"], answer: 1 },
      { id: 9, text: "The process of heat transfer through a vacuum is:", options: ["Conduction", "Convection", "Radiation", "Diffusion"], answer: 2 },
      { id: 10, text: "The acceleration due to gravity on Earth is approximately:", options: ["9.8 m/s²", "10.8 m/s²", "8.9 m/s²", "11 m/s²"], answer: 0 },
    ]
  },
  "Chemistry": {
    required: false,
    questions: [
      { id: 1, text: "The atomic number of Carbon is:", options: ["6", "12", "8", "14"], answer: 0 },
      { id: 2, text: "What is the chemical formula for water?", options: ["HO", "H₂O", "H₂O₂", "HO₂"], answer: 1 },
      { id: 3, text: "Which gas is responsible for the greenhouse effect?", options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"], answer: 2 },
      { id: 4, text: "The pH of a neutral solution is:", options: ["0", "7", "14", "10"], answer: 1 },
      { id: 5, text: "What type of bond is formed by sharing of electrons?", options: ["Ionic bond", "Covalent bond", "Metallic bond", "Hydrogen bond"], answer: 1 },
      { id: 6, text: "The process of converting liquid to gas is:", options: ["Condensation", "Sublimation", "Evaporation", "Fusion"], answer: 2 },
      { id: 7, text: "An element with atomic number 11 is:", options: ["Magnesium", "Sodium", "Potassium", "Calcium"], answer: 1 },
      { id: 8, text: "Which of these is a noble gas?", options: ["Chlorine", "Oxygen", "Argon", "Fluorine"], answer: 2 },
      { id: 9, text: "The rate of a chemical reaction increases when temperature:", options: ["Decreases", "Stays constant", "Increases", "Becomes zero"], answer: 2 },
      { id: 10, text: "Avogadro's number is:", options: ["6.02 × 10²³", "6.02 × 10²⁴", "3.14 × 10²³", "9.8 × 10²³"], answer: 0 },
    ]
  },
  "Biology": {
    required: false,
    questions: [
      { id: 1, text: "The powerhouse of the cell is the:", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi body"], answer: 2 },
      { id: 2, text: "DNA stands for:", options: ["Deoxyribonucleic Acid", "Diribonucleic Acid", "Deoxyribose Acid", "Dinucleic Acid"], answer: 0 },
      { id: 3, text: "Photosynthesis occurs in the:", options: ["Mitochondria", "Chloroplast", "Nucleus", "Vacuole"], answer: 1 },
      { id: 4, text: "The basic unit of life is:", options: ["Atom", "Molecule", "Cell", "Tissue"], answer: 2 },
      { id: 5, text: "Which blood type is the universal donor?", options: ["A", "B", "AB", "O"], answer: 3 },
      { id: 6, text: "The process of cell division is called:", options: ["Meiosis only", "Mitosis only", "Both mitosis and meiosis", "Osmosis"], answer: 2 },
      { id: 7, text: "The organ responsible for pumping blood is:", options: ["Lungs", "Kidney", "Heart", "Liver"], answer: 2 },
      { id: 8, text: "Osmosis is the movement of:", options: ["Solute from high to low concentration", "Water from high to low concentration", "Gas from low to high pressure", "Ions across a membrane"], answer: 1 },
      { id: 9, text: "Which vitamin is produced by the skin using sunlight?", options: ["Vitamin A", "Vitamin C", "Vitamin D", "Vitamin K"], answer: 2 },
      { id: 10, text: "The study of heredity is called:", options: ["Ecology", "Genetics", "Physiology", "Taxonomy"], answer: 1 },
    ]
  },
  "Economics": {
    required: false,
    questions: [
      { id: 1, text: "The full meaning of GDP is:", options: ["Gross Domestic Product", "General Domestic Product", "Gross Derived Product", "General Derived Product"], answer: 0 },
      { id: 2, text: "When demand increases and supply remains constant, price will:", options: ["Fall", "Rise", "Remain the same", "Become zero"], answer: 1 },
      { id: 3, text: "The concept of 'opportunity cost' refers to:", options: ["The price of a good", "What is given up when a choice is made", "The cost of production", "Tax on goods"], answer: 1 },
      { id: 4, text: "Inflation means:", options: ["A fall in prices", "A rise in the general price level", "Increase in production", "Reduction in taxes"], answer: 1 },
      { id: 5, text: "Which of these is a factor of production?", options: ["Money", "Land", "Tax", "Interest"], answer: 1 },
      { id: 6, text: "A monopoly exists when:", options: ["Many sellers exist", "Only one seller exists", "Two sellers compete", "Goods are free"], answer: 1 },
      { id: 7, text: "The Nigerian currency is the:", options: ["Dollar", "Pound", "Naira", "Franc"], answer: 2 },
      { id: 8, text: "Devaluation of currency means:", options: ["Increase in currency value", "Decrease in currency value", "Stable currency", "Printing more money"], answer: 1 },
      { id: 9, text: "Which bank serves as the apex bank in Nigeria?", options: ["First Bank", "Central Bank of Nigeria", "GTBank", "Access Bank"], answer: 1 },
      { id: 10, text: "The law of diminishing returns applies to:", options: ["Fixed factors only", "Variable factors as more are added", "Both fixed and variable", "Capital only"], answer: 1 },
    ]
  },
  "Government": {
    required: false,
    questions: [
      { id: 1, text: "Nigeria is a:", options: ["Unitary state", "Federal state", "Confederation", "Monarchy"], answer: 1 },
      { id: 2, text: "The National Assembly in Nigeria consists of:", options: ["Senate only", "House of Representatives only", "Senate and House of Representatives", "President and Ministers"], answer: 2 },
      { id: 3, text: "The 1999 Nigerian Constitution was promulgated under:", options: ["Obasanjo (civil)", "Abubakar", "Babangida", "Buhari"], answer: 1 },
      { id: 4, text: "Separation of powers was propounded by:", options: ["John Locke", "Montesquieu", "Rousseau", "Hobbes"], answer: 1 },
      { id: 5, text: "The executive arm of government is headed by:", options: ["The President", "The Speaker", "The Chief Justice", "The Senate President"], answer: 0 },
      { id: 6, text: "A bill becomes law after being signed by:", options: ["The Speaker", "The Senate President", "The President", "The Chief Justice"], answer: 2 },
      { id: 7, text: "INEC stands for:", options: ["Independent National Electoral Commission", "International National Electoral Committee", "Independent Nigerian Electoral Commission", "Integrated National Electoral Commission"], answer: 0 },
      { id: 8, text: "Federalism in Nigeria was introduced in:", options: ["1914", "1954", "1960", "1963"], answer: 1 },
      { id: 9, text: "The principle of rule of law means:", options: ["The government rules by force", "Law is supreme and applies equally", "Military controls government", "President makes all laws"], answer: 1 },
      { id: 10, text: "How many states are in Nigeria?", options: ["30", "34", "36", "38"], answer: 2 },
    ]
  },
  "Literature in English": {
    required: false,
    questions: [
      { id: 1, text: "Who wrote 'Things Fall Apart'?", options: ["Wole Soyinka", "Chinua Achebe", "Ken Saro-Wiwa", "Buchi Emecheta"], answer: 1 },
      { id: 2, text: "A Shakespearean sonnet has how many lines?", options: ["12", "14", "16", "18"], answer: 1 },
      { id: 3, text: "The term 'protagonist' refers to:", options: ["The villain of the story", "The main character", "A minor character", "The narrator"], answer: 1 },
      { id: 4, text: "'Purple Hibiscus' was written by:", options: ["Chimamanda Ngozi Adichie", "Ama Ata Aidoo", "Flora Nwapa", "Buchi Emecheta"], answer: 0 },
      { id: 5, text: "A story that teaches a moral lesson using animals is called a:", options: ["Legend", "Myth", "Fable", "Folktale"], answer: 2 },
      { id: 6, text: "The climax of a story is:", options: ["The introduction", "The resolution", "The turning point/highest tension", "The exposition"], answer: 2 },
      { id: 7, text: "Wole Soyinka won the Nobel Prize for Literature in:", options: ["1980", "1986", "1990", "1975"], answer: 1 },
      { id: 8, text: "A speech given by one character alone on stage is called a:", options: ["Dialogue", "Soliloquy", "Monologue", "Aside"], answer: 1 },
      { id: 9, text: "Which of these is a prose work?", options: ["Ode to a Nightingale", "The Merchant of Venice", "Arrow of God", "The Waste Land"], answer: 2 },
      { id: 10, text: "The repetition of initial consonant sounds is called:", options: ["Assonance", "Rhyme", "Alliteration", "Onomatopoeia"], answer: 2 },
    ]
  },
};

const COURSE_COMBINATIONS = {
  "Science": {
    required: ["English Language"],
    choose3From: ["Mathematics", "Physics", "Chemistry", "Biology"],
    description: "Medicine, Engineering, Sciences"
  },
  "Commercial": {
    required: ["English Language"],
    choose3From: ["Mathematics", "Economics", "Government", "Literature in English"],
    description: "Accounting, Business Admin, Law"
  },
  "Arts": {
    required: ["English Language"],
    choose3From: ["Literature in English", "Government", "Economics", "Biology"],
    description: "Mass Communication, Linguistics, History"
  },
};

const EXAM_DURATION = 30 * 60; // 30 minutes in seconds

// ─── COMPONENTS ───────────────────────────────────────────────────────────────
interface ProgressBarProps {
  step: number; // 0 to 4
}
function ProgressBar({ step }: ProgressBarProps) {
  const steps = ["Register", "Combination", "Instructions", "Exam", "Result"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 32 }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : 0 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            background: i <= step ? "#006400" : "#e0e0e0",
            color: i <= step ? "#fff" : "#999",
            fontWeight: 700, fontSize: 13, flexShrink: 0,
            border: i === step ? "3px solid #90EE90" : "3px solid transparent",
            boxShadow: i === step ? "0 0 0 2px #006400" : "none",
            transition: "all 0.3s"
          }}>
            {i < step ? "✓" : i + 1}
          </div>
          <div style={{ fontSize: 10, color: i <= step ? "#006400" : "#aaa", marginLeft: 4, fontWeight: i === step ? 700 : 400, whiteSpace: "nowrap" }}>
            {s}
          </div>
          {i < steps.length - 1 && (
            <div style={{ flex: 1, height: 2, background: i < step ? "#006400" : "#e0e0e0", margin: "0 8px", minWidth: 20, transition: "background 0.3s" }} />
          )}
        </div>
      ))}
    </div>
  );
}

interface TimerDisplayProps {
  seconds: number;
}

function TimerDisplay({ seconds }: TimerDisplayProps) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  const pct = seconds / EXAM_DURATION;
  const urgent = seconds <= 300;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, padding: "10px 20px",
      background: urgent ? "#fff3f3" : "#f0fff0",
      border: `2px solid ${urgent ? "#e53e3e" : "#006400"}`,
      borderRadius: 12, fontFamily: "'Courier New', monospace"
    }}>
      <div style={{ fontSize: 11, color: "#666", fontFamily: "inherit" }}>TIME LEFT</div>
      <div style={{
        fontSize: 28, fontWeight: 900, color: urgent ? "#e53e3e" : "#006400",
        letterSpacing: 2, animation: urgent && seconds <= 60 ? "pulse 1s infinite" : "none"
      }}>
        {mins}:{secs}
      </div>
      <div style={{ width: 60, height: 6, background: "#e0e0e0", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${pct * 100}%`, height: "100%", background: urgent ? "#e53e3e" : "#006400", transition: "width 1s linear" }} />
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────

export default function JAMBApp() {
  const [step, setStep] = useState(0); // 0=register, 1=combo, 2=instructions, 3=exam, 4=result
  const [student, setStudent] = useState({ name: "", regNo: "", email: "", phone: "", dob: "", gender: "" });
  const [formErrors, setFormErrors] = useState({});
  const [courseType, setCourseType] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [currentSubjectIdx, setCurrentSubjectIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // Timer
  useEffect(() => {
    if (step !== 3 || examSubmitted) return;
    if (timeLeft <= 0) { handleSubmitExam(); return; }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [step, timeLeft, examSubmitted]);

  interface Errors {    name?: string;   regNo?: string;    email?: string;    phone?: string;    dob?: string; gender?: string;  };
  

  const validateRegister = () => {
    const errs: Errors = {};
    if (!student.name.trim()) errs.name = "Full name is required";
    if (!student.regNo.trim()) errs.regNo = "Registration number is required";
    if (!student.email.trim() || !/\S+@\S+\.\S+/.test(student.email)) errs.email = "Valid email is required";
    if (!student.phone.trim() || student.phone.length < 11) errs.phone = "Valid phone number required";
    if (!student.dob) errs.dob = "Date of birth is required";
    if (!student.gender) errs.gender = "Please select gender";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  interface SubjectOptionProps {
    subject: string;
    isSelected: boolean;
    onClick: () => void;
  }

  const handleCourseSelect: React.MouseEventHandler<HTMLButtonElement> = (type) => {
    setCourseType(type);
    setSelectedSubjects(["English Language"]);
  };

  const toggleSubject = (sub) => {
    if (sub === "English Language") return;
    const combo = COURSE_COMBINATIONS[courseType];
    if (!combo.choose3From.includes(sub)) return;
    setSelectedSubjects(prev => {
      const others = prev.filter(s => s !== "English Language");
      if (others.includes(sub)) return ["English Language", ...others.filter(s => s !== sub)];
      if (others.length >= 3) return prev;
      return ["English Language", ...others, sub];
    });
  };

  const canStartExam = selectedSubjects.length === 4;

  const startExam = () => {
    setCurrentSubjectIdx(0);
    setCurrentQ(0);
    setAnswers({});
    setFlagged({});
    setTimeLeft(EXAM_DURATION);
    setStep(3);
  };

  const currentSubject = selectedSubjects[currentSubjectIdx];
  const currentSubjectQuestions = currentSubject ? SUBJECTS[currentSubject]?.questions || [] : [];
  const currentQuestion = currentSubjectQuestions[currentQ];

  const answerKey = `${currentSubjectIdx}-${currentQ}`;

  const selectAnswer = (optIdx) => {
    setAnswers(prev => ({ ...prev, [answerKey]: optIdx }));
  };

  const toggleFlag = () => {
    setFlagged(prev => ({ ...prev, [answerKey]: !prev[answerKey] }));
  };

  const goToSubject = (idx) => {
    setCurrentSubjectIdx(idx);
    setCurrentQ(0);
  };

  const calcScore = () => {
    let total = 0, correct = 0;
    selectedSubjects.forEach((sub, si) => {
      const qs = SUBJECTS[sub]?.questions || [];
      qs.forEach((q, qi) => {
        total++;
        const key = `${si}-${qi}`;
        if (answers[key] === q.answer) correct++;
      });
    });
    return { correct, total, pct: Math.round((correct / total) * 100) };
  };

  const handleSubmitExam = () => {
    setExamSubmitted(true);
    setStep(4);
    setShowSubmitConfirm(false);
  };

  const score = step === 4 ? calcScore() : null;

  const getSubjectScore = (si) => {
    const sub = selectedSubjects[si];
    const qs = SUBJECTS[sub]?.questions || [];
    let c = 0;
    qs.forEach((q, qi) => { if (answers[`${si}-${qi}`] === q.answer) c++; });
    return { correct: c, total: qs.length };
  };

  // ── RENDER ──

  const containerStyle = {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f0fff0 0%, #e8f5e9 50%, #f9fbe7 100%)",
    fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
    padding: "20px 16px",
  };

  const cardStyle = {
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 4px 24px rgba(0,100,0,0.10)",
    padding: "32px 28px",
    maxWidth: 700,
    margin: "0 auto",
  };

  const inputStyle = (err:Errors) => ({
    width: "100%", padding: "11px 14px", borderRadius: 8, fontSize: 14,
    border: `1.5px solid ${err ? "#e53e3e" : "#cde8cd"}`,
    outline: "none", boxSizing: "border-box",
    background: err ? "#fff5f5" : "#f9fff9",
    marginTop: 4
  });

  const btnPrimary = {
    background: "linear-gradient(135deg, #006400, #228B22)",
    color: "#fff", border: "none", borderRadius: 10, padding: "13px 32px",
    fontSize: 15, fontWeight: 700, cursor: "pointer", letterSpacing: 0.5,
    boxShadow: "0 2px 10px rgba(0,100,0,0.25)", transition: "all 0.2s"
  };

  const btnSecondary = {
    background: "#fff", color: "#006400", border: "2px solid #006400",
    borderRadius: 10, padding: "11px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer"
  };

  return (
    <div style={containerStyle}>
      <style>{`
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:none } }
        .fade-in { animation: fadeIn 0.4s ease forwards; }
        .btn-hover:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0,100,0,0.3) !important; }
        .option-hover:hover { background: #f0fff0 !important; border-color: #006400 !important; }
      `}</style>

      {/* HEADER */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 12, background: "#fff", borderRadius: 50, padding: "8px 20px", boxShadow: "0 2px 12px rgba(0,100,0,0.12)" }}>
          <div style={{ fontSize: 28 }}>🇳🇬</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#006400", letterSpacing: 1 }}>JAMB CBT</div>
            <div style={{ fontSize: 10, color: "#888", fontWeight: 600, letterSpacing: 2 }}>UNIFIED TERTIARY MATRICULATION EXAMINATION</div>
          </div>
          <div style={{ fontSize: 28 }}>🎓</div>
        </div>
      </div>

      {/* STEP 0: REGISTER */}
      {step === 0 && (
        <div className="fade-in" style={cardStyle}>
          <ProgressBar step={0} />
          <h2 style={{ color: "#006400", marginBottom: 4, fontSize: 22 }}>Candidate Registration</h2>
          <p style={{ color: "#666", fontSize: 13, marginBottom: 24 }}>Fill in your details accurately. This information will appear on your result slip.</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px" }}>
            {[
              { key: "name", label: "Full Name (Surname first)", placeholder: "e.g. IBRAHIM Fatima Bello", type: "text" },
              { key: "regNo", label: "JAMB Registration Number", placeholder: "e.g. 12345678AB", type: "text" },
              { key: "email", label: "Email Address", placeholder: "your@email.com", type: "email" },
              { key: "phone", label: "Phone Number", placeholder: "08012345678", type: "tel" },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#444", letterSpacing: 0.5 }}>{f.label.toUpperCase()}</label>
                <input
                  type={f.type}
                  placeholder={f.placeholder}
                  value={student[f.key]}
                  onChange={e => setStudent(s => ({ ...s, [f.key]: e.target.value }))}
                  style={inputStyle(formErrors[f.key])}
                />
                {formErrors[f.key] && <div style={{ fontSize: 11, color: "#e53e3e", marginTop: 2 }}>⚠ {formErrors[f.key]}</div>}
              </div>
            ))}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#444", letterSpacing: 0.5 }}>DATE OF BIRTH</label>
              <input type="date" value={student.dob} onChange={e => setStudent(s => ({ ...s, dob: e.target.value }))} style={inputStyle(formErrors.dob)} />
              {formErrors.dob && <div style={{ fontSize: 11, color: "#e53e3e", marginTop: 2 }}>⚠ {formErrors.dob}</div>}
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#444", letterSpacing: 0.5 }}>GENDER</label>
              <select value={student.gender} onChange={e => setStudent(s => ({ ...s, gender: e.target.value }))} style={{ ...inputStyle(formErrors.gender), appearance: "auto" }}>
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
              </select>
              {formErrors.gender && <div style={{ fontSize: 11, color: "#e53e3e", marginTop: 2 }}>⚠ {formErrors.gender}</div>}
            </div>
          </div>

          <div style={{ marginTop: 28, textAlign: "right" }}>
            <button className="btn-hover" style={btnPrimary} onClick={() => { if (validateRegister()) setStep(1); }}>
              Continue to Subject Selection →
            </button>
          </div>
        </div>
      )}

      {/* STEP 1: COMBINATION */}
      {step === 1 && (
        <div className="fade-in" style={cardStyle}>
          <ProgressBar step={1} />
          <h2 style={{ color: "#006400", marginBottom: 4 }}>Choose Your Exam Combination</h2>
          <p style={{ color: "#666", fontSize: 13, marginBottom: 20 }}>
            Welcome, <strong>{student.name}</strong>. Select your course group, then pick 3 elective subjects.
            <br /><em style={{ color: "#006400" }}>English Language is compulsory for all candidates.</em>
          </p>

          {/* Course Type */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#444", marginBottom: 10, letterSpacing: 1 }}>STEP 1 — SELECT COURSE GROUP</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              {Object.entries(COURSE_COMBINATIONS).map(([type, info]) => (
                <div key={type} onClick={() => handleCourseSelect(type)} style={{
                  padding: "16px 12px", borderRadius: 12, cursor: "pointer", textAlign: "center",
                  border: `2px solid ${courseType === type ? "#006400" : "#e0e0e0"}`,
                  background: courseType === type ? "#f0fff0" : "#fafafa",
                  transition: "all 0.2s"
                }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>
                    {type === "Science" ? "🔬" : type === "Commercial" ? "💼" : "🎨"}
                  </div>
                  <div style={{ fontWeight: 800, color: "#333", fontSize: 14 }}>{type}</div>
                  <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>{info.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Subject Selection */}
          {courseType && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#444", marginBottom: 10, letterSpacing: 1 }}>
                STEP 2 — SELECT 3 ELECTIVE SUBJECTS ({selectedSubjects.filter(s => s !== "English Language").length}/3 chosen)
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {/* Compulsory */}
                <div style={{
                  padding: "12px 16px", borderRadius: 10, background: "#006400", color: "#fff",
                  display: "flex", alignItems: "center", gap: 10
                }}>
                  <span style={{ fontSize: 18 }}>✅</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>English Language</div>
                    <div style={{ fontSize: 11, opacity: 0.8 }}>Compulsory</div>
                  </div>
                </div>
                {/* Electives */}
                {COURSE_COMBINATIONS[courseType].choose3From.map(sub => {
                  const sel = selectedSubjects.includes(sub);
                  const maxed = selectedSubjects.filter(s => s !== "English Language").length >= 3;
                  return (
                    <div key={sub} onClick={() => toggleSubject(sub)} style={{
                      padding: "12px 16px", borderRadius: 10, cursor: "pointer",
                      border: `2px solid ${sel ? "#006400" : "#e0e0e0"}`,
                      background: sel ? "#f0fff0" : "#fafafa",
                      display: "flex", alignItems: "center", gap: 10,
                      opacity: (!sel && maxed) ? 0.5 : 1,
                      transition: "all 0.2s"
                    }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: 6, border: `2px solid ${sel ? "#006400" : "#ccc"}`,
                        background: sel ? "#006400" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                      }}>
                        {sel && <span style={{ color: "#fff", fontSize: 13 }}>✓</span>}
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: sel ? "#006400" : "#444" }}>{sub}</div>
                    </div>
                  );
                })}
              </div>

              {canStartExam && (
                <div style={{ marginTop: 16, padding: "12px 16px", background: "#f0fff0", borderRadius: 10, border: "1.5px solid #90EE90" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#006400" }}>✅ Your Combination:</div>
                  <div style={{ fontSize: 13, color: "#444", marginTop: 4 }}>{selectedSubjects.join(" • ")}</div>
                </div>
              )}
            </div>
          )}

          <div style={{ marginTop: 28, display: "flex", justifyContent: "space-between" }}>
            <button style={btnSecondary} onClick={() => setStep(0)}>← Back</button>
            <button className="btn-hover" style={{ ...btnPrimary, opacity: canStartExam ? 1 : 0.4 }}
              disabled={!canStartExam} onClick={() => setStep(2)}>
              Proceed to Instructions →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: INSTRUCTIONS */}
      {step === 2 && (
        <div className="fade-in" style={cardStyle}>
          <ProgressBar step={2} />
          <h2 style={{ color: "#006400", marginBottom: 4 }}>Exam Instructions</h2>
          <div style={{ background: "#fff8e1", border: "1.5px solid #ffcc02", borderRadius: 10, padding: "14px 18px", marginBottom: 20 }}>
            <div style={{ fontWeight: 700, color: "#b7791f", marginBottom: 6 }}>⚠ READ CAREFULLY BEFORE PROCEEDING</div>
            <ul style={{ margin: 0, paddingLeft: 18, color: "#555", fontSize: 13, lineHeight: 2 }}>
              <li>You have <strong>30 minutes</strong> to complete all 4 subjects (40 questions total).</li>
              <li>Each subject has <strong>10 questions</strong>. Navigate between subjects using the tabs.</li>
              <li>You can <strong>flag questions</strong> to review before submission.</li>
              <li>Once the timer expires, your exam is automatically submitted.</li>
              <li>Do <strong>NOT</strong> refresh or close the browser during the exam.</li>
              <li>Each correct answer scores <strong>2.5 marks</strong>. No negative marking.</li>
              <li>Your total score will be displayed out of <strong>400 marks</strong>.</li>
            </ul>
          </div>

          <div style={{ background: "#f0fff0", border: "1.5px solid #90EE90", borderRadius: 10, padding: "14px 18px", marginBottom: 20 }}>
            <div style={{ fontWeight: 700, color: "#006400", marginBottom: 8 }}>📋 Exam Summary</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13 }}>
              <div><span style={{ color: "#888" }}>Candidate:</span> <strong>{student.name}</strong></div>
              <div><span style={{ color: "#888" }}>Reg No:</span> <strong>{student.regNo}</strong></div>
              <div><span style={{ color: "#888" }}>Course Group:</span> <strong>{courseType}</strong></div>
              <div><span style={{ color: "#888" }}>Duration:</span> <strong>30 minutes</strong></div>
              <div style={{ gridColumn: "1/-1" }}>
                <span style={{ color: "#888" }}>Subjects:</span> <strong>{selectedSubjects.join(", ")}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "#fff", border: "1.5px solid #e0e0e0", borderRadius: 10, marginBottom: 24 }}>
            <input type="checkbox" id="agree" style={{ width: 18, height: 18, accentColor: "#006400" }} />
            <label htmlFor="agree" style={{ fontSize: 13, color: "#444", cursor: "pointer" }}>
              I have read and understood all the instructions above. I am ready to begin my examination.
            </label>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button style={btnSecondary} onClick={() => setStep(1)}>← Back</button>
            <button className="btn-hover" style={{ ...btnPrimary, background: "linear-gradient(135deg, #c00, #8B0000)", boxShadow: "0 2px 10px rgba(150,0,0,0.3)" }}
              onClick={startExam}>
              🚀 Start Exam Now
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: EXAM */}
      {step === 3 && currentQuestion && (
        <div className="fade-in" style={{ maxWidth: 780, margin: "0 auto" }}>
          {/* Top bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            <div style={{ fontSize: 13 }}>
              <span style={{ color: "#888" }}>Candidate: </span>
              <strong style={{ color: "#006400" }}>{student.name}</strong>
              <span style={{ color: "#bbb", margin: "0 8px" }}>|</span>
              <span style={{ color: "#888" }}>Reg: </span>
              <strong>{student.regNo}</strong>
            </div>
            <TimerDisplay seconds={timeLeft} />
          </div>

          {/* Subject tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
            {selectedSubjects.map((sub, i) => {
              const answered = SUBJECTS[sub].questions.filter((_, qi) => answers[`${i}-${qi}`] !== undefined).length;
              return (
                <button key={sub} onClick={() => goToSubject(i)} style={{
                  padding: "8px 14px", borderRadius: 8, border: "2px solid",
                  borderColor: i === currentSubjectIdx ? "#006400" : "#ddd",
                  background: i === currentSubjectIdx ? "#006400" : "#fff",
                  color: i === currentSubjectIdx ? "#fff" : "#555",
                  fontWeight: 700, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap",
                  transition: "all 0.2s"
                }}>
                  {sub.split(" ")[0]}
                  <span style={{ marginLeft: 6, fontSize: 10, opacity: 0.8 }}>({answered}/10)</span>
                </button>
              );
            })}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: 16 }}>
            {/* Question panel */}
            <div style={{ ...cardStyle, padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: 1 }}>
                    {currentSubject.toUpperCase()} — QUESTION {currentQ + 1} OF 10
                  </div>
                  <div style={{ fontSize: 11, color: "#006400", marginTop: 2 }}>
                    {answers[answerKey] !== undefined ? "✅ Answered" : "⬜ Not answered"}
                    {flagged[answerKey] && " · 🚩 Flagged"}
                  </div>
                </div>
                <button onClick={toggleFlag} style={{
                  padding: "6px 12px", borderRadius: 8, border: "1.5px solid",
                  borderColor: flagged[answerKey] ? "#e53e3e" : "#ddd",
                  background: flagged[answerKey] ? "#fff5f5" : "#fff",
                  color: flagged[answerKey] ? "#e53e3e" : "#888",
                  fontSize: 12, cursor: "pointer", fontWeight: 600
                }}>
                  🚩 {flagged[answerKey] ? "Unflag" : "Flag"}
                </button>
              </div>

              <div style={{ fontSize: 16, fontWeight: 600, color: "#222", lineHeight: 1.6, marginBottom: 20 }}>
                {currentQ + 1}. {currentQuestion.text}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {currentQuestion.options.map((opt, i) => {
                  const sel = answers[answerKey] === i;
                  return (
                    <div key={i} className="option-hover" onClick={() => selectAnswer(i)} style={{
                      padding: "13px 16px", borderRadius: 10, cursor: "pointer",
                      border: `2px solid ${sel ? "#006400" : "#e8e8e8"}`,
                      background: sel ? "#f0fff0" : "#fff",
                      display: "flex", alignItems: "center", gap: 12,
                      transition: "all 0.15s"
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                        border: `2px solid ${sel ? "#006400" : "#ccc"}`,
                        background: sel ? "#006400" : "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 800, fontSize: 13, color: sel ? "#fff" : "#999"
                      }}>
                        {["A", "B", "C", "D"][i]}
                      </div>
                      <span style={{ fontSize: 14, color: sel ? "#006400" : "#444", fontWeight: sel ? 600 : 400 }}>{opt}</span>
                    </div>
                  );
                })}
              </div>

              {/* Navigation */}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
                <button style={{ ...btnSecondary, padding: "10px 18px", fontSize: 13 }}
                  disabled={currentQ === 0} onClick={() => setCurrentQ(q => q - 1)}>← Prev</button>
                {currentQ < 9 ? (
                  <button className="btn-hover" style={{ ...btnPrimary, padding: "10px 18px", fontSize: 13 }}
                    onClick={() => setCurrentQ(q => q + 1)}>Next →</button>
                ) : currentSubjectIdx < selectedSubjects.length - 1 ? (
                  <button className="btn-hover" style={{ ...btnPrimary, padding: "10px 18px", fontSize: 13 }}
                    onClick={() => goToSubject(currentSubjectIdx + 1)}>Next Subject →</button>
                ) : (
                  <button className="btn-hover" style={{ ...btnPrimary, background: "linear-gradient(135deg, #c00, #8B0000)", padding: "10px 18px", fontSize: 13 }}
                    onClick={() => setShowSubmitConfirm(true)}>Submit Exam ✓</button>
                )}
              </div>
            </div>

            {/* Question grid */}
            <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,100,0,0.08)", padding: "16px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: 1, marginBottom: 12 }}>QUESTION NAVIGATOR</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, marginBottom: 16 }}>
                {currentSubjectQuestions.map((_, qi) => {
                  const k = `${currentSubjectIdx}-${qi}`;
                  const isAnswered = answers[k] !== undefined;
                  const isFlagged = flagged[k];
                  const isCurrent = qi === currentQ;
                  return (
                    <button key={qi} onClick={() => setCurrentQ(qi)} style={{
                      width: "100%", aspectRatio: "1", borderRadius: 6, border: `2px solid`,
                      borderColor: isCurrent ? "#006400" : isFlagged ? "#e53e3e" : isAnswered ? "#90EE90" : "#e0e0e0",
                      background: isCurrent ? "#006400" : isFlagged ? "#fff5f5" : isAnswered ? "#f0fff0" : "#fff",
                      color: isCurrent ? "#fff" : isFlagged ? "#e53e3e" : "#555",
                      fontWeight: 700, fontSize: 12, cursor: "pointer"
                    }}>
                      {qi + 1}
                    </button>
                  );
                })}
              </div>
              {/* Legend */}
              <div style={{ fontSize: 11, color: "#888", lineHeight: 2 }}>
                <div><span style={{ display: "inline-block", width: 12, height: 12, borderRadius: 3, background: "#006400", marginRight: 6 }} />Current</div>
                <div><span style={{ display: "inline-block", width: 12, height: 12, borderRadius: 3, background: "#f0fff0", border: "1.5px solid #90EE90", marginRight: 6 }} />Answered</div>
                <div><span style={{ display: "inline-block", width: 12, height: 12, borderRadius: 3, background: "#fff5f5", border: "1.5px solid #e53e3e", marginRight: 6 }} />Flagged</div>
                <div><span style={{ display: "inline-block", width: 12, height: 12, borderRadius: 3, background: "#fff", border: "1.5px solid #e0e0e0", marginRight: 6 }} />Unanswered</div>
              </div>

              {/* Stats */}
              <div style={{ marginTop: 16, borderTop: "1px solid #eee", paddingTop: 12 }}>
                {selectedSubjects.map((sub, si) => {
                  const ans = SUBJECTS[sub].questions.filter((_, qi) => answers[`${si}-${qi}`] !== undefined).length;
                  return (
                    <div key={sub} style={{ fontSize: 11, marginBottom: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", color: "#555" }}>
                        <span>{sub.split(" ")[0]}</span>
                        <span style={{ fontWeight: 700, color: ans === 10 ? "#006400" : "#888" }}>{ans}/10</span>
                      </div>
                      <div style={{ height: 3, background: "#eee", borderRadius: 2, marginTop: 2 }}>
                        <div style={{ width: `${ans * 10}%`, height: "100%", background: "#006400", borderRadius: 2, transition: "width 0.3s" }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <button className="btn-hover" style={{ ...btnPrimary, width: "100%", marginTop: 16, background: "linear-gradient(135deg, #c00,#8B0000)", boxShadow: "0 2px 8px rgba(150,0,0,0.3)", textAlign: "center" }}
                onClick={() => setShowSubmitConfirm(true)}>
                Submit Exam
              </button>
            </div>
          </div>

          {/* Submit confirm modal */}
          {showSubmitConfirm && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
              <div style={{ background: "#fff", borderRadius: 16, padding: 32, maxWidth: 400, width: "90%", textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
                <h3 style={{ color: "#333", marginBottom: 8 }}>Submit Examination?</h3>
                <p style={{ color: "#666", fontSize: 13, marginBottom: 20 }}>
                  You have answered {Object.keys(answers).length} out of 40 questions.
                  Unanswered questions will be marked as wrong. This action cannot be undone.
                </p>
                <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                  <button style={btnSecondary} onClick={() => setShowSubmitConfirm(false)}>Continue Exam</button>
                  <button className="btn-hover" style={{ ...btnPrimary, background: "linear-gradient(135deg,#c00,#8B0000)" }}
                    onClick={handleSubmitExam}>Yes, Submit</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 4: RESULT */}
      {step === 4 && score && (
        <div className="fade-in" style={{ ...cardStyle, maxWidth: 640 }}>
          <ProgressBar step={4} />

          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 60 }}>{score.pct >= 50 ? "🎉" : "📚"}</div>
            <h2 style={{ color: "#006400", fontSize: 26, margin: "8px 0" }}>Exam Completed!</h2>
            <div style={{ color: "#666", fontSize: 14 }}>{student.name} · {student.regNo}</div>
          </div>

          {/* Score circle */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <div style={{
              width: 160, height: 160, borderRadius: "50%", border: `8px solid`,
              borderColor: score.pct >= 70 ? "#006400" : score.pct >= 50 ? "#ff9900" : "#e53e3e",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              background: "#f9fff9", boxShadow: "0 4px 20px rgba(0,100,0,0.15)"
            }}>
              <div style={{ fontSize: 40, fontWeight: 900, color: score.pct >= 70 ? "#006400" : score.pct >= 50 ? "#ff9900" : "#e53e3e" }}>
                {score.pct >= 70 ? score.correct * 10 : score.correct * 10}
              </div>
              <div style={{ fontSize: 13, color: "#888" }}>out of 400</div>
              <div style={{ fontSize: 12, color: "#006400", fontWeight: 700 }}>{score.pct}%</div>
            </div>
          </div>

          {/* Per-subject breakdown */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#444", letterSpacing: 1, marginBottom: 12 }}>SUBJECT BREAKDOWN</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {selectedSubjects.map((sub, si) => {
                const { correct, total } = getSubjectScore(si);
                const pct = Math.round((correct / total) * 100);
                return (
                  <div key={sub} style={{ padding: "12px 16px", background: "#f9fff9", borderRadius: 10, border: "1.5px solid #e8e8e8" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: 14, color: "#333" }}>{sub}</span>
                      <span style={{ fontWeight: 800, color: pct >= 70 ? "#006400" : pct >= 50 ? "#ff9900" : "#e53e3e", fontSize: 14 }}>
                        {correct}/{total} ({correct * 25}/100)
                      </span>
                    </div>
                    <div style={{ height: 6, background: "#e8e8e8", borderRadius: 3 }}>
                      <div style={{
                        width: `${pct}%`, height: "100%", borderRadius: 3,
                        background: pct >= 70 ? "#006400" : pct >= 50 ? "#ff9900" : "#e53e3e",
                        transition: "width 1s ease"
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* JAMB Score scale */}
          <div style={{ padding: "14px 18px", borderRadius: 10, background: score.pct >= 50 ? "#f0fff0" : "#fff8e1", border: `1.5px solid ${score.pct >= 50 ? "#90EE90" : "#ffcc02"}`, marginBottom: 24 }}>
            <div style={{ fontWeight: 700, color: "#333", marginBottom: 4 }}>
              {score.pct >= 70 ? "🌟 Excellent Performance!" : score.pct >= 50 ? "👍 Good Performance" : "📚 Keep Studying"}
            </div>
            <div style={{ fontSize: 13, color: "#555" }}>
              {score.pct >= 70
                ? "Outstanding! You have a very high chance of admission. Make sure to check your JAMB portal for your official score."
                : score.pct >= 50
                ? "Good effort! You may qualify for admission to some institutions. Review your weak subjects and retake if needed."
                : "You need to score at least 180/400 (45%) for most universities. Study harder, you can improve!"}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button style={btnSecondary} onClick={() => {
              setStep(0); setStudent({ name: "", regNo: "", email: "", phone: "", dob: "", gender: "" });
              setCourseType(""); setSelectedSubjects([]); setAnswers({}); setFlagged({}); setExamSubmitted(false);
            }}>
              🔄 New Exam
            </button>
            <button className="btn-hover" style={btnPrimary} onClick={() => window.print()}>
              🖨️ Print Result
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: "center", marginTop: 24, fontSize: 11, color: "#aaa" }}>
        © 2024 JAMB CBT Practice Platform · Joint Admissions and Matriculation Board · Nigeria
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { useStore } from "./store";
import { TopicRecord, TopicData } from "./store";
import { 
  BookOpen, Brain, CheckCircle2, ChevronRight, Loader2, Sparkles, XCircle, RotateCcw, Trophy
} from "lucide-react";
import { Card, CardContent } from "./ui";
import { Button } from "./ui";
import { Progress } from "./ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui";

export function LearnModule() {
  const { topicId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryTopic = searchParams.get("q");

  const history = useStore(state => state.learningHistory);
  const addTopic = useStore(state => state.addTopic);
  const updateScore = useStore(state => state.updateTopicRating);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TopicRecord | null>(null);
  
  // Interactive States
  const [activeTab, setActiveTab] = useState("overview");
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  const [currentFlashcard, setCurrentFlashcard] = useState(0);
  
  // Quiz State
  const [quizScore, setQuizScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  useEffect(() => {
    if (topicId === "new" && queryTopic) {
      generateContent(queryTopic);
    } else if (topicId !== "new") {
      const existing = history.find(t => t.id === topicId);
      if (existing) {
        setData(existing);
      } else {
        navigate("/");
      }
    }
  }, [topicId, queryTopic, history, navigate]);

  const generateContent = async (topicString: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-topic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topicString, difficulty: "Medium" })
      });
      
      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(`Generation failed (Status ${res.status}). Our AI might be busy. ${errText ? `Details: ${errText.slice(0, 100)}` : ""}`);
      }
      
      const payload: TopicData = await res.json();
      
      const newTopic: TopicRecord = {
        ...payload,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        difficulty: "Medium",
        score: 0,
        maxScore: payload.mcq.length + payload.trueFalse.length,
        completed: false
      };
      
      addTopic(newTopic);
      setData(newTopic);
      navigate(`/learn/${newTopic.id}`, { replace: true });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = (isCorrect: boolean) => {
    if (isCorrect) setQuizScore(s => s + 1);
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (!data) return;
    
    // Check if moving from MCQ to TrueFalse or finishing
    const totalMCQ = data.mcq.length;
    const totalTF = data.trueFalse.length;
    
    if (currentQuestion < totalMCQ + totalTF - 1) {
      setCurrentQuestion(q => q + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      // Finish Quiz
      setQuizFinished(true);
      updateScore(data.id, quizScore, data.maxScore);
      
      if (quizScore / data.maxScore > 0.8) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#a855f7', '#3b82f6', '#f43f5e']
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-zinc-800 border-t-purple-500 animate-spin" />
          <Brain className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-purple-400" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-white">Synthesizing Knowledge...</h2>
          <p className="text-zinc-400">Searching the web and extracting insights for "{queryTopic}"</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-4 max-w-md">
          <XCircle className="mx-auto h-12 w-12 text-rose-500" />
          <h2 className="text-xl font-bold text-white">Generation Failed</h2>
          <p className="text-zinc-400">{error}</p>
          <Button onClick={() => navigate("/")} className="bg-white text-zinc-950">
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const isMCQ = currentQuestion < data.mcq.length;
  const currQIndex = isMCQ ? currentQuestion : currentQuestion - data.mcq.length;
  const mcqData = isMCQ ? data.mcq[currQIndex] : null;
  const tfData = !isMCQ ? data.trueFalse[currQIndex] : null;

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 mt-8 relative z-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded bg-violet-500/20 text-violet-300 text-[10px] font-bold uppercase tracking-wider">
              {data.difficulty} MODE
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">{data.title}</h1>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white/5 border border-white/10 grid w-full grid-cols-3 p-1 rounded-2xl">
          <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-lg">Overview</TabsTrigger>
          <TabsTrigger value="flashcards" className="rounded-xl data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-lg">Flashcards</TabsTrigger>
          <TabsTrigger value="quiz" className="rounded-xl data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-lg">Quiz Challenge</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <Card className="bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl relative overflow-hidden">
              <CardContent className="p-6 md:p-8 text-lg font-medium text-slate-300 leading-relaxed">
                {data.summary}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                <Sparkles className="h-5 w-5 text-indigo-400" />
                Key Concepts
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.keyConcepts.map((concept, i) => (
                  <Card key={i} className="bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl relative overflow-hidden">
                    <CardContent className="p-6 space-y-2">
                      <h4 className="font-bold text-white text-lg">{concept.concept}</h4>
                      <p className="text-slate-400 text-sm leading-relaxed">{concept.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="flashcards" className="mt-6 flex flex-col items-center">
           <div className="w-full max-w-2xl min-h-[400px] perspective-1000">
             <motion.div
                className="w-full h-[400px] relative preserve-3d cursor-pointer"
                onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                animate={{ rotateY: flashcardFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 200, damping: 20 }}
             >
                {/* Front */}
                <Card className="absolute inset-0 backface-hidden flex items-center justify-center p-8 bg-white/5 border-white/10 rounded-3xl backdrop-blur-xl shadow-2xl text-center">
                  <h2 className="text-3xl font-bold text-white">{data.flashcards[currentFlashcard].term}</h2>
                  <p className="absolute bottom-6 text-sm text-slate-500 font-medium">Tap to flip</p>
                </Card>
                
                {/* Back */}
                <Card className="absolute inset-0 backface-hidden rotate-y-180 flex items-center justify-center p-8 bg-gradient-to-br from-violet-600 to-indigo-600 border-none rounded-3xl shadow-2xl shadow-indigo-500/20 text-center">
                  <p className="text-xl text-white font-medium leading-relaxed drop-shadow-md">{data.flashcards[currentFlashcard].definition}</p>
                </Card>
             </motion.div>
           </div>
           
           <div className="flex items-center gap-6 mt-8">
             <Button 
                variant="outline" 
                onClick={() => {
                  setFlashcardFlipped(false);
                  setCurrentFlashcard(prev => Math.max(0, prev - 1));
                }}
                disabled={currentFlashcard === 0}
                className="border-white/10 bg-white/5 text-white hover:bg-white/10 rounded-xl px-6 h-12 font-bold"
             >
              Previous
             </Button>
             <span className="text-slate-400 font-bold tracking-widest text-sm">
               {currentFlashcard + 1} / {data.flashcards.length}
             </span>
             <Button 
                onClick={() => {
                  setFlashcardFlipped(false);
                  setCurrentFlashcard(prev => Math.min(data.flashcards.length - 1, prev + 1));
                }}
                disabled={currentFlashcard === data.flashcards.length - 1}
                className="bg-white text-black hover:bg-slate-200 rounded-xl px-6 h-12 font-bold shadow-lg shadow-white/5"
             >
              Next Card
             </Button>
           </div>
        </TabsContent>

        <TabsContent value="quiz" className="mt-6 max-w-3xl mx-auto">
          {quizFinished ? (
            <Card className="bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl relative overflow-hidden text-center py-12">
              <CardContent className="space-y-6">
                <Trophy className={`mx-auto h-20 w-20 ${quizScore / data.maxScore > 0.8 ? "text-yellow-400" : "text-slate-500"}`} />
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-white">Quiz Completed!</h2>
                  <p className="text-slate-400">You scored {quizScore} out of {data.maxScore}</p>
                </div>
                <div className="pt-4">
                  <Button onClick={() => navigate("/dashboard")} className="bg-white text-black px-8 h-12 rounded-xl font-bold shadow-lg shadow-white/5">
                    View Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl relative overflow-hidden">
              <CardContent className="p-8 space-y-8">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium text-slate-400">
                    <span className="uppercase tracking-widest text-[10px] font-bold">Question {currentQuestion + 1} of {data.maxScore}</span>
                    <span className="uppercase tracking-widest text-[10px] font-bold">Score: {quizScore}</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                    <div 
                       className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full transition-all duration-500"
                       style={{ width: `${(currentQuestion / data.maxScore) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="min-h-[160px]">
                  <h3 className="text-2xl font-bold text-white leading-relaxed">
                    {mcqData ? mcqData.question : tfData?.question}
                  </h3>
                </div>

                <div className="space-y-3">
                  {mcqData && mcqData.options.map((opt, idx) => (
                    <button
                      key={idx}
                      disabled={showExplanation}
                      onClick={() => {
                        setSelectedOption(idx);
                        handleAnswerSubmit(idx === mcqData.correctIndex);
                      }}
                      className={`w-full p-4 rounded-2xl text-left border-2 transition-all shadow-sm ${
                        showExplanation
                          ? idx === mcqData.correctIndex
                            ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-300 shadow-emerald-500/10"
                            : selectedOption === idx
                              ? "bg-rose-500/10 border-rose-500/50 text-rose-300 shadow-rose-500/10"
                              : "bg-white/5 border-transparent text-slate-500"
                          : "bg-white/5 border-transparent hover:border-white/20 hover:bg-white/10 text-slate-200"
                      }`}
                    >
                      <div className="flex justify-between items-center font-medium">
                        <span>{opt}</span>
                        {showExplanation && idx === mcqData.correctIndex && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
                        {showExplanation && selectedOption === idx && idx !== mcqData.correctIndex && <XCircle className="h-5 w-5 text-rose-400" />}
                      </div>
                    </button>
                  ))}

                  {tfData && [true, false].map((opt, idx) => (
                    <button
                      key={idx}
                      disabled={showExplanation}
                      onClick={() => {
                        setSelectedOption(idx);
                        handleAnswerSubmit(opt === tfData.correctAnswer);
                      }}
                      className={`w-full p-4 rounded-2xl text-left border-2 transition-all shadow-sm font-medium ${
                        showExplanation
                          ? opt === tfData.correctAnswer
                            ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-300 shadow-emerald-500/10"
                            : selectedOption === idx
                              ? "bg-rose-500/10 border-rose-500/50 text-rose-300 shadow-rose-500/10"
                              : "bg-white/5 border-transparent text-slate-500"
                          : "bg-white/5 border-transparent hover:border-white/20 hover:bg-white/10 text-slate-200"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{opt ? "True" : "False"}</span>
                        {showExplanation && opt === tfData.correctAnswer && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
                        {showExplanation && selectedOption === idx && opt !== tfData.correctAnswer && <XCircle className="h-5 w-5 text-rose-400" />}
                      </div>
                    </button>
                  ))}
                </div>

                <AnimatePresence>
                  {showExplanation && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="bg-white/5 border border-white/10 rounded-2xl p-5 mt-6"
                    >
                      <p className="text-slate-300 text-sm leading-relaxed">
                        <span className="font-bold text-white uppercase tracking-wider text-xs mr-2">Explanation:</span>
                        {mcqData ? mcqData.explanation : tfData?.explanation}
                      </p>
                      <div className="mt-6 flex justify-end">
                        <Button onClick={handleNextQuestion} className="bg-white text-black font-bold gap-2 rounded-xl h-10 px-6 shadow-lg shadow-white/5">
                          Next <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

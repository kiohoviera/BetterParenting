import { doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase";


import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Star } from "lucide-react";

interface PersonalityEvaluationProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (profile: string) => void;
  childName: string;
  userId: string;
  childId: string;
}

interface Question {
  id: string;
  text: string;
  dimension: "E" | "I" | "S" | "N" | "T" | "F" | "J" | "P";
}

const questions: Question[] = [
  // Extraversion (E) vs. Introversion (I)
  { id: "e1", text: "My child likes meeting new friends.", dimension: "E" },
  {
    id: "e2",
    text: "My child enjoys talking or playing in big groups.",
    dimension: "E",
  },
  {
    id: "e3",
    text: "My child likes being the center of attention.",
    dimension: "E",
  },
  {
    id: "i1",
    text: "My child enjoys playing quietly by myself.",
    dimension: "I",
  },
  { id: "i2", text: "My child needs alone time to feel good.", dimension: "I" },
  {
    id: "i3",
    text: "My child thinks a lot before he/she speaks.",
    dimension: "I",
  },

  // Sensing (S) vs. Intuition (N)
  {
    id: "s1",
    text: "My child notice small details most people miss.",
    dimension: "S",
  },
  {
    id: "s2",
    text: "My child remember facts and instructions well.",
    dimension: "S",
  },
  { id: "s3", text: "My child like things to stay the same.", dimension: "S" },
  {
    id: "n1",
    text: "My child often imagine new games or stories.",
    dimension: "N",
  },
  {
    id: "n2",
    text: "My child enjoys thinking about what could happen.",
    dimension: "N",
  },
  {
    id: "n3",
    text: "My child likes to come up with new ideas or ways to do things.",
    dimension: "N",
  },

  // Thinking (T) vs. Feeling (F)
  {
    id: "t1",
    text: "My child likes solving problems by figuring out what makes sense.",
    dimension: "T",
  },
  {
    id: "t2",
    text: "My child likes rules to be clear and fair.",
    dimension: "T",
  },
  {
    id: "t3",
    text: "My child thinks about what is right or wrong using facts.",
    dimension: "T",
  },
  {
    id: "f1",
    text: "My child cares a lot about how others feel.",
    dimension: "F",
  },
  {
    id: "f2",
    text: "My child tries to make everyone happy when someone is upset.",
    dimension: "F",
  },
  {
    id: "f3",
    text: "My child make choices by thinking about other people's feelings.",
    dimension: "F",
  },

  // Judging (J) vs. Perceiving (P)
  {
    id: "j1",
    text: "My child likes to make plans and know what will happen next.",
    dimension: "J",
  },
  {
    id: "j2",
    text: "My child likes finishing my homework or chores before playing.",
    dimension: "J",
  },
  {
    id: "j3",
    text: "My child likes to feel good when things are organized.",
    dimension: "J",
  },
  {
    id: "p1",
    text: "My child enjoys trying new things, even if he/she don't know what will happen.",
    dimension: "P",
  },
  {
    id: "p2",
    text: "My child likes to change plans if he/she finds something more fun to do.",
    dimension: "P",
  },
  {
    id: "p3",
    text: "My child doesn't mind if things are a bit messy or unplanned.",
    dimension: "P",
  },
];

const dimensionTitles = {
  E: "Extraversion (E) vs. Introversion (I)",
  I: "Extraversion (E) vs. Introversion (I)",
  S: "Sensing (S) vs. Intuition (N)",
  N: "Sensing (S) vs. Intuition (N)",
  T: "Thinking (T) vs. Feeling (F)",
  F: "Thinking (T) vs. Feeling (F)",
  J: "Judging (J) vs. Perceiving (P)",
  P: "Judging (J) vs. Perceiving (P)",
};

const personalityDescriptions: Record<string, string> = {
  ESTJ: "The Executive - Organized, decisive, and natural leaders who enjoy taking charge.",
  ENTJ: "The Commander - Strategic thinkers who are natural born leaders and love challenges.",
  ESFJ: "The Consul - Warm-hearted and popular, always eager to help others.",
  ENFJ: "The Protagonist - Charismatic and inspiring leaders who care deeply about others.",
  ESTP: "The Entrepreneur - Energetic and spontaneous, they love being active and social.",
  ENTP: "The Debater - Curious and clever, always looking for new possibilities.",
  ESFP: "The Entertainer - Spontaneous and enthusiastic, they love being around people.",
  ENFP: "The Campaigner - Creative and enthusiastic, with a strong people focus.",
  ISTJ: "The Logistician - Practical and methodical, they value tradition and reliability.",
  INTJ: "The Architect - Imaginative and strategic thinkers with a plan for everything.",
  ISFJ: "The Protector - Warm and considerate, always ready to help those they care about.",
  INFJ: "The Advocate - Creative and insightful, inspired by their values and beliefs.",
  ISTP: "The Virtuoso - Bold and practical, they love to experiment and explore.",
  INTP: "The Thinker - Innovative and curious, they love exploring theoretical concepts.",
  ISFP: "The Adventurer - Flexible and charming, they are guided by their values.",
  INFP: "The Mediator - Idealistic and loyal, they value inner harmony and personal values.",
};

export const PersonalityEvaluation = ({
  isOpen,
  onClose,
  onComplete,
  childName,
  userId,
  childId,
}: PersonalityEvaluationProps) => {
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [currentSection, setCurrentSection] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [calculatedType, setCalculatedType] = useState("");
  const [error, setError] = useState<string | null>(null); // State for error messages
  const [isLoading, setIsLoading] = useState(false); // State for loading


  useEffect(() => {
    const fetchSavedEvaluation = async () => {
      if (!isOpen || !userId || !childId) return;

      // Handle "temp" children: delete from Firestore if exists and reset UI
      if (childId === "temp") {
        try {
          const tempDocRef = doc(db, "users", userId, "children", childId);
          const tempDocSnap = await getDoc(tempDocRef);

          if (tempDocSnap.exists()) {
            await deleteDoc(tempDocRef);
            console.log("Deleted temp child document from Firestore.");
          }
        } catch (error) {
          console.error("Failed to delete temp child from Firestore:", error);
        }

        setResponses({});
        setShowResult(false);
        setCalculatedType("");
        return;
      }

      try {
        const childDocRef = doc(db, "users", userId, "children", childId);
        const childSnapshot = await getDoc(childDocRef);

        if (childSnapshot.exists()) {
          const data = childSnapshot.data();
          const evaluation = data.personalityEvaluation;

          if (evaluation) {
            setResponses(evaluation.responses || {});
            setCalculatedType(
              evaluation.enhancedProfile
                ? `${evaluation.type}|${evaluation.enhancedProfile}`
                : evaluation.type
            );
            setShowResult(true);
          } else if (data.answers || data.type) {
            // Legacy format
            setResponses(data.answers || {});
            setCalculatedType(data.type || "");
            setShowResult(true);
          }
        }
      } catch (err) {
        console.error("Failed to fetch evaluation:", err);
      }
    };

    fetchSavedEvaluation();
  }, [isOpen, userId, childId]);


  const sections = [
    {
      title: "Extraversion (E) vs. Introversion (I)",
      questions: questions.slice(0, 6),
    },
    {
      title: "Sensing (S) vs. Intuition (N)",
      questions: questions.slice(6, 12),
    },
    {
      title: "Thinking (T) vs. Feeling (F)",
      questions: questions.slice(12, 18),
    },
    {
      title: "Judging (J) vs. Perceiving (P)",
      questions: questions.slice(18, 24),
    },
  ];

  const handleStarClick = (questionId: string, rating: number) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: rating,
    }));
  };

  const calculatePersonalityType = () => {
    const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

    Object.entries(responses).forEach(([questionId, rating]) => {
      const question = questions.find((q) => q.id === questionId);
      if (question) {
        scores[question.dimension] += rating;
      }
    });

    const type =
      (scores.E > scores.I ? "E" : "I") +
      (scores.S > scores.N ? "S" : "N") +
      (scores.T > scores.F ? "T" : "F") +
      (scores.J > scores.P ? "J" : "P");

    return type;
  };

  const handleComplete = async () => {
    setIsLoading(true); // Start loading
    setError(null); // Clear previous errors

    const personalityType = calculatePersonalityType();
    setCalculatedType(personalityType);

    // Try to get enhanced profile from OpenAI
    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
      if (!apiKey) {
        setError("OPENAI_API_KEY environment variable not found. Please check Secrets configuration.");
        setIsLoading(false);
        return;
      }

      const responseData = Object.entries(responses)
        .map(([questionId, rating]) => {
          const question = questions.find((q) => q.id === questionId);
          return `${question?.text}: ${rating}/5`;
        })
        .join("\n");

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "You are a child development specialist. Based on the personality assessment responses, provide a comprehensive personality profile for the child. Focus on practical insights for parenting. Keep it concise but insightful.",
              },
              {
                role: "user",
                content: `Based on these personality assessment responses for ${childName}:\n\n${responseData}\n\nThe calculated MBTI type is: ${personalityType}\n\nProvide EXACTLY 4 sentences in plain text (no formatting, bullet points, or headers). Each sentence should cover: 1) Key personality traits, 2) Primary strengths to nurture, 3) One potential challenge, 4) Brief parenting approach. Keep it under 100 words total.`,
              },
            ],
            max_tokens: 200,
            temperature: 0.7,
          }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        const enhancedProfile = data.choices[0].message.content;
        setCalculatedType(`${personalityType}|${enhancedProfile}`);
      } else {
        // Fallback to basic type if API call fails
        console.error("OpenAI API error:", response.status, await response.text());
        setCalculatedType(personalityType); // Fallback to basic type
      }
    } catch (error) {
      // Fallback to basic type if network error occurs
      console.error("Error calling OpenAI API:", error);
      setCalculatedType(personalityType); // Fallback to basic type
    } finally {
      setIsLoading(false); // End loading
      setShowResult(true);
    }
  };


  const handleFinalConfirm = async () => {
    try {
      const [basicType, enhancedProfile] = calculatedType.includes("|")
        ? calculatedType.split("|")
        : [calculatedType, null];

      const childDocRef = doc(db, "users", userId, "children", childId);

      //  Convert responses to use full question text
      const responseWithQuestionText: Record<string, number> = {};

      Object.entries(responses).forEach(([questionId, rating]) => {
        const question = questions.find((q) => q.id === questionId);
        if (question) {
          responseWithQuestionText[question.id] = rating;
        }
      });

      await setDoc(
        childDocRef,
        {
          personalityEvaluation: {
            type: basicType,
            enhancedProfile: enhancedProfile || null,
            responses: responseWithQuestionText,
            timestamp: new Date().toISOString(),
          },
          personalityProfile: calculatedType, // Also update the main personalityProfile field
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error saving evaluation:", error);
    }

    // Cleanup and pass the complete profile to parent
    onComplete(calculatedType);
    onClose();
    setResponses({});
    setCurrentSection(0);
    setShowResult(false);
    setCalculatedType("");
  };


  const allQuestionsAnswered = questions.every(
    (q) => responses[q.id] !== undefined,
  );

  const StarRating = ({
    questionId,
    currentRating,
  }: {
    questionId: string;
    currentRating?: number;
  }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleStarClick(questionId, star)}
          className="p-1 transition-colors hover:scale-110"
        >
          <Star
            className={`w-6 h-6 ${
              currentRating && star <= currentRating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 hover:text-yellow-300"
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Personality Evaluation for {childName}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Rate each statement from 1-5 stars based on how well it describes
            your child. We will use this as initial basis to better give
            insights and advices on your child depending on their personality
            type.
          </p>
        </DialogHeader>

        <ScrollArea className="h-96 pr-4">
          {showResult ? (
            <div className="text-center space-y-6 py-8">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                  <strong className="font-bold">Error: </strong>
                  <span className="block sm:inline">{error}</span>
                </div>
              )}
              {(() => {
                const [basicType, enhancedProfile] = calculatedType.includes(
                  "|",
                )
                  ? calculatedType.split("|")
                  : [calculatedType, null];

                return (
                  <>
                    <div className="text-6xl font-bold text-primary mb-4">
                      {basicType}
                    </div>
                    <h3 className="text-2xl font-semibold text-foreground">
                      {personalityDescriptions[basicType]?.split(" - ")[0] ||
                        "Personality Type"}
                    </h3>

                    {enhancedProfile ? (
                      <div className="text-left max-w-2xl mx-auto space-y-4">
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-xs text-green-600 font-medium mb-2">
                            ✓ Enhanced with AI Analysis
                          </p>
                        </div>
                        <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                          {enhancedProfile}
                        </div>
                      </div>
                    ) : (
                      <p className="text-lg text-muted-foreground max-w-md mx-auto">
                        {personalityDescriptions[basicType]?.split(" - ")[1] ||
                          "A unique personality profile has been calculated for your child."}
                      </p>
                    )}

                    <div className="bg-blue-50 p-4 rounded-lg mt-6">
                      <p className="text-sm text-blue-700">
                        This personality profile will help us provide more
                        personalized advice and insights for {childName}.
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="space-y-6">
              {sections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary border-b pb-2">
                    {section.title}
                  </h3>
                  {section.questions.map((question) => (
                    <div
                      key={question.id}
                      className="p-4 border rounded-lg space-y-3"
                    >
                      <p className="text-sm font-medium">{question.text}</p>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          <span>Not at all</span>
                          <span className="ml-8">Very much</span>
                        </div>
                        <StarRating
                          questionId={question.id}
                          currentRating={responses[question.id] || 0}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-between items-center pt-4 border-t">
          {showResult ? (
            <div className="w-full flex justify-center gap-2">
              <Button variant="outline" onClick={() => setShowResult(false)}>
                Back to Questions
              </Button>
              <Button onClick={handleFinalConfirm} className="btn-warm">
                Confirm & Save Profile
              </Button>
            </div>
          ) : (
            <>
              <div className="text-sm text-muted-foreground">
                {Object.keys(responses).length} of {questions.length} questions
                answered
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={!allQuestionsAnswered || isLoading}
                  className="btn-warm"
                >
                  {isLoading ? "Processing..." : "Complete Evaluation"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
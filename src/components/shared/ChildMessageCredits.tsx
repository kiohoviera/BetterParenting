import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { Progress } from "@/components/ui/progress";

interface ChildMessageCreditsProps {
  childId: string;
}

export const ChildMessageCredits = ({ childId }: ChildMessageCreditsProps) => {
  const [remainingMessages, setRemainingMessages] = useState<number | "unlimited">("unlimited");
  const [maxPlanMessages, setMaxPlanMessages] = useState<number | "unlimited">("unlimited");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user || !childId) return;

      try {
        const childRef = doc(db, "users", user.uid, "children", childId);
        const childSnap = await getDoc(childRef);
        if (!childSnap.exists()) throw new Error("Child not found");

        const childData = childSnap.data();
        const remaining = childData.remainingMessages;
        if (remaining === undefined || remaining === null) throw new Error("Missing remainingMessages");
        setRemainingMessages(remaining);

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) throw new Error("User not found");

        const planId = userSnap.data().planId ?? "free";

        const planRef = doc(db, "plans", planId);
        const planSnap = await getDoc(planRef);
        if (!planSnap.exists()) throw new Error("Plan not found");

        const planData = planSnap.data();
        const planMax = planData.maxConversations;

        if (typeof planMax === "number") {
          setMaxPlanMessages(planId === "ultimate" || planMax === 999 ? "unlimited" : planMax);
        } else {
          setMaxPlanMessages("unlimited");
        }
      } catch (error) {
        console.error("Error fetching message credits:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [childId]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading message credits...</p>;
  if (error) return <p className="text-sm text-red-500">Failed to fetch remaining credits</p>;

  const isUnlimited = (val: number | string) => val === -1 || val === "unlimited";

  if (isUnlimited(remainingMessages) || isUnlimited(maxPlanMessages)) {
    return (
      <div className="text-sm w-full">
        <p className="mb-1 text-muted-foreground">Unlimited messages</p>
        <Progress value={100} className="h-1" />
      </div>
    );
  }

  const displayMax = Math.max(remainingMessages, maxPlanMessages);
  const usedMessages = displayMax - remainingMessages;
  const progress = Math.min((usedMessages / displayMax) * 100, 100);

  return (
    <div className="text-sm w-full">
      <p className="mb-1 text-muted-foreground">
        {remainingMessages} messages left ({usedMessages}/{displayMax})
      </p>
      <Progress value={progress} className="h-1" />
    </div>
  );
};

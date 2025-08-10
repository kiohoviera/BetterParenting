import { getDocs, collection, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";

export async function ApplyPlanCreditsToChildren(userId: string, maxConversations: number) {
  const childrenRef = collection(db, "users", userId, "children");
  const snapshot = await getDocs(childrenRef);

  const updatePromises = snapshot.docs.map(async (docSnap) => {
    const data = docSnap.data();
    const currentCredits = Number(data.remainingMessages) || 0;
    const newCredits = currentCredits + Number(maxConversations);

    await updateDoc(docSnap.ref, {
      remainingMessages: newCredits,
    });
  });

  await Promise.all(updatePromises);
}

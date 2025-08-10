import { db } from "@/firebase";
import {
  collection,
  getDocs,
  query,
} from "firebase/firestore";

export const fetchChildrenForUser = async (userId: string) => {
  const childrenRef = collection(db, "users", userId, "children");
  const q = query(childrenRef);
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name || "",
      age: data.age || 0,
      personalityProfile: data.personalityProfile || "",
      interests: data.interests || [],
      whatsappNumber: data.whatsappNumber || "",
      remainingMessages: data.remainingMessages || 0,
      isFrozen: data.isFrozen ?? false,
    };
  }) as {
    id: string;
    name: string;
    age: number;
    personalityProfile?: string;
    interests?: string[];
    whatsappNumber?: string;
    remainingMessages?: number;
    isFrozen?: boolean;
  }[];
};

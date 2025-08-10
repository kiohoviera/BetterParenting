// src/components/shared/FreezeExtraChildren.ts

import { collection, getDocs, updateDoc, DocumentData, DocumentReference } from "firebase/firestore";
import { db } from "@/firebase";

interface ChildProfile {
  id: string;
  ref: DocumentReference<DocumentData>;
  remainingMessages: number;
  isFrozen?: boolean;
}

export async function freezeExtraChildrenIfNeeded(userId: string, allowedChildren: number) {
  const childrenRef = collection(db, "users", userId, "children");
  const snapshot = await getDocs(childrenRef);

  const children: ChildProfile[] = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ref: doc.ref,
      remainingMessages: data.remainingMessages ?? 0,
      isFrozen: data.isFrozen ?? false,
    };
  });

  // Sort children by remainingMessages descending
  const sortedChildren = children.sort((a, b) => b.remainingMessages - a.remainingMessages);

  let allowed = 0;

  const updatePromises = sortedChildren.map(async (child) => {
    const shouldUnfreeze = (allowed < allowedChildren) || child.remainingMessages > 0;
    const isCurrentlyFrozen = child.isFrozen ?? false;

    if (shouldUnfreeze && isCurrentlyFrozen) {
      allowed++;
      return updateDoc(child.ref, { isFrozen: false });
    } else if (!shouldUnfreeze && !isCurrentlyFrozen) {
      return updateDoc(child.ref, { isFrozen: true });
    } else if (shouldUnfreeze) {
      allowed++;
    }

    return null; // No update needed
  });

  await Promise.all(updatePromises);
}

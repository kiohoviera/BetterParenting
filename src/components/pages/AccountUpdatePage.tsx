
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "../../firebase";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { PersonalityEvaluation } from "@/components/shared/PersonalityEvaluation";

export const AccountUpdatePage = () => {
  const [parentName, setParentName] = useState("");
  const [children, setChildren] = useState([
    {
      id: null,
      name: "",
      age: "",
      personalityProfile: "",
      interests: "",
      responses: {},
    },
  ]);
  const [editingChildren, setEditingChildren] = useState<boolean[]>([]);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankName, setBankName] = useState("");
  const [maxChildren, setMaxChildren] = useState<number>(1);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [userData, setUserData] = useState<any | null>(null);
  const [isEditingParentInfo, setIsEditingParentInfo] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [planName, setPlanName] = useState("Free");


  const [personalityEvalChild, setPersonalityEvalChild] = useState<{
    id: string | null;
    name?: string;
    age?: string;
    personalityProfile?: string;
  } | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const planId = searchParams.get("plan");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate(`/login?next=account-setup&plan=${planId}`);
      }
    });
    return () => unsubscribe();
  }, [navigate, planId]);

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserData(data);
          setParentName(data.name || "");
          setPhone(data.phone || "");
          setAddress(data.address || "");
          setBankAccount(data.bankAccount || "");
          setBankName(data.bankName || "");
          setMaxChildren(data.maxChildren || 1);

          if (data.planId) {
            const planRef = doc(db, "plans", data.planId);
            const planSnap = await getDoc(planRef);
            if (planSnap.exists()) {
              const planData = planSnap.data();
              setPlanName(planData.name || "Free");
            }
          }
        }

        const childrenRef = collection(userRef, "children");
        const childrenSnap = await getDocs(childrenRef);
        const loadedChildren = childrenSnap.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            name: data.name || "",
            age: data.age?.toString() || "",
            personalityProfile: data.personalityProfile || "",
            interests: (data.interests || []).join(", "),
            responses: data.personalityEvaluation?.responses || {},
          };
        });

        if (loadedChildren.length > 0) {
          setChildren(loadedChildren);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoadingPlan(false);
      }
    };

    fetchData();
  }, [planId]);

  useEffect(() => {
    setEditingChildren(new Array(children.length).fill(false));
  }, [children.length]);

  const handleAddChild = () => {
    if (children.length >= maxChildren) return;
    setChildren((prev) => [
      ...prev,
      {
        id: null,
        name: "",
        age: "",
        personalityProfile: "",
        interests: "",
        responses: {},
      },
    ]);
  };

  const toggleChildEditing = (index: number) => {
    setEditingChildren((prev) => {
      const updated = [...prev];
      updated[index] = !updated[index];
      return updated;
    });
  };

  const handleChildChange = (index: number, field: string, value: string) => {
    setChildren((prev) => {
      const updated = [...prev];
      updated[index][field as keyof typeof updated[0]] = value;
      return updated;
    });
  };

  const handlePersonalityComplete = (personalityType: string) => {
    if (!personalityEvalChild) return;

    const idx = personalityEvalChild.id
      ? children.findIndex((c) => c.id === personalityEvalChild.id)
      : children.length - 1;

    if (idx < 0) return;

    const updated = [...children];
    updated[idx].personalityProfile = personalityType;
    setChildren(updated);
    setPersonalityEvalChild(null);
  };

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);

    try {
      const planRef = planId ? doc(db, "plans", planId) : null;
      const planSnap = planRef ? await getDoc(planRef) : null;
      const planData = planSnap?.exists() ? planSnap.data() : {};
      const newMaxConversations = planData?.maxConversations ?? userData?.maxConversations ?? 0;
      const newMaxChildren = planData?.maxChildren ?? userData?.maxChildren ?? 1;

      await setDoc(
        userRef,
        {
          name: parentName,
          email: user.email,
          phone,
          address,
          bankAccount,
          bankName,
          ...(planId && {
            planId,
            subscribedAt: new Date(),
            maxChildren: newMaxChildren,
            maxConversations: newMaxConversations,
          }),
        },
        { merge: true }
      );

      const childrenRef = collection(userRef, "children");

      for (const child of children.slice(0, newMaxChildren)) {
        if (!child.name || !child.age) continue;

        const childData = {
          name: child.name,
          age: Number(child.age),
          personalityProfile: child.personalityProfile,
          interests: child.interests
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          remainingMessages: newMaxConversations,
        };

        if (child.id) {
          const childDocRef = doc(childrenRef, child.id);
          await setDoc(childDocRef, childData, { merge: true });
        } else {
          await addDoc(childrenRef, childData);
        }
      }

      navigate("/my-children");
    } catch (error) {
      console.error("Error updating account:", error);
    }
  };

  const isPlanExpired = () => {
    if (!userData?.subscribedAt?.toDate) return false;
    const subscribed = userData.subscribedAt.toDate();
    const expiry = new Date(subscribed.getTime() + 30 * 24 * 60 * 60 * 1000);
    return new Date() > expiry;
  };

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, "");
    const match = digits.match(/^(\d{0,4})(\d{0,3})(\d{0,4})$/);
    if (!match) return digits;
    return [match[1], match[2], match[3]].filter(Boolean).join(" ").trim();
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };


  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header onStartChat={() => {}} />

      <div className="container max-w-4xl mx-auto px-4 pt-10 pb-20 space-y-10 fade-in-gentle">

        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-foreground">
          Update Your Parent Account
        </h1>

        {/* Parent Info */}
        <Card className="p-6 shadow-gentle space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-foreground">Parent Info</h2>
            <Button size="sm" variant="ghost" onClick={() => setIsEditingParentInfo(prev => !prev)}>
              {isEditingParentInfo ? "Cancel" : "Edit"}
            </Button>
          </div>

          <Input
            placeholder="Full Name"
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
            disabled={!isEditingParentInfo}
          />
          <Input
            placeholder="Email (from Google)"
            value={auth.currentUser?.email || ""}
            disabled
          />
          <Input
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneChange}
            placeholder="0924 231 2345"
            maxLength={13}
            disabled={!isEditingParentInfo}
          />
          <Input
            placeholder="Home Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            disabled={!isEditingParentInfo}
          />
          <Input
            placeholder="Bank Account Number"
            value={bankAccount}
            onChange={(e) => setBankAccount(e.target.value)}
            disabled={!isEditingParentInfo}
          />
          <Input
            placeholder="Bank Name"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            disabled={!isEditingParentInfo}
          />

          {isEditingParentInfo && (
            <Button variant="warm" className="w-full" onClick={() => setIsEditingParentInfo(false)}>
              Save Info
            </Button>
          )}
        </Card>

        {/* Family Plan Info */}
        {userData && (
          <Card className="p-6 shadow-gentle space-y-2 text-sm text-muted-foreground">
            <h2 className="text-xl font-semibold text-foreground mb-2">Family Plan Info</h2>
            <p><strong>Plan:</strong> {planName || "Free"}</p>
            <p><strong>Status:</strong> {isPlanExpired() ? "Expired" : "Active"}</p>
            <p><strong>Subscribed At:</strong> {userData.subscribedAt?.toDate ? formatDate(userData.subscribedAt.toDate()) : "N/A"}</p>
            <p><strong>Expires At:</strong> {userData.subscribedAt?.toDate ? formatDate(new Date(userData.subscribedAt.toDate().getTime() + 30 * 24 * 60 * 60 * 1000)) : "Unknown"}</p>
            <p><strong>Max Children:</strong> {userData.maxChildren}</p>
            <p><strong>Max Messages / Month:</strong> {userData.maxConversations}</p>

            <Button variant="secondary" className="mt-4 w-full" onClick={() => navigate("/pricing")}>
              Change Plan
            </Button>
          </Card>
        )}

        {/* Child Profiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {children.map((child, index) => {
            const isEditing = editingChildren[index] || false;

            return (
              <Card key={child.id ?? index} className="p-6 shadow-gentle space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-medium text-foreground">Child #{index + 1}</h2>
                  <Button size="sm" variant="ghost" onClick={() => toggleChildEditing(index)}>
                    {isEditing ? "Cancel" : "Edit"}
                  </Button>
                </div>

                <Input
                  placeholder="Name"
                  value={child.name}
                  onChange={(e) => handleChildChange(index, "name", e.target.value)}
                  disabled={!isEditing}
                />
                <Input
                  placeholder="Age"
                  type="number"
                  value={child.age}
                  min={0}
                  max={99}
                  onChange={(e) => handleChildChange(index, "age", e.target.value)}
                  disabled={!isEditing}
                />
                <Input
                  placeholder="Interests (comma-separated)"
                  value={child.interests}
                  onChange={(e) => handleChildChange(index, "interests", e.target.value)}
                  disabled={!isEditing}
                />

                <div>
                  <label className="block text-sm text-foreground mb-1">Personality Profile</label>
                  {child.personalityProfile ? (
                    <div className="flex items-center justify-between mb-2">
                      <strong>{child.personalityProfile}</strong>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setPersonalityEvalChild({
                            id: child.id ?? null,
                            name: child.name,
                          })
                        }
                      >
                        Update
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPersonalityEvalChild({
                          id: child.id ?? null,
                          name: child.name,
                        })
                      }
                    >
                      Evaluate Personality
                    </Button>
                  )}
                </div>

                {isEditing && (
                  <Button variant="warm" className="w-full" onClick={() => toggleChildEditing(index)}>
                    Save Info
                  </Button>
                )}
              </Card>
            );
          })}
        </div>

        {/* Add More Children */}
        <Button
          variant="ghost"
          className="w-full flex items-center justify-center gap-2 text-accent"
          onClick={handleAddChild}
          disabled={children.length >= maxChildren}
        >
          <Plus className="w-4 h-4" />
          Add Another Child
        </Button>

        {children.length >= maxChildren && (
          <p className="text-sm text-muted-foreground text-center">
            You've reached the limit of {maxChildren} child{maxChildren > 1 ? "ren" : ""} for your plan.
          </p>
        )}

        {/* Save All */}
        <Button variant="warm" className="w-full" onClick={handleSubmit} disabled={loadingPlan}>
          Save All Changes
        </Button>
      </div>

      <Footer />

      {/* Modal */}
      {personalityEvalChild && (
        <PersonalityEvaluation
          isOpen={!!personalityEvalChild}
          childName={personalityEvalChild.name || "New Child"}
          childId={personalityEvalChild.id}
          userId={auth.currentUser?.uid ?? ""}
          onClose={() => setPersonalityEvalChild(null)}
          onComplete={handlePersonalityComplete}
        />
      )}
    </div>

  );
};

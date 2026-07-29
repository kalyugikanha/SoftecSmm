import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase/client";
import type { Brand, ContentPillar, PostIdea, ApprovedPost } from "./types";

// ===== COLLECTIONS =====
const BRANDS = "brands";
const PILLARS = "pillars";
const IDEAS = "ideas";
const POSTS = "posts";

// ===== BRAND =====
export const getBrand = async (brandId: string): Promise<Brand | null> => {
  const snap = await getDoc(doc(db, BRANDS, brandId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Brand;
};

export const getAllBrands = async (): Promise<Brand[]> => {
  const snap = await getDocs(collection(db, BRANDS));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Brand));
};

export const createBrand = async (data: Omit<Brand, "id" | "createdAt" | "updatedAt">) => {
  const ref = await addDoc(collection(db, BRANDS), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateBrand = async (brandId: string, data: Partial<Brand>) => {
  await updateDoc(doc(db, BRANDS, brandId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

// ===== PILLARS =====
export const getPillars = async (brandId: string): Promise<ContentPillar[]> => {
  const q = query(collection(db, PILLARS), where("brandId", "==", brandId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ContentPillar));
};

export const createPillar = async (data: Omit<ContentPillar, "id" | "createdAt">) => {
  const ref = await addDoc(collection(db, PILLARS), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const deletePillar = async (pillarId: string) => {
  await deleteDoc(doc(db, PILLARS, pillarId));
};

// ===== IDEAS =====
export const getIdeas = async (brandId: string): Promise<PostIdea[]> => {
  const q = query(
    collection(db, IDEAS),
    where("brandId", "==", brandId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as PostIdea));
};

export const createIdea = async (data: Omit<PostIdea, "id" | "createdAt" | "updatedAt">) => {
  const ref = await addDoc(collection(db, IDEAS), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateIdea = async (ideaId: string, data: Partial<PostIdea>) => {
  await updateDoc(doc(db, IDEAS, ideaId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const getPendingIdeas = async (brandId: string): Promise<PostIdea[]> => {
  const q = query(
    collection(db, IDEAS),
    where("brandId", "==", brandId),
    where("status", "==", "pending_approval"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as PostIdea));
};

// ===== POSTS =====
export const getPosts = async (brandId: string): Promise<ApprovedPost[]> => {
  const q = query(
    collection(db, POSTS),
    where("brandId", "==", brandId),
    orderBy("scheduledAt", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ApprovedPost));
};

export const createPost = async (data: Omit<ApprovedPost, "id" | "createdAt">) => {
  const ref = await addDoc(collection(db, POSTS), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const updatePost = async (postId: string, data: Partial<ApprovedPost>) => {
  await updateDoc(doc(db, POSTS, postId), data);
};

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const configs = import.meta.glob('../../firebase-applet-config.json', { eager: true });
const localConfig: any = configs['../../firebase-applet-config.json'];

const firebaseConfig = localConfig?.default || localConfig || {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "missing",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "missing",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "missing",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "missing",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "missing",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "missing",
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || undefined,
};

let app: any;
let authInstance: any;
let dbInstance: any;
let providerInstance: any;

try {
  app = initializeApp(firebaseConfig);
  authInstance = getAuth(app);
  dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  providerInstance = new GoogleAuthProvider();
} catch (e) {
  console.error("Failed to initialize Firebase. Check your environment variables.", e);
  authInstance = {} as any;
  dbInstance = {} as any;
  providerInstance = {} as any;
}

export const auth = authInstance;
export const db = dbInstance;
export const googleProvider = providerInstance;

export { signInWithPopup, signOut, onAuthStateChanged };

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

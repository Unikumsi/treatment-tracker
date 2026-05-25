import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const DATA_PATH = 'treatment/v1';

export function subscribeToData(callback) {
  const dataRef = ref(db, DATA_PATH);
  return onValue(dataRef, (snapshot) => {
    callback(snapshot.val() || {});
  });
}

export function saveDataToCloud(data) {
  return set(ref(db, DATA_PATH), data);
}

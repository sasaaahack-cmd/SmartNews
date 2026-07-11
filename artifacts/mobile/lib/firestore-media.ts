import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  orderBy,
  limit,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  MusicVideo,
  Movie,
  LiveStream,
  PublishMusicVideoForm,
  PublishMovieForm,
  PublishLiveStreamForm,
} from '@/types/media';

// ── Helpers ────────────────────────────────────────────────────────────────

function tsToDate(ts: Timestamp | Date | null): Date | null {
  if (!ts) return null;
  if (ts instanceof Date) return ts;
  return (ts as Timestamp).toDate?.() ?? null;
}

// ── Music Videos ──────────────────────────────────────────────────────────

export async function getMusicVideos(count = 20): Promise<MusicVideo[]> {
  try {
    const q = query(collection(db, 'music_videos'), orderBy('publishedAt', 'desc'), limit(count));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      ...(d.data() as Omit<MusicVideo, 'id' | 'publishedAt'>),
      id: d.id,
      publishedAt: tsToDate(d.data().publishedAt) ?? new Date(),
    }));
  } catch {
    return [];
  }
}

export async function publishMusicVideo(
  form: PublishMusicVideoForm,
  adminUid: string,
): Promise<string> {
  const ref = await addDoc(collection(db, 'music_videos'), {
    ...form,
    kind: 'music_video',
    publishedBy: adminUid,
    publishedAt: serverTimestamp(),
    views: 0,
  });
  return ref.id;
}

// ── Movies ────────────────────────────────────────────────────────────────

export async function getMovies(count = 20): Promise<Movie[]> {
  try {
    const q = query(collection(db, 'movies'), orderBy('publishedAt', 'desc'), limit(count));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      ...(d.data() as Omit<Movie, 'id' | 'publishedAt'>),
      id: d.id,
      publishedAt: tsToDate(d.data().publishedAt) ?? new Date(),
    }));
  } catch {
    return [];
  }
}

export async function publishMovie(form: PublishMovieForm, adminUid: string): Promise<string> {
  const ref = await addDoc(collection(db, 'movies'), {
    ...form,
    kind: 'movie',
    year: parseInt(form.year, 10),
    publishedBy: adminUid,
    publishedAt: serverTimestamp(),
    views: 0,
  });
  return ref.id;
}

// ── Live Streams ──────────────────────────────────────────────────────────

export async function getLiveStreams(): Promise<LiveStream[]> {
  try {
    const q = query(
      collection(db, 'live_streams'),
      orderBy('startedAt', 'desc'),
      limit(10),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      ...(d.data() as Omit<LiveStream, 'id' | 'startedAt' | 'scheduledFor'>),
      id: d.id,
      startedAt: tsToDate(d.data().startedAt),
      scheduledFor: tsToDate(d.data().scheduledFor),
    }));
  } catch {
    return [];
  }
}

export async function getActiveLiveStreams(): Promise<LiveStream[]> {
  try {
    const q = query(
      collection(db, 'live_streams'),
      where('isLive', '==', true),
      limit(5),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      ...(d.data() as Omit<LiveStream, 'id' | 'startedAt' | 'scheduledFor'>),
      id: d.id,
      startedAt: tsToDate(d.data().startedAt),
      scheduledFor: tsToDate(d.data().scheduledFor),
    }));
  } catch {
    return [];
  }
}

export async function startLiveStream(
  form: PublishLiveStreamForm,
  adminUid: string,
): Promise<string> {
  const ref = await addDoc(collection(db, 'live_streams'), {
    ...form,
    kind: 'live_stream',
    isLive: true,
    publishedBy: adminUid,
    startedAt: serverTimestamp(),
    scheduledFor: form.scheduledFor ? new Date(form.scheduledFor) : null,
    viewerCount: 0,
  });
  return ref.id;
}

export async function endLiveStream(streamId: string): Promise<void> {
  await updateDoc(doc(db, 'live_streams', streamId), {
    isLive: false,
  });
}

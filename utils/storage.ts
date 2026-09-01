import AsyncStorage from '@react-native-async-storage/async-storage';
import { Note } from '../types';

const NOTES_KEY = '@tally_notes';

export async function getNotes(): Promise<Note[]> {
  try {
    const json = await AsyncStorage.getItem(NOTES_KEY);
    if (!json) return [];
    const notes: Note[] = JSON.parse(json);
    return notes.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

export async function saveNotes(notes: Note[]): Promise<void> {
  await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

export async function addNote(note: Note): Promise<void> {
  const notes = await getNotes();
  notes.unshift(note);
  await saveNotes(notes);
}

export async function updateNote(updated: Note): Promise<void> {
  const notes = await getNotes();
  const idx = notes.findIndex((n) => n.id === updated.id);
  if (idx !== -1) {
    notes[idx] = updated;
    await saveNotes(notes);
  }
}

export async function deleteNote(id: string): Promise<void> {
  const notes = await getNotes();
  await saveNotes(notes.filter((n) => n.id !== id));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

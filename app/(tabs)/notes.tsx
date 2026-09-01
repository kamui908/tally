import React, { useState, useCallback } from 'react';
import { View, FlatList, Pressable, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Note } from '../../types';
import { Colors } from '../../constants/theme';
import { getNotes, addNote, updateNote, deleteNote } from '../../utils/storage';
import NoteCard from '../../components/NoteCard';
import NoteEditor from '../../components/NoteEditor';
import { useFocusEffect } from '@react-navigation/native';

export default function NotesScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [editorVisible, setEditorVisible] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  useFocusEffect(
    useCallback(() => {
      getNotes().then(setNotes);
    }, []),
  );

  const handleSave = async (note: Note) => {
    if (editingNote) {
      await updateNote(note);
    } else {
      await addNote(note);
    }
    const updated = await getNotes();
    setNotes(updated);
    setEditorVisible(false);
    setEditingNote(null);
  };

  const handleDelete = (note: Note) => {
    Alert.alert('Delete Note', `Delete "${note.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteNote(note.id);
          const updated = await getNotes();
          setNotes(updated);
        },
      },
    ]);
  };

  const openNew = () => {
    setEditingNote(null);
    setEditorVisible(true);
  };

  const openEdit = (note: Note) => {
    setEditingNote(note);
    setEditorVisible(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Notes</Text>
        <View style={styles.headerActions}>
          <Text style={styles.count}>{notes.length}</Text>
        </View>
      </View>

      {notes.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="document-text-outline" size={64} color={Colors.mediumGray} />
          <Text style={styles.emptyTitle}>No notes yet</Text>
          <Text style={styles.emptySubtitle}>Tap + to create a note or checklist</Text>
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NoteCard
              note={item}
              onPress={() => openEdit(item)}
              onDelete={() => handleDelete(item)}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Pressable style={styles.fab} onPress={openNew}>
        <Ionicons name="add" size={28} color={Colors.white} />
      </Pressable>

      <NoteEditor
        visible={editorVisible}
        note={editingNote}
        onClose={() => {
          setEditorVisible(false);
          setEditingNote(null);
        }}
        onSave={handleSave}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surfaceDark,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  title: {
    color: Colors.white,
    fontSize: 34,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  count: {
    color: Colors.mediumGray,
    fontSize: 15,
    fontWeight: '500',
  },
  list: {
    paddingBottom: 100,
    paddingTop: 4,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: 60,
  },
  emptyTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '600',
  },
  emptySubtitle: {
    color: Colors.mediumGray,
    fontSize: 15,
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

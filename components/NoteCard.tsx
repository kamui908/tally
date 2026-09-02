import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Note } from '../types';
import { Colors } from '../constants/theme';

type Props = {
  note: Note;
  onPress: () => void;
  onDelete: () => void;
};

export default function NoteCard({ note, onPress, onDelete }: Props) {
  const hasItems = note.items.length > 0;
  const hasContent = note.content.trim().length > 0;
  const checkedCount = note.items.filter((i) => i.checked).length;
  const totalCount = note.items.length;

  const preview = (() => {
    const parts: string[] = [];
    if (hasContent) {
      parts.push(note.content);
    }
    if (hasItems) {
      parts.push(note.items.map((i) => (i.checked ? '✓ ' : '○ ') + i.text).join('\n'));
    }
    return parts.join('\n') || 'Empty note';
  })();

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={[styles.accent, { backgroundColor: hasItems ? Colors.checklistAccent : Colors.noteAccent }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {note.title || 'Untitled'}
          </Text>
          <Pressable
            onPress={(e) => {
              e.stopPropagation?.();
              onDelete();
            }}
            hitSlop={12}
            style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={16} color={Colors.mediumGray} />
          </Pressable>
        </View>
        <Text style={styles.preview} numberOfLines={2}>
          {preview}
        </Text>
        <View style={styles.footer}>
          {hasItems ? (
            <Text style={styles.badge}>{`${checkedCount}/${totalCount} tasks`}</Text>
          ) : (
            <Text style={styles.badge}>Note</Text>
          )}
          <Text style={styles.date}>
            {new Date(note.updatedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    overflow: 'hidden',
  },
  accent: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: 14,
    paddingLeft: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
  },
  deleteBtn: {
    padding: 4,
    marginLeft: 8,
  },
  preview: {
    color: Colors.lightGray,
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    color: Colors.mediumGray,
    fontSize: 12,
    fontWeight: '500',
    backgroundColor: Colors.surfaceDark,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  date: {
    color: Colors.mediumGray,
    fontSize: 12,
  },
});

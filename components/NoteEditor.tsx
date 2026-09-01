import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Note, NoteType, ChecklistItem } from '../types';
import { Colors } from '../constants/theme';
import { generateId } from '../utils/storage';

type Props = {
  visible: boolean;
  note: Note | null;
  onClose: () => void;
  onSave: (note: Note) => void;
};

export default function NoteEditor({ visible, note, onClose, onSave }: Props) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<NoteType>('note');
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const titleRef = useRef<TextInput>(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setType(note.type);
      setItems(note.items.length > 0 ? note.items : []);
    } else {
      setTitle('');
      setContent('');
      setType('note');
      setItems([]);
    }
  }, [note, visible]);

  const handleSave = () => {
    const now = Date.now();
    const saved: Note = {
      id: note?.id || generateId(),
      title: title.trim() || 'Untitled',
      type,
      content,
      items: type === 'checklist' ? items : [],
      createdAt: note?.createdAt || now,
      updatedAt: now,
    };
    onSave(saved);
  };

  const addItem = () => {
    setItems((prev) => [...prev, { id: generateId(), text: '', checked: false }]);
  };

  const updateItem = (id: string, text: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, text } : i)));
  };

  const toggleItem = (id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)));
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const canSave = type === 'note' ? content.trim().length > 0 : items.length > 0;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={12} style={styles.headerBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <View style={styles.typeToggle}>
            <Pressable
              onPress={() => setType('note')}
              style={[styles.typeBtn, type === 'note' && styles.typeBtnActive]}>
              <Ionicons
                name="document-text-outline"
                size={16}
                color={type === 'note' ? Colors.black : Colors.lightGray}
              />
              <Text style={[styles.typeBtnText, type === 'note' && styles.typeBtnTextActive]}>
                Note
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setType('checklist')}
              style={[styles.typeBtn, type === 'checklist' && styles.typeBtnActive]}>
              <Ionicons
                name="checkmark-circle-outline"
                size={16}
                color={type === 'checklist' ? Colors.black : Colors.lightGray}
              />
              <Text style={[styles.typeBtnText, type === 'checklist' && styles.typeBtnTextActive]}>
                Checklist
              </Text>
            </Pressable>
          </View>
          <Pressable
            onPress={handleSave}
            hitSlop={12}
            style={styles.headerBtn}
            disabled={false}>
            <Text style={[styles.saveText, !canSave && styles.saveDisabled]}>
              Save
            </Text>
          </Pressable>
        </View>

        <ScrollView style={styles.body} keyboardDismissMode="interactive">
          <TextInput
            ref={titleRef}
            style={styles.titleInput}
            placeholder="Title"
            placeholderTextColor={Colors.mediumGray}
            value={title}
            onChangeText={setTitle}
            autoFocus={!note}
            returnKeyType="next"
          />

          {type === 'note' ? (
            <TextInput
              style={styles.contentInput}
              placeholder="Start writing..."
              placeholderTextColor={Colors.mediumGray}
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
            />
          ) : (
            <View style={styles.checklistContainer}>
              {items.map((item) => (
                <View key={item.id} style={styles.checklistRow}>
                  <Pressable
                    onPress={() => toggleItem(item.id)}
                    hitSlop={8}
                    style={styles.checkBtn}>
                    <Ionicons
                      name={item.checked ? 'checkmark-circle' : 'ellipse-outline'}
                      size={24}
                      color={item.checked ? Colors.checklistAccent : Colors.mediumGray}
                    />
                  </Pressable>
                  <TextInput
                    style={[styles.checklistInput, item.checked && styles.checklistInputChecked]}
                    value={item.text}
                    onChangeText={(t) => updateItem(item.id, t)}
                    placeholder="Item"
                    placeholderTextColor={Colors.mediumGray}
                  />
                  <Pressable
                    onPress={() => removeItem(item.id)}
                    hitSlop={8}
                    style={styles.removeItemBtn}>
                    <Ionicons name="close" size={18} color={Colors.mediumGray} />
                  </Pressable>
                </View>
              ))}
              <Pressable onPress={addItem} style={styles.addItemBtn}>
                <Ionicons name="add-circle-outline" size={22} color={Colors.orange} />
                <Text style={styles.addItemText}>Add item</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.cardBgLight,
  },
  headerBtn: {
    minWidth: 60,
  },
  cancelText: {
    color: Colors.lightGray,
    fontSize: 16,
  },
  saveText: {
    color: Colors.orange,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
  },
  saveDisabled: {
    opacity: 0.4,
  },
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBg,
    borderRadius: 10,
    padding: 2,
  },
  typeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  typeBtnActive: {
    backgroundColor: Colors.lightGray,
  },
  typeBtnText: {
    color: Colors.lightGray,
    fontSize: 13,
    fontWeight: '500',
  },
  typeBtnTextActive: {
    color: Colors.black,
  },
  body: {
    flex: 1,
    padding: 16,
  },
  titleInput: {
    color: Colors.white,
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 16,
    padding: 0,
  },
  contentInput: {
    color: Colors.white,
    fontSize: 17,
    lineHeight: 24,
    minHeight: 200,
    padding: 0,
  },
  checklistContainer: {
    gap: 4,
  },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  checkBtn: {
    padding: 2,
  },
  checklistInput: {
    flex: 1,
    color: Colors.white,
    fontSize: 17,
    padding: 0,
  },
  checklistInputChecked: {
    textDecorationLine: 'line-through',
    color: Colors.mediumGray,
  },
  removeItemBtn: {
    padding: 4,
  },
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  addItemText: {
    color: Colors.orange,
    fontSize: 16,
    fontWeight: '500',
  },
});

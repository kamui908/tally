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
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Note, ChecklistItem } from '../types';
import { Colors } from '../constants/theme';
import { generateId } from '../utils/storage';

type Props = {
  visible: boolean;
  note: Note | null;
  onClose: () => void;
  onSave: (note: Note) => void;
};

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SWIPE_THRESHOLD = 120;
const HEADER_HEIGHT = 56;

export default function NoteEditor({ visible, note, onClose, onSave }: Props) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const titleRef = useRef<TextInput>(null);
  const contentRef = useRef<TextInput>(null);
  const insets = useSafeAreaInsets();

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const panAnim = useRef(new Animated.Value(0)).current;
  const mountedRef = useRef(false);
  const touchStartY = useRef(0);

  useEffect(() => {
    if (visible) {
      if (note) {
        setTitle(note.title);
        setContent(note.content);
        setItems(note.items.length > 0 ? [...note.items] : []);
      } else {
        setTitle('');
        setContent('');
        setItems([]);
      }
      mountedRef.current = true;
      slideAnim.setValue(SCREEN_HEIGHT);
      panAnim.setValue(0);
      requestAnimationFrame(() => {
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 200,
        }).start();
      });
      setTimeout(() => titleRef.current?.focus(), 400);
    }
  }, [visible, note]);

  const performSave = () => {
    const now = Date.now();
    const nonEmptyItems = items.filter((i) => i.text.trim().length > 0);
    const saved: Note = {
      id: note?.id || generateId(),
      title: title.trim() || 'Untitled',
      content,
      items: nonEmptyItems,
      createdAt: note?.createdAt || now,
      updatedAt: now,
    };
    onSave(saved);
  };

  const animateClose = (callback: () => void) => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      mountedRef.current = false;
      callback();
    });
  };

  const handleClose = () => {
    performSave();
    animateClose(onClose);
  };

  const handleSave = () => {
    performSave();
    animateClose(onClose);
  };

  const handleCancel = () => {
    animateClose(onClose);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return (
          Math.abs(gestureState.dy) > 10 &&
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx) &&
          touchStartY.current < HEADER_HEIGHT + insets.top + 20
        );
      },
      onPanResponderGrant: (_, gestureState) => {
        touchStartY.current = gestureState.y0;
        panAnim.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > SWIPE_THRESHOLD) {
          performSave();
          animateClose(onClose);
        } else {
          Animated.spring(panAnim, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

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

  const insertFormatting = (prefix: string, suffix: string) => {
    const ref = contentRef.current;
    if (!ref) return;
    ref.focus();
    const newText = `${content}${prefix}${suffix}`;
    setContent(newText);
  };

  const addBullet = () => {
    const ref = contentRef.current;
    if (!ref) return;
    ref.focus();
    const separator = content.length > 0 && !content.endsWith('\n') ? '\n' : '';
    setContent(`${content}${separator}• `);
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateY: Animated.add(slideAnim, panAnim) }] }]}
      {...panResponder.panHandlers}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <View style={styles.dragIndicator} />
          <View style={styles.headerRow}>
            <Pressable onPress={handleCancel} hitSlop={12} style={styles.headerBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Text style={styles.headerTitle}>
              {note ? 'Edit Note' : 'New Note'}
            </Text>
            <Pressable onPress={handleSave} hitSlop={12} style={styles.headerBtn}>
              <Text style={styles.saveText}>Save</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.toolbar}>
          <Pressable
            onPress={() => insertFormatting('**', '**')}
            style={styles.toolBtn}
            hitSlop={8}>
            <Text style={styles.toolBtnText}>B</Text>
          </Pressable>
          <Pressable
            onPress={() => insertFormatting('_', '_')}
            style={styles.toolBtn}
            hitSlop={8}>
            <Text style={[styles.toolBtnText, styles.italic]}>I</Text>
          </Pressable>
          <Pressable
            onPress={() => insertFormatting('~', '~')}
            style={styles.toolBtn}
            hitSlop={8}>
            <Text style={[styles.toolBtnText, styles.strikethrough]}>S</Text>
          </Pressable>
          <View style={styles.toolDivider} />
          <Pressable onPress={addBullet} style={styles.toolBtn} hitSlop={8}>
            <Ionicons name="list-outline" size={20} color={Colors.white} />
          </Pressable>
          <View style={styles.toolSpacer} />
          <Pressable onPress={addItem} style={styles.addTaskBtn} hitSlop={8}>
            <Ionicons name="checkbox-outline" size={18} color={Colors.orange} />
            <Text style={styles.addTaskText}>Task</Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.body}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled">
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

          <TextInput
            ref={contentRef}
            style={styles.contentInput}
            placeholder="Write something..."
            placeholderTextColor={Colors.mediumGray}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />

          {items.length > 0 && (
            <View style={styles.checklistSection}>
              <View style={styles.checklistHeader}>
                <Text style={styles.checklistLabel}>Tasks</Text>
                <Text style={styles.checklistCount}>
                  {items.filter((i) => i.checked).length}/{items.length}
                </Text>
              </View>
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
                    placeholder="Task"
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
            </View>
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.surfaceDark,
    zIndex: 999,
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.cardBgLight,
  },
  dragIndicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.mediumGray,
    alignSelf: 'center',
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerBtn: {
    minWidth: 60,
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
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
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.cardBgLight,
  },
  toolBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cardBg,
  },
  toolBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  italic: {
    fontStyle: 'italic',
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
  toolDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.cardBgLight,
    marginHorizontal: 4,
  },
  toolSpacer: {
    flex: 1,
  },
  addTaskBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.cardBg,
  },
  addTaskText: {
    color: Colors.orange,
    fontSize: 14,
    fontWeight: '600',
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
    minHeight: 160,
    padding: 0,
  },
  checklistSection: {
    marginTop: 24,
    gap: 4,
  },
  checklistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  checklistLabel: {
    color: Colors.mediumGray,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  checklistCount: {
    color: Colors.mediumGray,
    fontSize: 13,
    fontWeight: '500',
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
  bottomPadding: {
    height: 100,
  },
});

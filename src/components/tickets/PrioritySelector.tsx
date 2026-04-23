import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FONTS } from '../../constants/FONTS';
import { ISSUE_PRIORITIES, TICKET_THEME, getPriorityColor } from './ticketTheme';

type PriorityValue = (typeof ISSUE_PRIORITIES)[number];

type PrioritySelectorProps = {
  value: PriorityValue | '';
  onChange: (value: PriorityValue) => void;
};

const PrioritySelector = ({ value, onChange }: PrioritySelectorProps) => (
  <View style={styles.row}>
    {ISSUE_PRIORITIES.map(priority => {
      const isActive = value === priority;
      const priorityColor = getPriorityColor(priority);

      return (
        <Pressable
          key={priority}
          onPress={() => onChange(priority)}
          style={[
            styles.option,
            isActive && {
              borderColor: priorityColor,
              backgroundColor: `${priorityColor}20`,
            },
          ]}
        >
          <View style={[styles.dot, { backgroundColor: priorityColor }]} />
          <Text style={[styles.label, isActive && styles.labelActive]}>
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
          </Text>
        </Pressable>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  option: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: TICKET_THEME.inputBorder,
    backgroundColor: TICKET_THEME.input,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 8,
  },
  label: {
    color: TICKET_THEME.textSecondary,
    fontSize: 14,
    fontFamily: FONTS.semibold,
    fontWeight: '600',
  },
  labelActive: {
    color: TICKET_THEME.textPrimary,
  },
});

export default PrioritySelector;

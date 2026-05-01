import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { FONTS } from '../../constants/FONTS';
import { ISSUE_PRIORITIES, TICKET_THEME, getPriorityColor } from './ticketTheme';
import styles from './PrioritySelector.style';


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

export default PrioritySelector;

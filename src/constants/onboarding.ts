import { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

export interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  icon: ComponentProps<typeof Ionicons>['name'];
}

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Welcome to HIRAYA',
    description:
      'Your real-time companion for heat stroke risk awareness and prevention.',
    icon: 'sunny-outline',
  },
  {
    id: '2',
    title: 'Assess Your Risk',
    description:
      'Submit health and environmental data to receive risk assessments from our backend system.',
    icon: 'thermometer-outline',
  },
  {
    id: '3',
    title: 'Stay Informed',
    description:
      'Monitor local weather conditions and get personalized guidance to stay safe in the heat.',
    icon: 'shield-checkmark-outline',
  },
];

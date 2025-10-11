import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { CheckCircle, Mail, Calendar, MessageCircle, Database, Brain, Zap, AlertCircle } from 'lucide-react-native';

import { Screen } from '@/components/Screen';
import { useAppTheme } from '@/theme';
import { useAppStore } from '@/store/useAppStore';
import { apiClient } from '@/services/api';

const ONBOARDING_STEPS = [
    {
        id: 'welcome',
        icon: Zap,
        title: 'Welcome to Martin++',
        subtitle: 'AI-powered personal assistant',
        description: 'Manage emails, tasks, calendar, and more with intelligent automation.',
        action: null,
    },
    {
        id: 'database',
        icon: Database,
        title: 'Connect Application Database',
        subtitle: 'Neon PostgreSQL setup',
        description: 'Connect to your secure Neon database for storing application data.',
        action: 'connect-database',
    },
    {
        id: 'ai',
        icon: Brain,
        title: 'Connect AI Memory Store',
        subtitle: 'Pinecone RAG database',
        description: 'Set up Pinecone vector database for intelligent AI memory and retrieval.',
        action: 'connect-ai',
    },
    {
        id: 'gmail',
        icon: Mail,
        title: 'Connect Your Email',
        subtitle: 'Gmail integration',
        description: 'Connect Gmail for intelligent email processing and AI-powered responses.',
        action: 'connect-gmail',
    },
    {
        id: 'calendar',
        icon: Calendar,
        title: 'Smart Calendar Management',
        subtitle: 'Google Calendar AI sync',
        description: 'Let Martin++ find optimal meeting times and manage your calendar conflicts.',
        action: 'connect-calendar',
    },
    {
        id: 'voice',
        icon: MessageCircle,
        title: 'Voice Interactions',
        subtitle: 'Natural conversation',
        description: 'Talk to Martin++ for hands-free assistance anytime, anywhere.',
        action: null,
    },
];

interface ConnectionStatus {
    database: 'pending' | 'connecting' | 'connected' | 'error';
    ai: 'pending' | 'connecting' | 'connected' | 'error';
    gmail: 'pending' | 'connecting' | 'connected' | 'error';
    calendar: 'pending' | 'connecting' | 'connected' | 'error';
}

export default function OnboardingScreen() {
    const { colors } = useAppTheme();
    const { completeOnboarding } = useAppStore();
    const [currentStep, setCurrentStep] = useState(0);
    const [connections, setConnections] = useState<ConnectionStatus>({
        database: 'pending',
        ai: 'pending',
        gmail: 'pending',
        calendar: 'pending',
    });

    const testDatabaseConnection = async () => {
        try {
            setConnections(prev => ({ ...prev, database: 'connecting' }));
            const response = await apiClient.testDatabaseConnection();
            if (response.success) {
                setConnections(prev => ({ ...prev, database: 'connected' }));
                return true;
            }
        } catch (error) {
            console.error('Database connection test failed:', error);
            setConnections(prev => ({ ...prev, database: 'error' }));
        }
        return false;
    };

    const testAiConnection = async () => {
        try {
            setConnections(prev => ({ ...prev, ai: 'connecting' }));
            const response = await apiClient.testAiConnection();
            if (response.success) {
                setConnections(prev => ({ ...prev, ai: 'connected' }));
                return true;
            }
        } catch (error) {
            console.error('AI connection test failed:', error);
            setConnections(prev => ({ ...prev, ai: 'error' }));
        }
        return false;
    };

    const testGmailConnection = async () => {
        try {
            setConnections(prev => ({ ...prev, gmail: 'connecting' }));
            const response = await apiClient.testGmailConnection();
            if (response.success) {
                setConnections(prev => ({ ...prev, gmail: 'connected' }));
                return true;
            }
        } catch (error) {
            console.error('Gmail connection test failed:', error);
            setConnections(prev => ({ ...prev, gmail: 'error' }));
        }
        return false;
    };

    const testCalendarConnection = async () => {
        try {
            setConnections(prev => ({ ...prev, calendar: 'connecting' }));
            const response = await apiClient.testCalendarConnection();
            if (response.success) {
                setConnections(prev => ({ ...prev, calendar: 'connected' }));
                return true;
            }
        } catch (error) {
            console.error('Calendar connection test failed:', error);
            setConnections(prev => ({ ...prev, calendar: 'error' }));
        }
        return false;
    };

    const handleAction = async () => {
        const step = ONBOARDING_STEPS[currentStep];

        switch (step.action) {
            case 'connect-database':
                return await testDatabaseConnection();
            case 'connect-ai':
                return await testAiConnection();
            case 'connect-gmail':
                return await testGmailConnection();
            case 'connect-calendar':
                return await testCalendarConnection();
            default:
                return true;
        }
    };

    const handleNext = async () => {
        const step = ONBOARDING_STEPS[currentStep];

        // Only proceed if any required action is completed successfully
        if (step.action) {
            const success = await handleAction();
            if (!success) {
                // Don't advance if action failed
                return;
            }
        }

        if (currentStep < ONBOARDING_STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            // Complete onboarding
            completeOnboarding();
            router.replace('/(tabs)');
        }
    };

    const handleSkip = () => {
        completeOnboarding();
        router.replace('/(tabs)');
    };

    const step = ONBOARDING_STEPS[currentStep];
    const Icon = step.icon;

    const getStatusIcon = (stepId: string) => {
        const status = connections[stepId as keyof ConnectionStatus];
        switch (status) {
            case 'connected':
                return <CheckCircle color={colors.accent} size={20} />;
            case 'error':
                return <AlertCircle color={colors.destructive} size={20} />;
            case 'connecting':
                return <ActivityIndicator size="small" color={colors.accent} />;
            default:
                return null;
        }
    };

    const getStatusColor = (stepId: string) => {
        const status = connections[stepId as keyof ConnectionStatus];
        switch (status) {
            case 'connected':
                return colors.accent;
            case 'error':
                return colors.destructive;
            case 'connecting':
                return colors.accent;
            default:
                return colors.textMuted;
        }
    };

    return (
        <Screen title="" subtitle="" scrollable={false}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.container}>
                    {/* Progress Indicators */}
                    <View style={styles.progressContainer}>
                        {ONBOARDING_STEPS.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.progressDot,
                                    {
                                        backgroundColor: index <= currentStep ? colors.accent :
                                            index === currentStep + 1 && step.action ? getStatusColor(step.id) : colors.border,
                                    },
                                ]}
                            />
                        ))}
                    </View>

                    {/* Step Content */}
                    <View style={styles.content}>
                        <View style={[styles.iconContainer, { backgroundColor: colors.accent }]}>
                            <Icon color={colors.background} size={48} />
                            {step.action && getStatusIcon(step.id)}
                        </View>

                        <Text style={[styles.title, { color: colors.textPrimary }]}>
                            {step.title}
                        </Text>

                        <Text style={[styles.subtitle, { color: colors.accent }]}>
                            {step.subtitle}
                        </Text>

                        <Text style={[styles.description, { color: colors.textSecondary }]}>
                            {step.description}
                        </Text>

                        {/* Connection Status */}
                        {step.action && connections[step.id as keyof ConnectionStatus] === 'connected' && (
                            <View style={styles.statusContainer}>
                                <CheckCircle color={colors.accent} size={16} />
                                <Text style={[styles.statusText, { color: colors.accent }]}>
                                    Connected successfully
                                </Text>
                            </View>
                        )}

                        {step.action && connections[step.id as keyof ConnectionStatus] === 'error' && (
                            <View style={styles.statusContainer}>
                                <AlertCircle color={colors.destructive} size={16} />
                                <Text style={[styles.statusText, { color: colors.destructive }]}>
                                    Connection failed. Please check configuration.
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Actions */}
                    <View style={styles.actions}>
                        <Pressable
                            onPress={handleSkip}
                            style={[styles.skipButton, { borderColor: colors.border }]}
                        >
                            <Text style={[styles.skipText, { color: colors.textMuted }]}>
                                Skip Setup
                            </Text>
                        </Pressable>

                        <Pressable
                            onPress={handleNext}
                            disabled={step.action && connections[step.id as keyof ConnectionStatus] === 'connecting'}
                            style={[
                                styles.nextButton,
                                {
                                    backgroundColor: step.action && connections[step.id as keyof ConnectionStatus] === 'connecting'
                                        ? colors.border
                                        : colors.accent
                                }
                            ]}
                        >
                            {step.action && connections[step.id as keyof ConnectionStatus] === 'connecting' ? (
                                <ActivityIndicator size="small" color={colors.background} />
                            ) : (
                                <Text style={[styles.nextText, { color: colors.background }]}>
                                    {currentStep === ONBOARDING_STEPS.length - 1 ? 'Get Started' :
                                        step.action ? 'Connect & Continue' : 'Next'}
                                </Text>
                            )}
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingVertical: 48,
    },
    progressContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 48,
        gap: 8,
    },
    progressDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '500',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center',
        paddingHorizontal: 24,
    },
    actions: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 48,
    },
    skipButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
    },
    skipText: {
        fontSize: 16,
        fontWeight: '600',
    },
    nextButton: {
        flex: 2,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    nextText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

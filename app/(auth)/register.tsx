import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';

import { Screen } from '@/components/Screen';
import { authService } from '@/services/auth';
import { useAppTheme } from '@/theme';

export default function RegisterScreen() {
    const { colors } = useAppTheme();
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!form.name || !form.email || !form.password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (form.password !== form.confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            // Mock registration - in real app this would call API
            Alert.alert(
                'Registration Successful',
                'Welcome to Martin++! Your AI assistant is ready.',
                [{ text: 'Continue', onPress: () => router.replace('/onboarding') }]
            );
        } catch (error: any) {
            Alert.alert('Registration Failed', error.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const navigateToLogin = () => {
        router.push('/login');
    };

    return (
        <Screen title="Create Account" scrollable={false}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.textPrimary }]}>
                            Join Martin++
                        </Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            Create your account to get started
                        </Text>
                    </View>

                    <View style={styles.form}>
                        <View style={[styles.inputGroup, { borderColor: colors.border }]}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Full Name</Text>
                            <TextInput
                                style={[styles.input, { color: colors.textPrimary }]}
                                placeholder="Enter your full name"
                                placeholderTextColor={colors.textMuted}
                                value={form.name}
                                onChangeText={(name) => setForm(prev => ({ ...prev, name }))}
                                autoCapitalize="words"
                            />
                        </View>

                        <View style={[styles.inputGroup, { borderColor: colors.border }]}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
                            <TextInput
                                style={[styles.input, { color: colors.textPrimary }]}
                                placeholder="Enter your email"
                                placeholderTextColor={colors.textMuted}
                                value={form.email}
                                onChangeText={(email) => setForm(prev => ({ ...prev, email }))}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                autoComplete="email"
                            />
                        </View>

                        <View style={[styles.inputGroup, { borderColor: colors.border }]}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Password</Text>
                            <TextInput
                                style={[styles.input, { color: colors.textPrimary }]}
                                placeholder="Create a password"
                                placeholderTextColor={colors.textMuted}
                                value={form.password}
                                onChangeText={(password) => setForm(prev => ({ ...prev, password }))}
                                secureTextEntry
                                autoComplete="password-new"
                            />
                        </View>

                        <View style={[styles.inputGroup, { borderColor: colors.border }]}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Confirm Password</Text>
                            <TextInput
                                style={[styles.input, { color: colors.textPrimary }]}
                                placeholder="Confirm your password"
                                placeholderTextColor={colors.textMuted}
                                value={form.confirmPassword}
                                onChangeText={(confirmPassword) => setForm(prev => ({ ...prev, confirmPassword }))}
                                secureTextEntry
                                autoComplete="password-new"
                            />
                        </View>

                        <Pressable
                            onPress={handleRegister}
                            style={[styles.primaryButton, { backgroundColor: loading ? colors.surface : colors.accent }]}
                            disabled={loading}
                        >
                            <Text style={[styles.primaryButtonText, { color: colors.background }]}>
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </Text>
                        </Pressable>

                        <View style={styles.footer}>
                            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                                Already have an account?{' '}
                            </Text>
                            <Pressable onPress={navigateToLogin}>
                                <Text style={[styles.linkText, { color: colors.accent }]}>
                                    Sign In
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    content: {
        paddingHorizontal: 24,
        paddingVertical: 48,
    },
    header: {
        alignItems: 'center',
        marginBottom: 48,
        gap: 12,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        fontWeight: '400',
        textAlign: 'center',
        lineHeight: 24,
    },
    form: {
        gap: 24,
    },
    inputGroup: {
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
    },
    input: {
        fontSize: 16,
        padding: 0,
    },
    primaryButton: {
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 48,
    },
    footerText: {
        fontSize: 16,
    },
    linkText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

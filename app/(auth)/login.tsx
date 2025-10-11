import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { router } from 'expo-router';

import { Screen } from '@/components/Screen';
import { authService } from '@/services/auth';
import { useAppTheme } from '@/theme';
import { useAuthStore } from '@/store/authStore';

export default function LoginScreen() {
    const { colors } = useAppTheme();
    const { login } = useAuthStore();
    const isOnboarded = false; // TODO: Get from app store
    const [form, setForm] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!form.email || !form.password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const response = await authService.login(form.email, form.password);

            if (response) {
                login(response.user);
                // Navigate to main app through onboarding if first time
                router.replace(isOnboarded ? '/' : '/register');
            }
        } catch (error: any) {
            const message = error?.message || 'Login failed';
            Alert.alert('Login Failed', message);
        } finally {
            setLoading(false);
        }
    };

    const handleGmailLogin = async () => {
        try {
            // Configure OAuth request
            const redirectUri = AuthSession.makeRedirectUri();

            const request = new AuthSession.AuthRequest({
                clientId: '697365571947-5bdl8arfhkst2irk1fs0efstt746dth5.apps.googleusercontent.com',
                scopes: [
                    'openid',
                    'profile',
                    'email',
                    'https://www.googleapis.com/auth/gmail.readonly',
                    'https://www.googleapis.com/auth/gmail.modify',
                    'https://www.googleapis.com/auth/calendar.readonly',
                    'https://www.googleapis.com/auth/calendar.events',
                ],
                responseType: AuthSession.ResponseType.Token,
                redirectUri,
                prompt: AuthSession.Prompt.SelectAccount,
            });

            // Open browser for OAuth flow
            const result = await request.promptAsync({
                authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
            });

            if (result.type === 'success' && result.params.access_token) {
                // Exchange token for user data and authenticate with backend
                await authenticateWithBackend(result.params.access_token);
                Alert.alert('Success', 'Connected to Gmail successfully!');
                router.replace('/');
            } else {
                throw new Error('OAuth cancelled or failed');
            }
        } catch (error: any) {
            console.error('Gmail OAuth error:', error);
            Alert.alert('Gmail Sign-in Failed', error.message || 'Failed to sign in with Gmail');
        }
    };

    const authenticateWithBackend = async (accessToken: string) => {
        try {
            // Get user profile from Google
            const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) throw new Error('Failed to get user profile');

            const profile = await response.json();

            // Send to backend for authentication
            const authResponse = await authService.authenticateWithGmail(accessToken, profile);

            if (authResponse) {
                login(authResponse.user);
            } else {
                throw new Error('Backend authentication failed');
            }
        } catch (error: any) {
            console.error('Backend authentication error:', error);
            throw error;
        }
    };

    const navigateToRegister = () => {
        router.push('/register');
    };

    return (
        <Screen title="Sign In" scrollable={false}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.textPrimary }]}>
                            Welcome Back
                        </Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            Sign in to continue with Martin++
                        </Text>
                    </View>

                    <View style={styles.form}>
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
                                placeholder="Enter your password"
                                placeholderTextColor={colors.textMuted}
                                value={form.password}
                                onChangeText={(password) => setForm(prev => ({ ...prev, password }))}
                                secureTextEntry
                                autoComplete="password"
                            />
                        </View>

                        <Pressable
                            onPress={handleLogin}
                            style={[styles.primaryButton, { backgroundColor: loading ? colors.surface : colors.accent }]}
                            disabled={loading}
                        >
                            <Text style={[styles.primaryButtonText, { color: colors.background }]}>
                                {loading ? 'Signing In...' : 'Sign In'}
                            </Text>
                        </Pressable>

                        <View style={styles.divider}>
                            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                            <Text style={[styles.dividerText, { color: colors.textMuted }]}>or</Text>
                            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                        </View>

                        <Pressable
                            onPress={handleGmailLogin}
                            style={[styles.googleButton, { borderColor: colors.border }]}
                        >
                            <Text style={[styles.googleButtonText, { color: colors.textPrimary }]}>
                                🔗 Continue with Gmail
                            </Text>
                        </Pressable>
                    </View>

                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                            Don't have an account?{' '}
                        </Text>
                        <Pressable onPress={navigateToRegister}>
                            <Text style={[styles.linkText, { color: colors.accent }]}>
                                Sign Up
                            </Text>
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
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    dividerLine: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        fontSize: 13,
        fontWeight: '500',
        paddingHorizontal: 8,
    },
    googleButton: {
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    googleButtonText: {
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

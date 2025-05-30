import React from 'react';
import { View, TouchableOpacity, StyleSheet, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser } from '@/contexts/UserContext';
import { designSystem } from '@/theme/designSystem';
import { Typography } from './Typography';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showProfile?: boolean;
  rightComponent?: React.ReactNode;
  backgroundColor?: string;
  textColor?: string;
}

export function Header({
  title,
  showBack = false,
  showProfile = true,
  rightComponent,
  backgroundColor = designSystem.colors.primary[500],
  textColor = '#FFFFFF',
}: HeaderProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useUser();

  const handleBackPress = () => {
    router.back();
  };

  const handleProfilePress = () => {
    if (isAuthenticated) {
      router.push('/Account/account');
    } else {
      router.push('/Account/login');
    }
  };

  return (
    <>
      <StatusBar
        barStyle={backgroundColor === designSystem.colors.primary[500] ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundColor}
      />
      <View style={[styles.header, { backgroundColor }]}>
        <View style={styles.leftSection}>
          {showBack && (
            <TouchableOpacity onPress={handleBackPress} style={styles.iconButton}>
              <Ionicons name="arrow-back" size={24} color={textColor} />
            </TouchableOpacity>
          )}
          {title && (
            <Typography variant="h3" color={textColor} align="left" style={styles.pageTitle}>
              {title}
            </Typography>
          )}
        </View>

        <View style={styles.rightSection}>
          {rightComponent || (showProfile && (
            <TouchableOpacity onPress={handleProfilePress} style={styles.profileButton}>
              {isAuthenticated && user && user.fullName ? (
                <View style={styles.avatar}>
                  <Typography variant="body1" color={designSystem.colors.primary[500]} style={styles.avatarText}>
                    {user.fullName.charAt(0).toUpperCase()}
                  </Typography>
                </View>
              ) : (
                <View style={styles.loginButton}>
                  <Typography variant="body2" color={textColor}>
                    Login
                  </Typography>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 0 + 10,
    paddingBottom: designSystem.spacing.md,
    paddingHorizontal: designSystem.spacing.md,
    ...designSystem.shadows.sm,
  },

  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  pageTitle: {
    marginLeft: designSystem.spacing.sm,
  },

  rightSection: {
    alignItems: 'flex-end',
  },

  iconButton: {
    padding: designSystem.spacing.sm,
    borderRadius: designSystem.borderRadius.full,
  },

  profileButton: {
    alignItems: 'flex-end',
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...designSystem.shadows.sm,
  },

  avatarText: {
    fontWeight: designSystem.typography.weights.bold,
    fontSize: 18,
  },

  loginButton: {
    paddingVertical: designSystem.spacing.xs,
    paddingHorizontal: designSystem.spacing.sm,
    borderRadius: designSystem.borderRadius.md,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
});

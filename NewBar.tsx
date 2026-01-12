import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// three modes controlled from Landing drawer
type Mode = 'about' | 'edit' | 'password';

interface NewBarProps {
  mode: Mode;
  onBack: () => void;
}

// keeping validations simple and strict for first release
const emailRegex = /^[\w.+-]+@gmail\.com$/i;
const phoneRegex = /^[0-9]{10}$/;
const bloodGroupRegex = /^(A|B|AB|O)[+-]$/i;

const NewBar = ({ mode, onBack }: NewBarProps) => {
  // local profile state – in real app this should come from backend/user store
  const [name, setName] = useState('User');
  const [email, setEmail] = useState('user@gmail.com');
  const [phone, setPhone] = useState('9840000000');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [address, setAddress] = useState('Kathmandu, Nepal');

  // Birth of Date – string for now, can be wired to date picker later
  const [birthOfDate, setBirthOfDate] = useState('2000-01-01');

  // change photo modal (only UI, no backend yet)
  const [photoModalVisible, setPhotoModalVisible] = useState(false);

  // password change fields – only used when mode === 'password'
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // shared error bag for all three views
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    bloodGroup?: string;
    address?: string;
    birthOfDate?: string;
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  // validate basic profile fields before sending update to backend
  const validateProfile = () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!emailRegex.test(email.trim())) newErrors.email = 'Enter a valid email';

    if (!phone.trim()) newErrors.phone = 'Phone is required';
    else if (!phoneRegex.test(phone.trim())) newErrors.phone = 'Phone must be 10 digits';

    if (!bloodGroup.trim()) newErrors.bloodGroup = 'Blood group is required';
    else if (!bloodGroupRegex.test(bloodGroup.trim().toUpperCase()))
      newErrors.bloodGroup = 'Use format like A+, B-, O+, AB-';

    if (!address.trim()) newErrors.address = 'Address is required';

    if (!birthOfDate.trim()) newErrors.birthOfDate = 'Birth of date is required';
    else if (
      !/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(birthOfDate.trim())
    )
      newErrors.birthOfDate = 'Use format YYYY-MM-DD';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // validate password change before calling real change-password API
  const validatePassword = () => {
    const newErrors: typeof errors = {};

    if (!oldPassword) newErrors.oldPassword = 'Old password is required';
    if (!newPassword) newErrors.newPassword = 'New password is required';
    else if (newPassword.length < 6) newErrors.newPassword = 'At least 6 characters';

    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm password';
    else if (newPassword !== confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // profile save hook – ready for backend integration
  const handleSaveProfile = () => {
    if (!validateProfile()) return;

    /**
     * BACKEND INTEGRATION – UPDATE PROFILE
     *
     * API: PUT /user/profile
     * Body:
     * {
     *   name,
     *   email,
     *   phone,
     *   bloodGroup,
     *   address,
     *   birthOfDate,
     * }
     *
     * On success:
     * - show success message
     * - update global user state if you are using context/store
     */
    Alert.alert('Success', 'Profile updated successfully');
    onBack();
  };

  // password change hook – ready for backend integration
  const handleChangePassword = () => {
    if (!validatePassword()) return;

    /**
     * BACKEND INTEGRATION – CHANGE PASSWORD
     *
     * API: POST /user/change-password
     * Body:
     * {
     *   oldPassword,
     *   newPassword,
     * }
     *
     * On success:
     * - clear local password fields
     * - maybe force re-login depending on security policy
     */
    Alert.alert('Success', 'Password changed successfully');
    onBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER – title depends on mode from Landing drawer */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {mode === 'about'
            ? 'My Profile'
            : mode === 'edit'
            ? 'Edit Details'
            : 'Change Password'}
        </Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* TOP PROFILE CARD – shared for about/edit modes */}
        {(mode === 'about' || mode === 'edit') && (
          <View style={styles.topCard}>
            {mode === 'edit' ? (
              <TouchableOpacity
                style={styles.avatarCircle}
                onPress={() => setPhotoModalVisible(true)}
              >
                <Text style={styles.avatarText}>
                  {name.trim() ? name.trim().charAt(0).toUpperCase() : 'U'}
                </Text>
                <View style={styles.changePhotoBadge}>
                  <Text style={styles.changePhotoBadgeText}>✏</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                  {name.trim() ? name.trim().charAt(0).toUpperCase() : 'U'}
                </Text>
              </View>
            )}

            <Text style={styles.profileName}>{name}</Text>
            <Text style={styles.profileEmail}>{email}</Text>
            <View style={styles.profileRow}>
              <View style={styles.profileTag}>
                <Text style={styles.profileTagLabel}>Blood</Text>
                <Text style={styles.profileTagValue}>{bloodGroup.toUpperCase()}</Text>
              </View>
              <View style={styles.profileTag}>
                <Text style={styles.profileTagLabel}>Phone</Text>
                <Text style={styles.profileTagValue}>{phone}</Text>
              </View>
            </View>
          </View>
        )}

        {/* ABOUT VIEW – read-only summary of current user data */}
        {mode === 'about' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Personal Info</Text>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Full Name</Text>
              <Text style={styles.value}>{name}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{email}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Phone</Text>
              <Text style={styles.value}>{phone}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Blood Group</Text>
              <Text style={styles.value}>{bloodGroup.toUpperCase()}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Birth of Date</Text>
              <Text style={styles.value}>{birthOfDate}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Address</Text>
              <Text style={styles.value}>{address}</Text>
            </View>
          </View>
        )}

        {/* EDIT VIEW – allows changing local profile values */}
        {mode === 'edit' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Edit Info</Text>

            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="Full Name"
              value={name}
              onChangeText={text => {
                setName(text);
                setErrors(prev => ({ ...prev, name: undefined }));
              }}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={text => {
                setEmail(text);
                setErrors(prev => ({ ...prev, email: undefined }));
              }}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            <Text style={styles.inputLabel}>Phone</Text>
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              placeholder="Phone"
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={text => {
                setPhone(text.replace(/[^0-9]/g, ''));
                setErrors(prev => ({ ...prev, phone: undefined }));
              }}
            />
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

            <Text style={styles.inputLabel}>Blood Group</Text>
            <TextInput
              style={[styles.input, errors.bloodGroup && styles.inputError]}
              placeholder="e.g. A+, O-, AB+"
              autoCapitalize="characters"
              value={bloodGroup}
              onChangeText={text => {
                setBloodGroup(text.toUpperCase());
                setErrors(prev => ({ ...prev, bloodGroup: undefined }));
              }}
            />
            {errors.bloodGroup && (
              <Text style={styles.errorText}>{errors.bloodGroup}</Text>
            )}

            <Text style={styles.inputLabel}>Birth of Date</Text>
            <TextInput
              style={[styles.input, errors.birthOfDate && styles.inputError]}
              placeholder="YYYY-MM-DD"
              value={birthOfDate}
              onChangeText={text => {
                setBirthOfDate(text);
                setErrors(prev => ({ ...prev, birthOfDate: undefined }));
              }}
            />
            {errors.birthOfDate && (
              <Text style={styles.errorText}>{errors.birthOfDate}</Text>
            )}

            <Text style={styles.inputLabel}>Address</Text>
            <TextInput
              style={[
                styles.input,
                styles.multilineInput,
                errors.address && styles.inputError,
              ]}
              placeholder="Address"
              multiline
              value={address}
              onChangeText={text => {
                setAddress(text);
                setErrors(prev => ({ ...prev, address: undefined }));
              }}
            />
            {errors.address && (
              <Text style={styles.errorText}>{errors.address}</Text>
            )}

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleSaveProfile}
            >
              <Text style={styles.primaryText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* PASSWORD VIEW – pure client-side validation for now */}
        {mode === 'password' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Security</Text>

            <Text style={styles.inputLabel}>Old Password</Text>
            <TextInput
              style={[styles.input, errors.oldPassword && styles.inputError]}
              placeholder="Old Password"
              secureTextEntry
              value={oldPassword}
              onChangeText={text => {
                setOldPassword(text);
                setErrors(prev => ({ ...prev, oldPassword: undefined }));
              }}
            />
            {errors.oldPassword && (
              <Text style={styles.errorText}>{errors.oldPassword}</Text>
            )}

            <Text style={styles.inputLabel}>New Password</Text>
            <TextInput
              style={[styles.input, errors.newPassword && styles.inputError]}
              placeholder="New Password"
              secureTextEntry
              value={newPassword}
              onChangeText={text => {
                setNewPassword(text);
                setErrors(prev => ({ ...prev, newPassword: undefined }));
              }}
            />
            {errors.newPassword && (
              <Text style={styles.errorText}>{errors.newPassword}</Text>
            )}

            <Text style={styles.inputLabel}>Confirm Password</Text>
            <TextInput
              style={[
                styles.input,
                errors.confirmPassword && styles.inputError,
              ]}
              placeholder="Confirm Password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={text => {
                setConfirmPassword(text);
                setErrors(prev => ({ ...prev, confirmPassword: undefined }));
              }}
            />
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleChangePassword}
            >
              <Text style={styles.primaryText}>Change Password</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Change photo modal (only UI) – backend will later plug in gallery/camera */}
      <Modal
        visible={photoModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPhotoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Change Profile Photo</Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                // TODO: integrate gallery picker (image picker lib) here
                setPhotoModalVisible(false);
              }}
            >
              <Text style={styles.modalButtonText}>Choose from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                // TODO: integrate camera capture here
                setPhotoModalVisible(false);
              }}
            >
              <Text style={styles.modalButtonText}>Take a Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.modalCancelButton]}
              onPress={() => setPhotoModalVisible(false)}
            >
              <Text style={[styles.modalButtonText, styles.modalCancelText]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default NewBar;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFFFB',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  backText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#255E67',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#133D2E',
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  topCard: {
    backgroundColor: '#255E67',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#2FA678',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  avatarText: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  changePhotoBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2FA678',
  },
  changePhotoBadgeText: {
    fontSize: 14,
    color: '#2FA678',
    fontWeight: '900',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 4,
  },
  profileEmail: {
    fontSize: 13,
    color: '#E5F4EE',
    marginTop: 2,
  },
  profileRow: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 10,
  },
  profileTag: {
    flexDirection: 'column',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(250,255,251,0.15)',
  },
  profileTagLabel: {
    fontSize: 10,
    color: '#D0EFE4',
    fontWeight: '600',
  },
  profileTagValue: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#133D2E',
    marginBottom: 12,
  },
  infoRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2FA678',
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
    color: '#133D2E',
    marginTop: 2,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#255E67',
    marginTop: 10,
    marginBottom: 4,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    backgroundColor: '#FFFFFF',
  },
  multilineInput: {
    height: 72,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#FF4D4D',
  },
  errorText: {
    color: '#FF4D4D',
    fontSize: 11,
    marginTop: 3,
  },
  primaryButton: {
    marginTop: 18,
    backgroundColor: '#255E67',
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#133D2E',
    marginBottom: 16,
  },
  modalButton: {
    backgroundColor: '#2FA678',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    textAlign: 'center',
    fontSize: 14,
  },
  modalCancelButton: {
    backgroundColor: '#F2F7F5',
  },
  modalCancelText: {
    color: '#255E67',
  },
});

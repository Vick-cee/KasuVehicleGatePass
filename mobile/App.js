import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraView, useCameraPermissions } from 'expo-camera';
import api, {
  loginOfficer,
  verifyScan,
  getAssignedGate,
  getGatesList,
  getShiftLogs,
  logoutOfficer,
} from './src/services/api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [user, setUser] = useState(null);
  const [officerProfile, setOfficerProfile] = useState(null);
  const [availableGates, setAvailableGates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Officer Duty Station: 'ENTRY' (Check In) | 'EXIT' (Check Out)
  const [gateDuty, setGateDuty] = useState('ENTRY'); 
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' | 'manual' | 'history'
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [manualToken, setManualToken] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [shiftLogs, setShiftLogs] = useState([]);

  // Auth Inputs
  const [email, setEmail] = useState('officer1@university.edu');
  const [password, setPassword] = useState('Password123!');
  const [serverUrl, setServerUrl] = useState(api.defaults.baseURL);
  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('@officer_token');
      const storedUser = await AsyncStorage.getItem('@officer_user');
      const storedProfile = await AsyncStorage.getItem('@officer_profile');

      if (storedToken && storedUser) {
        setUser(JSON.parse(storedUser));
        if (storedProfile) setOfficerProfile(JSON.parse(storedProfile));
        await loadGatesData();
      }
    } catch (e) {
      console.error('Auth verification error:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadGatesData = async () => {
    try {
      const [assignedRes, allRes] = await Promise.allSettled([
        getAssignedGate(),
        getGatesList(),
      ]);

      if (allRes.status === 'fulfilled' && allRes.value.gates) {
        setAvailableGates(allRes.value.gates);
      }

      if (assignedRes.status === 'fulfilled' && assignedRes.value.assignedGate) {
        const assigned = assignedRes.value.assignedGate;
        if (assigned.code === 'GATE-EXIT') {
          setGateDuty('EXIT');
        } else {
          setGateDuty('ENTRY');
        }
      }
    } catch (e) {
      console.log('Gate data loading notice:', e.message);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      api.defaults.baseURL = serverUrl.trim();
      const data = await loginOfficer(email.trim(), password);
      setUser(data.user);
      setOfficerProfile(data.officerProfile || null);
      await loadGatesData();
    } catch (err) {
      Alert.alert(
        'Authentication Failed',
        err.response?.data?.message || err.message || 'Please check your server IP and credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutOfficer();
    setUser(null);
    setOfficerProfile(null);
    setScanResult(null);
    setScanned(false);
  };

  const handleBarcodeScanned = async ({ data }) => {
    if (scanned || verifying || scanResult) return;
    setScanned(true);
    handleVerifyToken(data);
  };

  const handleVerifyToken = async (token) => {
    if (!token || !token.trim()) return;
    setVerifying(true);
    try {
      // Find matching gate ID for current duty
      const targetGate = availableGates.find((g) =>
        gateDuty === 'ENTRY' ? g.code === 'GATE-ENTRY' : g.code === 'GATE-EXIT'
      );

      const result = await verifyScan({
        qrToken: token.trim(),
        direction: gateDuty,
        gateId: targetGate?._id || undefined,
      });

      setScanResult(result);
    } catch (err) {
      setScanResult({
        success: false,
        isValid: false,
        verificationStatus: 'INVALID',
        movementAction: gateDuty === 'ENTRY' ? 'CHECKED_IN' : 'CHECKED_OUT',
        failureReason: err.response?.data?.message || err.message || 'Verification rejected by gate security',
        direction: gateDuty,
        gate: {
          name: gateDuty === 'ENTRY' ? 'KASU Main Entry Gate (Check In)' : 'KASU Main Exit Gate (Check Out)',
          code: gateDuty === 'ENTRY' ? 'GATE-ENTRY' : 'GATE-EXIT',
        },
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleResetScanner = () => {
    setScanResult(null);
    setManualToken('');
    setTimeout(() => {
      setScanned(false);
    }, 1200);
  };

  const loadHistory = async () => {
    try {
      const data = await getShiftLogs();
      setShiftLogs(data.logs || []);
    } catch (e) {
      console.log('Error loading shift logs:', e.message);
    }
  };

  const currentGateName =
    gateDuty === 'ENTRY'
      ? 'KASU Main Entry Gate (Check In)'
      : 'KASU Main Exit Gate (Check Out)';
  const currentGateCode = gateDuty === 'ENTRY' ? 'GATE-ENTRY' : 'GATE-EXIT';

  // ----------------------------------------------------
  // RENDER: Loading Screen
  // ----------------------------------------------------
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#780016" />
        <Text style={styles.loadingText}>Initializing KASU Gate Terminal...</Text>
      </View>
    );
  }

  // ----------------------------------------------------
  // RENDER: Officer Login Screen
  // ----------------------------------------------------
  if (!user) {
    return (
      <SafeAreaView style={styles.loginContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0b0f19" />
        <ScrollView contentContainerStyle={styles.loginScroll} keyboardShouldPersistTaps="handled">
          <View style={styles.brandHeader}>
            <View style={styles.crestContainer}>
              <Text style={styles.crestText}>KASU</Text>
            </View>
            <Text style={styles.title}>KADUNA STATE UNIVERSITY</Text>
            <Text style={styles.subtitle}>Security Gate Pass & Verification Terminal</Text>
            <View style={styles.badgeRow}>
              <Text style={styles.subBadge}>Expo Go SDK 57 Client</Text>
              <Text style={styles.subBadgeGreen}>2-Gate Perimeter System</Text>
            </View>
          </View>

          <View style={styles.loginCard}>
            <Text style={styles.cardHeader}>Gate Officer Authentication</Text>

            <Text style={styles.label}>Officer Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="officer1@university.edu"
              placeholderTextColor="#64748b"
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor="#64748b"
            />

            <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} activeOpacity={0.85}>
              <Text style={styles.primaryButtonText}>Sign In to Gate Terminal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.configToggle}
              onPress={() => setShowConfig(!showConfig)}
            >
              <Text style={styles.configToggleText}>
                {showConfig ? '▲ Hide Backend Server IP' : '▼ Configure Backend Server IP (Expo Go)'}
              </Text>
            </TouchableOpacity>

            {showConfig && (
              <View style={styles.configBox}>
                <Text style={styles.configLabel}>REST API Base URL:</Text>
                <TextInput
                  style={styles.configInput}
                  value={serverUrl}
                  onChangeText={setServerUrl}
                  placeholder="http://192.168.1.X:5000/api"
                  placeholderTextColor="#64748b"
                  autoCapitalize="none"
                />
                <Text style={styles.configHelp}>
                  For Physical Phone on Local Wi-Fi: Set to http://[YOUR_PC_IP]:5000/api (e.g. http://192.168.1.100:5000/api)
                </Text>
              </View>
            )}
          </View>

          {/* Quick Demo Credentials */}
          <View style={styles.quickBox}>
            <Text style={styles.quickTitle}>Quick Demo Gate Duty Sign-in:</Text>
            <TouchableOpacity
              style={styles.quickBtn}
              onPress={() => {
                setEmail('officer1@university.edu');
                setPassword('Password123!');
              }}
            >
              <Text style={styles.quickBtnText}>🟢 Officer Marcus (Entry Gate Duty)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickBtn}
              onPress={() => {
                setEmail('officer2@university.edu');
                setPassword('Password123!');
              }}
            >
              <Text style={styles.quickBtnText}>🔴 Officer Sarah (Exit Gate Duty)</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ----------------------------------------------------
  // RENDER: Main Scanner Interface
  // ----------------------------------------------------
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0b0f19" />

      {/* Top Gate Station Header */}
      <View style={styles.topBanner}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.pulseDot,
                { backgroundColor: gateDuty === 'ENTRY' ? '#22c55e' : '#ef4444' },
              ]}
            />
            <Text style={styles.gateCode}>{currentGateCode}</Text>
            <Text
              style={[
                styles.onDutyTag,
                {
                  backgroundColor: gateDuty === 'ENTRY' ? '#052e16' : '#450a0a',
                  color: gateDuty === 'ENTRY' ? '#4ade80' : '#f87171',
                },
              ]}
            >
              {gateDuty === 'ENTRY' ? 'INBOUND DUTY' : 'OUTBOUND DUTY'}
            </Text>
          </View>
          <Text style={styles.gateName} numberOfLines={1}>
            {currentGateName}
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.75}>
          <Text style={styles.logoutBtnText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Two Gates / Direction Selection Bar */}
      <View style={styles.directionBar}>
        <TouchableOpacity
          style={[styles.dirBtn, gateDuty === 'ENTRY' && styles.dirBtnActiveEntry]}
          onPress={() => {
            setGateDuty('ENTRY');
            setScanResult(null);
          }}
          activeOpacity={0.8}
        >
          <Text style={[styles.dirText, gateDuty === 'ENTRY' && styles.dirTextActive]}>
            ⬇ KASU ENTRY GATE (CHECK IN)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.dirBtn, gateDuty === 'EXIT' && styles.dirBtnActiveExit]}
          onPress={() => {
            setGateDuty('EXIT');
            setScanResult(null);
          }}
          activeOpacity={0.8}
        >
          <Text style={[styles.dirText, gateDuty === 'EXIT' && styles.dirTextActive]}>
            ⬆ KASU EXIT GATE (CHECK OUT)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Navigation Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'camera' && styles.tabBtnActive]}
          onPress={() => setActiveTab('camera')}
        >
          <Text style={[styles.tabText, activeTab === 'camera' && styles.tabTextActive]}>
            📷 Camera View
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'manual' && styles.tabBtnActive]}
          onPress={() => setActiveTab('manual')}
        >
          <Text style={[styles.tabText, activeTab === 'manual' && styles.tabTextActive]}>
            ⌨ Manual Input
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'history' && styles.tabBtnActive]}
          onPress={() => {
            setActiveTab('history');
            loadHistory();
          }}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            📋 Shift Audit
          </Text>
        </TouchableOpacity>
      </View>

      {/* TAB 1: Camera Viewfinder */}
      {activeTab === 'camera' && (
        <View style={styles.scannerWrapper}>
          {!permission?.granted ? (
            <View style={styles.permissionBox}>
              <Text style={styles.permText}>
                Camera permission is required to scan QR vehicle passes on Expo Go.
              </Text>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={requestPermission}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryButtonText}>Grant Camera Permission</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.cameraContainer}>
              <CameraView
                style={StyleSheet.absoluteFillObject}
                facing="back"
                enableTorch={torchEnabled}
                barcodeScannerSettings={{
                  barcodeTypes: ['qr'],
                }}
                onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
              />

              {/* Torch Toggle Button */}
              <TouchableOpacity
                style={[
                  styles.torchButton,
                  torchEnabled && styles.torchButtonActive,
                ]}
                onPress={() => setTorchEnabled(!torchEnabled)}
              >
                <Text style={styles.torchText}>
                  {torchEnabled ? '🔦 Torch ON' : '💡 Torch OFF'}
                </Text>
              </TouchableOpacity>

              {/* Viewfinder Target Framing */}
              <View
                style={[
                  styles.viewfinderTarget,
                  {
                    borderColor:
                      gateDuty === 'ENTRY'
                        ? 'rgba(34, 197, 94, 0.5)'
                        : 'rgba(239, 68, 68, 0.5)',
                  },
                ]}
              >
                <View
                  style={[
                    styles.cornerTL,
                    { borderColor: gateDuty === 'ENTRY' ? '#22c55e' : '#ef4444' },
                  ]}
                />
                <View
                  style={[
                    styles.cornerTR,
                    { borderColor: gateDuty === 'ENTRY' ? '#22c55e' : '#ef4444' },
                  ]}
                />
                <View
                  style={[
                    styles.cornerBL,
                    { borderColor: gateDuty === 'ENTRY' ? '#22c55e' : '#ef4444' },
                  ]}
                />
                <View
                  style={[
                    styles.cornerBR,
                    { borderColor: gateDuty === 'ENTRY' ? '#22c55e' : '#ef4444' },
                  ]}
                />

                <Text
                  style={[
                    styles.targetLabel,
                    {
                      color: gateDuty === 'ENTRY' ? '#4ade80' : '#f87171',
                    },
                  ]}
                >
                  {gateDuty === 'ENTRY'
                    ? 'ALIGN QR • KASU ENTRY (CHECK IN)'
                    : 'ALIGN QR • KASU EXIT (CHECK OUT)'}
                </Text>
              </View>

              {verifying && (
                <View style={styles.scanningOverlay}>
                  <ActivityIndicator size="large" color="#ffffff" />
                  <Text style={styles.verifyingText}>Verifying Pass with KASU Security...</Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {/* TAB 2: Manual Pass Input */}
      {activeTab === 'manual' && (
        <ScrollView style={styles.manualScroll} keyboardShouldPersistTaps="handled">
          <View style={styles.manualCard}>
            <Text style={styles.manualTitle}>
              Manual Code Verification ({gateDuty === 'ENTRY' ? 'Check In' : 'Check Out'})
            </Text>
            <Text style={styles.manualSubtitle}>
              Type or paste the pass token if the physical camera is obstructed.
            </Text>

            <TextInput
              style={styles.manualInput}
              value={manualToken}
              onChangeText={setManualToken}
              placeholder="e.g. UGP-STUDENT-VALID"
              placeholderTextColor="#64748b"
              autoCapitalize="characters"
            />

            <TouchableOpacity
              style={[
                styles.primaryButton,
                { backgroundColor: gateDuty === 'ENTRY' ? '#006837' : '#780016' },
              ]}
              onPress={() => handleVerifyToken(manualToken)}
              disabled={verifying || !manualToken.trim()}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>
                {verifying
                  ? 'Verifying Token...'
                  : gateDuty === 'ENTRY'
                  ? 'Verify & Check In Vehicle'
                  : 'Verify & Check Out Vehicle'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.testHeader}>Quick Test Passes:</Text>
            <TouchableOpacity
              style={styles.testButton}
              onPress={() => handleVerifyToken('UGP-STUDENT-VALID')}
            >
              <Text style={styles.testBtnText}>✓ Student Pass (UNI-789-ST &bull; CS Dept)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.testButton}
              onPress={() => handleVerifyToken('UGP-STAFF-VALID')}
            >
              <Text style={styles.testBtnText}>✓ Staff Pass (FAC-404-OK &bull; Physics Dept)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.testButton}
              onPress={() => handleVerifyToken('UGP-VISITOR-VALID')}
            >
              <Text style={styles.testBtnText}>✓ Guest Pass (VIS-101-NG &bull; Keynote Guest)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.testButton}
              onPress={() => handleVerifyToken('UGP-SUSPENDED-TEST')}
            >
              <Text style={styles.testBtnText}>⚠️ Suspended Pass (SUS-555-ZZ &bull; Hold)</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* TAB 3: Shift History */}
      {activeTab === 'history' && (
        <ScrollView style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Recent Gate Scan Audit Log</Text>
          {shiftLogs.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No scans recorded on this shift yet.</Text>
            </View>
          ) : (
            shiftLogs.map((log) => (
              <View key={log._id} style={styles.logCard}>
                <View style={styles.logLeft}>
                  <Text style={styles.logPlate}>{log.licensePlate}</Text>
                  <Text style={styles.logOwner} numberOfLines={1}>
                    {log.ownerName} &bull; {log.ownerRole}
                  </Text>
                  <Text style={styles.logTime}>
                    {new Date(log.scannedAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </Text>
                </View>
                <View style={styles.logRight}>
                  <View
                    style={[
                      styles.logDirBadge,
                      {
                        backgroundColor:
                          log.direction === 'ENTRY' ? '#052e16' : '#450a0a',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.logDirText,
                        {
                          color:
                            log.direction === 'ENTRY' ? '#4ade80' : '#f87171',
                        },
                      ]}
                    >
                      {log.direction === 'ENTRY' ? 'CHECKED IN' : 'CHECKED OUT'}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.logStatus,
                      log.verificationStatus === 'VALID'
                        ? styles.statusValid
                        : styles.statusInvalid,
                    ]}
                  >
                    {log.verificationStatus}
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* ----------------------------------------------------
          SCAN RESULT MODAL (CHECKED IN / CHECKED OUT / DENIED)
         ---------------------------------------------------- */}
      <Modal visible={!!scanResult} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.resultCard}>
            {/* Header: Prominent CHECKED IN or CHECKED OUT */}
            <View
              style={[
                styles.resultHeader,
                scanResult?.isValid
                  ? scanResult?.direction === 'ENTRY'
                    ? styles.headerCheckIn
                    : styles.headerCheckOut
                  : styles.headerInvalid,
              ]}
            >
              <Text style={styles.resultStatusText}>
                {scanResult?.isValid
                  ? scanResult?.direction === 'ENTRY'
                    ? 'CHECKED IN'
                    : 'CHECKED OUT'
                  : 'ACCESS DENIED'}
              </Text>
              <Text style={styles.resultSubStatus}>
                {scanResult?.isValid
                  ? scanResult?.direction === 'ENTRY'
                    ? 'ENTRY GRANTED • KASU MAIN ENTRY GATE'
                    : 'EXIT CLEARED • KASU MAIN EXIT GATE'
                  : scanResult?.verificationStatus || 'VERIFICATION FAILED'}
              </Text>
            </View>

            {/* Error Message for Invalid / Suspended */}
            {!scanResult?.isValid && scanResult?.failureReason ? (
              <View style={styles.failureBox}>
                <Text style={styles.failureLabel}>SECURITY REJECTION REASON:</Text>
                <Text style={styles.failureText}>{scanResult.failureReason}</Text>
              </View>
            ) : null}

            {/* Vehicle & Owner Credentials */}
            {scanResult?.vehicleDetails ? (
              <View style={styles.vehicleDetailsBox}>
                <View style={styles.plateBadge}>
                  <Text style={styles.plateText}>
                    {scanResult.vehicleDetails.registrationNumber}
                  </Text>
                  <Text style={styles.plateSub}>
                    {scanResult.vehicleDetails.make} {scanResult.vehicleDetails.model} &bull;{' '}
                    {scanResult.vehicleDetails.colour} ({scanResult.vehicleDetails.vehicleType})
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoKey}>Driver / Owner:</Text>
                  <Text style={styles.infoVal}>
                    {scanResult.ownerDetails?.fullName || 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoKey}>Affiliation:</Text>
                  <Text style={styles.infoVal}>
                    {scanResult.ownerDetails?.role || 'UNIVERSITY MEMBER'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoKey}>ID / Matric #:</Text>
                  <Text style={styles.infoVal}>
                    {scanResult.ownerDetails?.idNumber || '—'}
                  </Text>
                </View>
                {scanResult.ownerDetails?.department ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoKey}>Faculty / Unit:</Text>
                    <Text style={styles.infoVal}>
                      {scanResult.ownerDetails.department}
                    </Text>
                  </View>
                ) : null}
                <View style={styles.infoRow}>
                  <Text style={styles.infoKey}>Perimeter Status:</Text>
                  <Text
                    style={[
                      styles.infoVal,
                      {
                        color:
                          scanResult.direction === 'ENTRY' ? '#22c55e' : '#f87171',
                        fontWeight: '900',
                      },
                    ]}
                  >
                    {scanResult.direction === 'ENTRY'
                      ? '● INSIDE CAMPUS (CHECKED IN)'
                      : '● OUTSIDE CAMPUS (CHECKED OUT)'}
                  </Text>
                </View>
              </View>
            ) : null}

            {/* Dismiss Button */}
            <TouchableOpacity
              style={styles.dismissBtn}
              onPress={handleResetScanner}
              activeOpacity={0.85}
            >
              <Text style={styles.dismissBtnText}>SCAN NEXT VEHICLE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f19' },
  centerContainer: {
    flex: 1,
    backgroundColor: '#0b0f19',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: { color: '#f5f5f7', marginTop: 12, fontSize: 13, fontWeight: '700' },
  loginContainer: { flex: 1, backgroundColor: '#0b0f19' },
  loginScroll: { padding: 20, justifyContent: 'center', flexGrow: 1 },

  // Brand Header
  brandHeader: { alignItems: 'center', marginBottom: 20, marginTop: 24 },
  crestContainer: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: '#780016',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#006837',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  crestText: { color: '#ffffff', fontWeight: '900', fontSize: 18, letterSpacing: 1 },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  subtitle: { fontSize: 12, color: '#94a3b8', marginTop: 4, textAlign: 'center', fontWeight: '600' },
  badgeRow: { flexDirection: 'row', gap: 6, marginTop: 8 },
  subBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38bdf8',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  subBadgeGreen: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4ade80',
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.25)',
  },

  // Login Card
  loginCard: {
    backgroundColor: '#111827',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  cardHeader: { color: '#ffffff', fontSize: 15, fontWeight: '900', marginBottom: 14 },
  label: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#030712',
    color: '#ffffff',
    padding: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#374151',
    fontSize: 14,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#006837',
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 6,
  },
  primaryButtonText: { color: '#ffffff', fontWeight: '900', fontSize: 13, letterSpacing: 0.5 },
  configToggle: { marginTop: 14, alignItems: 'center' },
  configToggleText: { color: '#38bdf8', fontSize: 11, fontWeight: '700' },
  configBox: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#030712',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  configLabel: { color: '#94a3b8', fontSize: 11, fontWeight: '600' },
  configInput: {
    color: '#38bdf8',
    fontSize: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: '#374151',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  configHelp: { color: '#64748b', fontSize: 10, marginTop: 4, lineHeight: 14 },
  quickBox: {
    marginTop: 16,
    padding: 14,
    backgroundColor: '#111827',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  quickTitle: {
    color: '#fbbf24',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  quickBtn: { backgroundColor: '#1f2937', padding: 11, borderRadius: 12, marginBottom: 6 },
  quickBtnText: { color: '#f5f5f7', fontSize: 12, fontWeight: '700' },

  // Top Banner
  topBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderColor: '#1f2937',
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pulseDot: { width: 8, height: 8, borderRadius: 4 },
  gateCode: {
    color: '#94a3b8',
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '700',
  },
  onDutyTag: {
    fontSize: 9,
    fontWeight: '900',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  gateName: { color: '#ffffff', fontSize: 15, fontWeight: '900', marginTop: 2 },
  logoutBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#1f2937',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  logoutBtnText: { color: '#f87171', fontSize: 11, fontWeight: '700' },

  // Direction Bar
  directionBar: { flexDirection: 'row', padding: 10, gap: 8 },
  dirBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1f2937',
    alignItems: 'center',
  },
  dirBtnActiveEntry: { backgroundColor: '#006837', borderColor: '#22c55e' },
  dirBtnActiveExit: { backgroundColor: '#780016', borderColor: '#ef4444' },
  dirText: { color: '#64748b', fontSize: 10, fontWeight: '900' },
  dirTextActive: { color: '#ffffff' },

  // Tabs
  tabsRow: { flexDirection: 'row', paddingHorizontal: 10, marginBottom: 8, gap: 6 },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#111827',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  tabBtnActive: { backgroundColor: '#1e293b', borderColor: '#334155' },
  tabText: { color: '#64748b', fontSize: 11, fontWeight: '700' },
  tabTextActive: { color: '#ffffff', fontWeight: '900' },

  // Scanner Wrapper
  scannerWrapper: {
    flex: 1,
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  cameraContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  torchButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 10,
  },
  torchButtonActive: {
    backgroundColor: '#d97706',
    borderColor: '#f59e0b',
  },
  torchText: { color: '#ffffff', fontSize: 11, fontWeight: '800' },
  viewfinderTarget: {
    width: Math.min(SCREEN_WIDTH * 0.68, 260),
    height: Math.min(SCREEN_WIDTH * 0.68, 260),
    borderWidth: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cornerTL: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 26,
    height: 26,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 16,
  },
  cornerTR: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 26,
    height: 26,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 16,
  },
  cornerBL: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    width: 26,
    height: 26,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 16,
  },
  cornerBR: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 16,
  },
  targetLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
    backgroundColor: 'rgba(2, 6, 23, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    textAlign: 'center',
  },
  scanningOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  verifyingText: {
    color: '#ffffff',
    marginTop: 10,
    fontSize: 12,
    fontWeight: '700',
  },
  permissionBox: { padding: 24, alignItems: 'center' },
  permText: { color: '#94a3b8', textAlign: 'center', marginBottom: 16, fontSize: 13 },

  // Manual Tab
  manualScroll: { flex: 1, padding: 10 },
  manualCard: {
    backgroundColor: '#111827',
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  manualTitle: { color: '#ffffff', fontSize: 14, fontWeight: '900', marginBottom: 4 },
  manualSubtitle: { color: '#94a3b8', fontSize: 11, marginBottom: 14 },
  manualInput: {
    backgroundColor: '#030712',
    color: '#ffffff',
    padding: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#374151',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    marginBottom: 12,
  },
  testHeader: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 18,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  testButton: {
    backgroundColor: '#1f2937',
    padding: 11,
    borderRadius: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#374151',
  },
  testBtnText: { color: '#f5f5f7', fontSize: 12, fontWeight: '600' },

  // History Tab
  historyContainer: { flex: 1, padding: 10 },
  historyTitle: { color: '#ffffff', fontSize: 15, fontWeight: '900', marginBottom: 10 },
  emptyCard: {
    backgroundColor: '#111827',
    padding: 24,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  emptyText: { color: '#64748b', fontSize: 12 },
  logCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 13,
    backgroundColor: '#111827',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 8,
  },
  logLeft: { flex: 1, paddingRight: 8 },
  logPlate: {
    color: '#fbbf24',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '900',
    fontSize: 14,
  },
  logOwner: { color: '#94a3b8', fontSize: 11, marginTop: 2 },
  logTime: { color: '#64748b', fontSize: 10, marginTop: 2 },
  logRight: { alignItems: 'flex-end', justifyContent: 'center' },
  logDirBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  logDirText: { fontSize: 9, fontWeight: '900' },
  logStatus: { fontSize: 10, fontWeight: '900', marginTop: 3 },
  statusValid: { color: '#22c55e' },
  statusInvalid: { color: '#f87171' },

  // Result Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(11, 15, 25, 0.95)',
    justifyContent: 'center',
    padding: 16,
  },
  resultCard: {
    backgroundColor: '#111827',
    borderRadius: 26,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1f2937',
    maxHeight: SCREEN_HEIGHT * 0.9,
  },
  resultHeader: { padding: 16, borderRadius: 18, alignItems: 'center', marginBottom: 14 },
  headerCheckIn: { backgroundColor: '#006837' },
  headerCheckOut: { backgroundColor: '#780016' },
  headerInvalid: { backgroundColor: '#991b1b' },
  resultStatusText: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
  },
  resultSubStatus: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 4,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  failureBox: {
    backgroundColor: '#450a0a',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#991b1b',
    marginBottom: 12,
  },
  failureLabel: { color: '#f87171', fontSize: 10, fontWeight: '900' },
  failureText: { color: '#fecaca', fontSize: 12, marginTop: 2 },
  vehicleDetailsBox: {
    backgroundColor: '#030712',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 14,
  },
  plateBadge: {
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 8,
  },
  plateText: {
    color: '#fbbf24',
    fontSize: 24,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 1,
  },
  plateSub: { color: '#94a3b8', fontSize: 11, marginTop: 2, textAlign: 'center' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3.5 },
  infoKey: { color: '#64748b', fontSize: 11, fontWeight: '600' },
  infoVal: { color: '#ffffff', fontSize: 11, fontWeight: '700' },
  dismissBtn: {
    backgroundColor: '#1f2937',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  dismissBtnText: { color: '#ffffff', fontWeight: '900', fontSize: 13, letterSpacing: 0.5 },
});

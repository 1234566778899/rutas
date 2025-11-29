import React, { useEffect, useState } from 'react'
import { 
    ActivityIndicator, 
    Alert, 
    FlatList, 
    StyleSheet, 
    Text, 
    TouchableOpacity, 
    View,
    RefreshControl 
} from 'react-native';
import {
    collection,
    onSnapshot,
    query,
    orderBy,
    where,
} from 'firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FAIcon from 'react-native-vector-icons/FontAwesome5';
import { firestore, auth } from '../firebase';
import moment from 'moment';
import { Menu, Divider, Chip } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';

export const ListScreen = ({ navigation }) => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [filterType, setFilterType] = useState('all');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [datePickerMode, setDatePickerMode] = useState('start');

    const getFilterLabel = () => {
        switch (filterType) {
            case 'today': return 'Hoy';
            case 'week': return 'Esta semana';
            case 'month': return 'Este mes';
            case 'range': return `${moment(startDate).format('DD/MM')} - ${moment(endDate).format('DD/MM')}`;
            default: return 'Todas';
        }
    };

    const getDateRange = () => {
        const now = new Date();
        let start, end;

        switch (filterType) {
            case 'today':
                start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
                end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
                break;
            case 'week':
                const dayOfWeek = now.getDay();
                const diff = now.getDate() - dayOfWeek;
                start = new Date(now.setDate(diff));
                start.setHours(0, 0, 0, 0);
                end = new Date();
                end.setHours(23, 59, 59, 999);
                break;
            case 'month':
                start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
                end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
                break;
            case 'range':
                start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                break;
            default:
                return null;
        }

        return { start, end };
    };

    const fetchReports = () => {
        const user = auth.currentUser;
        if (!user) {
            Alert.alert('Sesión requerida', 'Debes estar logueado para ver tus denuncias.');
            navigation.navigate('login');
            return null;
        }

        const userId = user.uid;
        const q = query(
            collection(firestore, 'reports'),
            where('userId', '==', userId),
            orderBy('timestamp', 'desc')
        );

        return q;
    };

    useEffect(() => {
        const q = fetchReports();
        if (!q) return;

        const unsubscribe = onSnapshot(
            q,
            snap => {
                let data = snap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    timestamp: doc.data().timestamp?.toDate() ?? null,
                }));

                const dateRange = getDateRange();
                if (dateRange) {
                    data = data.filter(report => {
                        if (!report.timestamp) return false;
                        const reportTime = report.timestamp.getTime();
                        return reportTime >= dateRange.start.getTime() && 
                               reportTime <= dateRange.end.getTime();
                    });
                }

                setReports(data);
                setLoading(false);
                setRefreshing(false);
            },
            err => {
                console.error('Error fetching reports:', err);
                
                if (err.code === 'failed-precondition') {
                    Alert.alert(
                        'Índice requerido',
                        'Necesitas crear un índice en Firebase. Revisa la consola para el enlace directo o ve a Firebase Console > Firestore > Índices.',
                        [{ text: 'Entendido' }]
                    );
                } else {
                    Alert.alert('Error', 'No se pudieron obtener las denuncias.');
                }
                
                setLoading(false);
                setRefreshing(false);
            }
        );
        return () => unsubscribe();
    }, [filterType, startDate, endDate]);

    const onRefresh = () => {
        setRefreshing(true);
    };

    const handleFilterSelect = (type) => {
        setFilterType(type);
        setMenuVisible(false);
        if (type === 'range') {
            setDatePickerMode('start');
            setShowDatePicker(true);
        }
    };

    const handleDateChange = (event, selectedDate) => {
        if (event.type === 'dismissed') {
            setShowDatePicker(false);
            return;
        }

        if (datePickerMode === 'start') {
            setStartDate(selectedDate || startDate);
            setDatePickerMode('end');
        } else {
            setEndDate(selectedDate || endDate);
            setShowDatePicker(false);
            setDatePickerMode('start');
        }
    };

    const getReportIcon = (description) => {
        const lowerDesc = description?.toLowerCase() || '';
        if (lowerDesc.includes('robo') || lowerDesc.includes('asalto')) return 'user-secret';
        if (lowerDesc.includes('violencia') || lowerDesc.includes('agresión')) return 'hand-rock';
        if (lowerDesc.includes('droga')) return 'pills';
        if (lowerDesc.includes('accidente')) return 'car-crash';
        return 'exclamation-triangle';
    };

    const renderReport = ({ item }) => (
        <TouchableOpacity style={styles.reportCard} activeOpacity={0.7}>
            <View style={styles.reportHeader}>
                <View style={styles.iconCircle}>
                    <FAIcon name={getReportIcon(item.description)} size={20} color="#05274B" />
                </View>
                <View style={styles.reportHeaderText}>
                    <Text style={styles.reportTitle}>{item.name}</Text>
                    <View style={styles.badgeContainer}>
                        <View style={styles.badge}>
                            <Icon name="verified-user" size={14} color="#05274B" />
                            <Text style={styles.badgeText}>DNI: {item.dni}</Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.reportContent}>
                <View style={styles.locationRow}>
                    <Icon name="location-on" size={18} color="#666" />
                    <Text style={styles.reportAddress}>{item.address}</Text>
                </View>
                <Text style={styles.reportDescription} numberOfLines={3}>
                    {item.description}
                </Text>
            </View>

            <View style={styles.reportFooter}>
                <View style={styles.timestampContainer}>
                    <Icon name="access-time" size={16} color="#999" />
                    <Text style={styles.reportTimestamp}>
                        {item.timestamp ? moment(item.timestamp).format('DD/MM/YYYY • hh:mm A') : ''}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.listTitle}>Mis Denuncias</Text>
                        {reports.length > 0 && (
                            <Text style={styles.resultsCount}>
                                {reports.length} {reports.length === 1 ? 'registro' : 'registros'}
                            </Text>
                        )}
                    </View>
                    <Menu
                        visible={menuVisible}
                        onDismiss={() => setMenuVisible(false)}
                        anchor={
                            <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.filterButton}>
                                <Icon name="filter-list" size={24} color="#05274B" />
                                <Text style={styles.filterButtonText}>{getFilterLabel()}</Text>
                            </TouchableOpacity>
                        }
                    >
                        <Menu.Item onPress={() => handleFilterSelect('all')} title="Todas" leadingIcon={filterType === 'all' ? 'check' : undefined} />
                        <Divider />
                        <Menu.Item onPress={() => handleFilterSelect('today')} title="Hoy" leadingIcon={filterType === 'today' ? 'check' : undefined} />
                        <Menu.Item onPress={() => handleFilterSelect('week')} title="Esta semana" leadingIcon={filterType === 'week' ? 'check' : undefined} />
                        <Menu.Item onPress={() => handleFilterSelect('month')} title="Este mes" leadingIcon={filterType === 'month' ? 'check' : undefined} />
                        <Divider />
                        <Menu.Item onPress={() => handleFilterSelect('range')} title="Rango personalizado" leadingIcon={filterType === 'range' ? 'check' : undefined} />
                    </Menu>
                </View>

                {filterType !== 'all' && (
                    <Chip icon="close" onPress={() => handleFilterSelect('all')} style={styles.activeFilterChip} textStyle={styles.chipText}>
                        Filtro activo: {getFilterLabel()}
                    </Chip>
                )}
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#05274B" />
                    <Text style={styles.loadingText}>Cargando denuncias...</Text>
                </View>
            ) : reports.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <FAIcon name="inbox" size={64} color="#CCCCCC" />
                    <Text style={styles.emptyTitle}>No hay denuncias</Text>
                    <Text style={styles.emptyText}>
                        {filterType !== 'all' ? 'No se encontraron denuncias en este período' : 'Aún no has registrado denuncias'}
                    </Text>
                    {filterType === 'all' && (
                        <TouchableOpacity onPress={() => navigation.navigate('report')} style={styles.emptyButton}>
                            <Text style={styles.emptyButtonText}>Crear primera denuncia</Text>
                        </TouchableOpacity>
                    )}
                </View>
            ) : (
                <FlatList
                    data={reports}
                    keyExtractor={(item) => item.id}
                    renderItem={renderReport}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#05274B']}
                            tintColor="#05274B"
                            title="Actualizando..."
                            titleColor="#05274B"
                        />
                    }
                />
            )}

            {showDatePicker && (
                <DateTimePicker
                    value={datePickerMode === 'start' ? startDate : endDate}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                />
            )}

            <TouchableOpacity onPress={() => navigation.navigate('report')} style={styles.fabButton} activeOpacity={0.8}>
                <Icon name="add" size={32} color="white" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' },
    headerContainer: {
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    listTitle: { fontSize: 26, fontWeight: 'bold', color: '#05274B' },
    resultsCount: { fontSize: 14, color: '#666', marginTop: 4 },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F4FF',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    filterButtonText: { fontSize: 14, color: '#05274B', fontWeight: '600' },
    activeFilterChip: { backgroundColor: '#E3F2FD', marginTop: 10 },
    chipText: { fontSize: 12, color: '#05274B' },
    listContent: { padding: 15, paddingBottom: 100 },
    reportCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
        borderLeftWidth: 4,
        borderLeftColor: '#05274B',
    },
    reportHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    iconCircle: {
        width: 45,
        height: 45,
        borderRadius: 23,
        backgroundColor: '#F0F4FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    reportHeaderText: { flex: 1 },
    reportTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E232C', marginBottom: 4 },
    badgeContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F4FF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    badgeText: { fontSize: 12, color: '#05274B', fontWeight: '500' },
    divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 12 },
    reportContent: { marginBottom: 12 },
    locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 4 },
    reportAddress: { fontSize: 14, color: '#666', flex: 1 },
    reportDescription: { fontSize: 15, color: '#333', lineHeight: 22 },
    reportFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    timestampContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    reportTimestamp: { fontSize: 12, color: '#999' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    loadingText: { fontSize: 16, color: '#666' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E232C', marginTop: 20, marginBottom: 8 },
    emptyText: { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22 },
    emptyButton: { backgroundColor: '#05274B', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginTop: 20 },
    emptyButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
    fabButton: {
        backgroundColor: '#05274B',
        width: 60,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 30,
        position: 'absolute',
        bottom: 20,
        right: 20,
        shadowColor: '#05274B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
});
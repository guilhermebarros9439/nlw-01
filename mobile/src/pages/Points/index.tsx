import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';

import Constants from 'expo-constants';
import { Feather as Icon } from '@expo/vector-icons';

import { useNavigation, useRoute } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';

import { SvgUri } from 'react-native-svg';
import api from '../../services/api';

interface Item {
    id: number;
    image_url: string;
    title: string;
}

interface Point {
    id: number;
    image: string;
    image_url: string;
    name: string;
    latitude: number;
    longitude: number;
}

interface Params {
    uf: string;
    city: string;
}

const Points = () => {
    const [ items, setItems ] = useState<Item[]>([]);
    const [ selectedItems, setSelectedItems ] = useState<number[]>([]);

    const [ position, setPosition ] = useState<[ number, number ]>([ 0, 0 ]);
    const [ points, setPoints ] = useState<Point[]>([]);

    const navigation = useNavigation();
    const route = useRoute();

    const routeParams = route.params as Params;

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(pos => {
            const { latitude, longitude } = pos.coords;

            setPosition([
                latitude,
                longitude
            ]);
        }, () => {
            Alert.alert('Oops!', 'Erro ao obter localização. Precisamos da permissão de localização.');
        });
    }, []);

    useEffect(() => {
        api.get('/items').then(response => {
            setItems(response.data);
        }).catch(err => {
            console.log(err);
        });
    }, []);

    useEffect(() => {
        api.get('/points', {
            params: {
                city: routeParams.city,
                uf: routeParams.uf,
                items: selectedItems
            }
        }).then(response => {
            setPoints(response.data);
        }).catch(() => {
            Alert.alert('Erro no servidor', 'Tente novamente mais tarde.');
        });
    }, [selectedItems]);

    function handleNavigateBack() {
        navigation.goBack();
    }

    function handleNavigateToDetail(id: number) {
        navigation.navigate('Detail', { point_id: id });
    }

    function handleSelectItem(id: number) {
        if (selectedItems.includes(id)) {
            const filteredItems = selectedItems.filter(item => item !== id);
            setSelectedItems(filteredItems);
        } else {
            setSelectedItems([ ...selectedItems, id ]);
        }
    }

    return (
        <>
            <View style={ styles.container }>
                <TouchableOpacity onPress={ handleNavigateBack }>
                    <Icon name='arrow-left' size={ 24 } color='#34cb29' />
                </TouchableOpacity>

                <Text style={ styles.title }>Bem-Vindo.</Text>
                <Text style={ styles.description }>Encontre no mapa um ponto de coleta.</Text>

                <View style={ styles.mapContainer }>
                    {
                        position[0] !== 0 && (
                            <MapView 
                                initialRegion={{
                                    latitude: position[0],
                                    longitude: position[1],
                                    latitudeDelta: 0.01,
                                    longitudeDelta: 0.01
                                }}
                                style={ styles.map }
                            >{
                                points.map(point => (
                                    <Marker 
                                        key={ String(point.id) }
                                        onPress={ () => handleNavigateToDetail(point.id) }
                                        style={ styles.mapMarker }
                                        coordinate={{
                                            latitude: point.latitude,
                                            longitude: point.longitude
                                        }} 
                                    >
                                        <View style={ styles.mapMarkerContainer }>
                                            <Image 
                                                style={ styles.mapMarkerImage }
                                                source={{ uri: point.image_url }} 
                                            />
                                            <Text style={ styles.mapMarkerTitle }>{ point.name }</Text>
                                        </View>
                                    </Marker>
                                ))
                            }</MapView>
                        )
                    }
                </View>
            </View>
            <View style={ styles.itemsContainer }>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={ false }
                    contentContainerStyle={{
                        paddingHorizontal: 28
                    }}
                >{
                    items.map(item => (
                        <TouchableOpacity 
                            key={ String(item.id) }
                            style={[
                                styles.item,
                                selectedItems.includes(item.id) && styles.selectedItem
                            ]}
                            onPress={ () => handleSelectItem(item.id) }
                            activeOpacity={ .6 }
                        >
                            <SvgUri width={ 42 } height={ 42 } uri={ item.image_url } />
                            <Text style={ styles.itemTitle }>{ item.title }</Text>
                        </TouchableOpacity>
                    ))
                }</ScrollView>   
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 32,
        paddingTop: 20 + Constants.statusBarHeight,
    },
  
    title: {
        fontSize: 20,
        fontFamily: 'Ubuntu_700Bold',
        marginTop: 24,
    },
  
    description: {
        color: '#6C6C80',
        fontSize: 16,
        marginTop: 4,
        fontFamily: 'Roboto_400Regular',
    },
  
    mapContainer: {
        flex: 1,
        width: '100%',
        borderRadius: 10,
        overflow: 'hidden',
        marginTop: 16,
    },
  
    map: {
        width: '100%',
        height: '100%',
    },
  
    mapMarker: {
        width: 90,
        height: 80,
    },
  
    mapMarkerContainer: {
        width: 90,
        height: 70,
        backgroundColor: '#34CB79',
        flexDirection: 'column',
        borderRadius: 8,
        overflow: 'hidden',
        alignItems: 'center',
    },
  
    mapMarkerImage: {
        width: 90,
        height: 45,
        resizeMode: 'cover',
    },
  
    mapMarkerTitle: {
        flex: 1,
        fontFamily: 'Roboto_400Regular',
        color: '#FFF',
        fontSize: 13,
        lineHeight: 23,
    },
  
    itemsContainer: {
        flexDirection: 'row',
        marginTop: 16,
        marginBottom: 32,
    },
  
    item: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#eee',
        height: 120,
        width: 120,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 16,
        marginHorizontal: 4,
        alignItems: 'center',
        justifyContent: 'space-between',
    
        textAlign: 'center',
    },
  
    selectedItem: {
        borderColor: '#34CB79',
        borderWidth: 2,
    },
  
    itemTitle: {
        fontFamily: 'Roboto_400Regular',
        textAlign: 'center',
        fontSize: 13,
    },
});

export default Points;
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { View, Text, Image, ImageBackground, KeyboardAvoidingView, StyleSheet, Platform } from 'react-native';

import { RectButton, TextInput } from 'react-native-gesture-handler';
import { Feather as Icon } from '@expo/vector-icons';

import { useNavigation } from '@react-navigation/native';
import Select from 'react-native-picker-select';

import axios from 'axios';

const logoImg = require('../../assets/logo.png');
const backgroundImg = require('../../assets/home-background.png');

interface UF {
    sigla: string;
}

interface City {
    nome: string;
}

const Home = () => {
    const [ ufs, setUfs ] = useState<string[]>([]);
    const [ cities, setCities ] = useState<string[]>([]);

    const [ uf, setUf ] = useState('');
    const [ city, setCity ] = useState('');

    const navigation = useNavigation();

    useEffect(() => {
        axios.get<UF[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
            const initialsUF = response.data.map(uf => uf.sigla);

            setUfs(initialsUF);
        });
    }, []);

    useEffect(() => {
        axios.get<City[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${ uf }/municipios`).then(response => {
            const cityNames = response.data.map(city => city.nome);

            setCities(cityNames);
        });
    }, [uf]);

    function handleNavigateToMap() {
        navigation.navigate('Points', {
            uf,
            city
        });
    }

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={ Platform.OS === 'ios' ? 'padding' : undefined }>
            <ImageBackground 
                source={ backgroundImg } 
                style={ styles.container }
                imageStyle={{
                    width: 274,
                    height: 368
                }}
            >
                <View style={ styles.main }>
                    <Image source={ logoImg } />
                    <View>
                        <Text style={ styles.title }>Seu marketplace de coleta de resíduos</Text>
                        <Text style={ styles.description }>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente.</Text>
                    </View>
                </View>

                <View style={ styles.footer }>
                    <Select
                        pickerProps={{ style: styles.input }}
                        value={ uf }
                        placeholder={{ label: 'Selecione uma UF', color: '#0003' }}
                        onValueChange={ value => setUf(value) }
                        items={ ufs.map(uf => ({ label: uf, value: uf })) }
                    />

                    <Select
                        pickerProps={{ style: styles.input }}
                        placeholder={{ label: 'Selecione uma Cidade', color: '#0003' }}
                        onValueChange={ value => setCity(value) }
                        items={ cities.map(city => ({ label: city, value: city })) } 
                    />

                    <RectButton style={ styles.button } onPress={ handleNavigateToMap }>
                        <View style={ styles.buttonIcon }>
                            <Icon name='log-in' color='#fff' size={ 24 } />
                        </View>
                        <Text style={ styles.buttonText }>Entrar</Text>
                    </RectButton>
                </View>
            </ImageBackground>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 32
    },
  
    main: {
        flex: 1,
        justifyContent: 'center',
    },
  
    title: {
        color: '#322153',
        fontSize: 32,
        fontFamily: 'Ubuntu_700Bold',
        maxWidth: 260,
        marginTop: 64,
    },
  
    description: {
        color: '#6C6C80',
        fontSize: 16,
        marginTop: 16,
        fontFamily: 'Roboto_400Regular',
        maxWidth: 260,
        lineHeight: 24,
    },
  
    footer: {},
  
    select: {},
  
    input: {
        height: 60,
        backgroundColor: '#FFF',
        borderRadius: 10,
        marginBottom: 8,
        paddingHorizontal: 24,
        fontSize: 16,
    },
  
    button: {
        backgroundColor: '#34CB79',
        height: 60,
        flexDirection: 'row',
        borderRadius: 10,
        overflow: 'hidden',
        alignItems: 'center',
        marginTop: 8,
    },
  
    buttonIcon: {
        height: 60,
        width: 60,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        justifyContent: 'center',
        alignItems: 'center'
    },
  
    buttonText: {
        flex: 1,
        justifyContent: 'center',
        textAlign: 'center',
        color: '#FFF',
        fontFamily: 'Roboto_500Medium',
        fontSize: 16,
    }
});

export default Home;
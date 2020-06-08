import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link } from 'react-router-dom';

import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';

import axios from 'axios';
import { LeafletMouseEvent } from 'leaflet';

import Dropzone from '../../components/Dropzone';
import api from '../../services/api';

import './style.css';
import logoImg from '../../assets/logo.svg';

interface Item {
    id: number;
    title: string;
    image_url: string;
}

interface IBGEUFResponse {
    sigla: string;
}

interface IBGECityResponse {
    nome: string;
}

const CreatePoint = () => {
    const [ items, setItems ] = useState<Item[]>([]);
    const [ selectedItems, setSelectedItems ] = useState<number[]>([]);
    const [ selectedFile, setSelectedFile ] = useState<File>();

    const [ formData, setFormData ] = useState({
        name: '',
        email: '',
        whatsapp: ''
    });

    const [ ufs, setUfs ] = useState<string[]>([]);
    const [ cities, setCities ] = useState<string[]>([]);

    const [ selectedUf, setSelectedUf ] = useState('0');
    const [ selectedCity, setSelectedCity ] = useState('0');

    const [ initialPosition, setInitialPosition ] = useState<[ number, number ]>([ 40.6971494, -74.2598693 ]);
    const [ selectedPosition, setSelectedPosition ] = useState<[ number, number ]>([ 40.6971494, -74.2598693 ]);

    useEffect(() => {
        async function getItems() {
            const response = await api.get('/items');

            setItems(response.data);
        }

        getItems();
    }, []);

    useEffect(() => {
        async function getUfs() {
            const response = await axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados');

            const ufInitials = response.data.map(uf => uf.sigla);
            setUfs(ufInitials);
        }
        
        getUfs();
    }, []);

    useEffect(() => {
        async function getCities() {
            if (selectedUf === '0') {
                return;
            }

            const response = await axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${ selectedUf }/municipios`);

            const cityNames = response.data.map(city => city.nome);
            setCities(cityNames);
        }

        getCities();
    }, [selectedUf]);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;

            setInitialPosition([
                latitude,
                longitude
            ]);

            setSelectedPosition([
                latitude,
                longitude
            ]);
        }, err => {
            console.error(err);
            alert('Erro ao obter localização. Certifique-se de conceder permissão de localização')
        })
    }, []);

    function handleSelectUf(e: ChangeEvent<HTMLSelectElement>) {
        setSelectedUf(e.target.value);
    }

    function handleSelectCity(e: ChangeEvent<HTMLSelectElement>) {
        setSelectedCity(e.target.value);
    }

    function handleMapClick(e: LeafletMouseEvent) {
        const { lat, lng } = e.latlng;

        setSelectedPosition([
            lat,
            lng
        ]);
    }

    function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });
    }

    function handleSelectItem(id: number) {
        if (selectedItems.includes(id)) {
            const filteredItems = selectedItems.filter(item_id => item_id !== id);
            setSelectedItems(filteredItems);
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();

        const homeLink = document.querySelector('#page-create-point header a');
        const successDiv = document.querySelector('#page-create-point div.success');

        const { name, email, whatsapp } = formData;
        const [ latitude, longitude ] = selectedPosition;
        const uf = selectedUf;
        const city = selectedCity;
        const items = selectedItems;

        const data = new FormData();

        data.append('name', name);
        data.append('email', email);
        data.append('whatsapp', whatsapp);
        data.append('latitude', String(latitude));
        data.append('longitude', String(longitude));
        data.append('uf', uf);
        data.append('city', city);
        data.append('items', items.join(','));

        if (selectedFile) {
            data.append('image', selectedFile);
        }

        try {
            await api.post('/points', data);

            successDiv?.classList.remove('hide');
            homeLink?.classList.add('success-link');
        } catch (err) {
            alert('Erro na requisição. Tente novamente.')
            console.error(err);
        }
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={ logoImg } alt="Ecoleta"/>

                <Link to='/'>
                    <FiArrowLeft />
                    Voltar para home
                </Link>
            </header>

            <form onSubmit={ handleSubmit }>
                <h1>Cadastro do<br /> ponto de coleta</h1>

                <Dropzone onFileUploaded={ setSelectedFile } />

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input 
                            type="text"
                            name='name'
                            id='name'
                            value={ formData.name }
                            onChange={ handleInputChange }
                        />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input 
                                type="text"
                                name='email'
                                id='email'
                                value={ formData.email }
                                onChange={ handleInputChange }
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input 
                                type="text"
                                name='whatsapp'
                                id='whatsapp'
                                value={ formData.whatsapp }
                                onChange={ handleInputChange }
                            />
                        </div>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map center={initialPosition} zoom={ 15 } onClick={ handleMapClick }>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <Marker position={selectedPosition}></Marker>
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select 
                                name="uf" 
                                id="uf"
                                value={ selectedUf }
                                onChange={ handleSelectUf }
                            >
                                <option value='0'>Selecione uma UF</option>
                            {
                                ufs.map(uf => <option key={ uf } value={ uf }>{ uf }</option>)
                            }</select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select 
                                name="city" 
                                id="city"
                                value={ selectedCity }
                                onChange={ handleSelectCity }
                            >
                                <option value="0">Selecione uma cidade</option>
                            {
                                cities.map((city, index) => <option key={ index } value={ city }>{ city }</option>)
                            }
                            </select>
                        </div>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>
                        <h2>Ítens de coleta</h2>
                        <span>Selecione um ou mais ítens abaixo</span>
                    </legend>

                    <ul className="items-grid">{
                        items.map(item => (
                            <li 
                                key={ item.id }
                                onClick={ () => handleSelectItem(item.id) }
                                className={ selectedItems.includes(item.id) ? 'selected': '' }
                            >
                                <img
                                    src={ item.image_url } 
                                    alt={ item.title } 
                                />
                                <span>{ item.title }</span>
                            </li>
                        ))
                    }</ul>
                </fieldset>

                <button type="submit">
                    Cadastrar ponto de coleta
                </button>
            </form>

            <div className="success hide">
                <FiCheckCircle size={ 60 } style={{ color: 'var(--primary-color)' }} />
                <h1>Cadastro concluido!</h1>
            </div>
        </div>
    );
}

export default CreatePoint;
import Knex from 'knex';

export async function seed(knex: Knex) {
    await knex('items').insert([
        { image: 'lampadas.svg', title: 'Lâmpadas' },
        { image: 'baterias.svg', title: 'Pilhas e Baterias' },
        { image: 'papeis.svg', title: 'Papéis e Papelão' },
        { image: 'eletronicos.svg', title: 'Residuos e Eletrônicos' },
        { image: 'organicos.svg', title: 'Resuduos Orgânicos' },
        { image: 'oleo.svg', title: 'Óleo de Cozinha' }
    ]);
}
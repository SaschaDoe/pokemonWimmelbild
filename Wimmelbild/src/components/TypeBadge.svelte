<script lang="ts">
    export let type: string;

    const colours = {
        normal: '#A8A77A',
        fire: '#EE8130',
        water: '#6390F0',
        electric: '#F7D02C',
        grass: '#7AC74C',
        ice: '#96D9D6',
        fighting: '#C22E28',
        poison: '#A33EA1',
        ground: '#E2BF65',
        flying: '#A98FF3',
        psychic: '#F95587',
        bug: '#A6B91A',
        rock: '#B6A136',
        ghost: '#735797',
        dragon: '#6F35FC',
        dark: '#705746',
        steel: '#B7B7CE',
        fairy: '#D685AD',
    };

    // German to English type mapping for colors
    const typeMapping: { [key: string]: string } = {
        Normal: 'normal',
        Feuer: 'fire',
        Wasser: 'water',
        Elektro: 'electric',
        Pflanze: 'grass',
        Eis: 'ice',
        Kampf: 'fighting',
        Gift: 'poison',
        Boden: 'ground',
        Flug: 'flying',
        Psycho: 'psychic',
        Käfer: 'bug',
        Gestein: 'rock',
        Geist: 'ghost',
        Drache: 'dragon',
        Unlicht: 'dark',
        Stahl: 'steel',
        Fee: 'fairy'
    };

    $: backgroundColor = colours[typeMapping[type]?.toLowerCase()] || '#777777';
</script>

<span class="type-badge" style="background-color: {backgroundColor}">
    {type}
</span>

<style>
    .type-badge {
        color: white;
        padding: 0.2rem 0.5rem;
        border-radius: 12px;
        font-size: 0.8rem;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.4);
        font-weight: bold;
    }
</style> 
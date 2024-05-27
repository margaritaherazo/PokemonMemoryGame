const apiUrl = "https://pokeapi.co/api/v2/pokemon/";
const gameBoard = document.getElementById('game-board');

let firstSelection;
let gamePaused = true;
let matchesCount;

const typeColors = {
    fire: '#FDDFDF',
    grass: '#DEFDE0',
    electric: '#FCF7DE',
    water: '#DEF3FD',
    ground: '#f4e7da',
    rock: '#d5d5d4',
    fairy: '#fceaff',
    poison: '#98d7a5',
    bug: '#f8d5a3',
    dragon: '#97b3e6',
    psychic: '#eaeda1',
    flying: '#F5F5F5',
    fighting: '#E6E0D4',
    normal: '#F5F5F5'
};

const fetchPokemonData = async () => {
    const uniqueIds = new Set();
    while (uniqueIds.size < 8) {
        const randomId = Math.ceil(Math.random() * 150);
        uniqueIds.add(randomId);
    }
    const fetchPromises = [...uniqueIds].map(id => fetch(apiUrl + id));
    const responses = await Promise.all(fetchPromises);
    return await Promise.all(responses.map(res => res.json()));
}

const startNewGame = async () => {
    gameBoard.innerHTML = '';
    gamePaused = true;
    firstSelection = null;
    matchesCount = 0;
    setTimeout(async () => {
        const pokemonData = await fetchPokemonData();
        renderPokemonCards([...pokemonData, ...pokemonData]);
        gamePaused = false;
    }, 200);
}

const renderPokemonCards = (pokemonArray) => {
    pokemonArray.sort(() => Math.random() - 0.5);
    const cardsHTML = pokemonArray.map(pokemon => {
        const type = pokemon.types[0]?.type?.name;
        const color = typeColors[type] || '#F5F5F5';
        return `
            <div class="card" onclick="handleCardClick(event)" data-name="${pokemon.name}" style="background-color:${color};">
                <div class="face"></div>
                <div class="back flipped" style="background-color:${color};">
                    <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" />
                    <h2>${pokemon.name}</h2>
                </div>
            </div>
        `;
    }).join('');
    gameBoard.innerHTML = cardsHTML;
}

const handleCardClick = (event) => {
    const clickedCard = event.currentTarget;
    const [face, back] = getCardFaces(clickedCard);
    if (face.classList.contains("flipped") || gamePaused) {
        return;
    }
    gamePaused = true;
    flipCards([face, back]);
    if (!firstSelection) {
        firstSelection = clickedCard;
        gamePaused = false;
    } else {
        const secondName = clickedCard.dataset.name;
        const firstName = firstSelection.dataset.name;
        if (firstName !== secondName) {
            const [firstFace, firstBack] = getCardFaces(firstSelection);
            setTimeout(() => {
                flipCards([face, back, firstFace, firstBack]);
                firstSelection = null;
                gamePaused = false;
            }, 500);
        } else {
            matchesCount++;
            if (matchesCount === 8) {
                console.log("You win!");
            }
            firstSelection = null;
            gamePaused = false;
        }
    }
}

const getCardFaces = (card) => {
    const face = card.querySelector(".face");
    const back = card.querySelector(".back");
    return [face, back];
}

const flipCards = (elements) => {
    if (!Array.isArray(elements)) return;
    elements.forEach(element => element.classList.toggle('flipped'));
}

startNewGame();

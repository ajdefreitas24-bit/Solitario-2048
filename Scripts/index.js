// Configuración e inicio del estado del juego
const MAX_CARDS = 8;
const POSSIBLE_VALUES = [2, 4, 8, 16, 32];

let boardState = [[], [], [], []]; // Representa las 4 columnas: cada array va de arriba hacia abajo
let currentScore = 0;
let nextCardValue = 0;
let gameOver = false;

// Elementos del DOM
const columnsDOM = document.querySelectorAll('.column');
const nextCardContainer = document.getElementById('next-card-container');
const scoreDisplay = document.getElementById('score');
const resetBtn = document.getElementById('reset-btn');

// Inicializar juego
function initGame() {
    boardState = [[], [], [], []];
    currentScore = 0;
    gameOver = false;
    scoreDisplay.textContent = currentScore;
    generateNextCard();
    renderBoard();
}

// Generar una nueva carta aleatoria para el mazo
function generateNextCard() {
    const randomIndex = Math.floor(Math.random() * POSSIBLE_VALUES.length);
    nextCardValue = POSSIBLE_VALUES[randomIndex];
    
    // Renderizar la carta del mazo
    nextCardContainer.innerHTML = `
        <div class="card card-${nextCardValue}">${nextCardValue}</div>
    `;
}

// Renderiza visualmente el estado del tablero
function renderBoard() {
    columnsDOM.forEach((columnElement, colIndex) => {
        columnElement.innerHTML = ''; // Limpiar la columna física
        const column = boardState[colIndex];
        columnElement.setAttribute('data-count', `${column.length}/${MAX_CARDS}`);
        columnElement.classList.toggle('near-full', column.length >= 6);
        
        column.forEach(value => {
            const cardElement = document.createElement('div');
            cardElement.className = `card card-${value}`;
            cardElement.textContent = value;
            columnElement.appendChild(cardElement);
        });
    });
}

// Lógica recursiva de fusión (Reacción en cadena)
function processMerges(colIndex, rowIndex) {
    // Si la carta está en la parte superior de la pila, no tiene nada arriba con qué fusionarse
    if (rowIndex <= 0) return;

    const currentCard = boardState[colIndex][rowIndex];
    const cardAbove = boardState[colIndex][rowIndex - 1];

    // Si tienen el mismo valor, ocurre la fusión
    if (currentCard && cardAbove && currentCard === cardAbove) {
        const newValue = currentCard * 2;
        
        // Sumar puntos
        currentScore += newValue;
        scoreDisplay.textContent = currentScore;

        // Modificar el arreglo eliminando la carta debajo y duplicando la de arriba
        boardState[colIndex][rowIndex - 1] = newValue;
        boardState[colIndex].splice(rowIndex, 1);

        // EFECTO ESPECIAL: Si alcanza 2048, limpia toda la columna de inmediato
            if (newValue === 2048) {
                // Mostrar la carta 2048, animarla y reproducir sonido, luego limpiar la columna
                renderBoard();

                // Añadir clase de celebración al elemento de la carta 2048 concreta
                const columnElement = columnsDOM[colIndex];
                const cardElems = columnElement.querySelectorAll('.card');
                const targetElem = cardElems[rowIndex - 1];
                if (targetElem) {
                    targetElem.classList.add('card-celebrate');
                }

                // Reproducir sonido (si el archivo existe en Assets)
                try {
                    const audio = new Audio('/Assets/VictorySound.mp4');
                    // Algunas plataformas requieren interacción previa; ignorar errores silenciosamente
                    audio.play().catch(() => {});
                } catch (e) {
                    // Ignorar si no se puede reproducir
                }

                // Mantener visible la carta un momento y después limpiar la columna
                setTimeout(() => {
                    boardState[colIndex] = [];
                    renderBoard();
                }, 1200);

                return; // Detiene la recursión temporalmente hasta limpiar la columna
            }

        // Llamada recursiva: verificar si el nuevo valor se fusiona con la carta que ahora tiene arriba
        processMerges(colIndex, rowIndex - 1);
    }
}

// Manejar la acción de soltar una carta en una columna
function dropCard(colIndex) {
    if (gameOver) return;

    const column = boardState[colIndex];

    // Verificar si la columna está llena antes de colocar la carta
    if (column.length >= MAX_CARDS) {
        alert("¡Esta columna está llena! Elige otra.");
        return;
    }

    // Colocar la carta al final del array de la columna (de arriba hacia abajo)
    column.push(nextCardValue);
    const newCardIndex = column.length - 1;

    // Procesar fusiones en cadena desde la posición actual
    processMerges(colIndex, newCardIndex);

    // Volver a renderizar los cambios en la pantalla
    renderBoard();

    // Verificar condición de derrota en cualquier columna tras las fusiones
    checkGameOver();

    if (!gameOver) {
        generateNextCard();
    }
}

// Verificar si el jugador perdió
function checkGameOver() {
    // Si alguna columna llegó al límite de 8 cartas tras los procesos de fusión, termina el juego
    const isFull = boardState.some(column => column.length >= MAX_CARDS);
    
    if (isFull) {
        gameOver = true;
        setTimeout(() => {
            alert(`¡Fin del Juego! Has alcanzado el límite de cartas. Puntuación final: ${currentScore}`);
        }, 100);
    }
}

// Event Listeners
columnsDOM.forEach(columnElement => {
    columnElement.addEventListener('click', () => {
        const colIndex = parseInt(columnElement.getAttribute('data-col'));
        dropCard(colIndex);
    });
});

resetBtn.addEventListener('click', initGame);

// Arrancar el juego por primera vez al cargar la página
initGame();
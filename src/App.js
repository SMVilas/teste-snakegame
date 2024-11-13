import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import audioFile from './assets/pou-eating.mp3'; // Importe o arquivo de áudio

const App = () => {
    const canvasRef = useRef(null);
    const [direction, setDirection] = useState(null);
    const [snake, setSnake] = useState([{ x: 270, y: 240 }]);
    const [food, setFood] = useState(getRandomFood());
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false); 
    const audio = useRef(new Audio(audioFile));

    // Função para gerar posição aleatória para a comida
    function getRandomPosition() {
        return Math.floor(Math.random() * 20) * 30;
    }

    function getRandomFood() {
        return {
            x: getRandomPosition(),
            y: getRandomPosition(),
            color: randomColor(),
        };
    }

    function randomColor() {
        const red = Math.floor(Math.random() * 256);
        const green = Math.floor(Math.random() * 256);
        const blue = Math.floor(Math.random() * 256);
        return `rgb(${red}, ${green}, ${blue})`;
    }

    // Função para desenhar o jogo
    const drawGame = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Desenha a comida
        ctx.fillStyle = food.color;
        ctx.fillRect(food.x, food.y, 30, 30);

        // Desenha a cobra
        snake.forEach((segment, index) => {
            ctx.fillStyle = index === snake.length - 1 ? 'white' : '#ddd';
            ctx.fillRect(segment.x, segment.y, 30, 30);
        });
    };

    // Função para mover a cobra
    const moveSnake = () => {
        const head = { ...snake[snake.length - 1] };

        if (direction === "right") head.x += 30;
        if (direction === "left") head.x -= 30;
        if (direction === "down") head.y += 30;
        if (direction === "up") head.y -= 30;

        setSnake((prev) => {
            const newSnake = [...prev, head];
            // Verifica se a cobra comeu a comida
            if (head.x === food.x && head.y === food.y) {
                setScore((prev) => prev + 10);
                audio.current.play(); // Toca o áudio
                setFood(getRandomFood());
                return newSnake;
            } else {
                newSnake.shift();
                return newSnake;
            }
        });

        // Verifica colisões
        checkCollision(head);
    };

    // Função para verificar colisões
    const checkCollision = (head) => {
        const wallCollision = head.x < 0 || head.x >= 600 || head.y < 0 || head.y >= 600;
        const selfCollision = snake.slice(0, -1).some((segment) => segment.x === head.x && segment.y === head.y);

        if (wallCollision || selfCollision) {
            setGameOver(true);
        }
    };

    useEffect(() => {
        if (!gameOver) {
            const gameLoop = setInterval(() => {
                drawGame();
                moveSnake();
            }, 200);
            return () => clearInterval(gameLoop);
        }
    }, [snake, direction, gameOver, drawGame, moveSnake]);

    // Lidar com os eventos de teclado
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "ArrowRight" && direction !== "left") setDirection("right");
            if (e.key === "ArrowLeft" && direction !== "right") setDirection("left");
            if (e.key === "ArrowDown" && direction !== "up") setDirection("down");
            if (e.key === "ArrowUp" && direction !== "down") setDirection("up");
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [direction]);

    // Reiniciar o jogo
    const restartGame = () => {
        setSnake([{ x: 270, y: 240 }]);
        setFood(getRandomFood());
        setScore(0);
        setDirection(null);
        setGameOver(false);
    };

    return (
        <div className="App">
            <div className="score">Score: {score}</div>
            <canvas ref={canvasRef} width={600} height={600} style={{ backgroundColor: '#111' }} />
            {gameOver && (
                <div className="overlay">
                    <div className="menu-screen">
                        <span className="game-over">Game Over</span>
                        <span className="final-score">Score: {score}</span>
                        <button className="btn-play" onClick={restartGame}>Jogar novamente</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
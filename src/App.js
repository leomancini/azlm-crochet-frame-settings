import React, { useState, useEffect } from "react";
import styled from "styled-components";

const DEFAULT_COLORS = [
  0xff0000, // Red
  0xff8000, // Orange-Red
  0xffff00, // Yellow
  0x00ff00, // Green
  0x00ffff, // Cyan
  0x0000ff, // Blue
  0x8000ff, // Light Blue
  0xff00ff, // Magenta
  0xffffff, // White
  0xffa500, // Orange
  0xffc0cb, // Pink
  0xffb6c1 // Light Pink
];

const COLOR_NAMES = [
  "Red",
  "Orange-Red",
  "Yellow",
  "Green",
  "Cyan",
  "Blue",
  "Light Blue",
  "Magenta",
  "White",
  "Orange",
  "Pink",
  "Light Pink"
];

const MATRIX_WIDTH = 64;
const MATRIX_HEIGHT = 64;
const EDGE_PADDING = 0;

const Page = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin: 0 auto;
`;

const Controls = styled.div`
  display: flex;
  gap: 1rem;
  flex-direction: column;
  width: calc(100% - 2rem);
  padding: 1rem;
  margin-top: -1rem;
`;

const Card = styled.div`
  background-color: rgba(255, 255, 255, 0.15);
  width: calc(100% - 2rem);
  padding: 1rem;
  border-radius: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(${MATRIX_WIDTH}, 1fr);
  gap: 1px;
  padding: 1rem;
  background: #000000;
  aspect-ratio: 1 / 1;
  // max-width: 32rem;
  width: calc(100% - 2rem);
`;

const Pixel = styled.div`
  width: 0.25rem;
  height: 0.25rem;
  background-color: ${(props) => props.color || "#000"};
`;

const ColorControl = styled.label`
  display: flex;
  align-items: center;
  gap: 0.3125rem;
  color: white;
  cursor: pointer;
  padding: 0.3125rem 0.625rem;
  border-radius: 0.25rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: #333;
  }
`;

const ColorPreview = styled.div`
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 0.25rem;
  background-color: ${(props) =>
    `#${props.color.toString(16).padStart(6, "0")}`};
`;

const SliderControl = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3125rem;
  color: white;
`;

const SliderLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Slider = styled.input`
  width: 100%;
  -webkit-appearance: none;
  height: 0.5rem;
  border-radius: 0.25rem;
  background: #333;
  outline: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 50%;
    background: #fff;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 50%;
    background: #fff;
    cursor: pointer;
  }
`;

class Sparkle {
  constructor(activeColors, sparkleSize) {
    this.currentX =
      Math.floor(
        Math.random() * (MATRIX_WIDTH - sparkleSize - EDGE_PADDING * 2)
      ) + EDGE_PADDING;
    this.currentY =
      Math.floor(
        Math.random() * (MATRIX_HEIGHT - sparkleSize - EDGE_PADDING * 2)
      ) + EDGE_PADDING;
    this.colorIndex = this.getRandomColorIndex(activeColors);
  }

  getRandomColorIndex(activeColors) {
    const activeIndices = activeColors
      .map((active, index) => (active ? index : -1))
      .filter((index) => index !== -1);
    return activeIndices[Math.floor(Math.random() * activeIndices.length)];
  }

  update(activeColors, sparkleSize) {
    this.currentX =
      Math.floor(
        Math.random() * (MATRIX_WIDTH - sparkleSize - EDGE_PADDING * 2)
      ) + EDGE_PADDING;
    this.currentY =
      Math.floor(
        Math.random() * (MATRIX_HEIGHT - sparkleSize - EDGE_PADDING * 2)
      ) + EDGE_PADDING;
    this.colorIndex = this.getRandomColorIndex(activeColors);
  }
}

function App() {
  const [activeColors, setActiveColors] = useState(
    Array(DEFAULT_COLORS.length).fill(true)
  );
  const [numSparkles, setNumSparkles] = useState(100);
  const [sparkleSize, setSparkleSize] = useState(5);
  const [speed, setSpeed] = useState(100);
  const [, setSparkles] = useState([]);
  const [grid, setGrid] = useState(
    Array(MATRIX_HEIGHT)
      .fill()
      .map(() => Array(MATRIX_WIDTH).fill(0))
  );

  useEffect(() => {
    // Initialize sparkles
    const initialSparkles = Array(numSparkles)
      .fill()
      .map(() => new Sparkle(activeColors, sparkleSize));
    setSparkles(initialSparkles);

    // Animation loop
    const interval = setInterval(() => {
      setSparkles((prevSparkles) => {
        const newSparkles = prevSparkles.map((sparkle) => {
          sparkle.update(activeColors, sparkleSize);
          return sparkle;
        });

        // Update grid
        const newGrid = Array(MATRIX_HEIGHT)
          .fill()
          .map(() => Array(MATRIX_WIDTH).fill(0));
        newSparkles.forEach((sparkle) => {
          for (let x = 0; x < sparkleSize; x++) {
            for (let y = 0; y < sparkleSize; y++) {
              if (
                sparkle.currentX + x < MATRIX_WIDTH &&
                sparkle.currentY + y < MATRIX_HEIGHT
              ) {
                newGrid[sparkle.currentY + y][sparkle.currentX + x] =
                  DEFAULT_COLORS[sparkle.colorIndex];
              }
            }
          }
        });
        setGrid(newGrid);
        return newSparkles;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [activeColors, numSparkles, sparkleSize, speed]);

  const handleColorToggle = (index) => {
    setActiveColors((prev) => {
      const newActiveColors = [...prev];
      newActiveColors[index] = !newActiveColors[index];
      return newActiveColors;
    });
  };

  return (
    <Page>
      <Grid>
        {grid.map((row, y) =>
          row.map((color, x) => (
            <Pixel
              key={`${x}-${y}`}
              color={color ? `#${color.toString(16).padStart(6, "0")}` : "#000"}
            />
          ))
        )}
      </Grid>
      <Controls>
        <Card>
          {DEFAULT_COLORS.map((color, index) => (
            <ColorControl key={index}>
              <input
                type="checkbox"
                checked={activeColors[index]}
                onChange={() => handleColorToggle(index)}
              />
              <ColorPreview color={color} />
              <span>{COLOR_NAMES[index]}</span>
            </ColorControl>
          ))}
        </Card>
        <Card>
          <SliderControl>
            <SliderLabel>
              <span>Number of Sparkles</span>
              <span>{numSparkles}</span>
            </SliderLabel>
            <Slider
              type="range"
              min="1"
              max="200"
              value={numSparkles}
              onChange={(e) => setNumSparkles(parseInt(e.target.value))}
            />
          </SliderControl>
          <SliderControl>
            <SliderLabel>
              <span>Sparkle Size</span>
              <span>{sparkleSize}</span>
            </SliderLabel>
            <Slider
              type="range"
              min="1"
              max="10"
              value={sparkleSize}
              onChange={(e) => setSparkleSize(parseInt(e.target.value))}
            />
          </SliderControl>
          <SliderControl>
            <SliderLabel>
              <span>Animation Speed (ms)</span>
              <span>{speed}</span>
            </SliderLabel>
            <Slider
              type="range"
              min="20"
              max="500"
              value={speed}
              onChange={(e) => setSpeed(parseInt(e.target.value))}
            />
          </SliderControl>
        </Card>
      </Controls>
    </Page>
  );
}

export default App;

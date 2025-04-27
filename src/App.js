import React, { useState, useEffect } from "react";
import styled from "styled-components";

const DEFAULT_COLORS = [
  0xff0000, // Red
  0xff8000, // Orange
  0xffff00, // Yellow
  0x00ff00, // Green
  0x00ffff, // Cyan
  0x0000ff, // Blue
  0x8000ff, // Purple
  0xff00ff, // Magenta
  0xffffff, // White
  0xff69b4, // Hot Pink
  0xdda0dd, // Plum
  0xffd700 // Gold
];

const MATRIX_WIDTH = 64;
const MATRIX_HEIGHT = 64;
const EDGE_PADDING = 0;

const Page = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  margin: 0 auto;
  min-height: 100dvh;
  box-sizing: border-box;
  padding-bottom: 0.5rem;

  @media (hover: hover) {
    max-width: 31rem;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100dvh;
  width: 100%;
  gap: 1.5rem;
`;

const LoadingSpinner = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  border: 0.25rem solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(${MATRIX_WIDTH}, 1fr);
  gap: 1px;
  background: #000000;
  aspect-ratio: 1 / 1;
  width: 100%;
  margin-top: 2rem;
  margin-bottom: 0.25rem;
  width: calc(100% - 3.5rem);

  @media (hover: none) {
    margin-top: 0rem;
  }
`;

const Pixel = styled.div`
  width: 0.25rem;
  height: 0.25rem;
  background-color: ${(props) => props.color || "#000"};
`;

const Controls = styled.div`
  display: flex;
  gap: 1.25rem;
  flex-direction: column;
  padding: 1rem;
  flex: 1;
  width: 100%;
  min-height: 0;
  height: 100%;
  align-items: center;
  justify-content: center;
`;

const TabContainer = styled.div`
  display: grid;
  grid-template-columns: 33% 1fr 1fr;
  gap: 0.75rem;
  width: calc(100% - 3.5rem);
  flex-shrink: 0;
`;

const Tab = styled.button`
  flex: 1;
  padding: 0.75rem;
  height: 3rem;
  background-color: ${(props) =>
    props.active ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.1)"};
  border: none;
  border-radius: 0.5rem;
  color: white;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:active {
    transform: scale(0.9);
  }
`;

const ColorControls = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  width: calc(100% - 3.5rem);
  gap: 0.75rem;
  flex: 1;
  min-height: 5rem;
`;

const ColorPreview = styled.div`
  width: 100%;
  height: 100%;
  min-height: 1rem;
  border-radius: 0.5rem;
  background-color: ${(props) =>
    `#${props.color.toString(16).padStart(6, "0")}`};
  min-height: 0;
  opacity: ${(props) => (props.active ? 1 : 0.1)};
  transition: all 0.2s;

  &:active {
    transform: scale(0.9);
  }
`;

const SliderControls = styled.div`
  display: flex;
  flex-direction: column;
  width: calc(100% - 3.5rem);
  height: 100%;
  flex: 1;
  justify-content: space-around;
  gap: 0.75rem;
`;

const SliderControl = styled.div`
  display: grid;
  grid-template-columns: 33% 2fr;
  gap: 0.75rem;
  width: 100%;
  color: white;
  height: 100%;
`;

const SliderLabel = styled.div`
  display: flex;
  font-size: 1.25rem;
  align-items: center;
  flex-direction: row;
  color: rgba(255, 255, 255, 0.5);
`;

const Slider = styled.input`
  width: 100%;
  height: 100%;
  -webkit-appearance: none;
  appearance: none;
  border-radius: 0.5rem;
  background: #333;
  outline: none;
  padding: 0;
  margin: 0;
  height: 2rem;
  box-sizing: content-box;
  border: none;
  background: rgba(255, 255, 255, 0.1);

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    height: 2rem;
    aspect-ratio: 1 / 1;
    border-radius: 0.5rem;
    box-shadow: none;
    background: #fff;
    padding: 0;
    margin: 0;
    border: none;
  }
`;

const Presets = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.75rem;
  overflow-x: scroll;
  flex: 1;
  width: 100%;
  min-height: 0;
  align-items: stretch;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const PresetPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background-color: rgba(255, 255, 255, 0.05);
  width: calc(100% - 3.5rem);
  margin: 0 auto;
  color: rgba(255, 255, 255, 0.25);
  border-radius: 0.5rem;
`;

const Preset = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.75rem;
  background-color: ${(props) =>
    props.selected ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.1)"};
  padding: 0.75rem 1rem 1rem 1rem;
  border-radius: 0.5rem;
  min-height: 0;
  width: 100%;
  cursor: pointer;
  transition: all 0.2s;

  &:first-child {
    margin-left: 1.75rem;
  }

  &:active {
    transform: scale(0.9);
  }

  ${({ numPresets }) =>
    numPresets > 1 &&
    `
      width: unset;
      flex: 0 0 calc(100% - 8.75rem);
      align-self: stretch;
      scroll-snap-align: center;
      scroll-snap-stop: always;
    `}
`;

const PresetSpacer = styled.div`
  width: 1.75rem;
  flex: 0 0 1rem;
`;

const PresetLabel = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.75rem;
  width: 100%;
  color: #ffffff;
  font-size: 1.25rem;
  font-weight: 800;
`;

const Button = styled.button`
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  padding: 0.75rem;
  width: calc(100% - 3.5rem);
  height: 3rem;
  border-radius: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  ${({ block }) =>
    block &&
    `
      width: 100%;
    `}

  &:not(:disabled):active {
    transform: scale(0.9);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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
    Array(DEFAULT_COLORS.length).fill(false)
  );
  const [numSparkles, setNumSparkles] = useState(300);
  const [sparkleSize, setSparkleSize] = useState(2);
  const [speed, setSpeed] = useState(50);
  const [, setSparkles] = useState([]);
  const [grid, setGrid] = useState(
    Array(MATRIX_HEIGHT)
      .fill()
      .map(() => Array(MATRIX_WIDTH).fill(0))
  );
  const [activeTab, setActiveTab] = useState("colors");
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [buttonState, setButtonState] = useState("loading");
  const [matchingPresetName, setMatchingPresetName] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savedPresets, setSavedPresets] = useState(() => {
    const saved = localStorage.getItem("sparklePresets");
    return saved ? JSON.parse(saved) : [];
  });
  const [presetButtonState, setPresetButtonState] = useState("apply");

  // Fetch initial settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(
          "https://azlm-crochet-frame-server.noshado.ws/api/settings"
        );
        const settings = await response.json();

        // Update sparkle settings
        setNumSparkles(settings.num_sparkles);
        setSparkleSize(settings.sparkle_size);
        setSpeed(settings.speed);

        // Update active colors based on the colors array from API
        const newActiveColors = DEFAULT_COLORS.map((color) =>
          settings.colors.includes(color)
        );
        setActiveColors(newActiveColors);

        // Check if current settings match any saved preset
        const matchingPreset = savedPresets.find((preset) => {
          const colorsMatch =
            settings.colors.every(
              (color) => preset.activeColors[DEFAULT_COLORS.indexOf(color)]
            ) &&
            preset.activeColors.filter(Boolean).length ===
              settings.colors.length;

          return (
            preset.numSparkles === settings.num_sparkles &&
            preset.sparkleSize === settings.sparkle_size &&
            preset.speed === settings.speed &&
            colorsMatch
          );
        });

        if (matchingPreset) {
          setSelectedPreset(matchingPreset.id);
          setMatchingPresetName(matchingPreset.name);
          setButtonState("applied");
        } else {
          setButtonState("apply");
        }

        // Set all states at once to prevent flashing
        setIsLoading(false);
        setHasChanges(false);
      } catch (error) {
        console.error("Error fetching settings:", error);
        setIsLoading(false);
        setButtonState("apply");
        setHasChanges(false);
      }
    };

    fetchSettings();
  }, [savedPresets]);

  const checkIfMatchesPreset = () => {
    const matchingPreset = savedPresets.find(
      (preset) =>
        JSON.stringify(preset.activeColors) === JSON.stringify(activeColors) &&
        preset.numSparkles === numSparkles &&
        preset.sparkleSize === sparkleSize &&
        preset.speed === speed
    );
    if (matchingPreset) {
      setMatchingPresetName(matchingPreset.name);
      return true;
    }
    setMatchingPresetName(null);
    return false;
  };

  const handleTabChange = async (tab) => {
    if (tab === "presets") {
      try {
        const response = await fetch(
          "https://azlm-crochet-frame-server.noshado.ws/api/settings"
        );
        const settings = await response.json();

        const matchingPreset = savedPresets.find((preset) => {
          const colorsMatch =
            settings.colors.every(
              (color) => preset.activeColors[DEFAULT_COLORS.indexOf(color)]
            ) &&
            preset.activeColors.filter(Boolean).length ===
              settings.colors.length;

          return (
            preset.numSparkles === settings.num_sparkles &&
            preset.sparkleSize === settings.sparkle_size &&
            preset.speed === settings.speed &&
            colorsMatch
          );
        });

        if (matchingPreset) {
          setSelectedPreset(matchingPreset.id);
          setPresetButtonState("applied");
        } else {
          setSelectedPreset(null);
          setPresetButtonState("apply");
        }
      } catch (error) {
        console.error("Error checking API settings:", error);
        setSelectedPreset(null);
        setPresetButtonState("apply");
      }
    }

    setActiveTab(tab);
    if (tab === "colors" || tab === "values") {
      if (!hasChanges && checkIfMatchesPreset()) {
        setButtonState("saved");
      } else if (!hasChanges) {
        setButtonState("save");
      }
    }
  };

  const handleApply = async () => {
    if (buttonState === "apply" || matchingPresetName) {
      setButtonState("applying");
      try {
        // Prepare the settings data
        const settings = {
          colors: DEFAULT_COLORS.filter((_, index) => activeColors[index]),
          num_sparkles: numSparkles,
          sparkle_size: sparkleSize,
          speed: speed
        };

        // Send POST request to update settings
        const response = await fetch(
          "https://azlm-crochet-frame-server.noshado.ws/api/settings",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(settings)
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update settings");
        }

        setButtonState("applied");
        setHasChanges(false);

        // After 1.5 seconds, change to "save" state
        setTimeout(() => {
          setButtonState("save");
        }, 1500);
      } catch (error) {
        console.error("Error updating settings:", error);
        setButtonState("apply");
      }
    } else if (buttonState === "save") {
      setButtonState("saving");
      savePreset();
    }
  };

  const savePreset = () => {
    const newPreset = {
      id: Date.now(),
      name: `Preset ${savedPresets.length + 1}`,
      activeColors,
      numSparkles,
      sparkleSize,
      speed
    };

    const updatedPresets = [...savedPresets, newPreset];
    setSavedPresets(updatedPresets);
    localStorage.setItem("sparklePresets", JSON.stringify(updatedPresets));
    setButtonState("saved");
    setSelectedPreset(newPreset.id);
    setMatchingPresetName(newPreset.name);
  };

  const handleValueChange = () => {
    setHasChanges(true);
    setButtonState("apply");
    // Deselect preset when values change
    setSelectedPreset(null);
  };

  useEffect(() => {
    if (hasChanges) {
      const matchingPreset = savedPresets.find(
        (preset) =>
          JSON.stringify(preset.activeColors) ===
            JSON.stringify(activeColors) &&
          preset.numSparkles === numSparkles &&
          preset.sparkleSize === sparkleSize &&
          preset.speed === speed
      );
      if (matchingPreset) {
        setMatchingPresetName(matchingPreset.name);
        setButtonState("saved");
        setHasChanges(false);
        // If values match a preset exactly, select that preset
        setSelectedPreset(matchingPreset.id);
      } else {
        setMatchingPresetName(null);
        // If values don't match any preset, deselect the current preset
        setSelectedPreset(null);
      }
    }
  }, [activeColors, numSparkles, sparkleSize, speed, hasChanges, savedPresets]);

  const handleColorToggle = (index) => {
    setActiveColors((prev) => {
      const newActiveColors = [...prev];
      newActiveColors[index] = !newActiveColors[index];
      return newActiveColors;
    });
    handleValueChange();
  };

  const loadPreset = async (preset) => {
    setActiveColors(preset.activeColors);
    setNumSparkles(preset.numSparkles);
    setSparkleSize(preset.sparkleSize);
    setSpeed(preset.speed);
    setSelectedPreset(preset.id);
    setHasChanges(false);
    setButtonState("apply");

    try {
      const response = await fetch(
        "https://azlm-crochet-frame-server.noshado.ws/api/settings"
      );
      const settings = await response.json();

      const colorsMatch =
        settings.colors.every(
          (color) => preset.activeColors[DEFAULT_COLORS.indexOf(color)]
        ) &&
        preset.activeColors.filter(Boolean).length === settings.colors.length;

      const matches =
        preset.numSparkles === settings.num_sparkles &&
        preset.sparkleSize === settings.sparkle_size &&
        preset.speed === settings.speed &&
        colorsMatch;

      if (matches) {
        setPresetButtonState("applied");
        setSelectedPreset(preset.id);
      } else {
        setPresetButtonState("apply");
      }
    } catch (error) {
      console.error("Error checking API settings:", error);
      setPresetButtonState("apply");
    }
  };

  const deletePreset = (presetId) => {
    const updatedPresets = savedPresets.filter((p) => p.id !== presetId);
    setSavedPresets(updatedPresets);
    localStorage.setItem("sparklePresets", JSON.stringify(updatedPresets));
    if (selectedPreset === presetId) {
      setSelectedPreset(null);
      setPresetButtonState("apply");
    }
  };

  const handlePresetApply = async () => {
    if (!selectedPreset) return;

    const preset = savedPresets.find((p) => p.id === selectedPreset);
    if (!preset) return;

    setPresetButtonState("applying");
    try {
      // Prepare the settings data
      const settings = {
        colors: DEFAULT_COLORS.filter((_, index) => preset.activeColors[index]),
        num_sparkles: preset.numSparkles,
        sparkle_size: preset.sparkleSize,
        speed: preset.speed
      };

      // Send POST request to update settings
      const response = await fetch(
        "https://azlm-crochet-frame-server.noshado.ws/api/settings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(settings)
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update settings");
      }

      setPresetButtonState("applied");
    } catch (error) {
      console.error("Error applying preset:", error);
      setPresetButtonState("apply");
    }
  };

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

  const renderTabContent = () => {
    switch (activeTab) {
      case "colors":
        return (
          <ColorControls>
            {DEFAULT_COLORS.map((color, index) => (
              <ColorPreview
                key={index}
                onClick={() => handleColorToggle(index)}
                color={color}
                active={activeColors[index]}
              />
            ))}
          </ColorControls>
        );
      case "values":
        return (
          <SliderControls>
            <SliderControl>
              <SliderLabel>Number</SliderLabel>
              <Slider
                type="range"
                min="1"
                max="200"
                value={numSparkles}
                onChange={(e) => {
                  const newValue = parseInt(e.target.value);
                  setNumSparkles(newValue);
                  handleValueChange();
                }}
              />
            </SliderControl>
            <SliderControl>
              <SliderLabel>Size</SliderLabel>
              <Slider
                type="range"
                min="1"
                max="10"
                value={sparkleSize}
                onChange={(e) => {
                  const newValue = parseInt(e.target.value);
                  setSparkleSize(newValue);
                  handleValueChange();
                }}
              />
            </SliderControl>
            <SliderControl>
              <SliderLabel>Speed</SliderLabel>
              <Slider
                type="range"
                min="10"
                max="500"
                value={500 - speed}
                onChange={(e) => {
                  const newValue = 500 - parseInt(e.target.value);
                  setSpeed(newValue);
                  handleValueChange();
                }}
              />
            </SliderControl>
          </SliderControls>
        );
      case "presets":
        return (
          <>
            <Presets>
              {savedPresets.length === 0 ? (
                <PresetPlaceholder>
                  When you save presets, they'll show up here.
                </PresetPlaceholder>
              ) : (
                savedPresets.map((preset) => (
                  <Preset
                    key={preset.id}
                    selected={selectedPreset === preset.id}
                    onClick={() => loadPreset(preset)}
                    numPresets={savedPresets.length}
                  >
                    <PresetLabel>{preset.name}</PresetLabel>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePreset(preset.id);
                      }}
                      block
                    >
                      Delete
                    </Button>
                  </Preset>
                ))
              )}
              {savedPresets.length > 0 && <PresetSpacer />}
            </Presets>
          </>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
      </LoadingContainer>
    );
  }

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
        <TabContainer>
          <Tab
            active={activeTab === "colors"}
            onClick={() => handleTabChange("colors")}
          >
            Colors
          </Tab>
          <Tab
            active={activeTab === "values"}
            onClick={() => handleTabChange("values")}
          >
            Values
          </Tab>
          <Tab
            active={activeTab === "presets"}
            onClick={() => handleTabChange("presets")}
          >
            Presets
          </Tab>
        </TabContainer>
        {renderTabContent()}
        {(activeTab === "colors" || activeTab === "values") && (
          <Button
            onClick={handleApply}
            disabled={
              buttonState === "loading" ||
              buttonState === "saving" ||
              buttonState === "applying" ||
              buttonState === "applied" ||
              (buttonState === "apply" && !hasChanges)
            }
          >
            {buttonState === "loading"
              ? "Loading..."
              : buttonState === "apply"
              ? "Apply"
              : buttonState === "saving"
              ? "Save preset"
              : buttonState === "applying"
              ? "Applying..."
              : buttonState === "applied"
              ? matchingPresetName
                ? `Applied ${matchingPresetName}`
                : "Applied"
              : matchingPresetName
              ? `Apply ${matchingPresetName}`
              : "Save preset"}
          </Button>
        )}
        {activeTab === "presets" && (
          <Button
            onClick={handlePresetApply}
            disabled={
              presetButtonState === "applying" ||
              presetButtonState === "applied"
            }
          >
            {presetButtonState === "apply"
              ? selectedPreset
                ? "Apply"
                : "Generate AI preset"
              : presetButtonState === "applying"
              ? "Applying..."
              : `Applied ${
                  savedPresets.find((p) => p.id === selectedPreset)?.name || ""
                }`}
          </Button>
        )}
      </Controls>
    </Page>
  );
}

export default App;

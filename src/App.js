import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
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
  width: calc(100% - 3.5rem - 6rem);
  margin: 0 auto;
  color: rgba(255, 255, 255, 0.25);
  border-radius: 0.5rem;
  padding: 0 3rem;
  text-align: center;
`;

const PresetSpacer = styled.div`
  width: 1.75rem;
  flex: 0 0 1rem;
`;

// Seeded random number generator
const seededRandom = (seed) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const Preset = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  background-color: ${(props) =>
    props.selected ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.1)"};
  padding: 0.75rem 1rem 1rem 1rem;
  border-radius: 0.5rem;
  min-height: 0;
  width: 100%;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.2s;
  transform: scale(1);
  touch-action: manipulation;

  &:first-child {
    margin-left: 1.75rem;
  }

  &:active {
    transform: scale(0.9);
  }

  ${({ numPresets }) =>
    numPresets === 2 &&
    `
      width: 50%;
    `}

  ${({ numPresets }) =>
    numPresets > 2 &&
    `
      width: unset;
      flex: 0 0 30%;
      align-self: stretch;
      scroll-snap-align: center;
      scroll-snap-stop: always;
    `}
`;

const PresetLabel = styled.div`
  display: flex;
  flex-direction: row;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  align-items: center;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 0.25rem;
`;

const PresetPreview = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0.25rem;
  padding: 0.25rem;
  background: #000000;
  aspect-ratio: 1 / 1;
  height: 100%;
  overflow: hidden;
  align-self: center;
  margin-top: 0.25rem;
`;

const PresetPreviewPixel = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${(props) => props.color || "#000"};
`;

const Button = styled.button`
  background-color: ${(props) =>
    props.isApply ? "white" : "rgba(255, 255, 255, 0.1)"};
  color: ${(props) => (props.isApply ? "black" : "white")};
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

  ${({ icon }) =>
    icon &&
    `
      background-color: transparent;
      padding: 0;
      width: 2.25rem;
      height: 2.25rem;
      aspect-ratio: 1 / 1;
      display: flex;
      align-items: center;
      justify-content: center;
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
  const [numSparkles, setNumSparkles] = useState();
  const [sparkleSize, setSparkleSize] = useState();
  const [speed, setSpeed] = useState();
  const [, setSparkles] = useState([]);
  const [grid, setGrid] = useState(
    Array(MATRIX_HEIGHT)
      .fill()
      .map(() => Array(MATRIX_WIDTH).fill(0))
  );
  const [activeTab, setActiveTab] = useState("colors");
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [buttonState, setButtonState] = useState("save");
  const [matchingPresetName, setMatchingPresetName] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savedPresets, setSavedPresets] = useState(() => {
    const saved = localStorage.getItem("sparklePresets");
    return saved ? JSON.parse(saved) : [];
  });
  const [presetButtonState, setPresetButtonState] = useState("apply");
  const [isLongPress, setIsLongPress] = useState(false);
  const pressStartTime = useRef(null);
  const wasCanceled = useRef(false);

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
          // Don't change buttonState from "saved" to "applied" - but access it via a ref instead of dependency
          if (buttonState !== "saved") {
            setButtonState("applied");
          }
        } else {
          // Don't reset from "saved" state
          if (buttonState !== "saved") {
            setButtonState("save");
          }
        }

        // Set all states at once to prevent flashing
        setIsLoading(false);
        setHasChanges(false);
      } catch (error) {
        console.error("Error fetching settings:", error);
        setIsLoading(false);
        // Don't reset from "saved" state on error either
        if (buttonState !== "saved") {
          setButtonState("save");
        }
        setHasChanges(false);
      }
    };

    fetchSettings();
  }, [savedPresets]); // Removed buttonState from dependencies

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

        // Only check for matching preset if no preset is currently selected
        if (!selectedPreset) {
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
            setPresetButtonState("apply");
          }
        } else {
          // If a preset is already selected, check if it's applied
          const selectedPresetData = savedPresets.find(
            (p) => p.id === selectedPreset
          );
          if (selectedPresetData) {
            const colorsMatch =
              settings.colors.every(
                (color) =>
                  selectedPresetData.activeColors[DEFAULT_COLORS.indexOf(color)]
              ) &&
              selectedPresetData.activeColors.filter(Boolean).length ===
                settings.colors.length;

            const isApplied =
              selectedPresetData.numSparkles === settings.num_sparkles &&
              selectedPresetData.sparkleSize === settings.sparkle_size &&
              selectedPresetData.speed === settings.speed &&
              colorsMatch;

            setPresetButtonState(isApplied ? "applied" : "apply");
          }
        }
      } catch (error) {
        console.error("Error checking API settings:", error);
        if (!selectedPreset) {
          setPresetButtonState("apply");
        }
      }
    }

    setActiveTab(tab);
    if (tab === "colors" || tab === "values") {
      if (!hasChanges) {
        // Check if current settings match the selected preset
        if (selectedPreset) {
          const selectedPresetData = savedPresets.find(
            (p) => p.id === selectedPreset
          );
          if (selectedPresetData) {
            const colorsMatch = activeColors.every(
              (active, index) =>
                active === selectedPresetData.activeColors[index]
            );
            const valuesMatch =
              numSparkles === selectedPresetData.numSparkles &&
              sparkleSize === selectedPresetData.sparkleSize &&
              speed === selectedPresetData.speed;

            if (colorsMatch && valuesMatch) {
              // Preserve "saved" state when switching tabs
              if (buttonState === "saved") {
                // Keep the saved state
              }
              // Only show "applied" if the preset was actually applied
              else if (presetButtonState === "applied") {
                setButtonState("applied");
              } else {
                setButtonState("apply");
              }
              setMatchingPresetName(selectedPresetData.name);
            } else {
              setButtonState("apply");
              setMatchingPresetName(selectedPresetData.name);
            }
          }
        } else if (checkIfMatchesPreset()) {
          // Don't change from "saved" to something else
          if (buttonState !== "saved") {
            setButtonState("saved");
          }
        } else {
          setButtonState("save");
        }
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
    // Always allow value changes regardless of current state
    setHasChanges(true);
    // Don't set button state here - let the effect handle it
    // Deselect preset when values change
    setSelectedPreset(null);
    setMatchingPresetName(null);
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
        // Only update matchingPresetName if we found a match
        setMatchingPresetName(matchingPreset.name);
        // If values match a preset exactly, select that preset
        setSelectedPreset(matchingPreset.id);
        // Set button state to "apply" only if it's not already "saved"
        if (buttonState !== "saved") {
          setButtonState("apply");
        }
        setHasChanges(false);
      } else {
        // Only clear matchingPresetName if we're sure there's no match
        setMatchingPresetName(null);
        // If values don't match any preset, deselect the current preset
        setSelectedPreset(null);
        // Only set to "apply" if it's not already "saved"
        if (buttonState !== "saved") {
          setButtonState("apply");
        }
      }
    }
  }, [
    activeColors,
    numSparkles,
    sparkleSize,
    speed,
    hasChanges,
    savedPresets,
    buttonState
  ]);

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

      // Update both states together to prevent flashing
      if (matches) {
        setPresetButtonState("applied");
        setButtonState("applied");
        setMatchingPresetName(preset.name);
      } else {
        setPresetButtonState("apply");
        setButtonState("apply");
        setMatchingPresetName(preset.name);
      }
    } catch (error) {
      console.error("Error checking API settings:", error);
      setPresetButtonState("apply");
      setButtonState("apply");
      setMatchingPresetName(preset.name);
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

  const handleLongPress = (presetId, presetName, event) => {
    // Always stop propagation and prevent default for the long press event
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    if (window.confirm(`Are you sure you want to delete "${presetName}"?`)) {
      deletePreset(presetId);
    } else {
      // If user cancels, prevent the preset from being selected
      setIsLongPress(false);
      setPresetButtonState("apply");
      wasCanceled.current = true;
    }
  };

  const handlePresetPress = (preset, event) => {
    // If we're in a long press state or was canceled, prevent any selection
    if (isLongPress || wasCanceled.current) {
      if (event) {
        event.stopPropagation();
        event.preventDefault();
      }
      wasCanceled.current = false;
      return;
    }
    loadPreset(preset);
    setButtonState("apply");
    setMatchingPresetName(preset.name);
  };

  const handlePresetPressStart = (preset, event) => {
    // Always stop propagation and prevent default for the press start
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    setIsLongPress(false);
    wasCanceled.current = false;
    pressStartTime.current = Date.now();

    // Store the timeout ID so we can clear it if needed
    const timeoutId = setTimeout(() => {
      if (pressStartTime.current) {
        setIsLongPress(true);
        handleLongPress(preset.id, preset.name, event);
      }
    }, 1000);

    // Store the timeout ID in the ref
    pressStartTime.current = {
      timestamp: Date.now(),
      timeoutId
    };
  };

  const handlePresetPressEnd = (preset, event) => {
    // If we're in a long press state or was canceled, prevent any selection
    if (isLongPress || wasCanceled.current) {
      if (event) {
        event.stopPropagation();
        event.preventDefault();
      }
    }

    // Clear the timeout if it exists
    if (pressStartTime.current?.timeoutId) {
      clearTimeout(pressStartTime.current.timeoutId);
    }
    pressStartTime.current = null;
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
                max="100"
                value={100 - speed}
                onChange={(e) => {
                  const newValue = 100 - parseInt(e.target.value);
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
                    onClick={(event) => handlePresetPress(preset, event)}
                    onMouseDown={(event) =>
                      handlePresetPressStart(preset, event)
                    }
                    onMouseUp={(event) => handlePresetPressEnd(preset, event)}
                    onMouseLeave={(event) =>
                      handlePresetPressEnd(preset, event)
                    }
                    onTouchStart={(event) =>
                      handlePresetPressStart(preset, event)
                    }
                    onTouchEnd={(event) => handlePresetPressEnd(preset, event)}
                    numPresets={savedPresets.length}
                  >
                    <PresetPreview>
                      {Array(8)
                        .fill()
                        .map((_, y) =>
                          Array(8)
                            .fill()
                            .map((_, x) => {
                              // Get a static color based on position and active colors
                              const activeColorIndices = preset.activeColors
                                .map((active, index) => (active ? index : -1))
                                .filter((index) => index !== -1);

                              // Always show a color, using seeded random to pick which one
                              const colorIndex =
                                activeColorIndices[
                                  Math.floor(
                                    seededRandom(preset.id + x + y * 8) *
                                      activeColorIndices.length
                                  )
                                ] || 0;
                              const color = DEFAULT_COLORS[colorIndex];

                              return (
                                <PresetPreviewPixel
                                  key={`${x}-${y}`}
                                  color={
                                    color
                                      ? `#${color
                                          .toString(16)
                                          .padStart(6, "0")}`
                                      : "#000"
                                  }
                                />
                              );
                            })
                        )}
                    </PresetPreview>
                    <PresetLabel>{preset.name}</PresetLabel>
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
              buttonState === "saved" ||
              buttonState === "applying" ||
              buttonState === "applied" ||
              (buttonState === "apply" && !hasChanges && !selectedPreset) ||
              (buttonState === "apply" && selectedPreset && !hasChanges)
            }
            isApply={
              buttonState === "apply" &&
              (hasChanges || (selectedPreset && hasChanges))
            }
          >
            {buttonState === "loading"
              ? "Loading..."
              : buttonState === "apply" && selectedPreset
              ? hasChanges
                ? `Apply ${matchingPresetName}`
                : `Using ${matchingPresetName}`
              : buttonState === "saving"
              ? "Save preset"
              : buttonState === "applying"
              ? "Applying..."
              : buttonState === "applied"
              ? matchingPresetName
                ? `Using ${matchingPresetName}`
                : "Applied"
              : buttonState === "saved"
              ? `Saved as ${matchingPresetName}`
              : hasChanges
              ? "Apply"
              : "Save preset"}
          </Button>
        )}
        {activeTab === "presets" && (
          <Button
            onClick={handlePresetApply}
            disabled={
              presetButtonState === "applying" ||
              presetButtonState === "applied" ||
              !selectedPreset
            }
            isApply={presetButtonState === "apply" && selectedPreset}
          >
            {presetButtonState === "apply"
              ? "Apply"
              : presetButtonState === "applying"
              ? "Applying..."
              : `Using ${
                  savedPresets.find((p) => p.id === selectedPreset)?.name || ""
                }`}
          </Button>
        )}
      </Controls>
    </Page>
  );
}

export default App;

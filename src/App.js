import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

const DEFAULT_COLORS = [
  16711680, // Red
  16744448, // Orange
  16776960, // Yellow
  65280, // Green
  65535, // Cyan
  255, // Blue
  8388863, // Purple
  16711935, // Magenta
  16777215, // White
  16738740, // Hot Pink
  14524637, // Plum
  16766720 // Gold
];

// Function to calculate adjusted speed based on number of sparkles and size
const calculateAdjustedSpeed = (baseSpeed, numSparkles, sparkleSize) => {
  // Base speed is in milliseconds, lower is faster
  const adjustedBaseSpeed = Math.max(baseSpeed, 1);

  // Scale factor increases with more sparkles and larger sizes
  const sparkleFactor = Math.pow(numSparkles, 0.1);
  const sizeFactor = Math.pow(sparkleSize, 0.1);

  // Combine factors and apply to base speed with additional scaling
  const adjustedSpeed =
    adjustedBaseSpeed * (1 + (sparkleFactor * sizeFactor) / 1.5);

  // Ensure minimum speed of 15ms and maximum of 3000ms
  return Math.min(Math.max(adjustedSpeed, 15), 3000);
};

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
    max-width: 32rem;
    margin: 1rem auto;
    background-color: #000000;
    min-height: unset;
    height: calc(100vh - 2rem);
    width: calc(100% - 2rem);
    border-radius: 1rem;
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

const NoApiKeyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100dvh;
  width: calc(100% - 4rem);
  gap: 1.5rem;
  padding: 2rem;
  text-align: center;
  color: white;
  background-color: #000000;
`;

const NoApiKeyMessage = styled.div`
  font-size: 1.25rem;
  line-height: 1.5;
  max-width: 32rem;
  margin-top: -4rem;
`;

const LoadingSpinner = styled.div`
  width: ${(props) => (props.size ? props.size : "2.5rem")};
  height: ${(props) => (props.size ? props.size : "2.5rem")};
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
  width: 100%;
  height: 100%;
  border-radius: 0.25rem;
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
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
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
  cursor: pointer;
  transition: transform 0.2s, background-color 0.2s;
  transform: scale(1);
  touch-action: manipulation;
  flex: 0 0 30%;

  ${({ numPresets }) =>
    numPresets === 0 &&
    `
      width: 100%;
      flex: unset;
      margin-right: 1.75rem;
    `}

  ${({ numPresets, isGenerating }) =>
    numPresets === 1 &&
    `
      width: 100%;
      flex: ${isGenerating ? "0 0 30%" : "unset"};
      margin-right: 0;
    `}

  &:active {
    transform: scale(0.9);
  }
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

const PresetIcon = styled.div`
  font-size: 1.5rem;
`;

const GeneratePresetContainer = styled(Preset)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem 1rem 1rem;
  text-align: center;
  flex: 0 0 30%;
  margin-left: 1.75rem;
  transition: transform 0.2s, background-color 0.2s;
  font-size: 1.125rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);

  ${({ isGenerating }) =>
    isGenerating &&
    `
      color: rgba(255, 255, 255, 0.25);
      cursor: not-allowed;
    `}

  ${({ numPresets, isGenerating }) =>
    numPresets === 0 &&
    `
      width: 100%;
      flex: unset;
      margin-right: ${isGenerating ? "0" : "1.75rem"};
    `}

    ${({ numPresets, isGenerating }) =>
    numPresets === 1 &&
    `
      width: 100%;
      flex: ${isGenerating ? "0 0 30%" : "unset"};
      margin-right: 0;
    `}
`;

const PresetPreviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  height: 100%;
`;

const PresetPreview = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0.375rem;
  padding: 0.5rem;
  background: #000000;
  aspect-ratio: 1 / 1;
  height: 100%;
  max-height: 8rem;
  overflow: hidden;
  align-self: center;
  margin-top: 0.25rem;
  border-radius: 0.5rem;
`;

const PresetPreviewLoading = styled(PresetPreview)`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
`;

const PresetPreviewPixel = styled.div`
  width: 100%;
  aspect-ratio: 1 / 1;
  background-color: ${(props) => props.color || "#000"};
  border-radius: 100%;
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

    // If no colors are active, use all colors
    if (activeIndices.length === 0) {
      return Math.floor(Math.random() * DEFAULT_COLORS.length);
    }

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
  // All hooks at the top
  const [activeColors, setActiveColors] = useState(
    Array(DEFAULT_COLORS.length).fill(true) // Initialize all colors as active
  );
  const [numSparkles, setNumSparkles] = useState(150); // Match the current value
  const [sparkleSize, setSparkleSize] = useState(3); // Match the current value
  const [speed, setSpeed] = useState(40); // Match the current value
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [skipInitialFetch, setSkipInitialFetch] = useState(false);
  const [appliedSettings, setAppliedSettings] = useState(null);

  // Function to get API key from URL parameters
  const getApiKey = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("apiKey") || "";
  };

  // Function to get API URL with key
  const getApiUrl = (endpoint = "") => {
    const apiKey = getApiKey();
    return `https://azlm-crochet-frame-server.noshado.ws/api/${endpoint}${
      apiKey ? `?apiKey=${apiKey}` : ""
    }`;
  };

  // Check if API key is present
  const hasApiKey = getApiKey() !== "";

  // Fetch initial settings
  useEffect(() => {
    if (!hasApiKey || skipInitialFetch) return; // Early return if no API key or skip flag is set

    const fetchSettings = async () => {
      try {
        const response = await fetch(getApiUrl("settings"));
        const settings = await response.json();

        console.log("Raw API Response:", {
          settings,
          type: typeof settings,
          colorsType: typeof settings.colors,
          isArray: Array.isArray(settings.colors)
        });

        // Store the applied settings
        setAppliedSettings(settings);

        // Update sparkle settings
        setNumSparkles(settings.num_sparkles);
        setSparkleSize(settings.sparkle_size);
        setSpeed(settings.speed);

        // Ensure settings.colors is an array and contains numbers
        const settingsColors = Array.isArray(settings.colors)
          ? settings.colors.map(Number)
          : [];

        console.log("Settings colors after conversion:", {
          original: settings.colors.map((c) => c.toString(16)),
          converted: settingsColors.map((c) => c.toString(16))
        });

        // Update active colors based on the colors array from API
        const newActiveColors = DEFAULT_COLORS.map((defaultColor, index) => {
          const decimalValue = Number(defaultColor);
          const isIncluded = settingsColors.includes(decimalValue);
          console.log(`Checking color ${defaultColor.toString(16)}:`, {
            defaultHex: defaultColor.toString(16),
            defaultDecimal: decimalValue,
            settingsColors: settingsColors.map((c) => c.toString(16)),
            isIncluded
          });
          return isIncluded;
        });

        console.log("Final comparison:", {
          defaultColors: DEFAULT_COLORS.map((c) => c.toString(16)),
          settingsColors: settingsColors.map((c) => c.toString(16)),
          newActiveColors
        });

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
            setButtonState("using");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedPresets, hasApiKey]);

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
      // Only check for matching preset if no preset is currently selected
      if (!selectedPreset) {
        const matchingPreset = savedPresets.find((preset) => {
          const colorsMatch = activeColors.every(
            (active, index) => active === preset.activeColors[index]
          );
          return (
            preset.numSparkles === numSparkles &&
            preset.sparkleSize === sparkleSize &&
            preset.speed === speed &&
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
          const colorsMatch = activeColors.every(
            (active, index) => active === selectedPresetData.activeColors[index]
          );
          const isApplied =
            selectedPresetData.numSparkles === numSparkles &&
            selectedPresetData.sparkleSize === sparkleSize &&
            selectedPresetData.speed === speed &&
            colorsMatch;

          setPresetButtonState(isApplied ? "applied" : "apply");
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
        // Prepare the settings data - use original speed value for server
        const settings = {
          colors: DEFAULT_COLORS.filter((_, index) => activeColors[index]),
          num_sparkles: numSparkles,
          sparkle_size: sparkleSize,
          speed: speed // Use original speed value
        };

        // Send POST request to update settings
        const response = await fetch(getApiUrl("settings"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(settings)
        });

        if (!response.ok) {
          throw new Error("Failed to update settings");
        }

        // Set applied state and clear any existing timeout
        if (window.applyTimeout) {
          clearTimeout(window.applyTimeout);
        }

        // Store the applied settings
        setAppliedSettings(settings);
        setButtonState("applied");
        setHasChanges(false);

        // After 1.5 seconds, change to "save" state
        window.applyTimeout = setTimeout(() => {
          if (selectedPreset) {
            setButtonState("apply");
            setMatchingPresetName(
              savedPresets.find((p) => p.id === selectedPreset)?.name || null
            );
          } else {
            setButtonState("save");
            setMatchingPresetName(null);
          }
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
      speed // Use original speed value
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
    setButtonState("apply");
  };

  useEffect(() => {
    if (hasChanges && buttonState !== "applied" && buttonState !== "applying") {
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
        setSelectedPreset(matchingPreset.id);
        // If we're already using this preset, keep showing "Using"
        if (buttonState === "using" || buttonState === "applied") {
          setButtonState("using");
        } else {
          // Check if these changes exactly match the applied settings
          if (appliedSettings) {
            const colorsMatch =
              JSON.stringify(
                DEFAULT_COLORS.filter(
                  (_, index) => matchingPreset.activeColors[index]
                )
              ) === JSON.stringify(appliedSettings.colors) &&
              matchingPreset.activeColors.filter(Boolean).length ===
                appliedSettings.colors.length;

            const isMatch =
              matchingPreset.numSparkles === appliedSettings.num_sparkles &&
              matchingPreset.sparkleSize === appliedSettings.sparkle_size &&
              matchingPreset.speed === appliedSettings.speed &&
              colorsMatch;

            if (isMatch) {
              setButtonState("using");
            } else if (buttonState !== "saved") {
              setButtonState("use");
            }
          } else if (buttonState !== "saved") {
            setButtonState("use");
          }
        }
        setHasChanges(false);
      } else {
        setMatchingPresetName(null);
        setSelectedPreset(null);
        if (buttonState !== "saved" && buttonState !== "using") {
          setButtonState("apply");
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeColors,
    numSparkles,
    sparkleSize,
    speed,
    hasChanges,
    savedPresets,
    buttonState,
    hasApiKey,
    appliedSettings
  ]);

  const handleColorToggle = (index) => {
    setActiveColors((prev) => {
      const newActiveColors = [...prev];
      newActiveColors[index] = !newActiveColors[index];

      // If all colors are now false, set the toggled color back to true
      if (newActiveColors.every((color) => !color)) {
        newActiveColors[index] = true;
      }

      return newActiveColors;
    });
    handleValueChange();
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

    if (window.confirm(`Delete ${presetName}?`)) {
      deletePreset(presetId);
    } else {
      // If user cancels, prevent the preset from being selected
      setIsLongPress(false);
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

    console.log("Pressing preset with colors:", {
      presetColors: preset.activeColors,
      defaultColors: DEFAULT_COLORS.map((c) => c.toString(16))
    });

    // Set the colors first
    setActiveColors(preset.activeColors);
    setNumSparkles(preset.numSparkles);
    setSparkleSize(preset.sparkleSize);
    setSpeed(preset.speed);
    setSelectedPreset(preset.id);
    setHasChanges(true);

    // Check if this preset matches the currently applied settings
    if (appliedSettings) {
      const colorsMatch =
        JSON.stringify(
          DEFAULT_COLORS.filter((_, index) => preset.activeColors[index])
        ) === JSON.stringify(appliedSettings.colors) &&
        preset.activeColors.filter(Boolean).length ===
          appliedSettings.colors.length;

      const isApplied =
        preset.numSparkles === appliedSettings.num_sparkles &&
        preset.sparkleSize === appliedSettings.sparkle_size &&
        preset.speed === appliedSettings.speed &&
        colorsMatch;

      if (isApplied) {
        setButtonState("using");
        setPresetButtonState("applied");
        setMatchingPresetName(preset.name);
      } else {
        setButtonState("apply");
        setPresetButtonState("apply");
      }
    } else {
      setButtonState("apply");
      setPresetButtonState("apply");
    }
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
      const response = await fetch(getApiUrl("settings"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        throw new Error("Failed to update settings");
      }

      setPresetButtonState("applied");
    } catch (error) {
      console.error("Error applying preset:", error);
      setPresetButtonState("apply");
    }
  };

  const generateAIPreset = async () => {
    console.log("Starting AI preset generation");
    setIsGenerating(true);
    setSkipInitialFetch(true); // Prevent initial settings fetch from overwriting our values
    try {
      const response = await fetch(getApiUrl("generate"));
      const data = await response.json();
      console.log("Received AI preset data:", data);

      // Convert the API response to match our preset format
      const newPreset = {
        id: Date.now(),
        name: data.theme || "AI Generated",
        activeColors: DEFAULT_COLORS.map((color) =>
          data.colors.includes(color)
        ),
        numSparkles: data.num_sparkles,
        sparkleSize: data.sparkle_size,
        speed: data.speed
      };
      console.log("Created new preset:", newPreset);

      // Add preset to the list
      const updatedPresets = [newPreset, ...savedPresets];
      setSavedPresets(updatedPresets);
      localStorage.setItem("sparklePresets", JSON.stringify(updatedPresets));

      // Update the state variables with the new preset's settings
      console.log("Updating state variables...");
      setActiveColors(newPreset.activeColors);
      setNumSparkles(newPreset.numSparkles);
      setSparkleSize(newPreset.sparkleSize);
      setSpeed(newPreset.speed);
      setSelectedPreset(newPreset.id);
      setMatchingPresetName(newPreset.name);
      setHasChanges(false);
      setPresetButtonState("apply");
      setButtonState("apply");
      console.log("State variables updated");
    } catch (error) {
      console.error("Error generating AI preset:", error);
      setPresetButtonState("apply");
      setButtonState("apply");
    } finally {
      setIsGenerating(false);
      console.log("Finished AI preset generation");
    }
  };

  useEffect(() => {
    console.log("Animation effect triggered with:", {
      numSparkles,
      sparkleSize,
      activeColors,
      speed,
      hasApiKey,
      isLoading
    });

    if (!numSparkles || !sparkleSize || !speed || isLoading) {
      console.log("Missing required values:", {
        numSparkles,
        sparkleSize,
        speed,
        isLoading
      });
      return;
    }

    // Initialize sparkles based on the current state
    const initialSparkles = Array(numSparkles)
      .fill()
      .map(() => new Sparkle(activeColors, sparkleSize));
    console.log("Created initial sparkles:", initialSparkles.length);
    setSparkles(initialSparkles);

    // Calculate and set the initial grid state immediately
    const initialGrid = Array(MATRIX_HEIGHT)
      .fill()
      .map(() => Array(MATRIX_WIDTH).fill(0));
    initialSparkles.forEach((sparkle) => {
      for (let x = 0; x < sparkleSize; x++) {
        for (let y = 0; y < sparkleSize; y++) {
          if (
            sparkle.currentX + x < MATRIX_WIDTH &&
            sparkle.currentY + y < MATRIX_HEIGHT
          ) {
            initialGrid[sparkle.currentY + y][sparkle.currentX + x] =
              DEFAULT_COLORS[sparkle.colorIndex];
          }
        }
      }
    });
    console.log("Setting initial grid state");
    setGrid(initialGrid);

    // Calculate adjusted speed based on current settings
    const adjustedSpeed = calculateAdjustedSpeed(
      speed,
      numSparkles,
      sparkleSize
    );
    console.log("Starting animation with adjusted speed:", adjustedSpeed);

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
    }, adjustedSpeed);

    return () => {
      console.log("Cleaning up animation effect");
      clearInterval(interval);
    };
  }, [activeColors, numSparkles, sparkleSize, speed, isLoading, hasApiKey]);

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
              <GeneratePresetContainer
                onClick={generateAIPreset}
                isGenerating={isGenerating}
                numPresets={savedPresets.length}
              >
                <PresetIcon>
                  <FontAwesomeIcon icon={faPlus} />
                </PresetIcon>
                Generate
              </GeneratePresetContainer>
              {isGenerating && (
                <Preset
                  isGenerating={isGenerating}
                  numPresets={savedPresets.length}
                >
                  <PresetPreviewContainer>
                    <PresetPreviewLoading>
                      <LoadingSpinner size="1.75rem" />
                    </PresetPreviewLoading>
                    <PresetLabel>Loading</PresetLabel>
                  </PresetPreviewContainer>
                </Preset>
              )}
              {savedPresets.length > 0 &&
                savedPresets.map((preset) => (
                  <Preset
                    isGenerating={isGenerating}
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
                    <PresetPreviewContainer>
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
                    </PresetPreviewContainer>
                    <PresetLabel>{preset.name}</PresetLabel>
                  </Preset>
                ))}
              {savedPresets.length > 0 && <PresetSpacer />}
            </Presets>
          </>
        );
      default:
        return null;
    }
  };

  if (!hasApiKey) {
    return (
      <NoApiKeyContainer>
        <NoApiKeyMessage>No API key</NoApiKeyMessage>
      </NoApiKeyContainer>
    );
  }

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
              buttonState === "using" ||
              (buttonState === "apply" && !hasChanges && !selectedPreset) ||
              (buttonState === "apply" && selectedPreset && !hasChanges)
            }
            isApply={
              buttonState === "apply" &&
              (hasChanges || (selectedPreset && hasChanges))
            }
          >
            {buttonState === "loading"
              ? selectedPreset
                ? `Using ${matchingPresetName}`
                : "Loading..."
              : buttonState === "apply" && selectedPreset
              ? hasChanges
                ? matchingPresetName
                  ? `Apply ${matchingPresetName}`
                  : "Apply"
                : `Using ${matchingPresetName}`
              : buttonState === "use"
              ? `Use ${matchingPresetName}`
              : buttonState === "using"
              ? `Using ${matchingPresetName}`
              : buttonState === "saving"
              ? "Save preset"
              : buttonState === "applying"
              ? "Applying"
              : buttonState === "applied"
              ? selectedPreset
                ? `Using ${matchingPresetName}`
                : "Applied"
              : buttonState === "saved"
              ? `Saved as ${matchingPresetName}`
              : hasChanges
              ? "Apply"
              : "Save preset"}
          </Button>
        )}
        {activeTab === "presets" && savedPresets.length > 0 && (
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
              ? "Applying"
              : presetButtonState === "applied"
              ? `Using ${
                  savedPresets.find((p) => p.id === selectedPreset)?.name || ""
                }`
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

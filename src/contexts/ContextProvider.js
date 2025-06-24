import React, { createContext, useContext, useState, useEffect } from 'react';

const StateContext = createContext();

const initialState = {
  chat: false,
  cart: false,
  userProfile: false,
  notification: false,
};

// Green Science default configuration
const greenScienceDefaults = {
  color: '#10b981', // Emerald green as default for GreenSys
  mode: 'Light',    // Light mode for better readability during learning
};

// Green Science themed colors for easy access
export const greenScienceColors = [
  { name: 'Emerald Green', color: '#10b981' },
  { name: 'Forest Green', color: '#059669' },
  { name: 'Dark Green', color: '#047857' },
  { name: 'Leaf Green', color: '#16a34a' },
  { name: 'Eco Blue', color: '#0891b2' },
  { name: 'Nature Teal', color: '#0d9488' },
  { name: 'Earth Brown', color: '#a16207' },
  { name: 'Sky Blue', color: '#0284c7' },
];

export const ContextProvider = ({ children }) => {
  // Initialize state with Green Science defaults
  const [screenSize, setScreenSize] = useState(undefined);
  const [currentColor, setCurrentColor] = useState(() => {
    // Check localStorage first, then use green science default
    const savedColor = localStorage.getItem('greenSysColorMode');
    return savedColor || greenScienceDefaults.color;
  });
  
  const [currentMode, setCurrentMode] = useState(() => {
    // Check localStorage first, then use green science default
    const savedMode = localStorage.getItem('greenSysThemeMode');
    return savedMode || greenScienceDefaults.mode;
  });
  
  const [themeSettings, setThemeSettings] = useState(false);
  const [activeMenu, setActiveMenu] = useState(true);
  const [isClicked, setIsClicked] = useState(initialState);

  // Green Science theme preferences
  const [greenScienceMode, setGreenScienceMode] = useState(() => {
    const savedGreenMode = localStorage.getItem('greenScienceMode');
    return savedGreenMode === 'true' || savedGreenMode === null; // Default to true for new users
  });

  // Load saved preferences on component mount
  useEffect(() => {
    const savedColor = localStorage.getItem('greenSysColorMode');
    const savedMode = localStorage.getItem('greenSysThemeMode');
    const savedGreenMode = localStorage.getItem('greenScienceMode');

    if (savedColor) {
      setCurrentColor(savedColor);
    }
    if (savedMode) {
      setCurrentMode(savedMode);
    }
    if (savedGreenMode !== null) {
      setGreenScienceMode(savedGreenMode === 'true');
    }

    // Apply green science styling to document root if enabled
    if (greenScienceMode) {
      document.documentElement.style.setProperty('--green-primary', currentColor);
      document.documentElement.classList.add('green-science-theme');
    }
  }, [currentColor, greenScienceMode]);

  const setMode = (e) => {
    const newMode = e.target.value;
    setCurrentMode(newMode);
    localStorage.setItem('greenSysThemeMode', newMode);
    
    // Apply theme class to document
    if (newMode === 'Dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const setColor = (color) => {
    setCurrentColor(color);
    localStorage.setItem('greenSysColorMode', color);
    
    // Update CSS custom property for green science theme
    if (greenScienceMode) {
      document.documentElement.style.setProperty('--green-primary', color);
    }
    
    // Log color change for green science analytics (optional)
    console.log(`GreenSys: Theme color changed to ${color}`);
  };

  const handleClick = (clicked) => {
    setIsClicked((prevState) => ({
      ...initialState,
      [clicked]: !prevState[clicked],
    }));
  };

  // Green Science specific functions
  const toggleGreenScienceMode = () => {
    const newGreenMode = !greenScienceMode;
    setGreenScienceMode(newGreenMode);
    localStorage.setItem('greenScienceMode', newGreenMode.toString());
    
    if (newGreenMode) {
      document.documentElement.classList.add('green-science-theme');
      document.documentElement.style.setProperty('--green-primary', currentColor);
      // Auto-switch to green color if not already green
      if (!isGreenColor(currentColor)) {
        setColor(greenScienceDefaults.color);
      }
    } else {
      document.documentElement.classList.remove('green-science-theme');
      document.documentElement.style.removeProperty('--green-primary');
    }
  };

  const isGreenColor = (color) => {
    return greenScienceColors.some(greenColor => greenColor.color === color);
  };

  const resetToGreenScienceDefaults = () => {
    setCurrentColor(greenScienceDefaults.color);
    setCurrentMode(greenScienceDefaults.mode);
    setGreenScienceMode(true);
    
    localStorage.setItem('greenSysColorMode', greenScienceDefaults.color);
    localStorage.setItem('greenSysThemeMode', greenScienceDefaults.mode);
    localStorage.setItem('greenScienceMode', 'true');
    
    document.documentElement.classList.add('green-science-theme');
    document.documentElement.style.setProperty('--green-primary', greenScienceDefaults.color);
    
    if (greenScienceDefaults.mode === 'Dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Enhanced context value with Green Science features
  const contextValue = {
    // Original properties
    currentColor,
    currentMode,
    activeMenu,
    screenSize,
    setScreenSize,
    handleClick,
    isClicked,
    initialState,
    setIsClicked,
    setActiveMenu,
    setCurrentColor,
    setCurrentMode,
    setMode,
    setColor,
    themeSettings,
    setThemeSettings,
    
    // Green Science specific properties
    greenScienceMode,
    toggleGreenScienceMode,
    resetToGreenScienceDefaults,
    greenScienceColors,
    greenScienceDefaults,
    isGreenColor,
  };

  return (
    <StateContext.Provider value={contextValue}>
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error('useStateContext must be used within a ContextProvider');
  }
  return context;
};

// Additional Green Science utility hooks
export const useGreenScienceTheme = () => {
  const { 
    greenScienceMode, 
    toggleGreenScienceMode, 
    resetToGreenScienceDefaults,
    currentColor,
    isGreenColor 
  } = useStateContext();
  
  return {
    isGreenScienceEnabled: greenScienceMode,
    toggleGreenScience: toggleGreenScienceMode,
    resetToDefaults: resetToGreenScienceDefaults,
    isCurrentColorGreen: isGreenColor(currentColor),
  };
};

export const useGreenScienceColors = () => {
  const { greenScienceColors, setColor } = useStateContext();
  
  const applyGreenColor = (colorName) => {
    const greenColor = greenScienceColors.find(color => color.name === colorName);
    if (greenColor) {
      setColor(greenColor.color);
    }
  };
  
  return {
    colors: greenScienceColors,
    applyColor: applyGreenColor,
  };
};
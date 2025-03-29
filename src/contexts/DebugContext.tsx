import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DebugContextType {
  isDebugMode: boolean;
  debugData: Record<string, any>;
  toggleDebugMode: () => void;
  setDebugData: (key: string, value: any) => void;
}

const DebugContext = createContext<DebugContextType | undefined>(undefined);

export function DebugProvider({ children }: { children: ReactNode }) {
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [debugData, setDebugDataState] = useState<Record<string, any>>({});

  const toggleDebugMode = () => {
    setIsDebugMode(prev => !prev);
  };

  const setDebugData = (key: string, value: any) => {
    setDebugDataState(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <DebugContext.Provider value={{ isDebugMode, debugData, toggleDebugMode, setDebugData }}>
      {children}
      {isDebugMode && (
        <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg max-w-lg max-h-[80vh] overflow-auto">
          <h3 className="text-lg font-semibold mb-2">Debug Data</h3>
          <pre className="text-xs whitespace-pre-wrap">
            {JSON.stringify(debugData, null, 2)}
          </pre>
        </div>
      )}
    </DebugContext.Provider>
  );
}

export function useDebug() {
  const context = useContext(DebugContext);
  if (context === undefined) {
    throw new Error('useDebug must be used within a DebugProvider');
  }
  return context;
} 
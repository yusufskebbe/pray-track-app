import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  getCityName as getCityNameFromDB,
  setCityName as setCityNameInDB,
} from "../services/database.service";

interface CityContextType {
  cityName: string | null;
  setCityName: (city: string) => Promise<void>;
  isLoading: boolean;
  loadCityFromDB: () => Promise<void>;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

export function CityProvider({ children }: { children: ReactNode }) {
  const [cityName, setCityNameState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadCityFromDB = async () => {
    setIsLoading(true);
    try {
      const savedCity = await getCityNameFromDB();
      setCityNameState(savedCity);
    } catch {
      // Silent fail - city will remain null
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCityFromDB();
  }, []);

  const setCityName = async (city: string) => {
    try {
      await setCityNameInDB(city);
      setCityNameState(city);
    } catch (error) {
      throw error;
    }
  };

  return (
    <CityContext.Provider
      value={{ cityName, setCityName, isLoading, loadCityFromDB }}
    >
      {children}
    </CityContext.Provider>
  );
}

export function useCity() {
  const context = useContext(CityContext);
  if (!context) {
    throw new Error("useCity must be used within a CityProvider");
  }
  return context;
}

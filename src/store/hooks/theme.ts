import { useSelector } from 'react-redux';
import { RootState } from '../rootState';

export const useThemeContext = () => useSelector((state: RootState) => state.stage.theme);


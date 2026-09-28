import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from './store'

// App-level hooks; lower FSD layers use their own narrowly typed selectors.
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()

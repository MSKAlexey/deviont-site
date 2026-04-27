import {createContext, useContext} from 'react'

const CardsTextConfigContext = createContext(null)

export function CardsTextConfigProvider({children, value}) {
  return <CardsTextConfigContext.Provider value={value}>{children}</CardsTextConfigContext.Provider>
}

export function useCardsTextConfigContext() {
  return useContext(CardsTextConfigContext)
}

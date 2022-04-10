import * as actionTypes from "./actionTypes"

const initialState: GomokuState = {
  currentPlayer: 'Black'
}

const reducer = (
  state: GomokuState = initialState,
  action: CurrentPlayerAction
): GomokuState => {
  switch (action.type) {
    case actionTypes.SET_CURRENT_PLAYER:
      return { ...state, currentPlayer: action.currentPlayer }

  }
  return state
}

export default reducer
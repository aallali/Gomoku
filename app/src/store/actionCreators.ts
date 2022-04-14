import * as actionTypes from "./actionTypes"

export function updateCurrentPlayer(currentPlayer: string) {
  const action: GomokuAction = {
    type: actionTypes.SET_CURRENT_PLAYER,
    currentPlayer,
  }
  return (dispatch: DispatchType) => {
    dispatch(action)
  }
}

export function setOptions(options: any) {
  const action: GomokuAction = {
    type: actionTypes.SET_OPTIONS,
    options,
  }
  return (dispatch: DispatchType) => {
    dispatch(action)
  }
}

export function setTurn() {
  const action: GomokuAction = {
    type: actionTypes.SET_TURN,
  }
  return (dispatch: DispatchType) => {
    dispatch(action)
  }
}


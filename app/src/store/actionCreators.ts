import * as actionTypes from "./actionTypes"

export function addArticle(currentPlayer: string) {
  const action: CurrentPlayerAction = {
    type: actionTypes.SET_CURRENT_PLAYER,
    currentPlayer,
  }
  return (dispatch: DispatchType) => {
      dispatch(action)
  }
}

 
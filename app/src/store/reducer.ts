import * as actionTypes from "./actionTypes"

const initialState: GomokuState = {
  currentPlayer: 'Black',
  options: {},
  color: {
    current: 'b',
    enemy: 'w'
  },
  player: 'human',
  enemy: 'ai',
  mode: 'local',
  myTurn: true,
  winner: undefined
}

const reducer = (
  state: GomokuState = initialState,
  action: GomokuAction
): GomokuState => {
  let currP
  switch (action.type) {
    case actionTypes.SET_CURRENT_PLAYER:
      currP = state.options.color === 'rb' ? (action.currentPlayer === 'Black' ? 'Blue' : 'Red') : action.currentPlayer
      return { ...state, currentPlayer: currP }
    case actionTypes.SET_OPTIONS:
      const color: any = {
        current: 'b',
        enemy: 'w'
      }
      currP = state.options.color === 'rb' ? (state.currentPlayer === 'Black' ? 'Blue' : 'Red') : state.currentPlayer

      if (action.options.color === 'rb') {
        color.current = "r"
        color.enemy = "bl"
      }
      return {
        ...state,
        player: action.options.mode === "4" ? 'ai' : 'human',
        color,
        enemy: '34'.includes(action.options.mode) ? 'ai' : 'human',
        mode: action.options.mode === 2 ? 'online' : 'local',
        options: action.options,
        currentPlayer:currP
      }
    case actionTypes.SET_TURN:
      return { ...state, myTurn: !state.myTurn }
    case actionTypes.SET_WINNER:
      return { ...state, winner: action.winner }
  }

  return state
}

export default reducer
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
  myTurn: true
}

const reducer = (
  state: GomokuState = initialState,
  action: GomokuAction
): GomokuState => {
  switch (action.type) {
    case actionTypes.SET_CURRENT_PLAYER:
      return { ...state, currentPlayer: action.currentPlayer }
    case actionTypes.SET_OPTIONS:
      const color: any = {
        current: 'b',
        enemy: 'w'
      }

      if (action.options.color === 'rb') {
        color.current = "bl"
        color.enemy = "r"
      }
      return {
        ...state,
        player: action.options.mode === "4" ? 'ai' : 'human',
        color,
        enemy: '34'.includes(action.options.mode) ? 'ai' : 'human',
        mode: action.options.mode === 2 ? 'online' : 'local',
        options: action.options
      }
    case actionTypes.SET_TURN:
 
      return { ...state, myTurn: !state.myTurn }
  }

  return state
}

export default reducer
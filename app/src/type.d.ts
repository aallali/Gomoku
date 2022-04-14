

type GomokuState = {
  currentPlayer: string
  options: any
  color: {
    current: 'b' | 'w' | 'r' | 'bl',
    enemy: 'b' | 'w' | 'r' | 'bl'
  }
  player: 'human' | 'ai'
  enemy: 'human' | 'ai',
  mode: 'local' | 'online',
  myTurn: boolean,
  winner: undefined | string
}

type GomokuAction = {
  type: string
  currentPlayer?: IArticle
  options?: any,
  winner?: undefined | string
}

type DispatchType = (args: GomokuAction) => CurrentPlayerAction
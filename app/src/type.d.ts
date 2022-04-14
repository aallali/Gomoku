

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
  myTurn: boolean
}

type GomokuAction = {
  type: string
  currentPlayer?: IArticle
  options?: any
}

type DispatchType = (args: GomokuAction) => CurrentPlayerAction


type GomokuState = {
  currentPlayer: string
}

type CurrentPlayerAction = {
  type: string
  currentPlayer: IArticle
}

type DispatchType = (args: CurrentPlayerAction) => CurrentPlayerAction
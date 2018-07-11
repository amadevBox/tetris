const mapWidth = 200
const mapHeight = 400
const rows = 20
const columns = 10
const cellSize = mapWidth / columns
const borderSize = 0.5

const zType = [
  [1, 1, 0],
  [0, 1, 1],
  [0, 0, 0],
]

const iType = [
  [0, 2, 0, 0],
  [0, 2, 0, 0],
  [0, 2, 0, 0],
  [0, 2, 0, 0],
]

const lType = [
  [3, 0, 0],
  [3, 0, 0],
  [3, 3, 0],
]

const oType = [
  [4, 4],
  [4, 4],
]

const blockColors = ['red', 'green', 'blue', 'pink']

const blockTypes = {
  zType,
  iType,
  lType,
  oType,
}

class Block {
  constructor(cells, x, y) {
    this.cells = cells
    this.position = { x, y }
    this.isAlive = true
  }

  rotate() {
    const newCells = []
    for (let i = 0; i < this.cells.length; i++) {
      newCells[i] = []
      for (let j = 0; j < this.cells.length; j++) {
        newCells[i][j] = this.cells[this.cells.length - 1 - j][i]
      }
    }
    this.cells = newCells
  }

  moveBlockByEvent(e) {
    switch(e.key) {
      case 'ArrowLeft': {
        if (/*this.position.x > 0*/true) {
          this.position.x--
        }
        break
      }
      case 'ArrowRight': {
        if (/*this.position.x < columns*/ true) {
          this.position.x++
        }
        break
      }
      case 'ArrowDown': {
        if (this.position.y + this.cells.length < 20) {
          this.position.y++
        }
        break
      }
      case 'ArrowUp': {
        if (/*this.position.x < columns*/true) {
          this.rotate()
        }
        break
      }
    }
  }

  findCollison(field) {
    const { x, y } = this.position
    this.cells.forEach((rows, i) => {
      rows.forEach((cell, j) => {
        if (cell && y + i >= 20) {
          this.isAlive = false
          return
        }
        if (cell && field[y + i][x + j]) {
          this.isAlive = false
          return
        }
      })
    })
  }
}
Block.timeToChange = 1000

const canMoveLeft = (block, field) => {
  const { cells, position } = block
  const { x, y } = position
  return !cells.some((rows, i) => {
    return rows.some((cell, j) => {
      if (
        (cell && x + j < 0) ||
        (cell && x + j >= 10) ||
        (cell && field[y + i][x + j])
      ) {
        return true
      }
    })
  })
  return true
}

const changeScore = (score) => {
  const scoreElem = document.getElementById('score')
  scoreElem.innerHTML = `length: ${score}`
}

const finishGame = (game) => {}

const drawField = (field, ctx) => {
  field.forEach((row, rowIndex) => {
    row.forEach((cell, columnIndex) => {
      ctx.fillStyle = cell ? blockColors[cell - 1] : '#000'
      ctx.strokeStyle = "#00f"
      ctx.lineWidth = borderSize

      const args = [
        columnIndex * cellSize,
        rowIndex * cellSize,
        cellSize,
        cellSize,
      ]

      ctx.fillRect(...args)
      ctx.strokeRect(...args)
    })
  })
}

const { requestAnimationFrame } = window
let prevTime = 0
const fps = 24
const timeToMoveDown = 500
let counterOfF = 0
let prevPosition = { x: 0, y: 0 }
let prevBlock = [[0,0,0], [0,0,0], [0,0,0]]
const render = (game, block, time) => {
  if (!block) {
    const arrOfTypes = Object.values(blockTypes)
    block = new Block(arrOfTypes[arrOfTypes.length * Math.random() | 0], 0, 0)
    addEventListener('keydown', (e) => block.moveBlockByEvent.bind(block)(e))
  }

  const { ctx, field } = game
  const { position } = block
  // console.log('current_position', position)

  // if (position.y > prevPosition.y) {
  //   // position.y = prevPosition.y + 1
  // }

  if (time - prevTime > 1000 / fps) {
    counterOfF++
    if (counterOfF === (fps * timeToMoveDown) / 1000) {
      counterOfF = 0
      if (block && block.isAlive) {
        position.y++
      } else {
        block = null
      }
    }

    prevTime = time

    insertIntoArray(prevBlock, field, prevPosition.y, prevPosition.x, true)

    const canMove = canMoveLeft(block, field)
    if (!canMove) {
      position.x = prevPosition.x
      block.cells = prevBlock
    }

    if (position.y > prevPosition.y) {
      position.y = prevPosition.y + 1
    }

    console.log('current', position.x, position.y)
    block.findCollison(field)
    if (block.isAlive) {
      // console.log('isAlive', prevPosition.y, position.y)
      insertIntoArray(block.cells, field, position.y, position.x)
      drawField(field, ctx)
      prevPosition = Object.assign({}, position)
      prevBlock = [].concat(block.cells)
    } else {
      // console.log('prevPosition', prevPosition)
      insertIntoArray(block.cells, field, prevPosition.y, prevPosition.x)
      game.field = findFilledRow(field)
      drawField(game.field, ctx)
      prevPosition = Object.assign({}, {x: 0, y: 0})
      block = null
    }
  }

  requestAnimationFrame((time) => render(game, block, time))
}

const insertIntoArray = (childArr, parrentArr, row, col, clearMode) => {
  const parrentHeight = parrentArr.length
  const parrentWidth = parrentArr[0].length

  const childHeight = childArr.length
  const childWidth = childArr[0].length

  let i = 0
  while(i < childHeight) {
    let j = 0
    while(j < childWidth) {
      parrentArr[row + i][col + j] = !clearMode
        ? childArr[i][j]
         ? childArr[i][j]
         : parrentArr[row + i][col + j]
        : childArr[i][j]
          ? 0
          : parrentArr[row + i][col + j]
      j++
    }
    i++
  }
}

const findFilledRow = (field) => {
  const filteredField = field.filter((row) => row.some((cell) => (cell === 0)))
  const diff = field.length - filteredField.length
  const filledArr = generateField(diff, 10)
  return [...filledArr, ...filteredField]
}

const generateField = (rows, cols) => {
  const field = Array.from({length: rows},
    () => Array.from({length: cols}, () => 0))
  return field
}

window.onload = () => {
  const canvas = document.getElementById('map')
  const ctx = canvas.getContext('2d')
  const game = { ctx }

  const amountOfRows = (mapHeight / cellSize) + 4
  const cellsInRow = mapWidth / cellSize
  game.field = generateField(amountOfRows, cellsInRow)
  render(game)
}

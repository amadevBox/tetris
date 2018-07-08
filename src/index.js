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
  [0, 1, 0, 0],
  [0, 1, 0, 0],
  [0, 1, 0, 0],
  [0, 1, 0, 0],
]

const lType = [
  [1, 0, 0],
  [1, 0, 0],
  [1, 1, 0],
]

const blockTypes = {
  zType,
  iType,
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
        if (this.position.x > 0) {
          this.position.x--
        }
        break
      }
      case 'ArrowRight': {
        if (this.position.x < columns) {
          this.position.x++
        }
        break
      }
      case 'ArrowDown': {
        if (/*this.position.x < columns*/true) {
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
        if (cell && y + i + 1 >= field.length) {
          this.isAlive = false
          return
        }
        if (cell && field[y + i + 1][x + j]) {
          this.isAlive = false
        }
      })
    })

  }
}

Block.timeToChange = 1000

const changeScore = (score) => {
  const scoreElem = document.getElementById('score')
  scoreElem.innerHTML = `length: ${score}`
}

const finishGame = (game) => {}

const generateField = () => {
  const amountOfRows = mapHeight / cellSize
  const cellsInRow = mapWidth / cellSize
  const field = Array.from({length: amountOfRows},
    () => Array.from({length: cellsInRow}, () => 0))
  return field
}

const drawField = (field, ctx) => {
  field.forEach((row, rowIndex) => {
    row.forEach((cell, columnIndex) => {
      ctx.fillStyle = cell ? 'red' : '#000'
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
const render = (game, block, time) => {
  if (!block) {
    const arrOfTypes = Object.values(blockTypes)
    block = new Block(arrOfTypes[arrOfTypes.length * Math.random() | 0], 0, 0)
    addEventListener('keydown', (e) => block.moveBlockByEvent.bind(block)(e))
  }

  const { ctx, field } = game
  const { position } = block

  if (time - prevTime > 1000 / fps) {
    counterOfF++
    if (counterOfF === (fps * timeToMoveDown) / 1000) {
      counterOfF = 0
      if (block.isAlive) {
        const canSliceBottom = block.cells[block.cells.length - 1].every((cell) => !cell)
        if (canSliceBottom) {
          block.cells.unshift(block.cells.pop())
        } else {
          position.y++
        }
      }
    }

    prevTime = time

    if (block.isAlive) {
      insertIntoArray(block.cells, field, prevPosition.y, prevPosition.x, true)
      block.findCollison(field)
      insertIntoArray(block.cells, field, position.y, position.x)
      drawField(field, ctx)
      prevPosition = Object.assign({}, position)
    } else {
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

  // if (
  //   (col + childWidth > parrentWidth) ||
  //   (row + childHeight > parrentHeight)
  // ) return

  let i = 0
  while(i < childHeight) {
    let j = 0
    while(j < childWidth) {
      parrentArr[row + i][col + j] = !clearMode ? childArr[i][j] : 0
      j++
    }
    i++
  }
}

const canMove = (childArr, parrentArr, row, col) => {

}

window.onload = () => {
  const canvas = document.getElementById('map')
  const ctx = canvas.getContext('2d')
  const game = { ctx }

  game.field = generateField()
  render(game)
}

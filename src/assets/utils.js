export const clearPoint = (point, ref) => {
  ref.innerHTML = ''
  for (var i = 0; i < 4; i++) {
    point[i] = new Array(4).fill(0)
  }
}
export const getRandom = () => {
  return parseInt(Math.random() * 4)
}
export const getNum = (level) => {
  switch (level) {
    case 2:
      if (Math.random() < 0.2) return 2
      else if(Math.random() < 0.4) return 4
      else if(Math.random() < 0.6) return 8
      else if(Math.random() < 0.8) return 16
      else return 32
    case 3:
      break
    default:
      if (Math.random() > 0.8) return 4
      else return 2
  }
}

export const canMoveLeft = (point) => {
  for (var i = 0; i < 4; i++) {
    // 最左边的一列不移动，因此不用判断
    for (var j = 1; j < 4; j++) {
      // 格子不等于零就要向左移动
      if (point[i][j] !== 0) {
        if (point[i][j - 1] === 0 || point[i][j - 1] === point[i][j]) return true
      }
    }
  }
  return false
}
export const canMoveRight = (point) => {
  for (var i = 0; i < 4; i++) {
    for (var j = 2; j >= 0; j--) {
      if (point[i][j] !== 0) {
        if (point[i][j + 1] === 0 || point[i][j] === point[i][j + 1]) return true
      }
    }
  }
  return false
}

export const canMoveUp = (point) => {
  for (var j = 0; j < 4; j++) {
    for (var i = 1; i < 4; i++) {
      if (point[i][j] !== 0) {
        if (point[i - 1][j] === 0 || point[i - 1][j] === point[i][j]) return true
      }
    }
  }
  return false
}

export const canMoveDown = (point) => {
  for (var j = 0; j < 4; j++) {
    for (var i = 0; i < 3; i++) {
      if (point[i][j] !== 0) {
        if (point[i + 1][j] === 0 || point[i + 1][j] === point[i][j]) return true
      }
    }
  }
  return false
}

// 判断第row行的第col1列到第col2列是否存在障碍物
export const noBlockHorizontal = (point, row, col1, col2) => {
  for (var i = col1 + 1; i < col2; i++) {
    if (point[row][i] !== 0) return false
  }
  return true
}

export const noBlockVertical = (point, col, row1, row2) => {
  for (var i = row1 + 1; i < row2; i++) {
    if (point[i][col] !== 0) return false
  }
  return true
}

export const generateOneNum = (point, ref, level) => {
  var x = getRandom()
  var y = getRandom()
  if (point[x][y] === 0) {
    point[x][y] = getNum(level)
    ref.children[x * 4 + y].innerHTML = point[x][y]
    ref.children[x * 4 + y].setAttribute('class', 'cell number-cell' + point[x][y])
  } else {
    generateOneNum(point, ref)
  }
}
export const showMoveAnimation = (ref, i, j, l, k) => {
  
  
}
export const numberInit = (point, numberRef) => {
  for(let i = 0; i < 4; i++) {
    for(let j = 0; j < 4; j++) {
      let el = document.createElement('div')
      if(point[i][j] === 0) {
        el.className = 'number-cell'
      } else {
        el.className = 'cell number-cell' + point[i][j]
        el.innerHTML = point[i][j]
      }
      numberRef.appendChild(el)
    }
  }
}
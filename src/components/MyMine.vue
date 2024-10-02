<template>
  <div
    class="min-w-[960px] min-h-[510px] border border-solid border-blue-100 rounded-lg flex flex-col"
  >
    <div class="flex-grow-[4] air flex items-center justify-center">
      <!-- <div v-for="(configRow, rowIndex) in stones.config.value" :key="rowIndex">
        <div v-for="(config, index) in configRow" :key="index">
          <div
            :class="`h-[10px] w-[10px] border border-solid border-blue-300 bg-blue-400 ${config.isShake ? 'shake-hard' : ''}`"
            ref="stoneBlockRef"
            @click="() => startAnimation(rowIndex, index)"
          ></div>
        </div>
      </div> -->
      <canvas
        ref="canvasElement"
        id="canvasId"
        width="480"
        height="320"
        class="border border-solid border-black"
      ></canvas>
    </div>
    <div class="flex-grow-[1] floor"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, Ref, ref } from 'vue'
// import { useStones } from '../hooks/useStones'

// const stones = useStones()

// const timeoutRef = ref()

// const startAnimation = (rowIndex: number, index: number) => {
//   if (!timeoutRef.value) {
//     stones.config.value[rowIndex][index].isShake = true
//     stones.config.value[rowIndex - 1][index].isShake = true
//     stones.config.value[rowIndex + 1][index].isShake = true
//     stones.config.value[rowIndex][index - 1].isShake = true
//     stones.config.value[rowIndex][index + 1].isShake = true
//     timeoutRef.value = setTimeout(() => {
//       stones.config.value[rowIndex][index].isShake = false
//       stones.config.value[rowIndex - 1][index].isShake = false
//       stones.config.value[rowIndex + 1][index].isShake = false
//       stones.config.value[rowIndex][index - 1].isShake = false
//       stones.config.value[rowIndex][index + 1].isShake = false
//       timeoutRef.value = null
//     }, 50)
//   }
// }

// The important part: the name of the variable needs to be equal to the ref's name of the canvas element in the template
const canvasElement: Ref<HTMLCanvasElement | undefined> = ref()
const context: Ref<CanvasRenderingContext2D | undefined> = ref()
const x = ref()
const y = ref()
const ballRadius = 10
let dx = 2
let dy = -2
const paddleHeight = 10
const paddleWidth = 75
const paddleX = ref()
const rightPressed = ref(false)
const leftPressed = ref(false)

const intervalRef = ref()

const brickRowCount = 3
const brickColumnCount = 5
const brickWidth = 75
const brickHeight = 20
const brickPadding = 10
const brickOffsetTop = 30
const brickOffsetLeft = 30

const brickX = ref()
const brickY = ref()

const bricks = ref<{ x: number; y: number; status: 0 | 1 }[][]>([])
for (let c = 0; c < brickColumnCount; c++) {
  bricks.value[c] = []
  for (let r = 0; r < brickRowCount; r++) {
    bricks.value[c][r] = { x: 0, y: 0, status: 1 }
  }
}

onMounted(() => {
  if (!canvasElement.value) {
    return
  }
  // Get canvas context. If 'getContext' returns 'null', set to 'undefined', so that it conforms to the Ref typing
  context.value = canvasElement.value?.getContext('2d') || undefined
  x.value = canvasElement.value?.width / 2
  y.value = canvasElement.value?.height - 30
  paddleX.value = (canvasElement.value.width - paddleWidth) / 2

  intervalRef.value = setInterval(() => render(), 10)
  // requestAnimationFrame(() => render())

  document.addEventListener('keydown', keyDownHandler, false)
  document.addEventListener('keyup', keyUpHandler, false)
})

function keyDownHandler(e: KeyboardEvent) {
  if (e.key === 'ArrowRight') {
    rightPressed.value = true
  } else if (e.key === 'ArrowLeft') {
    leftPressed.value = true
  }
}

function keyUpHandler(e: KeyboardEvent) {
  if (e.key === 'ArrowRight') {
    rightPressed.value = false
  } else if (e.key === 'ArrowLeft') {
    leftPressed.value = false
  }
}

function render() {
  if (!context.value || !canvasElement.value) {
    return
  }

  drawBall()
}

function drawBall() {
  if (!context.value || !canvasElement.value) {
    return
  }
  context.value.clearRect(0, 0, canvasElement.value.width, canvasElement.value.height)
  collisionDetection()
  drawBricks()
  drawPaddle()
  context.value.beginPath()
  context.value.arc(x.value, y.value, ballRadius, 0, Math.PI * 2)
  context.value.fillStyle = '#0095DD'
  context.value.fill()
  context.value.closePath()

  if (y.value + dy < ballRadius) {
    dy = -dy
  } else if (y.value + dy > canvasElement.value.height - ballRadius) {
    if (x.value > paddleX.value && x.value < paddleX.value + paddleWidth) {
      dy = -dy
    } else {
      alert('GAME OVER')
      history.go(0)
      clearInterval(intervalRef.value)
    }
  }
  if (x.value + dx < ballRadius || x.value + dx > canvasElement.value?.width - ballRadius) dx = -dx

  x.value += dx
  y.value += dy
}

function drawPaddle() {
  if (!context.value || !canvasElement.value) {
    return
  }

  if (rightPressed.value && paddleX.value < canvasElement.value.width - paddleWidth) {
    paddleX.value += 7
  } else if (leftPressed.value && paddleX.value > 0) {
    paddleX.value -= 7
  }

  context.value.beginPath()
  context.value.rect(
    paddleX.value,
    canvasElement.value.height - paddleHeight,
    paddleWidth,
    paddleHeight
  )
  context.value.fillStyle = '#0095DD'
  context.value.fill()
  context.value.closePath()
}

function drawBricks() {
  if (!context.value || !canvasElement.value) {
    return
  }

  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks.value[c][r].status == 1) {
        brickX.value = c * (brickWidth + brickPadding) + brickOffsetLeft
        brickY.value = r * (brickHeight + brickPadding) + brickOffsetTop
        bricks.value[c][r].x = brickX.value
        bricks.value[c][r].y = brickY.value
        console.log(brickX.value, brickY.value)
        context.value.beginPath()
        context.value.rect(brickX.value, brickY.value, brickWidth, brickHeight)
        context.value.fillStyle = '#0095DD'
        context.value.fill()
        context.value.closePath()
      }
    }
  }
}

function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      let b = bricks.value[c][r]
      // calculations
      if (
        x.value > b.x &&
        x.value < b.x + brickWidth &&
        y.value > b.y &&
        y.value < b.y + brickHeight
      ) {
        dy = -dy
        bricks.value[c][r].status = 0
      }
    }
  }
}
</script>

<style lang="scss" scoped>
// .air {
//   background-color: #e5e5f7;
//   opacity: 0.5;
//   background-image: radial-gradient(#444cf7 0.5px, #e5e5f7 0.5px);
//   background-size: 10px 10px;
// }

.floor {
  background-color: #e5e5f7;
  opacity: 0.1;
  background:
    linear-gradient(135deg, #444cf755 25%, transparent 25%) -10px 0/ 20px 20px,
    linear-gradient(225deg, #444cf7 25%, transparent 25%) -10px 0/ 20px 20px,
    linear-gradient(315deg, #444cf755 25%, transparent 25%) 0px 0/ 20px 20px,
    linear-gradient(45deg, #444cf7 25%, #e5e5f7 25%) 0px 0/ 20px 20px;
}

.shake-hard {
  background-color: #444cf7;
}

canvas {
  background: #eee;
  display: block;
  margin: 0 auto;
}
</style>

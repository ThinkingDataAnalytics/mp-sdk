const screenWidth = window.innerWidth
const screenHeight = window.innerHeight

let atlas = new Image()
let restartBtn = new Image()

atlas.src = 'resources/images/customDialog.png'
restartBtn.src = 'resources/images/againBtn.png'


export default class GameInfo {
    renderGameScore(ctx, score) {
        ctx.fillStyle = "#ffffff"
        ctx.font = "20px Arial"

        ctx.fillText(
            score,
            10,
            30
        )
    }

    renderGameOver(ctx, score) {
        ctx.drawImage(atlas, screenWidth / 2 - 150, screenHeight / 2 - 200, 300, 300)

        ctx.fillStyle = "#111111"
        ctx.font = "20px Arial"

        ctx.fillText(
            score,
            screenWidth / 2 - 2,
            screenHeight / 2 - 20
        )

        ctx.drawImage(
            atlas,
            120, 6, 39, 24,
            screenWidth / 2 - 60,
            screenHeight / 2 - 100 + 180,
            120, 40
        )

        ctx.drawImage(restartBtn, screenWidth / 2 - 80, screenHeight / 2 + 10 , 160, 40)


        /**
         * 重新开始按钮区域
         * 方便简易判断按钮点击
         */
        this.btnArea = {
            startX: screenWidth / 2 - 80,
            startY: screenHeight / 2 + 10,
            endX: screenWidth / 2 + 80,
            endY: screenHeight / 2 + 50
        }
    }
}

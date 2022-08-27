window.onload = function () {

	/** canevas */
	var canvas
	/** largeur du canevas */
	var canvas_width = 630
	/** hauteur du canevas */
	var canvas_height = 510
	var block_size = 30
	var ctx
	/** vitesse de déplacement du serpent */
	var delay = 100
	/** serpent initial */
	var initial_snake
	/** pomme initiale */
	var initial_apple
	var widthInBlocks = canvas_width / block_size
	var heightInBlocks = canvas_height / block_size
	/** score */
	var score
	var timeout

	init()
	/** démarrage du jeu */

	/**
	 * Démarrage le jeu
	 */
	function init() {
		canvas = document.createElement('canvas')
		canvas.width = canvas_width
		canvas.height = canvas_height
		canvas.style.border = "5px solid gray"
		canvas.style.margin = "50px auto"
		canvas.style.display = "block"
		canvas.style.backgroundColor = "#ddd"
		document.body.appendChild(canvas)
		ctx = canvas.getContext('2d')
		initial_snake = new Snake([[3, 4], [2, 4], [1, 4]], "right")
		initial_apple = new Apple([14, 10])
		score = 0
		refreshCanvas()
	}

	/**
	 * Rafraîchit le canevas
	 */
	function refreshCanvas() {
		initial_snake.advance()
		if (initial_snake.checkCollision()) {
			gameOver()
		} else {
			if (initial_snake.isEatingApple(initial_apple)) {
				score++
				initial_snake.ateApple = true
				do {
					initial_apple.setNewPosition()
				} while (initial_apple.isOnSnake(initial_snake))
			}
			ctx.clearRect(0, 0, canvas_width, canvas_height)
			drawScore()
			initial_snake.draw()
			initial_apple.draw()
			timeout = setTimeout(refreshCanvas, delay)
		}
	}

	/**
	 * Met fin au jeu
	 */
	function gameOver() {
		ctx.save()
		ctx.font = "bold 40px sans-serif"
		ctx.fillStyle = "dark"
		ctx.textAlign = "center"
		ctx.textBaseline = "middle"
		ctx.strokeStyle = "white"
		ctx.lineWidth = 3
		var center_x = canvas_width / 2
		var center_y = canvas_height / 2
		ctx.strokeText("Game Over", center_x, center_y - 180)
		ctx.fillText("Game Over", center_x, center_y - 180)
		ctx.font = "bold 20px sans-serif"
		ctx.strokeText("Appuyez sur la touche Espace pour refaire une partie", center_x, center_y - 130)
		ctx.fillText("Appuyez sur la touche Espace pour refaire une partie", center_x, center_y - 130)
		ctx.restore()
	}

	/**
	 * Redémarre le jeu
	 */
	function restart() {
		initial_snake = new Snake([[3, 4], [2, 4], [1, 4]], "right")
		initial_apple = new Apple([14, 10])
		score = 0
		clearTimeout(timeout)
		refreshCanvas()
	}

	/**
	 * Gère l'affichage du score
	 */
	function drawScore() {
		ctx.save()
		ctx.font = "bold 200px sans-serif"
		ctx.fillStyle = "gray"
		ctx.textAlign = "center"
		ctx.textBaseline = "middle"
		var center_x = canvas_width / 2
		var center_y = canvas_height / 2
		ctx.fillText(score.toString(), center_x, center_y)
		ctx.restore()
	}

	function drawBlock(ctx, position) {
		var x = position[0] * block_size
		var y = position[1] * block_size
		ctx.fillRect(x, y, block_size, block_size)
	}

	function Snake(body, direction) {
		this.body = body
		this.direction = direction
		this.ateApple = false

		this.draw = function () {
			ctx.save()
			ctx.fillStyle = "#ff0000"
			for (var i = 0; i < this.body.length; i++) {
				drawBlock(ctx, this.body[i])
			}
			ctx.restore()
		}

		this.setDirection = function (new_direction) {
			var allowedDirections
			switch (this.direction) {
				case "left":
				case "right":
					allowedDirections = ["up", "down"]
					break
				case "up":
				case "down":
					allowedDirections = ["right", "left"]
					break
				default:
					throw ("Invalid direction")
			}
			if (allowedDirections.indexOf(new_direction) > -1) {
				this.direction = new_direction
			}
		}

		this.advance = function () {
			var next_position = this.body[0].slice()
			switch (this.direction) {
				case "left":
					next_position[0]--
					break
				case "up":
					next_position[1]--
					break
				case "right":
					next_position[0]++
					break
				case "down":
					next_position[1]++
					break
				default:
					throw ("Invalid direction")
			}
			this.body.unshift(next_position)
			if (!this.ateApple) {
				this.body.pop()
			} else {
				this.ateApple = false
			}
		}

		this.checkCollision = function () {
			var wall_collision = false
			var snake_collision = false
			var head = this.body[0]
			var body_snake = this.body.slice(1)
			var snake_x = head[0]
			var snake_y = head[1]
			var min_x = 0
			var min_y = 0
			var max_x = widthInBlocks - 1
			var max_y = heightInBlocks - 1
			var isNotBetweenHorizontalWalls = snake_x < min_x || snake_x > max_x
			var isNotBetweenVerticalWalls = snake_y < min_y || snake_y > max_y

			/* vérification de collision avec les murs */
			if (isNotBetweenHorizontalWalls || isNotBetweenVerticalWalls) {
				wall_collision = true
			}

			/* vérification de collision avec le corps du serpent */
			for (var i = 0; i < body_snake.length; i++) {
				if (snake_x === body_snake[i][0] && snake_y === body_snake[i][1]) {
					snake_collision = true
				}
			}

			return wall_collision || snake_collision
		}

		this.isEatingApple = function (apple) {
			var head = this.body[0]
			if (head[0] == apple.position[0] && head[1] == apple.position[1]) {
				return true
			} else {
				return false
			}
		}
	}

	/**
	 * représente l'objet pomme
	 * @param {*} position 
	 */
	function Apple(position) {
		this.position = position

		this.draw = function () {
			ctx.save()
			ctx.fillStyle = "#70fa3a"
			ctx.beginPath()
			var radius = block_size / 2
			var x = this.position[0] * block_size + radius
			var y = this.position[1] * block_size + radius
			ctx.arc(x, y, radius, 0, Math.PI * 2, true)
			ctx.fill()
			ctx.restore()
		}

		/** nouvelle position de la pomme mangée */
		this.setNewPosition = function () {
			var new_x = Math.round(Math.random() * (widthInBlocks - 1))
			var new_y = Math.round(Math.random() * (heightInBlocks - 1))
			this.position = [new_x, new_y]
		}

		/** 
		 * vérifie si la nouvelle apparait sur le serpent
		 * @param snake notre serpent
		 * */
		this.isOnSnake = function (snake) {
			var is_on_snake = false
			for (var i = 0; i < snake.body.length; i++) {
				if (this.position[0] === snake.body[i][0] && this.position[1] === snake.body[i][1]) {
					is_on_snake = true
				}
			}
			return is_on_snake
		}
	}

	document.onkeydown = function handleKeyDown(e) {
		var key = e.keyCode
		var new_direction
		switch (key) {
			case 37:
				// touche direction à gauche
				new_direction = "left"
				break
			case 38:
				// touche direction en haut
				new_direction = "up"
				break
			case 39:
				// touche direction à droite
				new_direction = "right"
				break
			case 40:
				// touche direction en bas
				new_direction = "down"
				break
			case 32:
				// touche espace
				restart()
				return
			default:
				return
		}
		initial_snake.setDirection(new_direction)
	}
}
